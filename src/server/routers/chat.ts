import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { db } from '../../db';
import { chatSessions, messages } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { observable } from '@trpc/server/observable';
import { TRPCError } from '@trpc/server';
import { aiService } from '../../lib/ai-service';
import { ERROR_MESSAGES } from '../../lib/ai-config';
import { truncateConversation } from '../../lib/conversation';
import { createRateLimiter } from '../../lib/rate-limiter';

const aiRateLimiter = createRateLimiter({ max: 20, windowMs: 60_000 });

function enforceRateLimit(userId: number): void {
  const result = aiRateLimiter.check(String(userId));
  if (!result.allowed) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: `Too many messages. Please wait ${result.retryAfterSeconds}s and try again.`,
    });
  }
}

async function assertSessionOwnership(sessionId: number, userId: number) {
  const [session] = await db
    .select()
    .from(chatSessions)
    .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, userId)))
    .limit(1);

  if (!session) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Chat session not found' });
  }

  return session;
}

async function insertAssistantMessage(sessionId: number, content: string) {
  const [row] = await db
    .insert(messages)
    .values({ sessionId, content, role: 'assistant' })
    .returning();
  return row;
}

async function getConversationHistory(sessionId: number) {
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(messages.createdAt);

  return truncateConversation(
    rows.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))
  );
}

export const chatRouter = router({
  getSessions: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, ctx.userId))
      .orderBy(desc(chatSessions.updatedAt));
  }),

  getMessages: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      await assertSessionOwnership(input.sessionId, ctx.userId);

      return await db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, input.sessionId))
        .orderBy(messages.createdAt);
    }),

  createSession: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(255).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [row] = await db
        .insert(chatSessions)
        .values({
          userId: ctx.userId,
          title: input.title || 'New Chat',
        })
        .returning();
      return row;
    }),

  createSessionWithMessage: protectedProcedure
    .input(z.object({
      firstMessage: z.string().min(1).max(8000),
    }))
    .mutation(async ({ ctx, input }) => {
      enforceRateLimit(ctx.userId);
      const title = await aiService.generateChatTitle(input.firstMessage);

      const [session] = await db
        .insert(chatSessions)
        .values({
          userId: ctx.userId,
          title,
        })
        .returning();

      return session;
    }),

  updateSessionTitle: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      title: z.string().min(1).max(255),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertSessionOwnership(input.sessionId, ctx.userId);

      const [updatedSession] = await db
        .update(chatSessions)
        .set({
          title: input.title,
          updatedAt: new Date(),
        })
        .where(and(eq(chatSessions.id, input.sessionId), eq(chatSessions.userId, ctx.userId)))
        .returning();

      if (!updatedSession) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Chat session not found' });
      }

      return updatedSession;
    }),

  deleteSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await assertSessionOwnership(input.sessionId, ctx.userId);

      // Messages cascade via the foreign key constraint
      await db.delete(messages).where(eq(messages.sessionId, input.sessionId));
      await db
        .delete(chatSessions)
        .where(and(eq(chatSessions.id, input.sessionId), eq(chatSessions.userId, ctx.userId)));

      return { success: true };
    }),

  sendMessageStream: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      content: z.string().min(1).max(8000),
    }))
    .subscription(({ ctx, input }) => {
      return observable<{ type: 'chunk' | 'complete' | 'error'; content?: string; messageId?: number; sessionId?: number }>((emit) => {
        const processMessage = async () => {
          try {
            enforceRateLimit(ctx.userId);
            await assertSessionOwnership(input.sessionId, ctx.userId);

            await db.insert(messages).values({
              sessionId: input.sessionId,
              content: input.content,
              role: 'user',
            });

            const openaiMessages = await getConversationHistory(input.sessionId);

            if (!aiService.isAvailable()) {
              const errorMessage = ERROR_MESSAGES.NO_API_KEY;
              const aiMessage = await insertAssistantMessage(input.sessionId, errorMessage);

              emit.next({ type: 'chunk', content: errorMessage, sessionId: input.sessionId });
              emit.next({ type: 'complete', messageId: aiMessage.id, sessionId: input.sessionId });
              emit.complete();
              return;
            }

            const stream = aiService.generateStreamingResponse(openaiMessages);

            let fullResponse = '';
            let buffer = '';
            const BUFFER_SIZE = 5;

            for await (const chunk of stream) {
              const content = chunk.content || '';
              if (content) {
                fullResponse += content;
                buffer += content;

                if (buffer.length >= BUFFER_SIZE || /[.!?,;:\n]/.test(buffer)) {
                  emit.next({ type: 'chunk', content: buffer, sessionId: input.sessionId });
                  buffer = '';
                }
              }
            }

            if (buffer) {
              emit.next({ type: 'chunk', content: buffer, sessionId: input.sessionId });
            }

            const aiMessage = await insertAssistantMessage(
              input.sessionId,
              fullResponse || 'I apologize, but I was unable to generate a response. Please try again.'
            );

            await db
              .update(chatSessions)
              .set({ updatedAt: new Date() })
              .where(eq(chatSessions.id, input.sessionId));

            emit.next({ type: 'complete', messageId: aiMessage.id, sessionId: input.sessionId });
            emit.complete();
          } catch (error) {
            console.error('Streaming error:', error);

            // Auth and rate-limit failures abort cleanly — never write to a
            // session the caller may not own.
            if (error instanceof TRPCError) {
              emit.next({ type: 'error', content: error.message, sessionId: input.sessionId });
              emit.complete();
              return;
            }

            const errorMessage = 'I apologize, but I encountered an error while processing your request. Please try again.';

            let messageId: number | undefined;
            try {
              const aiMessage = await insertAssistantMessage(input.sessionId, errorMessage);
              messageId = aiMessage.id;
            } catch (dbError) {
              console.error('Failed to persist error message:', dbError);
            }

            emit.next({ type: 'error', content: errorMessage, sessionId: input.sessionId });
            emit.next({ type: 'complete', messageId, sessionId: input.sessionId });
            emit.complete();
          }
        };

        processMessage();
      });
    }),
});

import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '../../db';
import { chatSessions, messages } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { observable } from '@trpc/server/observable';
import { aiService } from '../../lib/ai-service';
import { ERROR_MESSAGES } from '../../lib/ai-config';

export const chatRouter = router({
  getSessions: publicProcedure
    .input(z.object({ userId: z.number().optional() }))
    .query(async ({ input }) => {
      const sessions = await db
        .select()
        .from(chatSessions)
        .where(input.userId ? eq(chatSessions.userId, input.userId) : undefined)
        .orderBy(desc(chatSessions.updatedAt));
      return sessions;
    }),

  getMessages: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      const sessionMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, input.sessionId))
        .orderBy(messages.createdAt);
      return sessionMessages;
    }),

  createSession: publicProcedure
    .input(z.object({
      userId: z.number().optional(),
      title: z.string().min(1).optional(),
    }))
    .mutation(async ({ input }) => {
      const [row] = await db
        .insert(chatSessions)
        .values({
          userId: input.userId,
          title: input.title || 'New Chat',
        })
        .returning();
      return row;
    }),

  createSessionWithMessage: publicProcedure
    .input(z.object({
      userId: z.number().optional(),
      firstMessage: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const title = await aiService.generateChatTitle(input.firstMessage);
      
      const [session] = await db
        .insert(chatSessions)
        .values({
          userId: input.userId,
          title,
        })
        .returning();
      
      return session;
    }),

  sendMessage: publicProcedure
    .input(z.object({
      sessionId: z.number(),
      content: z.string().min(1),
      userId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const [userMessage] = await db
        .insert(messages)
        .values({
          sessionId: input.sessionId,
          content: input.content,
          role: 'user',
        })
        .returning();

      const conversationHistory = await db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, input.sessionId))
        .orderBy(messages.createdAt);

      const openaiMessages = conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      try {
        let aiResponse = ERROR_MESSAGES.NO_API_KEY;

        if (aiService.isAvailable()) {
          aiResponse = await aiService.generateResponse(openaiMessages);
        }

        const [aiMessage] = await db
          .insert(messages)
          .values({
            sessionId: input.sessionId,
            content: aiResponse,
            role: 'assistant',
          })
          .returning();

        await db
          .update(chatSessions)
          .set({ updatedAt: new Date() })
          .where(eq(chatSessions.id, input.sessionId));

        return {
          userMessage,
          aiMessage,
        };
      } catch (error) {
        console.error('OpenAI API error:', error);

        const [errorMessage] = await db
          .insert(messages)
          .values({
            sessionId: input.sessionId,
            content: 'I apologize, but I encountered an error while processing your request. Please try again.',
            role: 'assistant',
          })
          .returning();

        return {
          userMessage,
          aiMessage: errorMessage,
        };
      }
    }),

  updateSessionTitle: publicProcedure
    .input(z.object({
      sessionId: z.number(),
      title: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const [updatedSession] = await db
        .update(chatSessions)
        .set({
          title: input.title,
          updatedAt: new Date(),
        })
        .where(eq(chatSessions.id, input.sessionId))
        .returning();
      
      if (!updatedSession) {
        throw new Error('Chat session not found');
      }
      
      return updatedSession;
    }),

  deleteSession: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input }) => {
      // First check if session exists
      const session = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.id, input.sessionId))
        .limit(1);
      
      if (!session[0]) {
        throw new Error('Chat session not found');
      }
      
      // Delete messages first due to foreign key constraint
      await db.delete(messages).where(eq(messages.sessionId, input.sessionId));
      await db.delete(chatSessions).where(eq(chatSessions.id, input.sessionId));
      
      return { success: true };
    }),

  sendMessageStream: publicProcedure
    .input(z.object({
      sessionId: z.number(),
      content: z.string().min(1),
      userId: z.number().optional(),
    }))
    .subscription(({ input }) => {
      return observable<{ type: 'chunk' | 'complete' | 'error'; content?: string; messageId?: number }>((emit) => {
        const processMessage = async () => {
          try {
            await db.insert(messages).values({
              sessionId: input.sessionId,
              content: input.content,
              role: 'user',
            });

            const conversationHistory = await db
              .select()
              .from(messages)
              .where(eq(messages.sessionId, input.sessionId))
              .orderBy(messages.createdAt);

            const openaiMessages = conversationHistory.map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            }));

            if (!aiService.isAvailable()) {
              const errorMessage = ERROR_MESSAGES.NO_API_KEY;
              const [aiMessage] = await db
                .insert(messages)
                .values({
                  sessionId: input.sessionId,
                  content: errorMessage,
                  role: 'assistant',
                })
                .returning();

              emit.next({ type: 'chunk', content: errorMessage });
              emit.next({ type: 'complete', messageId: aiMessage.id });
              emit.complete();
              return;
            }

            const stream = aiService.generateStreamingResponse(openaiMessages);

            let fullResponse = '';
            let buffer = '';
            const BUFFER_SIZE = 5; // Buffer size for smoother streaming
            
            // Process stream chunks with buffering for smoother client-side rendering
            for await (const chunk of stream) {
              const content = chunk.content || '';
              if (content) {
                fullResponse += content;
                buffer += content;
                
                // Send buffered content when buffer reaches threshold or contains punctuation
                if (buffer.length >= BUFFER_SIZE || /[.!?,;:\n]/.test(buffer)) {
                  emit.next({ type: 'chunk', content: buffer });
                  buffer = '';
                }
              }
            }
            
            // Send any remaining buffered content
            if (buffer) {
              emit.next({ type: 'chunk', content: buffer });
            }

            const [aiMessage] = await db
              .insert(messages)
              .values({
                sessionId: input.sessionId,
                content: fullResponse || 'I apologize, but I was unable to generate a response. Please try again.',
                role: 'assistant',
              })
              .returning();

            await db
              .update(chatSessions)
              .set({ updatedAt: new Date() })
              .where(eq(chatSessions.id, input.sessionId));

            emit.next({ type: 'complete', messageId: aiMessage.id });
            emit.complete();
          } catch (error) {
            console.error('Streaming error:', error);
            
            const errorMessage = 'I apologize, but I encountered an error while processing your request. Please try again.';
            const [aiMessage] = await db
              .insert(messages)
              .values({
                sessionId: input.sessionId,
                content: errorMessage,
                role: 'assistant',
              })
              .returning();

            emit.next({ type: 'error', content: errorMessage });
            emit.next({ type: 'complete', messageId: aiMessage.id });
            emit.complete();
          }
        };

        processMessage();
      });
    }),
});

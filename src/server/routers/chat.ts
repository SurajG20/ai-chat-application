import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '../../db';
import { chatSessions, messages } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import OpenAI from 'openai';
import { observable } from '@trpc/server/observable';

const getAIClient = () => {
  if (process.env.OPENAI_API_KEY) {
    return {
      client: new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      }),
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      provider: 'openai'
    };
  }
  if (process.env.GROQ_API_KEY) {
    return {
      client: new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      }),
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      provider: 'groq'
    };
  }
  return null;
};

const aiClient = getAIClient();

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
      title: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const [row] = await db
        .insert(chatSessions)
        .values({
          userId: input.userId,
          title: input.title,
        })
        .returning();
      return row;
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

      const systemMessage = {
        role: 'system' as const,
        content: `You are a professional career counselor with expertise in helping people navigate their career paths. You provide thoughtful, personalized advice on:
        - Career exploration and planning
        - Skills assessment and development
        - Job search strategies
        - Interview preparation
        - Professional networking
        - Work-life balance
        - Career transitions
        - Industry insights and trends
        
        Always be encouraging, practical, and specific in your advice. Ask clarifying questions when needed to provide the most relevant guidance.`
      };

      try {
        let aiResponse = 'I apologize, but the AI service is not configured. Please set up your OpenAI or Groq API key to use this feature.';

        if (aiClient) {
          const completion = await aiClient.client.chat.completions.create({
            model: aiClient.model,
            messages: [systemMessage, ...openaiMessages],
            max_tokens: 500,
            temperature: 0.7,
          });

          aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';
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

            const systemMessage = {
              role: 'system' as const,
              content: `You are a professional career counselor with expertise in helping people navigate their career paths. You provide thoughtful, personalized advice on:
              - Career exploration and planning
              - Skills assessment and development
              - Job search strategies
              - Interview preparation
              - Professional networking
              - Work-life balance
              - Career transitions
              - Industry insights and trends
              
              Always be encouraging, practical, and specific in your advice. Ask clarifying questions when needed to provide the most relevant guidance.`
            };

            if (!aiClient) {
              const errorMessage = 'I apologize, but the AI service is not configured. Please set up your OpenAI or Groq API key to use this feature.';
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

            const stream = await aiClient.client.chat.completions.create({
              model: aiClient.model,
              messages: [systemMessage, ...openaiMessages],
              max_tokens: 500,
              temperature: 0.7,
              stream: true,
            });

            let fullResponse = '';
            let buffer = '';
            const BUFFER_SIZE = 5; // Buffer size for smoother streaming
            
            // Process stream chunks with buffering for smoother client-side rendering
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
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

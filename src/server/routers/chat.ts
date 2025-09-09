import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '../../db';
import { chatSessions, messages } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import OpenAI from 'openai';


const getAIClient = () => {

  if (process.env.GROQ_API_KEY) {
    return new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
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
      const newSession = await db
        .insert(chatSessions)
        .values({
          userId: input.userId,
          title: input.title,
        })
        .returning();
      return newSession[0];
    }),

  sendMessage: publicProcedure
    .input(z.object({
      sessionId: z.number(),
      content: z.string().min(1),
      userId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const userMessage = await db
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
        let aiResponse = 'I apologize, but the AI service is not configured. Please set up your OpenAI API key to use this feature.';

        if (aiClient) {
          const model = 'llama-3.1-8b-instant'


          const completion = await aiClient.chat.completions.create({
            model,
            messages: [systemMessage, ...openaiMessages],
            max_tokens: 500,
            temperature: 0.7,
          });

          aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';
        }

        const aiMessage = await db
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
          userMessage: userMessage[0],
          aiMessage: aiMessage[0],
        };
      } catch (error) {
        console.error('OpenAI API error:', error);

        const errorMessage = await db
          .insert(messages)
          .values({
            sessionId: input.sessionId,
            content: 'I apologize, but I encountered an error while processing your request. Please try again.',
            role: 'assistant',
          })
          .returning();

        return {
          userMessage: userMessage[0],
          aiMessage: errorMessage[0],
        };
      }
    }),

  updateSessionTitle: publicProcedure
    .input(z.object({
      sessionId: z.number(),
      title: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const updatedSession = await db
        .update(chatSessions)
        .set({
          title: input.title,
          updatedAt: new Date(),
        })
        .where(eq(chatSessions.id, input.sessionId))
        .returning();
      return updatedSession[0];
    }),

  deleteSession: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(messages).where(eq(messages.sessionId, input.sessionId));
      await db.delete(chatSessions).where(eq(chatSessions.id, input.sessionId));
      return { success: true };
    }),
});

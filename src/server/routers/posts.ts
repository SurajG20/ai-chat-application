import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '../../db';
import { posts } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const postsRouter = router({
  getAll: publicProcedure.query(async () => {
    return await db.select().from(posts);
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const post = await db.select().from(posts).where(eq(posts.id, input.id));
      return post[0];
    }),

  create: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      content: z.string().optional(),
      authorId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const newPost = await db.insert(posts).values({
        title: input.title,
        content: input.content,
        authorId: input.authorId,
      }).returning();
      return newPost[0];
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      content: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      const updatedPost = await db
        .update(posts)
        .set(updateData)
        .where(eq(posts.id, id))
        .returning();
      return updatedPost[0];
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(posts).where(eq(posts.id, input.id));
      return { success: true };
    }),
});

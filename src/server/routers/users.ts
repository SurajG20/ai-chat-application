import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const usersRouter = router({
  getAll: publicProcedure.query(async () => {
    return await db.select().from(users);
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const user = await db.select().from(users).where(eq(users.id, input.id));
      return user[0];
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      const newUser = await db.insert(users).values({
        name: input.name,
        email: input.email,
      }).returning();
      return newUser[0];
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      const updatedUser = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();
      return updatedUser[0];
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(users).where(eq(users.id, input.id));
      return { success: true };
    }),

  // getPosts removed - posts functionality not needed for career counseling chat
});

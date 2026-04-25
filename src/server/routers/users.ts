import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../../lib/auth-utils';

export const usersRouter = router({
  getAll: publicProcedure.query(async () => {
    return await db.select().from(users);
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const user = await db.select().from(users).where(eq(users.id, input.id));
      if (!user[0]) {
        throw new Error('User not found');
      }
      return user[0];
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      const hashedPassword = await hashPassword(input.password);
      const [row] = await db
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
          password: hashedPassword,
        })
        .returning();
      return row;
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      
      if (Object.keys(updateData).length === 0) {
        throw new Error('At least one field must be provided for update');
      }
      
      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();
      
      if (!updatedUser) {
        throw new Error('User not found');
      }
      
      return updatedUser;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const result = await db.delete(users).where(eq(users.id, input.id));
      
      if (result.rowCount === 0) {
        throw new Error('User not found');
      }
      
      return { success: true };
    }),

});

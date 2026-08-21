import { initTRPC, TRPCError } from '@trpc/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';

export async function createContext() {
  const session = await getServerSession(authOptions);
  return { session };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  const userId = Number((ctx.session?.user as { id?: string } | undefined)?.id);

  if (!ctx.session?.user || !Number.isInteger(userId) || userId <= 0) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be signed in to do that.' });
  }

  return next({
    ctx: {
      ...ctx,
      userId,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
export const middleware = t.middleware;

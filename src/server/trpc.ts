import { initTRPC } from '@trpc/server';

// Create context type
export type Context = Record<string, never>;

// Create tRPC instance
const t = initTRPC.context<Context>().create();

// Export router, procedure, and middleware
export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

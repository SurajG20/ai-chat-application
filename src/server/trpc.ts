import { initTRPC } from '@trpc/server';
import { z } from 'zod';

// Create context type
export interface Context {
  // Add any context properties here (user, db, etc.)
}

// Create tRPC instance
const t = initTRPC.context<Context>().create();

// Export router, procedure, and middleware
export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

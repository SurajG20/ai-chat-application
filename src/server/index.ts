import { router } from './trpc';
import { usersRouter } from './routers/users';
import { chatRouter } from './routers/chat';

export const appRouter = router({
  users: usersRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;

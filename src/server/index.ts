import { router } from './trpc';
import { usersRouter } from './routers/users';
import { postsRouter } from './routers/posts';

export const appRouter = router({
  users: usersRouter,
  posts: postsRouter,
});

export type AppRouter = typeof appRouter;

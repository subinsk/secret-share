import { router } from './trpc';
import { secretRouter } from './secret';
import { userRouter } from './user';

export const appRouter = router({
  secret: secretRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

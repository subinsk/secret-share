import { initTRPC, TRPCError } from '@trpc/server';
import { OpenApiMeta } from 'trpc-openapi';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

export const createTRPCContext = async (opts: { req: NextRequest }) => {
  const { req } = opts;
  
  // For App Router, we need to handle the session differently
  const session = await getServerSession(authOptions);
  
  return {
    session,
    req,
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().meta<OpenApiMeta>().create();

export const router = t.router;
export const procedure = t.procedure;

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      // Ensures that session and user are non-nullable in protected procedures
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

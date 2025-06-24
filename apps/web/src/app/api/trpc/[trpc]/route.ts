import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from 'api';
import { createTRPCContext } from 'api/trpc';
import { NextRequest } from 'next/server';

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
  });

export { handler as GET, handler as POST };

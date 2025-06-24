import { createTRPCNext } from '@trpc/next';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from 'api';
import type { NextPageContext } from 'next';

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpc = createTRPCNext<AppRouter>({
  config(opts: { ctx?: NextPageContext }) {
    return {
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            if (opts?.ctx?.req?.headers) {
              // Convert IncomingHttpHeaders to Record<string, string>
              const headers: Record<string, string> = {};
              Object.entries(opts.ctx.req.headers).forEach(([key, value]) => {
                headers[key] = Array.isArray(value) ? value.join(',') : value ?? '';
              });
              headers['x-ssr'] = '1';
              return headers;
            }
            return {};
          },
        }),
      ],
    };
  },
  ssr: false,
});

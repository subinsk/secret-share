import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequestWithAuth } from "next-auth/middleware"
import { createRateLimiter, rateLimitConfigs } from "../../../lib/rate-limit"

export default withAuth(
  async function middleware(req: NextRequestWithAuth): Promise<NextResponse> {
    const { pathname } = req.nextUrl;

    // Apply rate limiting based on the path
    let rateLimitResponse = null;

    if (pathname.startsWith('/api/trpc/secret.create')) {
      rateLimitResponse = await createRateLimiter(rateLimitConfigs.createSecret)(req);
    } else if (pathname.startsWith('/api/trpc/secret.get') || pathname.startsWith('/secret/')) {
      rateLimitResponse = await createRateLimiter(rateLimitConfigs.accessSecret)(req);
    } else if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/register')) {
      rateLimitResponse = await createRateLimiter(rateLimitConfigs.auth)(req);
    } else if (pathname.startsWith('/api/')) {
      rateLimitResponse = await createRateLimiter(rateLimitConfigs.api)(req);
    }

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }): boolean => {
        const { pathname }: { pathname: string } = req.nextUrl

        // Protect dashboard routes - require authentication
        if (pathname.startsWith('/dashboard')) {
          return Boolean(token)
        }

        // Allow access to other pages
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // Include API routes for rate limiting
    '/api/:path*',
    // Or be more specific with the routes you want to protect
    // '/dashboard/:path*',
    // '/auth/:path*'
  ]
}
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt.util';
import { AUTH_COOKIE_NAME } from '@/config/constants';
import type { ApiResponse } from '@/types';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isApiRoute = path.startsWith('/api/');

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required. Please provide valid credentials.',
          },
        },
        { status: 401 }
      );
    }
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('from', path);
    return NextResponse.redirect(signinUrl);
  }

  try {
    const payload = await verifyToken(token);

    if (!payload) {
      throw new Error('Invalid or expired token');
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-email', payload.email);
    if (payload.role) {
      requestHeaders.set('x-user-role', payload.role);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    if (isApiRoute) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired session token.',
          },
        },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/signin', request.url));
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/billing/:path*',
    '/inventory/:path*',
    '/invoices/:path*',
    '/profile/:path*',
    '/api/protected/invoices/:path*',
    '/api/protected/medicines/:path*',
    '/api/protected/shops/:path*',
    '/api/protected/users/:path*',
  ],
};
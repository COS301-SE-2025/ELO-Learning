import { NextResponse } from 'next/server';

export function middleware(request) {
  // Only run auth check on protected routes (not public assets or auth pages)
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and auth pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/login-landing') ||
    pathname === '/' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for NextAuth session token (the main one)
  const sessionToken =
    request.cookies.get('next-auth.session-token') ||
    request.cookies.get('__Secure-next-auth.session-token') ||
    request.cookies.get('__Host-next-auth.session-token');

  // Check for custom auth cookie (credential users)
  const customToken = request.cookies.get('token');

  // If no authentication found, redirect to login
  if (!sessionToken && !customToken) {
    // Safe URL construction with fallback
    try {
      if (request.url && typeof request.url === 'string') {
        return NextResponse.redirect(new URL('/login-landing', request.url));
      } else {
        // Fallback for when request.url is invalid
        const baseUrl =
          process.env.NEXTAUTH_URL ||
          process.env.NEXT_PUBLIC_FRONTEND_URL ||
          'http://localhost:8080';
        return NextResponse.redirect(new URL('/login-landing', baseUrl));
      }
    } catch (error) {
      console.error('Middleware redirect error:', error);
      // Emergency fallback - direct redirect
      return NextResponse.redirect('/login-landing');
    }
  }

  // Allow request to proceed
  return NextResponse.next();
}

export const config = {
  // Only match specific protected routes to reduce middleware overhead
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/game/:path*',
    '/multiplayer/:path*',
    '/practice/:path*',
    '/leaderboard/:path*',
    '/end-screen/:path*',
  ],
};

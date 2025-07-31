import { NextResponse } from 'next/server'

export function middleware(request) {
  let cookie = request.cookies.get('next-auth.session-token') || request.cookies.get('next-auth.csrf-token')

  if (!cookie) {
    // If no token, redirect to login-landing
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
  //regexp to match all paths except login-landing, static assets, and public files
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login-landing|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp|.*\\.ico|$).*)',
  ],
}

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const isLogin = request.nextUrl.pathname.startsWith('/login');

  if (!token && !isLogin) return NextResponse.redirect(new URL('/login', request.url));
  if (token && isLogin) return NextResponse.redirect(new URL('/', request.url));
}

export const config = { matcher: ['/((?!_next|favicon.ico|api).*)'] };

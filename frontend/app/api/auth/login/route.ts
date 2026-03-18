import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const response = NextResponse.json({ user: data.data?.user || data.user });

  response.cookies.set('access_token', data.data?.access_token || data.access_token, {
    httpOnly: true,
    path: '/',
    maxAge: 900,
    sameSite: 'lax',
  });

  response.cookies.set('refresh_token', data.data?.refresh_token || data.refresh_token, {
    httpOnly: true,
    path: '/',
    maxAge: 604800,
    sameSite: 'lax',
  });

  return response;
}

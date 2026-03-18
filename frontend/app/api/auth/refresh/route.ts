import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const refresh_token = cookieHeader.match(/refresh_token=([^;]+)/)?.[1];

  if (!refresh_token) {
    return NextResponse.json({ message: 'Refresh token not found' }, { status: 401 });
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`, {
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ refresh_token }),
  });

  const data = await res.json();
  if (!res.ok) {
    const response = NextResponse.json(data, { status: res.status });
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('access_token', data.data?.access_token || data.access_token, {
    httpOnly: true,
    path: '/',
    maxAge: 900,
    sameSite: 'lax',
  });

  return response;
}

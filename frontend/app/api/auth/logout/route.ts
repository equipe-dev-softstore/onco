import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const refresh_token = cookieHeader.match(/refresh_token=([^;]+)/)?.[1];

  if (refresh_token) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ refresh_token }),
    });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');

  return response;
}

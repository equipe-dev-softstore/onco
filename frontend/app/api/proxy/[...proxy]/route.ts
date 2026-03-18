import { NextResponse } from 'next/server';

async function handler(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const access_token = cookieHeader.match(/access_token=([^;]+)/)?.[1];

  const url = new URL(req.url);
  const path = url.pathname.replace('/api/proxy/', '/api/v1/');
  const targetUrl = `${process.env.NEXT_PUBLIC_API_URL}${path}${url.search}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (access_token) {
    headers['Authorization'] = `Bearer ${access_token}`;
  }

  const options: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    options.body = await req.text();
  }

  const res = await fetch(targetUrl, options);
  const data = await res.text();
  
  let parsedData = data;
  try {
    parsedData = JSON.parse(data);
  } catch (e) {}

  return NextResponse.json(parsedData, { status: res.status });
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
export const PUT = handler;

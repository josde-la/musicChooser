import { NextResponse } from 'next/server';

export async function GET() {
  const env = {
    NETLIFY: process.env.NETLIFY,
    NETLIFY_PURPOSE: process.env.NETLIFY_PURPOSE,
    SITE_ID: process.env.SITE_ID ? 'Set' : 'Not Set',
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
    NODE_ENV: process.env.NODE_ENV,
  };
  return NextResponse.json(env);
}

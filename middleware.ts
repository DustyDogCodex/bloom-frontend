import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { ENVIRONMENT } from './constants/enums';

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  const environments = [ENVIRONMENT.STAGING, ENVIRONMENT.PRODUCTION];
  const currentEnv = process.env.NEXT_PUBLIC_ENV as ENVIRONMENT;

  if (environments.includes(currentEnv) && req.headers.get('x-forwarded-proto') !== 'https') {
    const hostname = req.headers.get('host') || req.nextUrl.hostname;
    return NextResponse.redirect(`https://${hostname}${req.nextUrl.pathname}`, 301);
  }
  return NextResponse.next();
}

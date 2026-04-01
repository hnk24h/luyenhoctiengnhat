import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Passthrough middleware – locale is handled by the [locale] route segment,
// not by next-intl's createMiddleware (which would strip the default-locale
// prefix from URLs like /vi/ja/vocab and break the router).
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};

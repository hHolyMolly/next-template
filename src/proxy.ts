import { type NextRequest, NextResponse } from 'next/server';

/**
 * Proxy для обработки запросов.
 * Расширяйте по мере необходимости: auth, i18n redirect, rate limiting и т.д.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};

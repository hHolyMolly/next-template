import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

import { routing } from '@/services/i18n/routing';

const middleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  return middleware(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};

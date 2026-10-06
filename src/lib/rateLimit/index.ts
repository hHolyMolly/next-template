export {
  checkIdentity,
  createApiRateLimit,
  createRateLimiter,
  rateLimitHeaders,
  rateLimitResponse,
  resolveClientIp,
} from '@/lib/rateLimit/rateLimit';
export type {
  IdentityCheck,
  RateLimitConfig,
  RateLimitResult,
  RateLimitScope,
} from '@/lib/rateLimit/rateLimit';

// `withActionRateLimit` is deliberately NOT re-exported here: it imports
// `next/headers`, and this barrel is consumed by `proxy.ts`. Import it by
// its full path: `@/lib/rateLimit/rateLimitAction`.

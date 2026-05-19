import type { NextResponse } from 'next/server';

/**
 * CORS helper for Route Handlers.
 *
 * Next.js middleware (`proxy.ts`) already enforces CSP + headers for page
 * requests, but Route Handlers (`app/api/**`) need explicit CORS when:
 * - they're called from a different origin (another subdomain, mobile app);
 * - you accept credentials (cookies, Authorization) cross-origin.
 *
 * @example
 * // src/app/api/echo/route.ts
 * import { cors, handlePreflight } from '@/lib/cors';
 *
 * const ALLOWED = ['https://app.example.com'];
 *
 * export async function OPTIONS(req: NextRequest) {
 *   return handlePreflight(req, { origins: ALLOWED, methods: ['POST'] });
 * }
 *
 * export async function POST(req: NextRequest) {
 *   const data = await req.json();
 *   return cors(NextResponse.json(data), req, { origins: ALLOWED });
 * }
 */

type CorsOptions = {
  /**
   * Allowed origins. Use an exact origin string, never `*`
   * when `credentials: true`. `'*'` is accepted for public endpoints.
   */
  origins: readonly string[] | '*';
  /** Allowed HTTP methods. Default: GET,POST,OPTIONS */
  methods?: readonly string[];
  /** Allowed request headers. Default: Content-Type,Authorization */
  headers?: readonly string[];
  /** Exposed response headers for the browser. Default: none */
  exposed?: readonly string[];
  /** Send `Access-Control-Allow-Credentials: true`. Default: false */
  credentials?: boolean;
  /** Preflight cache seconds. Default: 86_400 (1 day) */
  maxAge?: number;
};

function resolveOrigin(request: Request, options: CorsOptions): string | null {
  const origin = request.headers.get('origin');
  if (!origin) return null;
  if (options.origins === '*') return options.credentials ? null : '*';
  return options.origins.includes(origin) ? origin : null;
}

/** Attach CORS headers to a response and return it. */
export function cors<T extends Response>(response: T, request: Request, options: CorsOptions): T {
  const origin = resolveOrigin(request, options);
  if (!origin) return response;

  const methods = options.methods ?? ['GET', 'POST', 'OPTIONS'];
  const headers = options.headers ?? ['Content-Type', 'Authorization'];

  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.append('Vary', 'Origin');
  response.headers.set('Access-Control-Allow-Methods', methods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', headers.join(', '));
  if (options.exposed?.length) {
    response.headers.set('Access-Control-Expose-Headers', options.exposed.join(', '));
  }
  if (options.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  return response;
}

/** Build the response for an `OPTIONS` preflight request. */
export function handlePreflight(request: Request, options: CorsOptions): Response {
  const maxAge = options.maxAge ?? 86_400;
  const response = new Response(null, { status: 204 });
  response.headers.set('Access-Control-Max-Age', String(maxAge));
  return cors(response, request, options);
}

/** Attach CORS to an existing `NextResponse` (return it back for chaining). */
export function withCors(
  response: NextResponse,
  request: Request,
  options: CorsOptions,
): NextResponse {
  return cors(response, request, options);
}

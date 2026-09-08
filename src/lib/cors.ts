import { isAllowedOrigin } from '@/lib/origin';

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
   * Allowed origins (compared as normalized origins — trailing slashes and
   * casing are tolerated). `'*'` is accepted for public endpoints only and
   * cannot be combined with `credentials: true`.
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

function assertValidOptions(options: CorsOptions): void {
  if (options.origins === '*' && options.credentials) {
    // The CORS spec forbids `Access-Control-Allow-Origin: *` with
    // credentials; silently emitting nothing would be a debugging trap.
    throw new Error("cors: `credentials: true` cannot be combined with `origins: '*'`");
  }
}

function resolveOrigin(request: Request, options: CorsOptions): string | null {
  const origin = request.headers.get('origin');
  if (!origin) return null;
  if (options.origins === '*') return '*';
  return isAllowedOrigin(origin, options.origins) ? origin : null;
}

/**
 * Response objects from `fetch()` / `Response.redirect()` carry immutable
 * headers — mutate a clone instead of throwing a confusing TypeError.
 */
export function toMutableResponse<T extends Response>(response: T): T {
  try {
    response.headers.set('x-cors-probe', '1');
    response.headers.delete('x-cors-probe');
    return response;
  } catch {
    return new Response(response.body, response) as T;
  }
}

/** Attach CORS headers to a response and return it (possibly a clone). */
export function cors<T extends Response>(response: T, request: Request, options: CorsOptions): T {
  assertValidOptions(options);

  const out = toMutableResponse(response);

  // `Vary: Origin` must be present on EVERY response of this resource —
  // including rejections — or a shared cache may serve the allowed-origin
  // variant to a disallowed origin (cache poisoning). Merge (don't overwrite,
  // don't duplicate) so repeated calls and preflight's wider Vary survive.
  if (options.origins !== '*') {
    const vary = out.headers.get('Vary');
    if (!vary) out.headers.set('Vary', 'Origin');
    else if (!/\bOrigin\b/i.test(vary)) out.headers.set('Vary', `${vary}, Origin`);
  }

  const origin = resolveOrigin(request, options);
  if (!origin) return out;

  const methods = options.methods ?? ['GET', 'POST', 'OPTIONS'];
  const headers = options.headers ?? ['Content-Type', 'Authorization'];

  out.headers.set('Access-Control-Allow-Origin', origin);
  out.headers.set('Access-Control-Allow-Methods', methods.join(', '));
  out.headers.set('Access-Control-Allow-Headers', headers.join(', '));
  if (options.exposed?.length) {
    out.headers.set('Access-Control-Expose-Headers', options.exposed.join(', '));
  }
  if (options.credentials) {
    out.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  return out;
}

/** Build the response for an `OPTIONS` preflight request. */
export function handlePreflight(request: Request, options: CorsOptions): Response {
  const response = new Response(null, { status: 204 });
  // Preflight answers vary by the requested method/headers as well.
  response.headers.set(
    'Vary',
    'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
  );

  const out = cors(response, request, options);

  // Cache the preflight only when the origin was actually allowed.
  if (out.headers.has('Access-Control-Allow-Origin')) {
    out.headers.set('Access-Control-Max-Age', String(options.maxAge ?? 86_400));
  }
  return out;
}

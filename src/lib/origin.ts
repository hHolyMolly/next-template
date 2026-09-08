/**
 * Origin/URL helpers shared by CORS (`cors.ts`), CSRF (`assertSameOrigin.ts`),
 * CSP (`proxy.ts`) and metadata (`createMetadata.ts`) code — one definition
 * of "same origin" for the whole app.
 */

/** True when the value is an absolute http(s) URL. */
export function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/**
 * Normalize any URL-ish string to its origin (`https://host:3000`), or `null`
 * when it cannot be parsed. Strips paths, trailing slashes and normalizes
 * casing — safe to compare with `===`.
 */
export function normalizeOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/** Allowlist check over normalized origins (slash/case tolerant). */
export function isAllowedOrigin(origin: string, allowlist: Iterable<string>): boolean {
  const target = normalizeOrigin(origin);
  if (!target) return false;

  for (const entry of allowlist) {
    if (normalizeOrigin(entry) === target) return true;
  }
  return false;
}

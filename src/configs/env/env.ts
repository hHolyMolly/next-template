/**
 * Runtime validation of environment variables.
 * Called at application startup (instrumentation.register) for early
 * problem detection.
 *
 * Note: `proxy.ts` reads several of these variables at module scope, which
 * can happen before `register()` runs — that's why the middleware also
 * sanitizes its inputs in place (whitelist for TRUSTED_TYPES_MODE, URL-parse
 * for CSP_REPORT_URI). This schema still catches typos at boot instead of
 * letting them silently degrade to defaults in production.
 */

import { z } from 'zod';

const urlSchema = z.url({ protocol: /^https?$/, error: 'URL must be absolute and use http(s)' });

const optionalBool = z.enum(['true', 'false']).optional().or(z.literal(''));

const envSchema = z.object({
  NEXT_PUBLIC_CLIENT_URL: urlSchema,
  NEXT_PUBLIC_SERVER_URL: urlSchema.optional().or(z.literal('')),
  NEXT_PUBLIC_VITALS_ENDPOINT: urlSchema.optional().or(z.literal('')),

  TRUSTED_PROXY_HOPS: z
    .string()
    .optional()
    .refine(
      (v) => v === undefined || v === '' || (/^\d+$/.test(v) && Number(v) >= 0 && Number(v) <= 5),
      { message: 'TRUSTED_PROXY_HOPS must be an integer between 0 and 5' },
    ),
  RATE_LIMIT_BYPASS_IPS: z
    .string()
    .optional()
    .refine((v) => !v || v.split(',').every((ip) => /^[0-9a-fA-F.:]{2,45}$/.test(ip.trim())), {
      message: 'RATE_LIMIT_BYPASS_IPS must be a comma-separated list of IPs',
    }),
  REVALIDATE_SECRET: z
    .string()
    .optional()
    .refine((v) => v === undefined || v === '' || v.length >= 16, {
      message: 'REVALIDATE_SECRET must be at least 16 characters (or unset)',
    }),

  CSP_REPORT_ONLY: optionalBool,
  CSP_STRICT_STYLES: optionalBool,
  CSP_REPORT_URI: urlSchema.optional().or(z.literal('')),
  TRUSTED_TYPES_MODE: z.enum(['off', 'report', 'enforce']).optional().or(z.literal('')),
});

export function validateEnv(): void {
  const result = envSchema.safeParse(process.env);
  if (result.success) return;

  const lines = result.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`);
  throw new Error(
    `❌ Invalid environment variables:\n${lines.join('\n')}\n\nPut real values into .env.local (see .env.example) — .env.development/.env.production are committed defaults.`,
  );
}

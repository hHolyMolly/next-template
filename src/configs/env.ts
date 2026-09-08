/**
 * Runtime validation of environment variables.
 * Called at application startup (instrumentation.register) for early
 * problem detection.
 *
 * Note: `proxy.ts` runs in its own (Edge) runtime and reads several of these
 * variables at module scope BEFORE this validator runs — that's why the
 * middleware also sanitizes its inputs in place (whitelist for
 * TRUSTED_TYPES_MODE, URL-parse for CSP_REPORT_URI). This schema still
 * catches typos at boot instead of letting them silently degrade to
 * defaults in production.
 */

import { z } from 'zod';

const urlSchema = z
  .url()
  .refine((v) => /^https?:\/\//.test(v), { message: 'URL must use http(s) protocol' });

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

  CSP_REPORT_ONLY: optionalBool,
  CSP_STRICT_STYLES: optionalBool,
  CSP_REPORT_URI: urlSchema.optional().or(z.literal('')),
  TRUSTED_TYPES_MODE: z.enum(['off', 'report', 'enforce']).optional().or(z.literal('')),

  ANALYZE: optionalBool,
  PORT: z
    .string()
    .optional()
    .refine((v) => v === undefined || v === '' || /^\d+$/.test(v), {
      message: 'PORT must be a number',
    }),
});

export function validateEnv(): void {
  const result = envSchema.safeParse(process.env);
  if (result.success) return;

  const lines = result.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`);
  throw new Error(
    `❌ Invalid environment variables:\n${lines.join('\n')}\n\nCreate .env.development from .env.example and fill in the values.`,
  );
}

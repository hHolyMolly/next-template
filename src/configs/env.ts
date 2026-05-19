/**
 * Runtime validation of environment variables.
 * Called at application startup for early problem detection.
 */

import { z } from 'zod';

const urlSchema = z
  .string()
  .url()
  .refine((v) => /^https?:\/\//.test(v), { message: 'URL must use http(s) protocol' });

const envSchema = z.object({
  NEXT_PUBLIC_CLIENT_URL: urlSchema,
  NEXT_PUBLIC_SERVER_URL: urlSchema.optional().or(z.literal('')),
  TRUSTED_PROXY_HOPS: z
    .string()
    .optional()
    .refine(
      (v) => v === undefined || v === '' || (/^\d+$/.test(v) && Number(v) >= 0 && Number(v) <= 5),
      { message: 'TRUSTED_PROXY_HOPS must be an integer between 0 and 5' },
    ),
});

export function validateEnv(): void {
  const result = envSchema.safeParse(process.env);
  if (result.success) return;

  const lines = result.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`);
  throw new Error(
    `❌ Invalid environment variables:\n${lines.join('\n')}\n\nCreate .env.development from .env.example and fill in the values.`,
  );
}

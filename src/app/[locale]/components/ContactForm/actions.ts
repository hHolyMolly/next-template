'use server';

import { getTranslations } from 'next-intl/server';

import {
  createContactSchema,
  type ContactFormValues,
} from '@/app/[locale]/components/ContactForm/schema';
import { assertSameOrigin } from '@/lib/assertSameOrigin';
import { ValidationError } from '@/lib/errors';
import { withActionRateLimit } from '@/lib/rateLimitAction';
import { withServerAction } from '@/lib/withServerAction';

/**
 * Demo Server Action (removed by `pnpm clean:demo`) — the canonical mutation
 * pipeline: CSRF check → per-IP rate limit → server-side Zod re-validation →
 * typed `ServerActionResult` back to the client (never throws).
 */
export const submitContact = withServerAction(
  withActionRateLimit({ limit: 5, windowSeconds: 60 }, async (values: ContactFormValues) => {
    await assertSameOrigin();

    const t = await getTranslations('demo');
    const schema = createContactSchema({
      name: t('form_error_name'),
      email: t('form_error_email'),
      message: t('form_error_message'),
    });

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid input');
    }

    // Replace with a real integration (email, DB, CRM, …) — the demo echoes back.
    return { name: parsed.data.name, receivedAt: new Date().toISOString() };
  }),
);

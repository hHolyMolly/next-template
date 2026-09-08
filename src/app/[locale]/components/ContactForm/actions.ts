'use server';

import { getTranslations } from 'next-intl/server';

import {
  createContactSchema,
  type ContactSubmission,
} from '@/app/[locale]/components/ContactForm/schema';
import { assertSameOrigin } from '@/lib/assertSameOrigin';
import { ValidationError } from '@/lib/errors';
import { withActionRateLimit } from '@/lib/rateLimitAction';
import { withServerAction } from '@/lib/withServerAction';
import { logger } from '@/utils/logger';

/** Humans need at least a few seconds to fill three fields. */
const MIN_FILL_MS = 3000;

/**
 * Demo Server Action (removed by `pnpm clean:demo`) — the canonical mutation
 * pipeline: CSRF check → per-IP rate limit → honeypot/min-fill-time →
 * server-side Zod re-validation → typed `ServerActionResult` back to the
 * client (never throws).
 *
 * Order matters: the CSRF check runs BEFORE the rate limiter so cross-site
 * garbage can't burn a legitimate user's per-IP budget.
 */
export const submitContact = withServerAction(async (submission: ContactSubmission) => {
  await assertSameOrigin();
  return limitedSubmit(submission);
});

const limitedSubmit = withActionRateLimit(
  { limit: 5, windowSeconds: 60 },
  async (submission: ContactSubmission) => {
    const { company, elapsedMs, ...values } = submission;

    // Anti-bot: the hidden field was filled, or the form was submitted
    // faster than a human can type. Answer with a SUCCESS-shaped response —
    // an error would teach the bot which of its inputs to fix.
    const tooFast = typeof elapsedMs !== 'number' || elapsedMs < MIN_FILL_MS;
    if ((company && company.length > 0) || tooFast) {
      logger.warn(
        `[contact] bot rejected (honeypot=${Boolean(company)} elapsedMs=${elapsedMs ?? 'missing'})`,
      );
      return { name: String(values.name ?? ''), receivedAt: new Date().toISOString() };
    }

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
  },
);

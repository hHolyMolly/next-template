import { z } from 'zod';

/**
 * Shared contact-form schema — the SAME rules run on the client
 * (zodResolver) and inside the Server Action (never trust the client).
 *
 * A factory instead of a constant so validation messages can be localized:
 * the client builds it with `useTranslations`, the action with
 * `getTranslations`.
 */

export type ContactSchemaMessages = {
  name: string;
  email: string;
  message: string;
};

export function createContactSchema(messages: ContactSchemaMessages) {
  return z.object({
    name: z.string().min(2, messages.name),
    email: z.email(messages.email),
    message: z.string().min(10, messages.message),
  });
}

export type ContactFormValues = z.infer<ReturnType<typeof createContactSchema>>;

/**
 * What the client actually POSTs: the form values plus anti-bot metadata.
 * Both extras are spoofable by a determined attacker — the honeypot targets
 * the naive form-spam bots that make up most of the noise.
 */
export type ContactSubmission = ContactFormValues & {
  /** Honeypot — rendered invisibly; humans never fill it. */
  company?: string;
  /** Milliseconds between form mount and submit (min-fill-time check). */
  elapsedMs?: number;
};

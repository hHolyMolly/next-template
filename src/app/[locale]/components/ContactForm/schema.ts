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

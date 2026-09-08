'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { submitContact } from '@/app/[locale]/components/ContactForm/actions';
import {
  createContactSchema,
  type ContactFormValues,
} from '@/app/[locale]/components/ContactForm/schema';
import { Card } from '@/app/[locale]/components/Demo/components/Card';
import { Button, FormField } from '@/components/UI';
import { withMinDelay } from '@/lib/withMinDelay';

/**
 * Demo form (removed by `pnpm clean:demo`): react-hook-form + zodResolver
 * on the client, the same schema re-validated in the Server Action,
 * result surfaced via Sonner toasts. Ships the anti-bot extras the action
 * expects: a honeypot field and the time it took to fill the form.
 */
export function ContactForm() {
  const t = useTranslations('demo');
  const [isPending, startTransition] = useTransition();
  const honeypotRef = useRef<HTMLInputElement>(null);

  // Stamped in an effect: render must stay pure (react-hooks/purity), and
  // effect time ≈ "the user can see the form", which is what we measure.
  const mountedAtRef = useRef(0);
  useEffect(() => {
    if (mountedAtRef.current === 0) mountedAtRef.current = Date.now();
  }, []);

  // No useMemo — the React Compiler (enabled in next.config) memoizes this.
  const schema = createContactSchema({
    name: t('form_error_name'),
    email: t('form_error_email'),
    message: t('form_error_message'),
  });

  const { control, handleSubmit, reset } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', message: '' },
  });

  // eslint-disable-next-line react-hooks/refs -- refs are read at submit time, not during render.
  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      // withMinDelay floors the perceived duration — a 40ms response would
      // flash the "Sending…" state for a single frame and read as broken.
      const result = await withMinDelay(
        submitContact({
          ...values,
          company: honeypotRef.current?.value ?? '',
          elapsedMs: Date.now() - mountedAtRef.current,
        }),
      );

      if (result.success) {
        toast.success(t('form_success'));
        reset();
        return;
      }

      toast.error(result.error.message);
    });
  });

  return (
    <Card title={t('form_title')} description={t('form_description')}>
      {/* The demo card is dark while the UI kit is light-themed — labels
          inherit the color set here, inputs get an explicit light text. */}
      <form onSubmit={onSubmit} className="flex flex-col gap-4 text-slate-200" noValidate>
        {/* Honeypot: invisible to humans (aria-hidden + off-screen +
            tabIndex -1), looks like a real field to naive bots. English on
            purpose — no user ever sees it, and translating it would only
            make it look less like a real form field to a crawler.
            The unrecognized autoComplete token suppresses Chrome Autofill
            (a literal "off" is ignored for the Autofill feature). */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Company
            <input ref={honeypotRef} type="text" name="company" tabIndex={-1} autoComplete="nope" />
          </label>
        </div>

        <FormField
          control={control}
          name="name"
          label={t('form_name')}
          autoComplete="name"
          className="text-slate-100"
        />
        <FormField
          control={control}
          name="email"
          label={t('form_email')}
          type="email"
          autoComplete="email"
          className="text-slate-100"
        />
        <FormField
          control={control}
          name="message"
          label={t('form_message')}
          className="text-slate-100"
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? t('form_sending') : t('form_submit')}
        </Button>
      </form>
    </Card>
  );
}

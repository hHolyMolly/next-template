'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useMemo, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { submitContact } from '@/app/[locale]/components/ContactForm/actions';
import {
  createContactSchema,
  type ContactFormValues,
} from '@/app/[locale]/components/ContactForm/schema';
import { Button, FormField } from '@/components/UI';

/**
 * Demo form (removed by `pnpm clean:demo`): react-hook-form + zodResolver
 * on the client, the same schema re-validated in the Server Action,
 * result surfaced via Sonner toasts.
 */
export default function ContactForm() {
  const t = useTranslations('demo');
  const [isPending, startTransition] = useTransition();

  const schema = useMemo(
    () =>
      createContactSchema({
        name: t('form_error_name'),
        email: t('form_error_email'),
        message: t('form_error_message'),
      }),
    [t],
  );

  const { control, handleSubmit, reset } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await submitContact(values);

      if (result.success) {
        toast.success(t('form_success'));
        reset();
        return;
      }

      toast.error(result.error.message);
    });
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
      <h2 className="mb-1 text-lg font-semibold text-slate-100">{t('form_title')}</h2>
      <p className="mb-5 text-sm text-slate-400">{t('form_description')}</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormField control={control} name="name" label={t('form_name')} autoComplete="name" />
        <FormField
          control={control}
          name="email"
          label={t('form_email')}
          type="email"
          autoComplete="email"
        />
        <FormField control={control} name="message" label={t('form_message')} />

        <Button type="submit" disabled={isPending}>
          {isPending ? t('form_sending') : t('form_submit')}
        </Button>
      </form>
    </div>
  );
}

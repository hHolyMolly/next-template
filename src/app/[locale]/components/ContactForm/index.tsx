'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { submitContact } from '@/app/[locale]/components/ContactForm/actions';
import {
  createContactSchema,
  type ContactFormValues,
} from '@/app/[locale]/components/ContactForm/schema';
import { Card } from '@/app/[locale]/components/Demo/components/Card';
import { Button, FormField } from '@/components/UI';

/**
 * Demo form (removed by `pnpm clean:demo`): react-hook-form + zodResolver
 * on the client, the same schema re-validated in the Server Action,
 * result surfaced via Sonner toasts.
 */
export function ContactForm() {
  const t = useTranslations('demo');
  const [isPending, startTransition] = useTransition();

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
    <Card title={t('form_title')} description={t('form_description')}>
      {/* The demo card is dark while the UI kit is light-themed — labels
          inherit the color set here, inputs get an explicit light text. */}
      <form onSubmit={onSubmit} className="flex flex-col gap-4 text-slate-200" noValidate>
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

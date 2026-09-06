/**
 * Demo Section — the template's living examples. Remove with
 * `pnpm clean:demo`, which deletes `src/app/[locale]/components/` and
 * resets the home page to a clean skeleton.
 */

import { useTranslations } from 'next-intl';

import ContactForm from '@/app/[locale]/components/ContactForm';
import Actions from '@/app/[locale]/components/Demo/components/Actions';
import Badge from '@/app/[locale]/components/Demo/components/Badge';
import CopyCommand from '@/app/[locale]/components/Demo/components/CopyCommand';
import Footer from '@/app/[locale]/components/Demo/components/Footer';
import Hero from '@/app/[locale]/components/Demo/components/Hero';
import Stack from '@/app/[locale]/components/Demo/components/Stack';
import { actionLinks } from '@/app/[locale]/components/Demo/data/actions';
import {
  INSTALL_COMMAND,
  AUTHOR,
  AUTHOR_URL,
  VERSION,
} from '@/app/[locale]/components/Demo/data/constants';
import { stack } from '@/app/[locale]/components/Demo/data/stack';
import DemoBanner from '@/app/[locale]/components/DemoBanner';
import HealthStatus from '@/app/[locale]/components/HealthStatus';

import type { ReactNode } from 'react';

interface DemoProps {
  languageSwitch?: ReactNode;
}

export default function Demo({ languageSwitch }: DemoProps) {
  const t = useTranslations('demo');

  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-10 md:px-6 md:py-15">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(56,189,248,0.1),transparent)]" />

      {languageSwitch && <div className="absolute top-6 right-6 z-10">{languageSwitch}</div>}

      <div className="relative w-full max-w-[900px] text-center">
        <DemoBanner />

        <Badge version={VERSION} label={t('badge_label')} />

        <Hero title={t('title')} subtitle={t('subtitle')} description={t('description')} />

        <Actions links={actionLinks} />

        <CopyCommand command={INSTALL_COMMAND} />

        {/* Living examples: Server Action + RHF/Zod form · TanStack Query SSR */}
        <div className="mb-8 grid gap-4 md:mb-12 md:grid-cols-2">
          <ContactForm />
          <HealthStatus />
        </div>

        <Stack items={stack} />
      </div>

      <Footer label={t('footer')} author={AUTHOR} authorUrl={AUTHOR_URL} />
    </section>
  );
}

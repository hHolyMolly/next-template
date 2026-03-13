/**
 * Demo Section (demo — delete after starting work)
 *
 * This component is a template demo page.
 * Replace it with your own home page content.
 *
 * To remove: delete the entire `home` folder at
 * src/app/[locale]/(routes)/home/
 * and update (routes)/page.tsx with your own page.
 */

import { useTranslations } from 'next-intl';

import Badge from '@/app/[locale]/(routes)/home/components/Demo/components/Badge';
import Hero from '@/app/[locale]/(routes)/home/components/Demo/components/Hero';
import Actions from '@/app/[locale]/(routes)/home/components/Demo/components/Actions';
import CopyCommand from '@/app/[locale]/(routes)/home/components/Demo/components/CopyCommand';
import Stack from '@/app/[locale]/(routes)/home/components/Demo/components/Stack';
import Footer from '@/app/[locale]/(routes)/home/components/Demo/components/Footer';
import {
  INSTALL_COMMAND,
  AUTHOR,
  AUTHOR_URL,
  VERSION,
} from '@/app/[locale]/(routes)/home/components/Demo/data/constants';
import { stack } from '@/app/[locale]/(routes)/home/components/Demo/data/stack';
import { actionLinks } from '@/app/[locale]/(routes)/home/components/Demo/data/actions';

import type { ReactNode } from 'react';

interface DemoProps {
  languageSwitch?: ReactNode;
}

export default function Demo({ languageSwitch }: DemoProps) {
  const t = useTranslations('demo');

  return (
    <section className="md:py-15 relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-10 md:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(56,189,248,0.1),transparent)]" />

      {languageSwitch && <div className="absolute right-6 top-6 z-10">{languageSwitch}</div>}

      <div className="relative w-full max-w-[900px] text-center">
        <Badge version={VERSION} label={t('badge_label')} />

        <Hero title={t('title')} subtitle={t('subtitle')} description={t('description')} />

        <Actions links={actionLinks} />

        <CopyCommand command={INSTALL_COMMAND} />

        <Stack items={stack} />
      </div>

      <Footer label={t('footer')} author={AUTHOR} authorUrl={AUTHOR_URL} />
    </section>
  );
}

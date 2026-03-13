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

import Badge from './components/Badge';
import Hero from './components/Hero';
import Actions from './components/Actions';
import CopyCommand from './components/CopyCommand';
import Stack from './components/Stack';
import Footer from './components/Footer';
import { INSTALL_COMMAND, AUTHOR, AUTHOR_URL, VERSION } from './constants';
import { stack } from './data/stack';
import { actionLinks } from './data/actions';

import type { ReactNode } from 'react';

interface DemoProps {
  languageSwitch?: ReactNode;
}

export default function Demo({ languageSwitch }: DemoProps) {
  const t = useTranslations('demo');

  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-15">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(56,189,248,0.1),transparent)]" />

      {languageSwitch && <div className="absolute top-6 right-6 z-10">{languageSwitch}</div>}

      <div className="relative w-full max-w-[720px] text-center">
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

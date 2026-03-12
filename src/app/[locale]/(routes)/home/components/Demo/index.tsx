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
import styles from './Demo.module.scss';

import type { ReactNode } from 'react';

interface DemoProps {
  languageSwitch?: ReactNode;
}

export default function Demo({ languageSwitch }: DemoProps) {
  const t = useTranslations('demo');

  return (
    <section className={styles.section}>
      <div className={styles.glow} />

      {languageSwitch && <div className={styles.languageSwitch}>{languageSwitch}</div>}

      <div className={styles.content}>
        <Badge version={VERSION} label={t('badge_label')} />

        <Hero
          title={t('title')}
          subtitle={t('subtitle')}
          description={t('description')}
        />

        <Actions links={actionLinks} />

        <CopyCommand command={INSTALL_COMMAND} />

        <Stack items={stack} />
      </div>

      <Footer
        label={t('footer')}
        author={AUTHOR}
        authorUrl={AUTHOR_URL}
      />
    </section>
  );
}

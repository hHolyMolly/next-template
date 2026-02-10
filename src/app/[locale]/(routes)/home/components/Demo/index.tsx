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

import CopyCommand from '@/app/[locale]/(routes)/home/components/Demo/CopyCommand';
import DemoBadge from '@/app/[locale]/(routes)/home/components/Demo/DemoBadge';
import DemoHero from '@/app/[locale]/(routes)/home/components/Demo/DemoHero';
import DemoActions from '@/app/[locale]/(routes)/home/components/Demo/DemoActions';
import DemoStack from '@/app/[locale]/(routes)/home/components/Demo/DemoStack';
import DemoFooter from '@/app/[locale]/(routes)/home/components/Demo/DemoFooter';
import { INSTALL_COMMAND, AUTHOR, AUTHOR_URL, VERSION } from './constants';
import { stack } from './stack';
import { actionLinks } from './actions';
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
        <DemoBadge version={VERSION} label={t('badge_label')} />

        <DemoHero
          title={t('title')}
          subtitle={t('subtitle')}
          description={t('description')}
        />

        <DemoActions links={actionLinks} />

        <CopyCommand command={INSTALL_COMMAND} />

        <DemoStack items={stack} />
      </div>

      <DemoFooter
        label={t('footer')}
        author={AUTHOR}
        authorUrl={AUTHOR_URL}
      />
    </section>
  );
}

/**
 * Welcome Section (demo — delete after starting work)
 *
 * This component is a template demo page.
 * Replace it with your own home page content.
 *
 * To remove: delete the entire `home` folder at
 * src/app/[locale]/(routes)/home/
 * and update (routes)/page.tsx with your own page.
 */

import { useTranslations } from 'next-intl';

import CopyCommand from '@/app/[locale]/(routes)/home/components/Welcome/CopyCommand';
import WelcomeBadge from '@/app/[locale]/(routes)/home/components/Welcome/WelcomeBadge';
import WelcomeHero from '@/app/[locale]/(routes)/home/components/Welcome/WelcomeHero';
import WelcomeActions from '@/app/[locale]/(routes)/home/components/Welcome/WelcomeActions';
import WelcomeStack from '@/app/[locale]/(routes)/home/components/Welcome/WelcomeStack';
import WelcomeFooter from '@/app/[locale]/(routes)/home/components/Welcome/WelcomeFooter';
import { INSTALL_COMMAND, AUTHOR, AUTHOR_URL, VERSION } from './constants';
import { stack } from './stack';
import { actionLinks } from './actions';
import styles from './Welcome.module.scss';

import type { ReactNode } from 'react';

interface WelcomeProps {
  languageSwitch?: ReactNode;
}

export default function Welcome({ languageSwitch }: WelcomeProps) {
  const t = useTranslations('welcome');

  return (
    <section className={styles.section}>
      <div className={styles.glow} />

      {languageSwitch && <div className={styles.languageSwitch}>{languageSwitch}</div>}

      <div className={styles.content}>
        <WelcomeBadge version={VERSION} label={t('badge_label')} />

        <WelcomeHero
          title={t('title')}
          subtitle={t('subtitle')}
          description={t('description')}
        />

        <WelcomeActions links={actionLinks} />

        <CopyCommand command={INSTALL_COMMAND} />

        <WelcomeStack items={stack} />
      </div>

      <WelcomeFooter
        label={t('footer')}
        author={AUTHOR}
        authorUrl={AUTHOR_URL}
      />
    </section>
  );
}

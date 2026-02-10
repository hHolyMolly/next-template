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

import CopyCommand from '@/app/[locale]/(routes)/home/components/Welcome/CopyCommand';
import WelcomeBadge from '@/app/[locale]/(routes)/home/components/Welcome/WelcomeBadge';
import WelcomeHero from '@/app/[locale]/(routes)/home/components/Welcome/WelcomeHero';
import WelcomeActions from '@/app/[locale]/(routes)/home/components/Welcome/WelcomeActions';
import WelcomeStack from '@/app/[locale]/(routes)/home/components/Welcome/WelcomeStack';
import WelcomeFooter from '@/app/[locale]/(routes)/home/components/Welcome/WelcomeFooter';
import {
  INSTALL_COMMAND,
  AUTHOR,
  AUTHOR_URL,
  VERSION,
} from '@/app/[locale]/(routes)/home/components/Welcome/constants';
import { stack } from '@/app/[locale]/(routes)/home/components/Welcome/stack';
import { actionLinks } from '@/app/[locale]/(routes)/home/components/Welcome/actions';
import styles from '@/app/[locale]/(routes)/home/components/Welcome/Welcome.module.scss';

interface WelcomeProps {
  languageSwitch?: React.ReactNode;
}

export default function Welcome({ languageSwitch }: WelcomeProps) {
  return (
    <section className={styles.section}>
      <div className={styles.glow} />

      {languageSwitch && <div className={styles.languageSwitch}>{languageSwitch}</div>}

      <div className={styles.content}>
        <WelcomeBadge version={VERSION} label="Production Ready" />

        <WelcomeHero
          title="Next.js Template"
          subtitle="for Modern Development"
          description="Production-ready template with TypeScript, Tailwind CSS, i18n, state management, and everything you need for scalable applications."
        />

        <WelcomeActions links={actionLinks} />

        <CopyCommand command={INSTALL_COMMAND} />

        <WelcomeStack items={stack} />
      </div>

      <WelcomeFooter author={AUTHOR} authorUrl={AUTHOR_URL} />
    </section>
  );
}

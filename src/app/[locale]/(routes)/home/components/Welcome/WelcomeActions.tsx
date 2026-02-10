import { useTranslations } from 'next-intl';

import type { ActionLink } from './types';
import styles from './Welcome.module.scss';

interface WelcomeActionsProps {
  links: ActionLink[];
}

export default function WelcomeActions({ links }: WelcomeActionsProps) {
  const t = useTranslations('welcome');

  return (
    <div className={styles.actions}>
      {links.map(({ href, labelKey, icon, variant }) => (
        <a
          key={labelKey}
          href={href}
          className={variant === 'primary' ? styles.btnPrimary : styles.btnSecondary}
          target="_blank"
          rel="noopener noreferrer"
        >
          {icon}
          {t(labelKey)}
        </a>
      ))}
    </div>
  );
}

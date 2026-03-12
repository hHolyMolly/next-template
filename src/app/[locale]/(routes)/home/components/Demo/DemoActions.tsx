import { useTranslations } from 'next-intl';

import type { ActionLink } from './types';
import styles from './Demo.module.scss';

interface DemoActionsProps {
  links: ActionLink[];
}

export default function DemoActions({ links }: DemoActionsProps) {
  const t = useTranslations('demo');

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
          <span className="sr-only">(opens in new tab)</span>
        </a>
      ))}
    </div>
  );
}

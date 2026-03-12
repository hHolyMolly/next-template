import { useTranslations } from 'next-intl';

import type { ActionLink } from '../types';
import styles from './Actions.module.scss';

interface ActionsProps {
  links: ActionLink[];
}

export default function Actions({ links }: ActionsProps) {
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

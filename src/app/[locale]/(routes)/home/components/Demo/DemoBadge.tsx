import styles from './Demo.module.scss';

interface DemoBadgeProps {
  version: string;
  label: string;
}

export default function DemoBadge({ version, label }: DemoBadgeProps) {
  return (
    <span className={styles.badge}>
      <span className={styles.badgeDot} />
      {version} — {label}
    </span>
  );
}

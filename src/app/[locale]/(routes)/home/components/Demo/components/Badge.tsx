import styles from './Badge.module.scss';

interface BadgeProps {
  version: string;
  label: string;
}

export default function Badge({ version, label }: BadgeProps) {
  return (
    <span className={styles.badge}>
      <span className={styles.dot} />
      {version} — {label}
    </span>
  );
}

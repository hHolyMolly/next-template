import styles from '@/app/[locale]/(routes)/home/components/Welcome/Welcome.module.scss';

interface WelcomeBadgeProps {
  version: string;
  label: string;
}

export default function WelcomeBadge({ version, label }: WelcomeBadgeProps) {
  return (
    <span className={styles.badge}>
      <span className={styles.badgeDot} />
      {version} — {label}
    </span>
  );
}

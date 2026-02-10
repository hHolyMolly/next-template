import styles from '@/app/[locale]/(routes)/home/components/Welcome/Welcome.module.scss';

interface ActionLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  variant: 'primary' | 'secondary';
}

interface WelcomeActionsProps {
  links: ActionLink[];
}

export default function WelcomeActions({ links }: WelcomeActionsProps) {
  return (
    <div className={styles.actions}>
      {links.map(({ href, label, icon, variant }) => (
        <a
          key={label}
          href={href}
          className={variant === 'primary' ? styles.btnPrimary : styles.btnSecondary}
          target="_blank"
          rel="noopener noreferrer"
        >
          {icon}
          {label}
        </a>
      ))}
    </div>
  );
}

export type { ActionLink };

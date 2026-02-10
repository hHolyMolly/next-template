import styles from './Welcome.module.scss';

interface WelcomeFooterProps {
  label: string;
  author: string;
  authorUrl: string;
}

export default function WelcomeFooter({ label, author, authorUrl }: WelcomeFooterProps) {
  return (
    <div className={styles.footer}>
      {label}{' '}
      <a href={authorUrl} target="_blank" rel="noopener noreferrer">
        @{author}
      </a>
    </div>
  );
}

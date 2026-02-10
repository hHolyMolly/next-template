import styles from '@/app/[locale]/(routes)/home/components/Welcome/Welcome.module.scss';

interface WelcomeFooterProps {
  author: string;
  authorUrl: string;
}

export default function WelcomeFooter({ author, authorUrl }: WelcomeFooterProps) {
  return (
    <div className={styles.footer}>
      Made by{' '}
      <a href={authorUrl} target="_blank" rel="noopener noreferrer">
        @{author}
      </a>
    </div>
  );
}

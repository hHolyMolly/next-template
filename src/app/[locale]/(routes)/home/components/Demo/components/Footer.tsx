import styles from './Footer.module.scss';

interface FooterProps {
  label: string;
  author: string;
  authorUrl: string;
}

export default function Footer({ label, author, authorUrl }: FooterProps) {
  return (
    <div className={styles.footer}>
      {label}{' '}
      <a href={authorUrl} target="_blank" rel="noopener noreferrer">
        @{author}
      </a>
    </div>
  );
}

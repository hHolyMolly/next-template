import styles from './Demo.module.scss';

interface DemoFooterProps {
  label: string;
  author: string;
  authorUrl: string;
}

export default function DemoFooter({ label, author, authorUrl }: DemoFooterProps) {
  return (
    <div className={styles.footer}>
      {label}{' '}
      <a href={authorUrl} target="_blank" rel="noopener noreferrer">
        @{author}
      </a>
    </div>
  );
}

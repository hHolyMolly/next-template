import type { StackItem } from './types';
import styles from './Demo.module.scss';

interface DemoStackProps {
  items: StackItem[];
}

export default function DemoStack({ items }: DemoStackProps) {
  return (
    <div className={styles.stack}>
      {items.map(({ name, color, icon }) => (
        <span key={name} className={styles.tag}>
          <svg className={styles.tagIcon} viewBox="0 0 24 24" fill={color}>
            <path d={icon} />
          </svg>
          {name}
        </span>
      ))}
    </div>
  );
}

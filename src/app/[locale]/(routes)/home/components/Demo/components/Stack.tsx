import type { StackItem } from '../types';
import styles from './Stack.module.scss';

interface StackProps {
  items: StackItem[];
}

export default function Stack({ items }: StackProps) {
  return (
    <div className={styles.stack}>
      {items.map(({ name, color, icon }) => (
        <span key={name} className={styles.tag}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill={color} aria-hidden="true">
            <path d={icon} />
          </svg>
          {name}
        </span>
      ))}
    </div>
  );
}

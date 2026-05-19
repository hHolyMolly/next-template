import { cn } from '@/lib/cn';

import type { ReactNode, CSSProperties } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export default function Container({ children, className, style }: Props) {
  return (
    <div className={cn('container', className)} style={style}>
      {children}
    </div>
  );
}

import type { ReactNode, CSSProperties } from 'react';

import { cn } from '@/lib/cn';

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

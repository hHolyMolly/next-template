import React from 'react';
import clsx from 'clsx';

type Props = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

function Container({ children, className, style }: Props) {
  return (
    <div className={clsx('container', className)} style={style}>
      {children}
    </div>
  );
}

export default React.memo(Container);

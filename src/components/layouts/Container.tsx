import React from 'react';
import classNames from 'classnames';

type Props = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

function Container({ children, className, style }: Props) {
  return (
    <div className={classNames('container', className)} style={style}>
      {children}
    </div>
  );
}

export default React.memo(Container);

import React from 'react';
import classNames from 'classnames';

import styles from '@components/icons/LoadingIcon/index.module.scss';

type Props = {
  className?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
};

const LoadingIcon: React.FC<Props> = ({
  className,
  size = 20,
  strokeWidth = 3,
  color = 'currentColor',
}) => {
  return (
    <div
      className={classNames(styles.LoadingElem, className)}
      style={{
        width: size,
        height: size,
      }}
    >
      {[...Array(4)].map((_, idx: number) => (
        <div
          style={{
            width: size,
            height: size,
            borderWidth: strokeWidth,
            borderColor: `${color} transparent transparent transparent`,
          }}
          key={`loading-icon_${idx}`}
        />
      ))}
    </div>
  );
};

export default React.memo(LoadingIcon);

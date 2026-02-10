import React from 'react';
import clsx from 'clsx';

import styles from '@/components/icons/LoadingIcon/index.module.scss';

type LoadingIconProps = {
  className?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
};

const LoadingIconComponent = ({
  className,
  size = 20,
  strokeWidth = 3,
  color = 'currentColor',
}: LoadingIconProps) => {
  const containerStyle = React.useMemo(
    () => ({
      width: size,
      height: size,
    }),
    [size],
  );

  const getItemStyle = React.useCallback(
    () => ({
      width: size,
      height: size,
      borderWidth: strokeWidth,
      borderColor: `${color} transparent transparent transparent`,
    }),
    [size, strokeWidth, color],
  );

  return (
    <div className={clsx(styles.LoadingElem, className)} style={containerStyle}>
      {[...Array(4)].map((_, idx: number) => (
        <div style={getItemStyle()} key={`loading-icon_${idx}`} />
      ))}
    </div>
  );
};

LoadingIconComponent.displayName = 'LoadingIcon';

const LoadingIcon = React.memo(LoadingIconComponent);

export { LoadingIcon };

import { useMemo, memo } from 'react';

import { cn } from '@/lib/cn';

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
  const containerStyle = useMemo(() => ({ width: size, height: size }), [size]);

  const itemStyle = useMemo(
    () => ({
      width: size,
      height: size,
      borderWidth: strokeWidth,
      borderColor: `${color} transparent transparent transparent`,
    }),
    [size, strokeWidth, color],
  );

  return (
    <div className={cn(styles.LoadingElem, className)} style={containerStyle}>
      {[...Array(4)].map((_, idx: number) => (
        <div style={itemStyle} key={`loading-icon_${idx}`} />
      ))}
    </div>
  );
};

LoadingIconComponent.displayName = 'LoadingIcon';

const LoadingIcon = memo(LoadingIconComponent);

export { LoadingIcon };

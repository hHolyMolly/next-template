import { cn } from '@/lib/cn';

type LoadingIconProps = {
  className?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  /** Accessible name — pass a translated string (e.g. t('shared.loading')). */
  label?: string;
};

const DELAY_CLASSES = [
  '[animation-delay:-0.45s]',
  '[animation-delay:-0.3s]',
  '[animation-delay:-0.15s]',
  '',
] as const;

function LoadingIcon({
  className,
  size = 20,
  strokeWidth = 3,
  color = 'currentColor',
  label = 'Loading',
}: LoadingIconProps) {
  return (
    <div
      className={cn('relative inline-block', className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    >
      {Array.from({ length: 4 }, (_, idx) => (
        <div
          className={cn(
            'absolute block animate-spinner rounded-full border-solid',
            DELAY_CLASSES[idx],
          )}
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
}

export { LoadingIcon };

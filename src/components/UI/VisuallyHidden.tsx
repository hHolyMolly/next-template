import { cn } from '@/lib/cn';

import type { ComponentProps } from 'react';

/**
 * Screen-reader-only text. Accepts every `<span>` prop, so it can carry
 * `role="status"` for live announcements.
 */
function VisuallyHidden({ className, ...props }: ComponentProps<'span'>) {
  return <span className={cn('sr-only', className)} {...props} />;
}

export { VisuallyHidden };

import * as React from 'react';

import { cn } from '@/lib/cn';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  ref?: React.Ref<HTMLInputElement>;
  /** Error message — renders below the input and flips `aria-invalid`. */
  error?: string | null;
  /** Helper text shown when `error` is absent. */
  hint?: string;
  /** Visual label. If omitted, caller must wire accessible naming manually. */
  label?: string;
  /** Optional wrapper className — `className` is still forwarded to the input. */
  containerClassName?: string;
};

function Input({
  className,
  containerClassName,
  type,
  ref,
  id,
  error,
  hint,
  label,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: InputProps) {
  const reactId = React.useId();
  const inputId = id ?? reactId;
  // Only reference elements that actually render — error hides the hint,
  // and a dangling id in aria-describedby is an a11y defect.
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint && !error ? `${inputId}-hint` : undefined;

  const describedBy = [ariaDescribedBy, errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {/* No hardcoded label color — it inherits, so the field works on dark
          surfaces too (set a text color on `containerClassName`). */}
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        type={type}
        aria-invalid={ariaInvalid ?? (error ? true : undefined)}
        aria-describedby={describedBy}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className,
        )}
        ref={ref}
        {...props}
      />

      {/* No role="alert": aria-invalid + aria-describedby already announce
          the message — an alert on top of that reads it twice. */}
      {error ? (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export { Input };
export type { InputProps };

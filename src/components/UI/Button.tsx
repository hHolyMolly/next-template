import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';

import { type TypeStatus } from '@/types';

import { LoadingIcon } from '@/components/icons';

const buttonVariants = cva(
  'gap-x-[6px] inline-flex justify-center items-center overflow-hidden text-center font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-500 text-white hover:bg-blue-600',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        outline: 'border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-100',
        ghost: 'bg-transparent text-gray-900 hover:bg-gray-100',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-[6px]',
        md: 'h-10 px-4 text-base rounded-[8px]',
        lg: 'h-12 px-6 text-lg rounded-[10px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    status?: TypeStatus;
    before?: React.ReactNode;
    after?: React.ReactNode;
  };

const ButtonComponent = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant,
      size,
      status = 'loaded',
      before,
      after,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = status === 'error' || disabled;

    return (
      <button
        ref={ref}
        className={clsx(
          buttonVariants({ variant, size }),
          status === 'loading' && 'pointer-events-none',
          className,
        )}
        disabled={isDisabled}
        {...props}
      >
        {status !== 'loading' ? (
          <>
            {before && <span>{before}</span>}
            <span>{children}</span>
            {after && <span>{after}</span>}
          </>
        ) : (
          <LoadingIcon />
        )}
      </button>
    );
  },
);

ButtonComponent.displayName = 'Button';

const Button = React.memo(ButtonComponent);

export { Button, buttonVariants };
export type { ButtonProps };

import React from 'react';
import classNames from 'classnames';

import { type TypeStatus } from '@interfaces/status.types';

import { LoadingIcon } from '@components/icons';

type Props<T = React.ReactNode> = {
  children: T;
  className?: HTMLButtonElement["className"];
  style?: React.CSSProperties;
  onClick?: () => void;
  disabled?: HTMLButtonElement["disabled"];
  type?: 'submit' | 'reset' | 'button';
  status?: TypeStatus;
  ariaLabel?: string;

  before?: T;
  after?: T;
};

const Button: React.FC<Props> = ({
  children,
  className,
  style,
  onClick,
  disabled,
  type = 'button',
  status = 'loaded',
  ariaLabel,

  before,
  after,
}) => {
  return (
    <button
      className={classNames(
        'gap-x-[6px] inline-flex justify-center items-center overflow-hidden rounded-[8px] bg-blue-500 text-center font-semibold text-white',

        className,

        // loading
        status === 'loading' && 'pointer-events-none',

        // error
        'disabled:pointer-events-none',
      )}
      style={style}
      onClick={() => onClick?.()}
      type={type}
      disabled={status === "error" || disabled}
      aria-label={ariaLabel}
    >
      {status !== "loading" ? (
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
};

export default React.memo(Button);

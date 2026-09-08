import type { ReactNode } from 'react';

/** Demo page action link */
export type ActionLink = {
  href: string;
  labelKey: 'github' | 'documentation';
  icon: ReactNode;
  variant: 'primary' | 'secondary';
};

/** Technology stack item */
export type StackItem = {
  name: string;
  color: string;
  icon: string;
};

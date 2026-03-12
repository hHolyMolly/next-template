import type { ReactNode } from 'react';

/** Demo page action link */
export interface ActionLink {
  href: string;
  labelKey: 'github' | 'documentation';
  icon: ReactNode;
  variant: 'primary' | 'secondary';
}

/** Technology stack item */
export interface StackItem {
  name: string;
  color: string;
  icon: string;
}

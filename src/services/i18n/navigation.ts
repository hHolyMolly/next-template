import { createNavigation } from 'next-intl/navigation';

import { routing } from '@services/i18n/routing';

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);

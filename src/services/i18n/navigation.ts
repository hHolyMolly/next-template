import { createNavigation } from 'next-intl/navigation';

import { routing } from '@/services/i18n/routing';

/**
 * Типизированные навигационные хелперы на основе конфигурации локалей.
 */
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);

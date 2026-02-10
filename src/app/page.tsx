import { redirect } from '@/services/i18n/navigation';
import { routing } from '@/services/i18n/routing';

import routes from '@/configs/routes';

function RootPage() {
  redirect({ href: routes.Home, locale: routing.defaultLocale });
}

export default RootPage;

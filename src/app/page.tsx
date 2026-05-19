import routes from '@/configs/routes';
import { redirect } from '@/services/i18n/navigation';
import { routing } from '@/services/i18n/routing';

function RootPage() {
  redirect({ href: routes.home(), locale: routing.defaultLocale });
}

export default RootPage;

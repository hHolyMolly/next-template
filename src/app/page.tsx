import { redirect } from 'next/navigation';

import routes from '@configs/routes';

function RootHomePage() {
  redirect(routes.Home);
}

export default RootHomePage;

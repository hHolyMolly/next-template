import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { Demo, LanguageSwitch } from '@/app/[locale]/components';
import { getQueryClient } from '@/lib/queryClient';
import { healthQuery } from '@/services/api/queries';

export { generateHomeMetadata as generateMetadata } from '@/app/[locale]/metadata';

async function HomePage() {
  // SSR prefetch: HealthStatus (client) reads this from the hydrated cache
  // instead of fetching after mount. `prefetchQuery` never throws — on
  // failure the client simply refetches.
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(healthQuery);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Demo languageSwitch={<LanguageSwitch />} />
    </HydrationBoundary>
  );
}

export default HomePage;

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { setRequestLocale } from 'next-intl/server';

import { Demo } from '@/app/[locale]/components/Demo';
import { LanguageSwitch } from '@/app/[locale]/components/LanguageSwitch';
import { getQueryClient } from '@/lib/queryClient';
import { healthQuery } from '@/services/api/queries';

export { generateHomeMetadata as generateMetadata } from '@/app/[locale]/metadata';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // SSR prefetch: HealthStatus (client) reads this from the hydrated cache
  // instead of fetching after mount. `prefetchQuery` never throws — on
  // failure the client simply refetches. Fired without await: TanStack v5
  // dehydrates pending promises, so blocking TTFB on a self-fetch here
  // would only slow the page down.
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(healthQuery);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main id="main-content">
        <Demo languageSwitch={<LanguageSwitch />} />
      </main>
    </HydrationBoundary>
  );
}

export default HomePage;

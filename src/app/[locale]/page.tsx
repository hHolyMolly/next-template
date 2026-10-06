import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { setRequestLocale } from 'next-intl/server';

import { Demo } from '@/app/[locale]/components/Demo';
import { getHealth } from '@/app/api/health/getHealth';
import { LanguageSwitch } from '@/components/layouts/LanguageSwitch';
import { getQueryClient } from '@/lib/queryClient';
import { healthQuery } from '@/services/api/queries';

export { generateHomeMetadata as generateMetadata } from '@/app/[locale]/metadata';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // SSR prefetch, streamed: the SAME query key the client uses, but the
  // server calls the data function directly (`getHealth()`) — never a
  // self-fetch into its own /api route. Fired without `await` on purpose:
  // the query client dehydrates PENDING queries (see lib/queryClient), so
  // the promise streams in the RSC payload and `HealthStatus` resolves it
  // through `useSuspenseQuery`. `prefetchQuery` never throws.
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery({ ...healthQuery, queryFn: getHealth });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main id="main-content">
        <Demo languageSwitch={<LanguageSwitch variant="inverse" />} />
      </main>
    </HydrationBoundary>
  );
}

export default HomePage;

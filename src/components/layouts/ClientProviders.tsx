'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useState, type ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import { Toaster } from '@/components/UI/Sonner';
import { getQueryClient } from '@/lib/queryClient';
import { WebVitals } from '@/lib/webVitals';
import { makeStore, type AppStore } from '@/store';

type ClientProvidersProps = {
  children: ReactNode;
};

// Dynamic + ssr:false keeps the devtools bundle out of SSR; the dev-only
// guard below keeps it out of production builds entirely (DCE).
const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then((m) => m.ReactQueryDevtools),
  { ssr: false, loading: () => null },
);

const isDev = process.env.NODE_ENV === 'development';

export function ClientProviders({ children }: ClientProvidersProps) {
  const [store] = useState<AppStore>(() => makeStore());
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={store}>{children}</ReduxProvider>
      {/* Toaster/WebVitals don't consume the store — no reason to remount
          them if the Redux tree ever changes. */}
      <Toaster />
      {/* Always mounted: web vitals matter MOST in production (the hook
          itself decides where metrics go — dev log vs. beacon). */}
      <WebVitals />
      {isDev && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import { Toaster } from '@/components/UI/Sonner';
import { getQueryClient } from '@/lib/queryClient';
import { WebVitals } from '@/lib/webVitals';
import { makeStore, type AppStore } from '@/store';

type ClientProvidersProps = {
  children: ReactNode;
};

const isDev = process.env.NODE_ENV === 'development';

function ClientProviders({ children }: ClientProvidersProps) {
  const [store] = useState<AppStore>(() => makeStore());
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={store}>
        {children}
        <Toaster />
      </ReduxProvider>
      {isDev && <ReactQueryDevtools initialIsOpen={false} />}
      {isDev && <WebVitals />}
    </QueryClientProvider>
  );
}

export default ClientProviders;

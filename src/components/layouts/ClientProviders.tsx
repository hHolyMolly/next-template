'use client';

import { useState, type ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { makeStore, type AppStore } from '@/store';
import { getQueryClient } from '@/lib/queryClient';

import { ThemeProvider } from '@/components/layouts/ThemeProvider';
import { Toaster } from '@/components/UI/Sonner';
import { WebVitals } from '@/lib/webVitals';

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
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </ReduxProvider>
      {isDev && <ReactQueryDevtools initialIsOpen={false} />}
      {isDev && <WebVitals />}
    </QueryClientProvider>
  );
}

export default ClientProviders;

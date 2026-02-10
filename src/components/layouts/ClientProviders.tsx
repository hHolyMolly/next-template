'use client';

import { useState, type ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { makeStore, type AppStore } from '@/store';
import { getQueryClient } from '@/lib/queryClient';

type ClientProvidersProps = {
  children: ReactNode;
};

function ClientProviders({ children }: ClientProvidersProps) {
  const [store] = useState<AppStore>(() => makeStore());
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={store}>{children}</ReduxProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default ClientProviders;

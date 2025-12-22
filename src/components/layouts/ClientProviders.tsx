'use client';

import React from 'react'
import { Provider as ReduxProvider } from 'react-redux';

import { store } from '@store';

type ClientProvidersProps = {
  children: React.ReactNode;
};

function ClientProviders({ children }: ClientProvidersProps) {
  return <ReduxProvider store={store}>{children}</ReduxProvider>;
}

export default ClientProviders;

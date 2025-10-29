'use client';

import { Provider } from 'react-redux';

import { store } from '@store';

type ReduxProviderWrapperProps = {
  children: React.ReactNode;
};

function ReduxProviderWrapper({ children }: ReduxProviderWrapperProps) {
  return <Provider store={store}>{children}</Provider>;
}

export default ReduxProviderWrapper;

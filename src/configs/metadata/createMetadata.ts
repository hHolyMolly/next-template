import { type Metadata } from 'next';

import getBaseMetadata from '@configs/metadata/getBaseMetadata';

async function createMetadata(overrides?: Partial<Metadata>): Promise<Metadata> {
  const base = await getBaseMetadata();

  return {
    ...base,
    ...overrides,

    openGraph: {
      ...base.openGraph,
      ...overrides?.openGraph,
    },

    twitter: {
      ...base.twitter,
      ...overrides?.twitter,
    },
  };
}

export default createMetadata;

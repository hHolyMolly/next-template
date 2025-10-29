import { notFound } from 'next/navigation';

import { generateNotFoundMetadata } from '@app/[locale]/not-found/metadata';

export const generateMetadata = generateNotFoundMetadata;

function CatchAllPage() {
  notFound();
}

export default CatchAllPage;

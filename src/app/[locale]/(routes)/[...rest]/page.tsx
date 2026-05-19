import { notFound } from 'next/navigation';

export { generateNotFoundMetadata as generateMetadata } from '@/app/[locale]/not-found.metadata';

function CatchAllPage() {
  notFound();
}

export default CatchAllPage;

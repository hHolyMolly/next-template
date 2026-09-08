import { notFound } from 'next/navigation';

export { generateNotFoundMetadata as generateMetadata } from '@/app/[locale]/not-found.metadata';

// `never`: notFound() throws unconditionally — this page never renders.
function CatchAllPage(): never {
  notFound();
}

export default CatchAllPage;

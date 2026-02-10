import { notFound } from 'next/navigation';

/**
 * Catch-all страница для обработки несуществующих маршрутов.
 * Перенаправляет на стандартную 404-страницу Next.js.
 */
function CatchAllPage() {
  notFound();
}

export default CatchAllPage;

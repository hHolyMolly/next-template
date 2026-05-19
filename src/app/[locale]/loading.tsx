import { Skeleton } from '@/components/UI';

/**
 * Locale-level loading UI — streamed while the segment resolves.
 * App Router shows this automatically on client-side navigations and on
 * the initial server render while PPR dynamic parts resolve.
 */
function Loading() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-4 w-56" />
    </div>
  );
}

export default Loading;

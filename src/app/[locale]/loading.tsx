import { LoadingIcon } from '@/components/icons';

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <LoadingIcon size={40} strokeWidth={4} />
    </div>
  );
}

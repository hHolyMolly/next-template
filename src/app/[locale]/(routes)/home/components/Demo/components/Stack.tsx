import type { StackItem } from '@/app/[locale]/(routes)/home/components/Demo/types';

interface StackProps {
  items: StackItem[];
}

export default function Stack({ items }: StackProps) {
  return (
    <div className="mx-auto flex max-w-[900px] flex-wrap justify-center gap-2 md:gap-3">
      {items.map(({ name, color, icon }) => (
        <span
          key={name}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm font-medium text-slate-200 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] md:px-4 md:py-2.5"
        >
          <svg className="size-[18px] shrink-0" viewBox="0 0 24 24" fill={color} aria-hidden="true">
            <path d={icon} />
          </svg>
          {name}
        </span>
      ))}
    </div>
  );
}

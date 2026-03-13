import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';

import type { ActionLink } from '@/app/[locale]/(routes)/home/components/Demo/types';

interface ActionsProps {
  links: ActionLink[];
}

export default function Actions({ links }: ActionsProps) {
  const t = useTranslations('demo');

  return (
    <div className="mb-8 flex flex-wrap justify-center gap-4 md:mb-12">
      {links.map(({ href, labelKey, icon, variant }) => (
        <a
          key={labelKey}
          href={href}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 md:px-8 md:py-4',
            variant === 'primary'
              ? 'bg-gradient-to-br from-sky-400 to-indigo-400 text-slate-900 shadow-[0_4px_24px_rgba(56,189,248,0.3)] hover:shadow-[0_8px_32px_rgba(56,189,248,0.4)]'
              : 'border border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/[0.08]',
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          {icon}
          {t(labelKey)}
          <span className="sr-only">(opens in new tab)</span>
        </a>
      ))}
    </div>
  );
}

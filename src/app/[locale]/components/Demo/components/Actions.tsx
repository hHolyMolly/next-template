import { cva } from 'class-variance-authority';
import { useTranslations } from 'next-intl';

import type { ActionLink } from '@/app/[locale]/components/Demo/types';
import { VisuallyHidden } from '@/components/UI';

type ActionsProps = {
  links: ActionLink[];
};

const actionVariants = cva(
  'inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 md:px-8 md:py-4',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-br from-sky-400 to-indigo-400 text-slate-900 shadow-[0_4px_24px_rgba(56,189,248,0.3)] hover:shadow-[0_8px_32px_rgba(56,189,248,0.4)]',
        secondary:
          'border border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10',
      },
    },
  },
);

export function Actions({ links }: ActionsProps) {
  const t = useTranslations('demo');
  const tShared = useTranslations('translations.shared');

  return (
    <div className="mb-8 flex flex-wrap justify-center gap-4 md:mb-12">
      {links.map(({ href, labelKey, icon, variant }) => (
        <a
          key={labelKey}
          href={href}
          className={actionVariants({ variant })}
          target="_blank"
          rel="noopener noreferrer"
        >
          {icon}
          {t(labelKey)}
          <VisuallyHidden>{tShared('opens_in_new_tab')}</VisuallyHidden>
        </a>
      ))}
    </div>
  );
}

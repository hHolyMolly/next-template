'use client';

import { useTranslations } from 'next-intl';

import { VisuallyHidden } from '@/components/UI';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

type CopyCommandProps = {
  command: string;
};

export function CopyCommand({ command }: CopyCommandProps) {
  const t = useTranslations('demo');
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className="mx-auto mb-8 max-w-[520px] md:mb-12">
      <button
        type="button"
        onClick={() => void copy(command)}
        className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left font-mono text-sm text-slate-300 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] md:px-6 md:py-4"
        aria-label={t('copy_label', { command })}
      >
        <span className="text-slate-500 select-none">$</span>
        <span className="flex-1 truncate">{command}</span>

        <span className="shrink-0 text-slate-500 transition-colors duration-200 group-hover:text-slate-300">
          {copied ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-scale-in text-green-500"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
        </span>

        {/* Announce the state change to screen readers — the icon swap is silent. */}
        <VisuallyHidden role="status">{copied ? t('copy_done') : ''}</VisuallyHidden>
      </button>
    </div>
  );
}

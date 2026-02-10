'use client';

import React from 'react';

import styles from '@/app/[locale]/(routes)/home/components/Welcome/Welcome.module.scss';

interface CopyCommandProps {
  command: string;
}

export default function CopyCommand({ command }: CopyCommandProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard API not available */
    }
  }, [command]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group flex items-center gap-3 w-full max-w-lg mx-auto px-6 py-4 text-sm text-slate-300 bg-white/5 border border-white/10 rounded-xl font-mono hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer text-left"
    >
      <span className="text-slate-500 select-none">$</span>
      <span className="flex-1 truncate">{command}</span>

      <span className="flex-shrink-0 ml-2 transition-all">
        {copied ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.scaleIn}
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
            className="text-slate-500 group-hover:text-slate-300 transition-colors"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        )}
      </span>
    </button>
  );
}

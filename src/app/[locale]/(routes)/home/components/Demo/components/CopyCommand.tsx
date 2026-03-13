'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

import { cn } from '@/lib/cn';

interface CopyCommandProps {
  command: string;
}

export default function CopyCommand({ command }: CopyCommandProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard API not available */
    }
  }, [command]);

  return (
    <div className="mx-auto mb-12 max-w-[520px]">
      <button
        type="button"
        onClick={handleCopy}
        className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-left font-mono text-sm text-slate-300 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08]"
        aria-label={`Copy install command: ${command}`}
      >
        <span className="select-none text-slate-500">$</span>
        <span className="flex-1 truncate">{command}</span>

        <span className="shrink-0 text-slate-500 transition-colors duration-200 group-hover:text-slate-300">
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
              className={cn('text-green-500', 'animate-[scale-in_0.2s_ease-out]')}
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
      </button>
    </div>
  );
}

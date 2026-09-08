'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Copy text to the clipboard with a self-resetting "copied" flag.
 *
 * @param resetAfterMs How long `copied` stays true (default 2000 ms).
 * @returns `copy(text)` resolves `true` on success, `false` when the
 *          Clipboard API is unavailable or rejected.
 *
 * @example
 * const { copied, copy } = useCopyToClipboard();
 * <button onClick={() => copy(command)}>{copied ? '✓' : 'Copy'}</button>
 */
export function useCopyToClipboard(resetAfterMs = 2000): {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
} {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        return false; // Clipboard API unavailable (permissions, insecure context)
      }
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), resetAfterMs);
      return true;
    },
    [resetAfterMs],
  );

  return { copied, copy };
}

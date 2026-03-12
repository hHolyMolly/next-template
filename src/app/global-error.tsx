'use client';

import { ThemeScript } from '@/components/layouts/ThemeProvider';

/**
 * Global error boundary — catches errors in root layout.
 *
 * This is the ONLY error boundary that wraps `app/layout.tsx`.
 * When the root layout itself throws, Next.js replaces the entire page
 * with this component, so `<html>` and `<body>` tags are **required**.
 *
 * - i18n is unavailable (layout is broken) — text is hardcoded.
 * - `reset()` re-renders the root layout segment to attempt recovery.
 */

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: '16px',
          fontFamily: 'system-ui, sans-serif',
          margin: 0,
          color: 'var(--text-primary, #1a1a1a)',
          backgroundColor: 'var(--bg-primary, #fafafa)',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Something went wrong</h2>

        {process.env.NODE_ENV === 'development' && error.message && (
          <pre
            style={{
              maxWidth: '600px',
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              fontSize: '0.875rem',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {error.message}
          </pre>
        )}

        <button
          onClick={reset}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            background: 'var(--accent, #000)',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}

export default GlobalError;

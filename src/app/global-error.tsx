'use client';

/**
 * Global Error — обрабатывает ошибки root layout.
 * i18n недоступен, т.к. layout сломан — тексты inline.
 */
function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: '16px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <h2>Something went wrong</h2>
        <button
          onClick={reset}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            background: '#000',
            color: '#fff',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}

export default GlobalError;

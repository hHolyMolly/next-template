import Link from 'next/link';

/**
 * Root-level 404 page — outside [locale] layout.
 *
 * Catches requests that don't match any locale prefix (e.g., `/nonexistent`).
 * i18n is unavailable here, so text is hardcoded.
 *
 * `[locale]/not-found.tsx` handles 404s inside locale routes.
 */
function RootNotFoundPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: '16px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h2 style={{ fontSize: '3.5rem', fontWeight: 700, margin: 0 }}>404</h2>
      <p style={{ color: '#6b7280', margin: 0 }}>Page not found</p>
      <Link
        href="/"
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          background: '#000',
          color: '#fff',
          textDecoration: 'none',
          fontSize: '0.875rem',
        }}
      >
        Go home
      </Link>
    </div>
  );
}

export default RootNotFoundPage;

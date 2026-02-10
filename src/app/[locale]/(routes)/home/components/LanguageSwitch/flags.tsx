/**
 * Locale flag SVG components.
 *
 * Add new flags here when adding new locales.
 * Each flag is a 20×15 SVG matching a country flag.
 */

export const localeFlags: Record<string, React.ReactNode> = {
  en: (
    <svg width="20" height="15" viewBox="0 0 60 30" className="rounded-sm flex-shrink-0">
      <clipPath id="en-clip">
        <rect width="60" height="30" rx="2" />
      </clipPath>
      <g clipPath="url(#en-clip)">
        <rect width="60" height="30" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0V30 M0,15H60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0V30 M0,15H60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  ),

  ru: (
    <svg width="20" height="15" viewBox="0 0 60 30" className="rounded-sm flex-shrink-0">
      <rect width="60" height="30" rx="2" fill="#0039A6" />
      <rect width="60" height="10" fill="#fff" />
      <rect y="20" width="60" height="10" fill="#D52B1E" />
    </svg>
  ),
};

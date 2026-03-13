interface FooterProps {
  label: string;
  author: string;
  authorUrl: string;
}

export default function Footer({ label, author, authorUrl }: FooterProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-slate-600 md:bottom-6">
      {label}{' '}
      <a
        href={authorUrl}
        className="text-slate-500 transition-colors duration-200 hover:text-slate-400"
        target="_blank"
        rel="noopener noreferrer"
      >
        @{author}
      </a>
    </div>
  );
}

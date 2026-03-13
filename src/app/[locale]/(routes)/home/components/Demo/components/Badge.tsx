interface BadgeProps {
  version: string;
  label: string;
}

export default function Badge({ version, label }: BadgeProps) {
  return (
    <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-400 md:mb-6">
      <span className="size-1.5 animate-pulse rounded-full bg-green-500" />
      {version} — {label}
    </span>
  );
}

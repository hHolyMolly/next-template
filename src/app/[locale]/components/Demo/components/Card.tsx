import type { ReactNode } from 'react';

type CardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

/** Shared card chrome for the demo widgets (ContactForm, HealthStatus). */
export function Card({ title, description, children }: CardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
      <h2 className="mb-1 text-lg font-semibold text-slate-100">{title}</h2>
      <p className="mb-5 text-sm text-slate-400">{description}</p>
      {children}
    </div>
  );
}

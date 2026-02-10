/**
 * Welcome Section (demo — delete after starting work)
 *
 * This component is a template demo page.
 * Replace it with your own home page content.
 *
 * To remove: delete the entire `home` folder at
 * src/app/[locale]/(routes)/home/
 * and update (routes)/page.tsx with your own page.
 */

import CopyCommand from '@/app/[locale]/(routes)/home/components/Welcome/CopyCommand';
import { INSTALL_COMMAND, GITHUB_URL, README_URL } from '@/app/[locale]/(routes)/home/components/Welcome/constants';
import { stack } from '@/app/[locale]/(routes)/home/components/Welcome/stack';

interface WelcomeProps {
  languageSwitch?: React.ReactNode;
}

export default function Welcome({ languageSwitch }: WelcomeProps) {
  return (
    <section className="relative min-h-dvh flex flex-col items-center justify-center px-6 py-20 bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.15), transparent)',
            'radial-gradient(ellipse 60% 40% at 100% 100%, rgba(56, 189, 248, 0.1), transparent)',
          ].join(', '),
        }}
      />

      <div className="relative text-center max-w-2xl w-full">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-medium text-sky-400 bg-sky-400/10 border border-sky-400/20 rounded-full">
          <span className="size-1.5 bg-green-500 rounded-full animate-pulse" />
          v1.0 — Production Ready
        </span>

        {/* Title */}
        <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-tight tracking-tight text-slate-50 mb-6 text-balance">
          Next.js Template
          <br />
          <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            for Modern Development
          </span>
        </h1>

        {/* Description */}
        <p className="text-xl leading-relaxed text-slate-400 mb-10">
          Production-ready template with TypeScript, Tailwind CSS, i18n, state management, and
          everything you need for scalable applications.
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-center flex-wrap mb-10">
          {/* GitHub button */}
          <a
            href={GITHUB_URL}
            className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold text-slate-900 bg-gradient-to-r from-sky-400 to-indigo-400 rounded-xl shadow-lg shadow-sky-400/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-400/40 transition-all"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>

          {/* Documentation button */}
          <a
            href={README_URL}
            className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
              <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
            </svg>
            Documentation
          </a>

          {/* Language switch */}
          {languageSwitch && (
            <div className="flex items-center gap-3 px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl">
              {languageSwitch}
            </div>
          )}
        </div>

        {/* Install command with copy */}
        <div className="mb-12">
          <CopyCommand command={INSTALL_COMMAND} />
        </div>

        {/* Stack with SVG logos */}
        <div className="flex flex-wrap gap-3 justify-center max-w-xl mx-auto">
          {stack.map(({ name, color, icon }) => (
            <span
              key={name}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-200 bg-white/[0.03] border border-white/[0.06] rounded-lg hover:bg-white/[0.06] hover:border-white/10 transition-all"
            >
              <svg className="size-[18px] flex-shrink-0" viewBox="0 0 24 24" fill={color}>
                <path d={icon} />
              </svg>
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-sm text-slate-600">
        Made by{' '}
        <a
          href="https://github.com/hHolyMolly"
          className="text-slate-500 hover:text-slate-400 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          @HolyMolly
        </a>
      </div>
    </section>
  );
}

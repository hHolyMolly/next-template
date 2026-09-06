<div align="center">
  <h1>Next Template</h1>
  <p>Production-ready Next.js starter with TypeScript, Tailwind CSS v4, i18n and working examples for every shipped library</p>

  <p>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D22-brightgreen?style=flat-square" alt="Node.js"></a>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/next.js-16-black?style=flat-square" alt="Next.js"></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/typescript-strict-3178C6?style=flat-square" alt="TypeScript"></a>
    <a href="https://github.com/hHolyMolly/next-template/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License"></a>
  </p>
</div>

<br />

## Features

- **Next.js 16** — App Router, Turbopack, React 19, React Compiler
- **TypeScript** — strict mode (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- **Tailwind CSS v4** — CSS-first config, oklch design tokens, shadcn/ui components
- **i18n** — next-intl, `[locale]` routing, key-parity check, typed messages
- **State** — Redux Toolkit (live `uiSlice` example) + TanStack Query (SSR prefetch + HydrationBoundary)
- **Forms** — React Hook Form + shared Zod schema, re-validated in a Server Action
- **Security** — per-request CSP nonce (`strict-dynamic`), hardened headers, rate limiting, CSRF check for actions
- **Quality gates** — ESLint (0 warnings), Stylelint, Prettier, typecheck (app + tests), Vitest, knip, commitlint — all blocking in CI and on Vercel
- **Supply chain** — pnpm `minimumReleaseAge`, SHA-pinned Actions

## Quick Start

```bash
npx degit hHolyMolly/next-template my-app
cd my-app
pnpm install
git init && pnpm prepare   # enable git hooks
pnpm dev
```

Remove the demo surface when you start building:

```bash
pnpm clean:demo my-app          # degit clones: also renames + finalizes
pnpm clean:demo my-app --force  # git clones: force the finalization step
```

> Node.js 22+, pnpm 10+. `next-env.d.ts` is generated on first `pnpm dev`.

## Living Examples (removed by `clean:demo`)

Every shipped library is exercised by real code on the home page:

| Example                              | Shows                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| `[locale]/components/ContactForm`    | RHF + zodResolver → Server Action (`withServerAction` + CSRF + rate limit) → toast |
| `[locale]/components/HealthStatus`   | TanStack Query SSR: `prefetchQuery` + `HydrationBoundary` → `useQuery`             |
| `[locale]/components/DemoBanner`     | Redux `uiSlice` + `featureFlags`                                                   |
| `GET /api/health` · `POST /api/echo` | `withApiHandler`: Zod validation, typed errors, rate-limit headers                 |

## Commands

| Command                                      | Description                    |
| -------------------------------------------- | ------------------------------ |
| `pnpm dev` / `build` / `start` / `preview`   | Develop · build · serve        |
| `pnpm lint` / `lint:fix`                     | ESLint, 0 warnings allowed     |
| `pnpm lint:css` / `lint:styles`              | Stylelint check · autofix      |
| `pnpm format` / `format:check`               | Prettier write · check         |
| `pnpm typecheck` / `typecheck:test`          | TypeScript: app · tests        |
| `pnpm test` / `test:watch` / `test:coverage` | Vitest (+ coverage thresholds) |
| `pnpm check`                                 | All gates in one command       |
| `pnpm check:i18n`                            | Locale key parity              |
| `pnpm knip`                                  | Unused files / exports / deps  |
| `pnpm analyze`                               | Bundle analyzer                |
| `pnpm clean` / `clean:cache` / `clean:demo`  | Cleanup                        |

Git hooks: pre-commit (lint-staged + i18n parity) · commit-msg (commitlint) · pre-push (typecheck + tests).

## Project Structure

```
src/
├── app/
│   ├── layout.tsx            # <html>/<body>, JSON-LD (nonce), styles
│   ├── api/health, api/echo  # Route Handler examples (withApiHandler)
│   └── [locale]/
│       ├── layout.tsx        # locale + NextIntlClientProvider (client namespaces)
│       ├── page.tsx          # demo home (SSR query prefetch)
│       ├── components/       # demo surface (clean:demo removes it)
│       └── (routes)/         # Header/Footer layout, template page, 404 catch-all
├── components/  UI/ (shadcn) · layouts/ · icons/
├── configs/     project · metadata · routes · env · featureFlags
├── hooks/       10 SSR-safe hooks
├── lib/         withApiHandler · withServerAction · rateLimit · errors · cn · queryClient
├── messages/    {en,ru}/{translations,metadata,demo}.json
├── services/    api (axios + queryOptions) · i18n (next-intl)
├── store/       Redux Toolkit (slices/uiSlice)
├── styles/      tailwind.css (@theme) · vars.css (oklch tokens) · fonts.ts
└── proxy.ts     middleware: rate limit → CSP nonce → next-intl
```

## Environment

`.env.development` / `.env.production` are committed (no secrets). Local overrides go to
`.env.local` (gitignored, wins). Required: `NEXT_PUBLIC_CLIENT_URL`. Full list: [.env.example](.env.example).

## Deploy

**Vercel** — import the repo; `vercel.json` runs `lint + format:check + typecheck + build` on every push.
Self-hosted — `pnpm build && pnpm start` behind a reverse proxy (set `TRUSTED_PROXY_HOPS`).

## Docs

Architecture rules, conventions and security contracts live in [AGENTS.md](AGENTS.md) —
the single source of truth for humans and AI agents alike. Security policy: [SECURITY.md](SECURITY.md).

## License

MIT © [HolyMolly](https://github.com/hHolyMolly)

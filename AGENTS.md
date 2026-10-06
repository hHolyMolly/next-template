# Next Template — Agent Instructions

> **Single source of truth for all AI coding agents** (GitHub Copilot, Claude Code, Cursor, Codex, Aider, etc.).
>
> `CLAUDE.md` and `.github/copilot-instructions.md` are thin pointer files — edit only `AGENTS.md`.

---

## Project

Next.js 16 template (App Router, Turbopack) with TypeScript (strict), Tailwind CSS v4, next-intl, Redux Toolkit, TanStack React Query, Axios. Node 24, pnpm 10.

## Architecture Rules

### Aliases

- Use **only `@/`** alias (= `./src/`). No other aliases inside `src/`.
- `@public/` is reserved for importing files from `public/` (static assets).

### Routing

- Root layout (`src/app/layout.tsx`) is minimal — only `<html>`, `<body>`, global styles, JSON-LD. There is **no root `page.tsx`** — the intl middleware rewrites `/` into the default locale.
- All page content lives under `src/app/[locale]/`.
- `[locale]/layout.tsx` sets the request locale and wires `NextIntlClientProvider` (client namespaces only — see i18n) + `ClientProviders`.
- `[locale]/(routes)/layout.tsx` adds Header + Footer + skip-link; pages outside `(routes)` render without them (the demo home page is such a page). `[locale]/not-found.tsx` also renders outside the group, so it composes the same chrome itself.
- `[locale]/(routes)/[...rest]/page.tsx` is a catch-all that triggers the styled `[locale]/not-found.tsx`.
- **`loading.tsx` only at route level** (e.g. `(routes)/template/loading.tsx`), never at locale level: a locale-level Suspense boundary streams a 200 shell before the `[...rest]` catch-all can throw `notFound()`, breaking the 404 status code (verified empirically — segment-scoped boundaries are safe).
- `proxy.ts` (not `middleware.ts`) — Next.js 16 convention; it always runs on the Node.js runtime. The exported function **must** be named `proxy`.
- Middleware composes: rate limit (pages only — Server Action POSTs target the page URL and ARE counted) → nonce/CSP onto **request** headers → next-intl routing → CSP mirrored on response.
- Every matched route is rendered per request **by design** (per-request CSP nonce). `setRequestLocale(locale)` in every layout/page/`generateMetadata` is still mandatory — it is how next-intl gets the locale without request state.
- **Parallel routes / intercepting routes**: when you add a `@slot` segment, always pair it with a `default.tsx` at every level that can be matched independently.

### Localization (i18n)

- All texts live in `src/messages/{locale}/{namespace}.json` (not `public/` — messages are not a public asset).
- Namespaces: `translations.json` (UI copy), `metadata.json` (SEO, server-only; includes the `%s | Site` title template), `demo.json` (demo surface — removed by `pnpm clean:demo`).
- `clientNamespaces` in `src/services/i18n/constants.ts` controls what is serialized to the client — `metadata` never ships in the RSC payload.
- **No hardcoded strings** in components — always `useTranslations()` / `getTranslations()`. This includes `sr-only` texts, `aria-label`s and Zod validation messages (schemas are factories taking translated messages — see `ContactForm/schema.ts`). Metadata routes without a locale segment (`manifest.ts`, `opengraph-image.tsx`) call `getTranslations({ locale: projectConfig.i18n.defaultLocale, namespace })`.
- Exception: `global-error.tsx` — i18n is unavailable because the layout is broken; English fallback is acceptable.
- Language switching: `LanguageSwitch` (`src/components/layouts/`) — mounted in the Header; `variant="inverse"` for dark surfaces. It uses `<Link>` from `@/services/i18n/navigation` with the `locale` prop.
- Types for message shape derive from the default locale — see `src/types/next-intl.ts`. `pnpm check:i18n` enforces key parity against `en` (also runs in pre-commit when messages change).

### Styling — Tailwind CSS v4

- **CSS-first config** — there is no `tailwind.config.ts`. Everything lives in `src/styles/tailwind.css`:
  `@import 'tailwindcss'` + `@import 'tw-animate-css'` (shadcn animation utilities), `@theme inline` maps runtime tokens to utilities, `@utility container` overrides the built-in container, keyframes live inside `@theme`.
- Design tokens in `src/styles/vars.css` are **complete oklch colors** (`--primary: oklch(62.32% 0.1879 259.8deg)`), so opacity modifiers (`bg-primary/10`) work via color-mix.
- `src/styles/normalize.css` is wrapped in `@layer base` **on purpose** — unlayered CSS beats every Tailwind utility (`a { color: inherit }` would override `text-*` everywhere). Never add unlayered element rules.
- The next/font variable is `--font-app` (mapped to Tailwind's `--font-sans` in `@theme inline`) and its class sits on **`<html>`**, not `<body>` — a custom property is substituted where it is defined, and `--font-sans` resolves on `:root`. Never name a next/font variable after a Tailwind token. No manual preconnect to Google Fonts: next/font self-hosts.
- Use semantic tokens (`bg-background`, `text-foreground`, `bg-primary`, `text-destructive`) — never raw colors in shared components. Brand colors needed OUTSIDE the cascade (viewport `themeColor`, manifest, generated icons/OG image) come from `projectConfig.theme`.
- Single light theme by design (no dark mode); `themeColor` / manifest colors stay light.
- Use `cn()` from `@/lib/cn` (clsx + tailwind-merge) to merge classes.
- SCSS only for `src/styles/index.scss` (page/layout wrappers, reduced-motion).

### Components

- **UI components** → `src/components/UI/` — based on **shadcn/ui** (new-york style).
  - Available: Button, Input, FormField, Dialog, Skeleton, Sonner (toast), VisuallyHidden.
  - Toast notifications use `sonner` — call `toast()` from `sonner` (see ContactForm for live usage).
  - `Button` defaults to `type="button"` (except `asChild`); use `VisuallyHidden` for all sr-only text.
- Layout components → `src/components/layouts/` (Header, Footer, Container, LanguageSwitch, ClientProviders, WebVitals, ErrorBoundary, ErrorState).
- Icons → `src/components/icons/`. `LoadingIcon` takes a `label` prop for its accessible name.
- Page-specific/demo components → co-located at `src/app/[locale]/components/`. A component is PROMOTED to `src/components/` only when a **second** route needs it — never preemptively.
- **Folder convention**: a module WITH a test (or sibling files: schema, actions, data) lives in a folder named after it — `Button/{Button.tsx, Button.test.tsx, index.ts}`. The `index.ts` ONLY re-exports (named exports, no `export *`, types via `export type`); implementation never lives in an index file. Single-file modules stay flat (`layouts/Header.tsx`, `configs/project.ts`). Consumer imports don't change — `@/components/UI/Button` resolves through the folder index.
- **Named exports** everywhere (no default exports except Next.js file conventions). `@/components/UI` is the only component barrel; layouts and app components are imported by their full path.

### API

- **Route Handlers** wrap in `withApiHandler` (`@/lib/withApiHandler`): CORS + rate limit (`createApiRateLimit` from `@/lib/rateLimit`) + `AppError` → JSON mapping. `NextResponse` comes from `next/server`. Live examples: `GET /api/health` (infra, never rate-limited), `POST /api/echo` (demo: Zod body validation + rate limit), `POST /api/revalidate` (ISR webhook).
- **All client API I/O goes through TanStack Query.** Define queries with `queryOptions()` in `src/services/api/queries.ts` — one definition serves the client hook and `prefetchQuery` on the server. SSR flow (live example: `[locale]/page.tsx` → `HealthStatus`): prefetch in a Server Component with the SAME key but the underlying data function as `queryFn` (`{ ...healthQuery, queryFn: getHealth }` — never a self-fetch into your own /api route), un-awaited (the query client dehydrates PENDING queries, see `lib/queryClient`), + `<HydrationBoundary state={dehydrate(qc)}>`. **Consume a pending-dehydrated query with `useSuspenseQuery` inside `<Suspense>`** (+ `ErrorBoundary` for an inline error state) — `useQuery` renders the loading state on the server while the client may already hold the value at hydration → React #418 text mismatch. `useQuery` + `isWaitingFor` is for client-initiated (non-prefetched) queries.
- Reuse `STALE_TIMES` from `@/lib/queryClient`.
- **Transport policy** lives in `src/services/api/http.ts`: `resolveAppUrl()` for this app's OWN routes (always absolute), `resolveApiUrl()` for the EXTERNAL backend (`NEXT_PUBLIC_SERVER_URL`, throws when unset), `DEFAULT_TIMEOUT_MS` shared by axios and `serverFetch`. Backend endpoints are catalogued in `src/services/api/paths.ts` (`API_PATHS`).
- Axios instance (`src/services/api/instance.ts`, `baseURL` = backend) is the client-side transport — `healthQuery` is its live consumer; own routes MUST be passed as absolute URLs or axios glues them onto `baseURL`. `serverFetch` (`src/services/api/serverFetch/`, `import 'server-only'`) is the server transport with ISR options. Interceptors must never log raw response bodies. `ServerFetchError` extends `AppError` with the upstream status and a matching `code`; a non-JSON 200 is reported as **502**, never as success.
- **ISR cache policy** lives in `src/services/api/cache.ts`: named `REVALIDATE` windows + `CACHE_TAGS` (collections as constants, per-entity tags as builders). Never inline a raw `revalidate` number or bare tag string. On-demand invalidation: `POST /api/revalidate` — secret ONLY via the `x-revalidate-secret` header (constant-time compare, rate-limited, 501 when `REVALIDATE_SECRET` is unset); `paths` are app-relative and revalidated through the `[locale]` segment for every locale.
- When the API layer grows, split per domain: `services/api/<domain>/{keys,queries,mutations}.ts`. Keys/contract modules must be PLAIN modules — never `'use client'` (a client module imported by a Server Component resolves to a client-reference proxy and the prefetch silently does nothing).
- Query-side helpers in `src/lib`: `isWaitingFor(query)` instead of `isPending` for placeholders (skipToken queries are pending forever), `patchCache(label, fn)` around every cache write in mutation callbacks, `withMinDelay(promise)` to floor perceived submit duration.

### Forms

- React Hook Form + Zod resolver. `<FormField control={...} name="...">` bridges RHF and the typed `<Input>`.
- Schema-first and **shared**: the same Zod schema validates on the client (zodResolver) and inside the Server Action. Schemas are factories taking translated messages.
- Live example: `src/app/[locale]/components/ContactForm/` (schema.ts + actions.ts + ContactForm.tsx + index.ts) — RHF + `useTransition` + `toast()`.

### Server Actions

- Co-locate actions with their feature (`.../ContactForm/actions.ts`); files start with `'use server'`.
- The canonical mutation pipeline (see `submitContact`): `withServerAction` → `assertSameOrigin()` → `withActionRateLimit` (import from `@/lib/rateLimit/rateLimitAction` — deliberately not in the `rateLimit` barrel, which `proxy.ts` consumes) → honeypot + min-fill-time → Zod re-validation → return data. **CSRF check runs BEFORE the rate limiter** so cross-site garbage can't burn a legitimate user's per-IP budget. Bots caught by the honeypot get a SUCCESS-shaped response — an error would teach them what to fix.
- `assertSameOrigin()` is **mandatory** for every mutation (defense in depth on top of Next's own Origin/Host check). It throws a `ForbiddenError` with a constant message (the offending origin is logged, never reflected).
- `withServerAction` returns a discriminated `ServerActionResult<T>` (`error` is the shared `ErrorPayload`) — actions never throw to the client; Next control-flow errors (`redirect()`/`notFound()`) are re-thrown via `unstable_rethrow`.
- The error envelope is `toErrorPayload()` (`@/lib/errors`) everywhere — Route Handlers, Server Actions, middleware 429. `details` is nested, never spread.
- Use `revalidatePath()` / `revalidateTag()` after real mutations.

### Types

- Global types → `src/types/index.ts`. `Locale` derives from `projectConfig.i18n.locales` — the config object is `as const satisfies ProjectConfig` so the union stays literal; don't widen it.
- Prefer `type` over `interface` unless declaration merging is required.

### Hooks

- Reusable hooks → `src/hooks/`, barrel in `src/hooks/index.ts`. All SSR-safe.
- Available: `useMediaQuery`, `useDebounce`/`useDebouncedCallback`, `useThrottle`, `useClickOutside`, `useCopyToClipboard`, `useScrollLock`, `useToggle`, `useIsomorphicLayoutEffect`, `useEventListener`, `useLatestRef`, `useLocalStorage`, `useIntersectionObserver`.
- `useLocalStorage` is `useSyncExternalStore`-based: same-tab + cross-tab sync; `initialValue` is rendered on the server AND during hydration (components in the initial HTML may show it for one frame — gate on a mounted flag if that matters); `initialValue` is captured on first render (object literals are safe). Storage reads/writes are guarded — blocked storage degrades to `initialValue`.
- `useLatestRef` is the house pattern for "stable callback, fresh closure" — use it instead of hand-rolled `useRef`+`useEffect` mirrors.
- Framework-free timing utils live in `src/utils/`: `debounce` (`.cancel()`/`.flush()`) and `throttle` (`.cancel()`); the hooks wrap them.

### Logging & Errors

- Use `logger` from `@/utils/logger` (never `console.*`). `logger.child('scope')` returns a prefixed logger (create it once at module scope). `logger.warn` **and** `logger.error` survive production — warn carries operational signals (rate-limit identity missing, config fallbacks); the rest are dev-only.
- Error taxonomy: `AppError` subclasses in `@/lib/errors` (`NotImplementedError` = 501 for "exists but not configured"); `toErrorResponse()` for handlers.
- `errorReporting` (`@/lib/errorReporting`) is the ONE reporter seam: `error.tsx` boundaries, `ErrorBoundary`, `withApiHandler`, `withServerAction` and `instrumentation.onRequestError` all report through it — wire Sentry/Datadog there and nowhere else. `captureException` receives the Error object (stack included).
- `ErrorBoundary` renders a translated default fallback (`DefaultFallback`).

### Configuration

- `src/configs/project.ts` — name, locales, `theme` (brand colors for metadata surfaces), sitemap, robots (`as const satisfies ProjectConfig`).
- `src/configs/constants/urls.ts` — website + API URLs from env.
- `src/configs/metadata/` — `getBaseMetadata(path)`, `createMetadata({ path, preview, ... })` (named exports), `buildLocaleAlternates(path)` (the ONE hreflang rule — canonical AND `app/sitemap.ts` derive from it).
  - **Always pass `path`** for non-home pages — it builds the canonical + hreflang URLs.
  - `title` on the base is `{ default, template: '%s | Site' }` (from `metadata.global`); pass a plain string `title` per page and Next applies the template.
  - A page-level `title`/`description` propagates into `openGraph`/`twitter` automatically; explicit og/twitter overrides win.
  - OG/Twitter images come from the generated `opengraph-image.tsx`; per-page override via `createMetadata({ preview })`.
  - `generateMetadata` **and** every layout/page take `{ params }` and call `setRequestLocale(locale)` (next-intl requirement).
- `src/configs/env/` — Zod v4 env validation of ALL runtime env vars (URLs, CSP/TT toggles, proxy hops, revalidate secret), run from `instrumentation.ts`. `proxy.ts` additionally sanitizes the values it reads at module scope.
- `src/configs/routes.ts` — typed route helpers (`routes.template()`, named export).
- `src/configs/featureFlags.ts` — `featureFlags.isEnabled('demoBanner')` (live example in DemoBanner).

### State Management

- Redux Toolkit — client-global UI state. Live example: `src/store/slices/uiSlice.ts` (registered in `src/store/index.ts`, consumed by `DemoBanner` via `useAppSelector`/`useAppDispatch`).
- Typed hooks live in `@/store/hooks` — import from there, never from `@/store` (circular-import guard).
- TanStack React Query — server state. DevTools wired in `ClientProviders` (dev only). `networkMode: 'always'` is set globally — never revert to the default `'online'` (it pauses offline requests instead of failing them: eternal skeletons, silent submits). `dehydrate.shouldDehydrateQuery` includes pending queries — never revert to the default either (un-awaited prefetches would be dropped).

### Security

- **CSP nonce contract**: `proxy.ts` puts `x-nonce` + the CSP header on the **request** (via `new NextRequest(request, { headers })` into the intl middleware) so `headers()` in RSC sees the nonce AND Next can nonce its own bootstrap scripts (`strict-dynamic`); the CSP is then mirrored on the response. Never set these only on the response — production hydration breaks.
- `CSP_REPORT_URI` is parsed (`new URL().href`) before it goes into a header — a raw value could inject directives. `upgrade-insecure-requests` is production-only (Safari upgrades `http://localhost` in dev).
- Rate limiting: ONE identity rule, `checkIdentity()` in `@/lib/rateLimit` — used by the middleware (pages, scope `page`), `createApiRateLimit` (scope `api`) and `withActionRateLimit` (scope `action`). It honours `RATE_LIMIT_BYPASS_IPS` and warns once per scope when identity is unknown. The middleware keeps one limiter PER RULE (index-aligned), never per `limit:window` shape.
- Set `TRUSTED_PROXY_HOPS` to match the reverse-proxy depth before trusting `x-forwarded-for`. **In production, when no trustworthy client IP can be resolved, rate limiting is SKIPPED** (one-time warning per scope) — never collapsed into a shared bucket (that would be a site-wide self-DoS). Configure the hops or limits silently don't apply. `x-real-ip` is accepted as a fallback identity — only meaningful when a proxy in front of you overwrites it.
- Budget headers: `X-RateLimit-*` on every checked response, `Retry-After` ONLY on 429; nothing when the check was skipped.
- `.env.development` / `.env.production` are committed (no secrets); `.env*.local` is gitignored — real values go there. `dev/build/start` use Next's native env loading (no dotenv-cli) so `.env.local` correctly overrides. `PORT` cannot live in `.env` files (Next picks it from the shell first).
- Public env is read ONLY as literal `process.env.NEXT_PUBLIC_X` (the bundler can't rewrite computed access). `pnpm build` ends with `scripts/check-public-env.mjs`, which fails the build if a set variable's value is absent from every client chunk — add new must-reach-the-client vars to the build script's argument list.
- `CSP_STRICT_STYLES=true` keeps `style-src-attr 'unsafe-inline'` on purpose — Radix/floating-ui position popovers via inline style attributes; the nonce locks down `style-src-elem`.

### Code Style

- Imports: external → `@/…` aliases → relative. ESLint auto-sorts. The `import` plugin instance comes from `eslint-config-next` — never re-register it. `eslint-config-next/core-web-vitals` already includes the base preset — never spread both.
- All comments and commit messages in English; commits are Conventional Commits (commitlint enforces in commit-msg hook).
- Prefer `type` imports: `import { type Foo } from '…'`.

### Testing

- Unit: **Vitest 5** + **React Testing Library**. Place `*.test.ts(x)` next to the source file. Server-side modules opt into `// @vitest-environment node` at the top of the test file (`vitest.setup.ts` skips its browser shims there and mocks `server-only`).
- Tests are typechecked separately: `pnpm typecheck:test` (tsconfig.test.json — it MUST override `exclude`, or the inherited test exclusion silently empties the program).
- Coverage thresholds in `vitest.config.ts` are a ratchet — raise, never lower. `src/lib/**` is held to 70% (per-directory threshold).
- Reference tests: `src/lib/rateLimit/{rateLimit,rateLimitAction}.test.ts`, `cors/`, `withApiHandler/`, `withServerAction/`, `assertSameOrigin/` (mocks `next/headers`), `queryClient/` (dehydration policy), `src/services/api/{http,serverFetch}/`, `src/app/api/revalidate/route.test.ts` (mocks `next/cache`), `src/configs/env/`, `src/configs/metadata/{createMetadata,alternates}/` (mocks `next-intl/server`), `src/hooks/useLocalStorage/`.

## Commands

```
pnpm dev               # Dev server (Turbopack)
pnpm build             # Production build + public-env bundle guard
pnpm start             # Production server
pnpm preview           # Build + start
pnpm lint              # ESLint (--max-warnings 0, cached in node_modules/.cache)
pnpm lint:fix          # ESLint autofix
pnpm lint:css          # Stylelint check (CI)
pnpm lint:css:fix      # Stylelint autofix
pnpm format            # Prettier write
pnpm format:check      # Prettier check (CI)
pnpm typecheck         # next typegen + TypeScript (app)
pnpm typecheck:test    # TypeScript (tests)
pnpm test              # Vitest run
pnpm test:coverage     # Vitest + coverage thresholds
pnpm check             # ALL gates: lint + css + format + types + tests + i18n + knip (= CI)
pnpm check:i18n        # Locale key parity
pnpm knip              # Unused files/deps (blocking) + exports (advisory)
pnpm analyze           # Turbopack bundle analyzer (next experimental-analyze)
pnpm clean / clean:cache
pnpm clean:demo        # Remove demo surface (destructive; --force to finalize in a git checkout)
```

Git hooks (husky): pre-commit = lint-staged + i18n parity; commit-msg = commitlint; pre-push = typecheck + typecheck:test + test.
Vercel (`vercel.json`) runs `pnpm check && pnpm build` on every push — any gate failure blocks the deploy.

Before claiming a change verified, follow `docs/verification-playbook.md`. Debugged a confusing symptom? Add it to `docs/gotchas.md` (symptom → cause → fix).

## Supply chain

- `pnpm-workspace.yaml` sets `minimumReleaseAge: 4320` (3 days) — too-fresh versions fail install; lower the range floor instead of excluding packages. `onlyBuiltDependencies` allow-lists the only packages with install scripts — audit before adding one.
- GitHub Actions in `ci.yml` are SHA-pinned (`# vX` comment) — keep pins when updating. Dependabot uses a 3-day cooldown to match.
- The template repo stays demo-complete: test `clean:demo` only on a copy in /tmp.

## Performance

- **React Compiler** (`reactCompiler: true`, stable `babel-plugin-react-compiler@1`) auto-memoizes — don't add `useMemo`/`useCallback` unless profiling demands it.
- **Cache Components** (Next 16): toggle `cacheComponents: true` once every dynamic access is Suspense-wrapped.
- Measure bundle size with `pnpm analyze`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

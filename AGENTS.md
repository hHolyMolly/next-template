# Next Template — Agent Instructions

> **Single source of truth for all AI coding agents** (GitHub Copilot, Claude Code, Cursor, Codex, Aider, etc.).
>
> `CLAUDE.md` and `.github/copilot-instructions.md` are thin pointer files — edit only `AGENTS.md`.

---

## Project

Next.js 16 template (App Router, Turbopack) with TypeScript (strict), Tailwind CSS, next-intl, Redux Toolkit, TanStack React Query, Axios.

## Architecture Rules

### Aliases

- Use **only `@/`** alias (= `./src/`). No other aliases inside `src/`.
- `@public/` is reserved for importing files from `public/` (e.g. translation JSONs).

### Routing

- Root layout (`src/app/layout.tsx`) is minimal — only `<html>`, `<body>`, global styles, JSON-LD.
- Root `page.tsx` redirects to the default locale.
- Root `not-found.tsx` is a server component rendered without i18n providers.
- All page content lives under `src/app/[locale]/`.
- `[locale]/layout.tsx` sets the request locale and wires `NextIntlClientProvider` + `ClientProviders`.
- `[locale]/(routes)/layout.tsx` adds Header + Footer; pages outside `(routes)` render without them.
- `[locale]/[...rest]/page.tsx` is a catch-all that triggers `not-found`.
- `proxy.ts` (not `middleware.ts`) — Next.js 16 convention. The exported function **must** be named `proxy`.
- Middleware composes: rate limit → next-intl routing → CSP nonce/headers.
- **Parallel routes / intercepting routes**: when you add a `@slot` segment, always pair it with a `default.tsx` at every level that can be matched independently — otherwise a direct navigation produces a 404. Applies recursively through nested layouts.

### Localization (i18n)

- All texts live in `public/locales/{locale}/{namespace}.json`.
- Namespaces: `translations.json` (UI copy), `metadata.json` (SEO), `demo.json` (demo page — safe to delete).
- **No hardcoded strings** in components — always `useTranslations()` / `getTranslations()`.
- Exception: `global-error.tsx` — i18n is unavailable because the layout is broken; English fallback is acceptable.
- Language switching uses `<Link>` from `@/services/i18n/navigation` with the `locale` prop.
- Types for message shape are generated from the default locale — see `src/types/next-intl.ts`.

### Styling

- Tailwind-first. SCSS only for `src/styles/index.scss` (page/layout wrappers).
- CSS variables in `vars.css` use the **oklch color space**: `--background: 100% 0 none;`
  - Format: `lightness chroma hue` — perceptually uniform, wider gamut than HSL.
  - Tokens are applied in Tailwind via `oklch(var(--token))`.
- Use semantic tokens (`bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`) — never raw colors.
- Container defined in `tailwind.css`.
- Use `cn()` from `@/lib/cn` (clsx + tailwind-merge) to merge classes.
- Animations — prefer Tailwind keyframes from `tailwind.config.ts` or `tw-animate-css` utilities.

### Components

- **UI components** → `src/components/UI/` — based on **shadcn/ui** (new-york style).
  - Available: Button, Input, Dialog, Skeleton, Sonner (toast), VisuallyHidden.
  - Button uses `cva` variants and `asChild` via `@radix-ui/react-slot`.
  - Toast notifications use `sonner` — call `toast()` from `sonner`, not a custom hook.
- Layout components → `src/components/layouts/` (Header, Footer, Container, ClientProviders, ErrorBoundary).
- No theme switching — single light theme only.
- Icons → `src/components/icons/`.
- Page-specific components → co-located at `src/app/[locale]/(routes)/{page}/components/`.

### API

- Axios instance: `src/services/api/instance.ts` — holds interceptors (auth, sanitized error logging).
- `request<T>(config, signal?)` — low-level typed helper; **never call it directly from a component**.
- **All client API I/O goes through TanStack Query.** Add endpoints to `src/services/api/paths.ts`, then wrap them in `useQuery` / `useMutation` inside `src/services/api/queries.ts` (see the `useTodos` / `useCreateTodo` example and the `todoKeys` factory).
- Reuse `STALE_TIMES` from `@/lib/queryClient`; invalidate via the broadest query-key that still makes sense.
- `isApiError(error)` — type guard for `AxiosError`.
- `isAbortError(error)` — checks if the error is a cancelled request.
- API interceptors must **never** log raw server response bodies — only status, method, URL, and a sanitized message.
- **Server Components / Route Handlers** → use `serverFetch<T>(path, { next: { revalidate, tags } })` from `@/services/api/serverFetch`. It speaks Next.js ISR and tag-based revalidation. Throws `ServerFetchError` on non-2xx.

### Forms

- React Hook Form + Zod resolver. Use `<FormField control={...} name="...">` from `@/components/UI` — it bridges RHF and the typed `<Input>` (label, error, hint, aria-describedby).
- Schema-first: declare a `zod` schema, derive types with `z.infer<typeof schema>`, attach via `useForm({ resolver: zodResolver(schema) })`.
- For Server-Action-backed forms, combine `useActionState()` with `withServerAction()` so the returned `ServerActionResult` is fully typed.

### Server Actions

- Put Server Actions in `src/app/actions.ts` (global) or co-locate with pages.
- Every file with Server Actions starts with `'use server'`.
- **Always validate inputs** — Server Actions are public HTTP endpoints.
- Verify `Origin` / `Referer` against `NEXT_PUBLIC_CLIENT_URL` for state-changing actions (see `src/lib/assertSameOrigin.ts`). **Mandatory** for every mutation — `SameSite=Lax` cookies leave a CSRF window otherwise, and `proxy.ts` does not see Server Actions.
- Wrap every action with `withServerAction(...)` from `@/lib/withServerAction` so it returns a discriminated `ServerActionResult<T>` instead of throwing.
- Rate-limit actions with `withActionRateLimit({ limit, windowSeconds }, action)` from `@/lib/rateLimitAction`. Actions bypass `proxy.ts`, so the middleware limiter does **not** cover them — wrap every mutation.
- Use `revalidatePath()` / `revalidateTag()` after mutations.
- Use `useActionState()` in Client Components for form state.

### Types

- Global types → `src/types/index.ts`. No `interfaces/` directory.
- Component-local types — next to the component or inline.
- Prefer `type` over `interface` unless declaration merging is required.

### Hooks

- Reusable hooks → `src/hooks/`, barrel in `src/hooks/index.ts`.
- Available: `useMediaQuery`, `useDebounce`, `useThrottle`, `useClickOutside`, `useScrollLock`, `useToggle`, `useIsomorphicLayoutEffect`, `useEventListener`, `useLocalStorage`, `useIntersectionObserver`.
- All hooks are SSR-safe — return a stable server value or use `useSyncExternalStore`.

### Dynamic imports

- For heavy client-only components (charts, maps, editors, large modals) use `lazyLoad()` from `@/lib/lazyLoad` — it wraps `next/dynamic` with a standardized loader and `ssr: false` by default.
- Do **not** use `next/dynamic` directly unless you need non-default options — go through `lazyLoad` so loaders stay consistent.

### Logging

- Use `logger` from `@/utils/logger` instead of `console.*`.
- In production, `logger.log` / `logger.warn` / `logger.info` / `logger.debug` become no-ops; `logger.error` always logs.
- `logger.child({ scope })` returns a prefixed logger for a module.

### Configuration

- `src/configs/project/` — project name, locales, sitemap, robots.
- `src/configs/constants/urls.ts` — website + API URLs derived from env.
- `src/configs/metadata/` — `getBaseMetadata()`, `createMetadata()`, `previewImage()`.
  - OG/Twitter previews live in `public/assets/img/previews/*.webp`.
  - `global.webp` is the fallback; override per page with `createMetadata({ preview: '/assets/...' })`.
  - Metadata exposes `alternates.canonical` and `alternates.languages` based on current locale.
- `src/configs/env.ts` — runtime env validation. Import via `process.env`; `validateEnv()` is invoked from `instrumentation.ts` at startup.
- `src/configs/routes.ts` — typed route helpers (`routes.template({ id: 1 })`).
- `src/configs/featureFlags.ts` — `featureFlags.isEnabled(flag)`.

### State Management

- Redux Toolkit (`src/store/`) — global UI state. Slices under `src/store/slices/` (see `src/store/slices/README.md` for the template).
- Typed hooks (`useAppDispatch`, `useAppSelector`, `useAppStore`) live in `@/store/hooks` — import from there, never from `@/store`, to avoid a circular import when slices themselves reference `RootState`.
- TanStack React Query — server state + API caching. Use `STALE_TIMES` from `@/lib/queryClient`.
- React Query DevTools are wired in `ClientProviders` (dev only).

### Security

- **CSP** is set per-request in `proxy.ts` with a fresh nonce (`x-nonce` header). Inline scripts (JSON-LD, etc.) **must** read the nonce via `headers()` and pass it through.
- Set `CSP_STRICT_STYLES=true` to switch `style-src` to nonce-based CSP (drops `'unsafe-inline'`). Roll out in `Content-Security-Policy-Report-Only` first.
- Cross-origin isolation headers (`COOP`, `CORP`) + hardened `Permissions-Policy` are set in `next.config.ts`.
- Rate limiting (middleware): `createRateLimit` from `@/lib/rateLimit`. In-memory backend (suitable for long-running Node.js servers/VPS/Docker); swap for a Redis-backed implementation when deploying to serverless platforms.
- Rate limiting (Server Actions): `withActionRateLimit` from `@/lib/rateLimitAction`.
- Never trust client IPs from `x-forwarded-for` without knowing the hosting provider's proxy chain — set `TRUSTED_PROXY_HOPS` to match your reverse-proxy depth.
- Error reporting abstraction: `src/lib/errorReporting.ts`. Replace the body to wire a real reporter (Sentry / Datadog / Rollbar / …).
- Cookies: use `customCookieStorage` from `@/services/storage` — automatic `SameSite=Lax` + `Secure` on HTTPS. For auth tokens prefer server-side cookies via `cookies()` with `httpOnly`.

### Error Handling

- `ErrorBoundary` component in `src/components/layouts/ErrorBoundary.tsx`.
- `[locale]/error.tsx` — locale-scoped boundary (client component, has i18n).
- `global-error.tsx` — root fallback (no i18n).

### Code Style

- Imports: external → `@/…` aliases → relative. ESLint auto-sorts.
- All comments and commit messages in English.
- Minimal comments — only where intent is non-obvious.
- Prefer `type` imports: `import { type Foo } from '…'`.

### Testing

- Unit: **Vitest** + **React Testing Library**. Place `*.test.ts(x)` next to the source file.
- `pnpm test` (run), `pnpm test:watch`, `pnpm test:coverage`.

## Commands

```
pnpm dev               # Dev server (Turbopack)
pnpm build             # Production build
pnpm start             # Production server
pnpm preview           # Build + start
pnpm lint              # ESLint
pnpm lint:fix          # ESLint autofix
pnpm lint:styles       # Stylelint
pnpm lint:all          # ESLint + Stylelint + TypeCheck
pnpm format            # Prettier
pnpm typecheck         # TypeScript check
pnpm test              # Vitest (unit)
pnpm check:i18n        # Verify all locales have the same keys
pnpm analyze           # Bundle analyzer (set ANALYZE=true)
pnpm knip              # Find unused files / exports / deps
pnpm clean             # Clean .next / dist
```

## Performance

- **React Compiler** (`reactCompiler: true` in `next.config.ts`) auto-memoizes components. Don't add `useMemo`/`useCallback` unless profiling shows you need them.
- **Cache Components** (Next.js 16+): toggle `cacheComponents: true` in `next.config.ts` once every dynamic data access is wrapped in `<Suspense>`. Replaces the former `experimental.ppr`.
- Always pass stable keys to lists; use `useMemo` only for expensive derivations the compiler can't prove pure.
- Keep client-side state close to where it's used — split Client Components out of Server trees.
- Measure bundle size with `ANALYZE=true pnpm build` (`@next/bundle-analyzer`).

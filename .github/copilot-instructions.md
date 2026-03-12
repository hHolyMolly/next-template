# Next Template — Copilot Instructions

## Project

Next.js 16 template (App Router, Turbopack) with TypeScript, Tailwind CSS, next-intl, Redux Toolkit, TanStack React Query, Axios.

## Architecture Rules

### Aliases

- Use **only `@/`** alias (= `./src/`). No other aliases.

### Routing

- Root layout (`src/app/layout.tsx`) is minimal — only `<html>`, `<body>`, styles, metadata.
- Root `page.tsx` redirects to the default locale.
- Root `not-found.tsx` is a client component — no i18n.
- All page content lives under `src/app/[locale]/`.
- `[locale]/layout.tsx` contains providers, header, footer, `NextIntlClientProvider`.
- `[locale]/(routes)/` — route group for pages.
- `[locale]/[...rest]/page.tsx` — catch-all for 404.
- `proxy.ts` (not middleware.ts) — Next.js 16 convention. Uses `createMiddleware(routing)` from next-intl.

### Localization (i18n)

- **All texts** are stored in `public/locales/{locale}/{namespace}.json`.
- Translation files: `translations.json` (UI texts), `metadata.json` (SEO).
- **No strings** are hardcoded in components — everything via `useTranslations()` or `getTranslations()`.
- Exception: `global-error.tsx` — i18n is unavailable (layout is broken), text is inline.
- Language switching uses `<Link>` from `@/services/i18n/navigation` with `locale` prop.

### Styling

- Tailwind CSS classes. SCSS only for `index.scss` (wrapper/page layout).
- CSS variables in `vars.css` use **oklch color space**: `--background: 100.00% 0.0000 none`.
  - Format: `lightness chroma hue` — perceptually uniform, wider gamut than HSL.
  - Colors applied in Tailwind via `oklch(var(--token))`.
- Colors applied via Tailwind tokens: `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, etc.
- Container defined in `tailwind.css`.
- Use `cn()` from `@/lib/cn` (clsx + tailwind-merge) for merging classes.

### Components

- **UI components** → `src/components/UI/` — based on **shadcn/ui** (new-york style).
  - Available: Button, Input, Dialog, Skeleton, Sonner (toast), VisuallyHidden.
  - Button uses `cva` variants and `asChild` via `@radix-ui/react-slot`.
  - Toast notifications: `sonner` (not react-hot-toast). Use `toast()` from `sonner`.
- Layout components → `src/components/layouts/` (Header, Footer, Container, ClientProviders, ErrorBoundary).
- No theme switching — single light theme only.
- Icons → `src/components/icons/`.
- Page-specific components → `src/app/[locale]/(routes)/{page}/components/`.

### API

- Axios instance: `src/services/api/instance.ts`.
- `request<T>(config, signal?)` — typed helper, returns `data` from AxiosResponse. Supports `AbortSignal`.
- `isApiError(error)` — type guard for AxiosError.
- `isAbortError(error)` — checks if error is a cancelled request.
- API endpoints: `src/services/api/paths.ts`.
- API modules: `src/services/api/{resource}/index.ts` — functions + React Query hooks.

### Server Actions

- Server Actions go in `src/app/actions.ts` (global) or co-located with pages.
- All files with Server Actions must start with `'use server'` directive.
- Always validate inputs — Server Actions are public HTTP endpoints.
- Use `revalidatePath()` / `revalidateTag()` after mutations.
- Use `useActionState()` hook in Client Components for form state management.
- See `src/app/actions.ts` for a documented example.

### Types

- Global types → `src/types/index.ts`.
- Component types — next to the component or inline.
- No `interfaces/` directory — everything in `types/`.

### Hooks

- Reusable hooks → `src/hooks/index.ts`.
- Available: `useMediaQuery`, `useDebounce`, `useClickOutside`, `useScrollLock`, `useToggle`, `useIsomorphicLayoutEffect`.

### Logging

- Use `logger` from `@/utils/logger` instead of `console.*`.
- In production `logger.log`/`logger.warn` become noop; `logger.error` always logs.

### Configuration

- `src/configs/project/` — name, i18n, sitemap, robots.
- `src/configs/constants/urls.ts` — URLs (website, server API).
- `src/configs/metadata/` — `getBaseMetadata()`, `createMetadata()`, `previewImage()`.
  - OG/Twitter preview images stored in `public/assets/img/previews/` (`.webp`).
  - Use `preview` shorthand in `createMetadata({ preview: 'about' })` for per-page preview.
  - Global fallback: `global.webp`.
- `src/configs/env.ts` — env variable validation.
- `src/configs/routes.ts` — application routes.

### State Management

- Redux Toolkit: `src/store/` — global state.
- TanStack React Query: server state and API caching. Use `STALE_TIMES` from `@/lib/queryClient`.
- React Query DevTools connected in ClientProviders.

### Error Handling

- `ErrorBoundary` component in `src/components/layouts/ErrorBoundary.tsx`.
- Error reporting abstraction: `src/lib/errorReporting.ts` — plug Sentry or other service.
- Feature flags: `src/configs/featureFlags.ts` — `featureFlags.isEnabled(flag)`.

### Tests

- Vitest + @testing-library/react.
- Tests in `src/__tests__/` with mirrored structure.
- Run: `pnpm test` / `pnpm test:watch`.

### Code Style

- All comments in English.
- Minimal comments — only where intent is non-obvious.

## Commands

```
pnpm dev          # Dev server (port 5555)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm lint:fix     # ESLint autofix
pnpm format       # Prettier
pnpm test         # Vitest
pnpm test:watch   # Vitest watch mode
pnpm analyze      # Bundle analyzer
pnpm clean        # Clean .next/dist
```

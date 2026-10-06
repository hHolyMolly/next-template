# Gotchas

Symptom → real cause → fix. One entry per incident actually hit while
building or hardening this template. Add yours — a symptom you debugged for
an hour belongs here, indexed by what you SAW, not by what it turned out
to be.

---

## Runtime / routing

**404 pages return HTTP 200.**
Cause: a `loading.tsx` at the LOCALE level. Its Suspense boundary streams a
200 shell before the `[...rest]` catch-all can throw `notFound()`.
Fix: keep `loading.tsx` at route level only (e.g. `(routes)/template/`).
Segment-scoped boundaries are safe — verified empirically.

**Runtime checks pass/fail randomly between runs; a "fixed" bug is still there.**
Cause: a zombie `next-server` from a previous session still owns the port —
you're testing last week's build.
Fix: `lsof -nP -iTCP:3100 -sTCP:LISTEN` → `pkill -f next-server` before
every prod-runtime test round.

**`/manifest.webmanifest` (or an OG image) redirects 307 → 404 for non-default locales.**
Cause: the intl middleware matcher caught extensionless metadata routes.
Fix: the matcher in `src/proxy.ts` excludes `manifest.webmanifest`,
`opengraph-image`, `twitter-image`, `apple-icon`, `icon`, `sitemap.xml`,
`robots.txt` — keep the list in sync when adding metadata files. Path
prefixes need boundaries too: `(?:api|trpc)(?:/|$)`, or `/apiary` leaks out
of the exclusion.

## CSP / security

**Production hydration breaks with a nonce CSP; dev works fine.**
Cause: nonce + CSP set only on the RESPONSE. Next reads the nonce from the
REQUEST headers to sign its own bootstrap scripts (`strict-dynamic`).
Fix: `proxy.ts` puts `x-nonce` + the CSP header on the request via
`new NextRequest(request, { headers })` into the intl middleware, then
mirrors the CSP on the response.

**Suspense fallback stays on screen forever under a strict CSP (measured
in a descendant project).**
React's swap-in script for streamed boundaries is inline. With the nonce on
the REQUEST headers (see above) Next signs it, and on this template the
swap works — verified in a prod build with an artificially slowed segment
and zero CSP violations (Next 16.1.6, `cacheComponents` OFF). Re-verify
this exact scenario when enabling `cacheComponents` — that is where the
incompatibility was observed in production elsewhere.

**Dropdowns/tooltips render at the top-left corner when `CSP_STRICT_STYLES=true`.**
Cause: Radix Popper / floating-ui position floating UI via inline `style`
ATTRIBUTES; a nonce-only `style-src` blocks them.
Fix: strict mode keeps `style-src-attr 'unsafe-inline'` while
`style-src-elem` carries the nonce (see `buildCsp` in `src/proxy.ts`).

**Trusted Types "report" mode silently turned the whole CSP off.**
Cause: report mode flipped the MAIN policy header to
`Content-Security-Policy-Report-Only`.
Fix: TT report directives go in a SEPARATE Report-Only header; the main CSP
stays enforcing. Only `CSP_REPORT_ONLY=true` may change the main header.

**Link prefetches / fetches fail with `ERR_SSL_PROTOCOL_ERROR` on a local
`pnpm start` (http://localhost).**
Cause: CSP `upgrade-insecure-requests` was sent unconditionally; the
browser upgrades every same-origin request on an http page to https.
Fix: the directive is added only when the request itself is HTTPS
(`nextUrl.protocol` or `x-forwarded-proto`) — see `buildCsp` in `proxy.ts`.

**HTTPS errors in dev for exactly one person on the team (Safari).**
Cause: HSTS sent on http://localhost — Safari honours it and pins the
origin; Chromium exempts localhost, so everyone else is fine.
Fix: `Strict-Transport-Security` is production-only in `next.config.ts`.

**Rate limiting "works in dev, does nothing in prod" (or: one user gets
429 and everyone else does too).**
Cause: without `TRUSTED_PROXY_HOPS`/`x-real-ip` there is no trustworthy
client IP. Falling back to a constant collapses every visitor into ONE
bucket (site-wide self-DoS); this template instead SKIPS limiting and logs
a one-time warning.
Fix: set `TRUSTED_PROXY_HOPS` for your platform (Vercel: 1).

**A Server Action navigates nowhere / shows an error toast after `redirect()`.**
Cause: a catch-all wrapper swallowed Next's control-flow errors —
`redirect()`/`notFound()` THROW, with a `digest` starting `NEXT_`.
Fix: re-throw them before generic error handling (see `withServerAction`).

**Rate limiting looks like it works in the API but Server Actions are limited
twice (page budget + action budget).**
Cause: a Server Action is a POST to the page URL, so `proxy.ts` counts it
against the per-IP PAGE budget as well as `withActionRateLimit`.
Fix: nothing — by design (coarse floor + fine per-action budget). Do NOT
short-circuit on the `next-action` header: it is client-controlled.

**`/api/revalidate` returns 403 although the secret is right.**
Cause: the secret was passed as `?secret=` — only the `x-revalidate-secret`
header is accepted (query strings land in access logs).

**`revalidatePath('/blog')` from the webhook changes nothing.**
Cause: pages live under `/[locale]/…`; the bare path matches no route.
Fix: the webhook revalidates `/[locale]<path>` with `type: 'page'`, which
covers every locale (unprefixed default included).

## Data / React

**The "SSR prefetch" demo works, but the client still fetches after mount.**
Cause: TanStack's default `shouldDehydrateQuery` ships only `success`
queries — an un-awaited `prefetchQuery` is still `pending` when
`dehydrate()` runs and is silently dropped.
Fix: `dehydrate.shouldDehydrateQuery` includes pending queries
(`lib/queryClient`); the promise streams in the RSC payload.

**React #418 "server rendered text didn't match" on a prefetched widget.**
Cause: a pending-dehydrated query consumed with `useQuery` — the server
rendered "Loading…", the streamed promise resolved before hydration, and
the client rendered the data.
Fix: `useSuspenseQuery` inside `<Suspense>` (both sides wait for the same
promise); `ErrorBoundary` for the inline error state.

**"A query that was dehydrated as pending ended up rejecting" /
`⨯ Error: redacted` in the server log.**
Cause: the server prefetch self-fetched `NEXT_PUBLIC_CLIENT_URL/api/…` —
a different port (dev on 3200, URL says 3000) or the live demo site
(`.env.production`) answered.
Fix: server prefetches call the data function directly
(`{ ...healthQuery, queryFn: getHealth }`); only the browser goes through
the Route Handler.

**Requests to own routes hit `https://backend/api/api/health`.**
Cause: one resolver prefixed EVERY relative path with the backend base once
`NEXT_PUBLIC_SERVER_URL` was set; axios does the same with `baseURL`.
Fix: `resolveAppUrl()` (own routes, always absolute) vs `resolveApiUrl()`
(backend) in `services/api/http.ts`.

**A value set in env is `undefined` in the browser; every gate is green.**
Cause: the bundler only rewrites literal `process.env.NEXT_PUBLIC_X` —
dynamic access (`process.env[name]`) survives to the client as-is. Node
tests can't catch it (they have a real `process.env`).
Fix: literal reads only + `scripts/check-public-env.mjs` runs after every
build and fails when a set variable is absent from all client chunks.

**Screens hold skeletons forever / submits spin silently when offline.**
Cause: TanStack Query's default `networkMode: 'online'` PAUSES requests —
they neither resolve nor reject.
Fix: `networkMode: 'always'` for queries and mutations (`lib/queryClient`).

**The UI says a mutation failed, but the server applied it.**
Cause: a bug in an `onSuccess` cache updater — TanStack runs `onSuccess`
inside the mutation's try block and re-throws.
Fix: wrap cache writes in `patchCache(label, fn)` (`@/lib/patchCache`).

**A placeholder gated on `isPending` never disappears for some users.**
Cause: a `skipToken`/disabled query stays `isPending: true` forever.
Fix: gate on `isWaitingFor(query)` (`@/lib/queryState`).

**An SSR prefetch compiles, runs, and silently prefetches nothing.**
Cause: query keys/options imported from a module marked `'use client'` — a
server component gets a client-reference proxy instead of the value.
Fix: keys/contract modules must be plain modules (no `'use client'`).

**Hydration mismatch on formatted dates/numbers.**
Cause: server and client formatted in different time zones.
Fix: `timeZone` is pinned via `projectConfig.i18n.timeZone` ('UTC') in the
next-intl request config.

**React Compiler is on — so why is this `useMemo` here?**
It shouldn't be. Don't add `useMemo`/`useCallback` unless profiling demands
it. Known library caveat: react-hook-form and TanStack Table may need a
`'use no memo'` directive on components the compiler mis-memoizes — prefer
documenting the case here over sprinkling manual memoization.

## CSS / fonts

**Links inherit the parent color; inputs are square — the Tailwind classes
are in the DOM but do nothing.**
Cause: `normalize.css` was imported UNLAYERED. Unlayered CSS beats every
cascade layer, so `a { color: inherit }` / `input { border-radius: 0 }`
override `text-*` and `rounded-*` utilities regardless of specificity.
Fix: the whole reset lives inside `@layer base`.

**The next/font family never applies; the page renders in the system font.**
Cause: the font variable class (`--font-app`) sat on `<body>` while
Tailwind defines `--font-sans: var(--font-app)` on `:root`. A custom
property is substituted where it is DEFINED, so at `:root` the reference
was invalid and the stack collapsed to the fallback.
Fix: put `appFont.variable` on `<html>` (= `:root`).

## Tooling

**`pnpm typecheck:test` passes in seconds and never catches anything.**
Cause: `tsconfig.test.json` overrode `include` but inherited `exclude`
(`**/*.test.ts`) from the base config — the program contained two files.
Fix: the test config sets its own `"exclude": ["node_modules"]`. Verify
with `tsc -p tsconfig.test.json --showConfig | grep -c '\.test\.'`.

**ESLint 10 install fails on peer dependencies.**
Cause: `eslint-config-next` still depends on `eslint-plugin-react@7`,
`eslint-plugin-import@2` and `eslint-plugin-jsx-a11y@6`, whose peer range
tops out at ESLint 9.
Fix: stay on ESLint 9; re-check with
`pnpm view eslint-plugin-react@7 peerDependencies.eslint`.

**vitest crashes on startup after an upgrade.**
Cause: an old lockfile pins an older vite as a transitive peer.
Fix: keep `vite`, `@vitejs/plugin-react` and `vitest` as explicit devDeps
moving together (vitest 5 ↔ vite 8 ↔ plugin-react 6). Related: jsdom is
pinned `^29` — 30 requires Node ≥ 24.15; bump both together.

**Aliases don't resolve inside `*.test.tsx` only.**
Cause: `vite-tsconfig-paths` reads the app tsconfig, which EXCLUDES tests.
Fix: declare `resolve.alias` explicitly in `vitest.config.ts` (done) and
typecheck tests with `tsconfig.test.json` (`pnpm typecheck:test`).

**A server-only module explodes in a unit test ("cannot be imported from a
Client Component").**
Cause: `import 'server-only'` throws outside Next's RSC layer.
Fix: `vitest.setup.ts` mocks `server-only`; add
`// @vitest-environment node` to the test file so jsdom's `AbortSignal`
doesn't fight Node's `fetch`.

**`pnpm install` refuses a freshly released package version.**
Cause: `minimumReleaseAge: 4320` (3 days) in `pnpm-workspace.yaml` —
supply-chain guard.
Fix: lower the version RANGE floor; never exclude the package from the rule.

**commitlint rejects the commit.**
Subjects must start lowercase (`config-conventional`).

**ESLint: "Cannot redefine plugin import".**
Cause: registering `eslint-plugin-import` yourself — `eslint-config-next`
already provides the instance.
Fix: use the existing instance; never re-register.

**Scroll position jumps / body styles fight each other with a Radix Dialog open.**
Cause: `useScrollLock` and Radix both manage `document.body` scroll.
Fix: don't combine them — Radix overlays lock scroll themselves.

**Chrome autofills a field that has `autocomplete="off"`.**
Cause: for the Autofill feature Chrome treats a literal `off` as "no
declared type" and falls back to heuristics.
Fix: an UNRECOGNIZED token (e.g. `autoComplete="nope"`) parses as
"unrecognized" and suppresses it — used by the demo form's honeypot.

<div align="center">
  <h1>Next Template</h1>
  <p>Production-ready Next.js starter with TypeScript, Tailwind CSS, i18n, and everything you need for scalable applications</p>

  <p>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D22-brightgreen?style=flat-square" alt="Node.js"></a>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/next.js-16-black?style=flat-square" alt="Next.js"></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/typescript-strict-3178C6?style=flat-square" alt="TypeScript"></a>
    <a href="https://github.com/hHolyMolly/next-template/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License"></a>
  </p>
</div>

<br />

## Features

- **Next.js 16** — App Router, Turbopack, React 19
- **TypeScript** — strict mode, full type coverage
- **Tailwind CSS + SCSS** — utility-first styling with CSS Variables
- **i18n** — next-intl with middleware & `[locale]` routing
- **State Management** — Redux Toolkit + TanStack Query (canonical for all API I/O)
- **API Layer** — Axios + typed paths + ready-made TanStack Query hooks
- **Forms** — React Hook Form + Zod resolver + typed `<FormField>`
- **UI Components** — Button, Input, FormField, Dialog (Radix), Sonner (toast), Skeleton (CVA variants)
- **Code Quality** — ESLint 9 + Prettier + Stylelint
- **Testing** — Vitest + React Testing Library
- **Deploy** — GitHub Actions CI/CD

## Tech Stack

| Category     | Technology                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Framework    | [Next.js 16](https://nextjs.org) (App Router, Turbopack)                                                                        |
| Language     | [TypeScript](https://www.typescriptlang.org) (strict mode)                                                                      |
| Styling      | [Tailwind CSS](https://tailwindcss.com) + SCSS + CSS Variables                                                                  |
| i18n         | [next-intl](https://next-intl-docs.vercel.app) (middleware, `[locale]` routing)                                                 |
| State        | [Redux Toolkit](https://redux-toolkit.js.org) + [TanStack Query](https://tanstack.com/query)                                    |
| API          | [Axios](https://axios-http.com) + typed paths + TanStack Query hooks                                                            |
| Forms        | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) resolver                                                |
| Variants     | [CVA](https://cva.style) + [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) |
| Code Quality | [ESLint 9](https://eslint.org) + [Prettier](https://prettier.io) + [Stylelint](https://stylelint.io)                            |
| Testing      | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com)                                                   |
| CI/CD        | GitHub Actions                                                                                                                  |

## Quick Start

```bash
npx degit hHolyMolly/next-template my-app
cd my-app
pnpm install
pnpm clean:demo        # strip demo surface, rename project, remove LICENSE, self-delete
pnpm dev
```

> **Requirements:** Node.js 22+, pnpm

## Commands

| Command              | Description                    |
| -------------------- | ------------------------------ |
| `pnpm dev`           | Dev server (Turbopack)         |
| `pnpm build`         | Production build               |
| `pnpm start`         | Start production server        |
| `pnpm preview`       | Build + start                  |
| `pnpm lint`          | ESLint check                   |
| `pnpm lint:fix`      | ESLint auto-fix                |
| `pnpm lint:styles`   | Stylelint check + fix          |
| `pnpm lint:all`      | ESLint + Stylelint + TypeCheck |
| `pnpm format`        | Prettier formatting            |
| `pnpm typecheck`     | TypeScript type checking       |
| `pnpm test`          | Run unit tests (Vitest)        |
| `pnpm test:watch`    | Unit tests in watch mode       |
| `pnpm test:coverage` | Unit tests with coverage       |
| `pnpm clean`         | Remove `.next`, `dist`         |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Redirect → default locale
│   ├── not-found.tsx            # Root 404 (i18n, header, footer)
│   ├── global-error.tsx         # Global error boundary
│   ├── layout.tsx               # Root layout (styles, fonts, JSON-LD)
│   ├── robots.ts                # robots.txt generation
│   ├── sitemap.ts               # sitemap.xml generation
│   └── [locale]/
│       ├── layout.tsx           # Locale layout (providers)
│       ├── page.tsx             # Home page (no header/footer — landing)
│       ├── loading.tsx          # Loading state
│       ├── error.tsx            # Error boundary
│       ├── not-found.tsx        # 404 page (i18n, header, footer)
│       └── (routes)/            # Pages with header & footer
│           ├── layout.tsx       # Adds Header + Footer wrapper
│           ├── template/        # Template starter page
│           ├── [...rest]/       # Catch-all → 404
│           └── home/            # Demo components (delete after start)
├── components/
│   ├── layouts/                 # Header, Footer, Container, ClientProviders
│   ├── icons/                   # SVG icon components
│   └── UI/                      # Reusable UI components
│       ├── Button.tsx           # CVA button with variants
│       ├── Input.tsx            # CVA input with label/error
│       ├── Dialog.tsx           # Radix dialog primitives
│       ├── Sonner.tsx           # Toast notifications (sonner)
│       └── Skeleton.tsx         # Skeleton loader + presets
├── configs/
│   ├── project/                 # Project name, locales, sitemap, robots
│   ├── metadata/                # SEO metadata helpers
│   └── constants/               # URLs, env variables
├── hooks/                       # Custom React hooks
│   ├── useClickOutside          # Click outside detection
│   ├── useDebounce              # Value debouncing
│   ├── useMediaQuery            # SSR-safe media queries
│   ├── useScrollLock            # Scroll locking
│   └── useToggle                # Boolean toggle
├── lib/
│   ├── cn.ts                    # clsx + tailwind-merge
│   ├── queryClient.ts           # React Query client
│   ├── lazyLoad.ts              # Dynamic import helper
│   └── jsonLd.ts                # JSON-LD structured data
├── services/
│   ├── api/                     # Axios instance + request helper
│   ├── i18n/                    # Routing, navigation, middleware
│   └── storage/                 # Local/session/cookie storage
├── store/                       # Redux store + slices
├── styles/                      # Tailwind, SCSS, fonts, normalize, CSS vars
├── types/                       # TypeScript types
└── utils/                       # Utility functions (debounce, logger)
```

## Configuration

| Setting      | Location                                                         |
| ------------ | ---------------------------------------------------------------- |
| Project      | [`src/configs/project`](src/configs/project/index.ts)            |
| URLs         | [`src/configs/constants/urls.ts`](src/configs/constants/urls.ts) |
| Environment  | `.env.example` → `.env.development` / `.env.production`          |
| Translations | [`public/locales/{locale}/`](public/locales/)                    |
| Styles       | [`src/styles/vars.css`](src/styles/vars.css)                     |

### Optional integrations

The template ships lean — add any of the following when you need them:

- Error reporting (Sentry, Datadog, Rollbar, …): wire the SDK inside
  `src/instrumentation.ts` / `src/instrumentation-client.ts` and replace the
  body of `src/lib/errorReporting.ts` — every call site already goes through
  that abstraction.
- Distributed rate limiting (Upstash, Redis, …): replace the in-memory
  backend inside `src/lib/rateLimit.ts` with your vendor of choice.

## UI Components

### Button

```tsx
<Button variant="primary" size="md" status="loaded">Click me</Button>
<Button variant="destructive" before={<TrashIcon />}>Delete</Button>
```

### Input

```tsx
<Input label="Email" placeholder="you@example.com" error="Required" />
<Input variant="filled" size="lg" before={<SearchIcon />} />
```

### Dialog

```tsx
import * as Dialog from '@/components/UI/Dialog';

<Dialog.Root>
  <Dialog.Trigger asChild>
    <Button>Open</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Confirm</Dialog.Title>
    <p>Are you sure?</p>
  </Dialog.Content>
</Dialog.Root>;
```

### Toast

```tsx
import { toast } from 'sonner';

toast.success('Saved successfully!');
toast.error('Something went wrong');
```

### Skeleton

```tsx
<Skeleton width={200} height={20} />
<SkeletonText lines={3} />
<SkeletonAvatar size={48} />
<SkeletonCard />
```

## Getting Started

After cloning, the demo page is at `/` (home). To start building your project:

1. **Delete demo page** — remove `src/app/[locale]/(routes)/home/` folder
2. **Update home page** — edit `src/app/[locale]/page.tsx` with your content
3. **Use template page** — `src/app/[locale]/(routes)/template/` is a starter page with Header + Footer — rename and customize it
4. **Add new pages** — create folders inside `(routes)/` — they automatically get Header + Footer from `(routes)/layout.tsx`
5. **Pages without Header/Footer** — create page files directly in `[locale]/` (outside `(routes)/`)
6. **Update translations** — edit files in `public/locales/{en,ru}/`
7. **Update metadata** — edit `public/locales/{locale}/metadata.json`

### Page Structure

| Route        | Header/Footer | Description                 |
| ------------ | ------------- | --------------------------- |
| `/`          | No            | Home / landing page         |
| `/template`  | Yes           | Template starter page       |
| `/any-route` | Yes           | Any page inside `(routes)/` |
| `/404`       | Yes           | Not found page              |

## Testing

- **Unit** — [Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/). Place `*.test.ts(x)` / `*.spec.ts(x)` next to source files in `src/`.
- **Setup files** — [`vitest.config.ts`](vitest.config.ts), [`vitest.setup.ts`](vitest.setup.ts).

```bash
pnpm test                # unit tests
pnpm test:watch          # watch mode
pnpm test:coverage       # coverage report (v8)
```

## API Layer — TanStack Query first

All API I/O goes through TanStack Query. **Do not** call `request()` directly
from a component — wrap it in a `useQuery` / `useMutation` so the cache, devtools,
and loading states stay consistent.

1. Add the endpoint to [`src/services/api/paths.ts`](src/services/api/paths.ts).
2. Add typed query/mutation hooks in [`src/services/api/queries.ts`](src/services/api/queries.ts) — see the `useTodos` / `useCreateTodo` example.
3. Import and use in components.

```tsx
'use client';
import { useTodos, useCreateTodo } from '@/services/api';

const { data, isLoading } = useTodos();
const create = useCreateTodo();
create.mutate({ title: 'Buy milk' });
```

## Forms — React Hook Form + Zod

```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField, Button } from '@/components/UI';

const schema = z.object({
  email: z.email(),
  name: z.string().min(1),
});

const { control, handleSubmit } = useForm({ resolver: zodResolver(schema) });

<form onSubmit={handleSubmit(onSubmit)}>
  <FormField control={control} name="name" label="Name" />
  <FormField control={control} name="email" label="Email" type="email" />
  <Button type="submit">Send</Button>
</form>;
```

## Server Actions

Wrap every mutating action with `withServerAction` to get a typed
`{ success, data } | { success: false, error }` result instead of thrown
exceptions. Mutations must also assert same-origin and rate-limit themselves
— middleware (`proxy.ts`) does **not** see Server Actions.

```ts
'use server';
import { withServerAction } from '@/lib/withServerAction';
import { assertSameOrigin } from '@/lib/assertSameOrigin';
import { withActionRateLimit } from '@/lib/rateLimitAction';
import { ValidationError } from '@/lib/errors';

export const sendMessage = withServerAction(
  withActionRateLimit({ limit: 5, windowSeconds: 60 }, async (input: { email: string }) => {
    await assertSameOrigin();
    if (!input.email) throw new ValidationError('email is required', 'email');
    // ...
    return { ok: true };
  }),
);
```

## Security notes

- **CSP `style-src 'unsafe-inline'`** stays on by default — Next.js injects
  inline styles for Suspense fallbacks, `next/image` placeholders and Server
  Component streaming. Flip `CSP_STRICT_STYLES=true` only after rolling out
  `Content-Security-Policy-Report-Only` (`CSP_REPORT_ONLY=true`) and
  confirming there are no violations. Tracked upstream:
  https://github.com/vercel/next.js/issues/39560
- **CORS + credentials**: never combine `origins: '*'` with `credentials: true`.
  Even with an explicit allowlist, **every mutating Route Handler / Server
  Action must call `assertSameOrigin()`** — `SameSite=Lax` cookies are sent on
  cross-site top-level navigations and leave a CSRF window otherwise.
- **Rate limiting** uses an in-memory backend — safe for VPS / Docker /
  `next start`, **not** safe for serverless (each cold start has its own
  budget). Swap the backend in `src/lib/rateLimit.ts` for Redis-backed when
  deploying to Vercel / Lambda / Workers.

## Deploy

### Vercel

```bash
npx vercel
```

### Self-hosted

```bash
pnpm build
pnpm start
```

## License

MIT © [HolyMolly](https://github.com/hHolyMolly)

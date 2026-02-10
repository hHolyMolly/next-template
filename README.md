# Next Template

Production-ready Next.js 16 template — TypeScript, Tailwind CSS, SCSS, i18n, Redux Toolkit, React Query, and more.

## Quick Start

```bash
pnpm dlx degit hHolyMolly/next-template my-app
cd my-app
pnpm install
pnpm dev
```

## Features

- **Next.js 16** — App Router, Turbopack, `[locale]` routing
- **TypeScript** — strict mode
- **Tailwind CSS + SCSS** — utility-first + custom styles
- **next-intl** — multi-language support with middleware
- **Redux Toolkit** — global state management
- **React Query** — server state, caching, devtools
- **Axios** — API layer with typed `request<T>()` helper
- **Vitest** — unit testing with React Testing Library
- **CVA + clsx + twMerge** — component variant system
- **ESLint + Prettier** — code quality
- **PM2** — production process manager

## Commands

| Command           | Description                 |
| ----------------- | --------------------------- |
| `pnpm dev`        | Dev server (Turbopack)      |
| `pnpm build`      | Production build            |
| `pnpm start`      | Start production server     |
| `pnpm lint`       | ESLint check                |
| `pnpm lint:fix`   | ESLint auto-fix             |
| `pnpm format`     | Prettier formatting         |
| `pnpm test`       | Run tests                   |
| `pnpm test:watch` | Tests in watch mode         |
| `pnpm clean`      | Remove .next, out, dist     |
| `pnpm clean:all`  | Remove node_modules + .next |

## Project Structure

```
src/
├── app/
│   ├── page.tsx            # Redirects to default locale
│   ├── not-found.tsx       # Root 404 (client component)
│   ├── global-error.tsx    # Global error boundary
│   ├── layout.tsx          # Root layout (minimal)
│   ├── robots.ts           # robots.txt
│   ├── sitemap.ts          # sitemap.xml
│   └── [locale]/
│       ├── layout.tsx      # Locale layout (providers, header, footer)
│       ├── error.tsx       # Error boundary
│       ├── not-found.tsx   # 404 page (i18n)
│       └── (routes)/       # Page routes
├── components/
│   ├── layouts/            # Layout components (ClientProviders, Header, Footer)
│   ├── icons/              # Icon components
│   └── UI/                 # Reusable UI components (Button, etc.)
├── configs/
│   ├── project/            # Project settings (name, i18n, sitemap, robots)
│   ├── metadata/           # SEO metadata helpers
│   └── constants/          # URLs
├── hooks/                  # Custom React hooks
├── lib/                    # Shared instances (cn, queryClient)
├── services/
│   ├── api/                # Axios instance + request helper
│   ├── i18n/               # Internationalization (routing, navigation, middleware)
│   └── storage/            # Storage utilities
├── store/                  # Redux store + slices
├── styles/                 # Global styles (Tailwind, SCSS, fonts)
├── types/                  # TypeScript types
└── utils/                  # Utility functions (debounce, logger)
```

## Configuration

- **Project** — [`src/configs/project`](src/configs/project/index.ts) (name, locales, sitemap, robots)
- **URLs** — [`src/configs/constants/urls.ts`](src/configs/constants/urls.ts)
- **Environment** — `.env.development` / `.env.production`
- **Translations** — [`public/locales/{locale}/`](public/locales/)

## Deploy

Recommended: [Vercel](https://vercel.com/) — zero-config deployment for Next.js.

```bash
pnpm dlx vercel
```

## License

MIT © [HolyMolly](https://github.com/hHolyMolly)

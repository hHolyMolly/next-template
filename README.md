# Next Template

Production-ready Next.js template with TypeScript, Tailwind CSS, SCSS, i18n, state management, and everything you need for scalable applications.

## Quick Start

```bash
npx degit hHolyMolly/next-template my-app
cd my-app
pnpm install
pnpm dev
```

> Requires **Node.js 22+** and **pnpm**.

## Tech Stack

| Category     | Technology                                 |
| ------------ | ------------------------------------------ |
| Framework    | Next.js 16 (App Router, Turbopack)         |
| Language     | TypeScript (strict mode)                   |
| Styling      | Tailwind CSS + SCSS                        |
| i18n         | next-intl (middleware, `[locale]` routing) |
| State        | Redux Toolkit + React Query                |
| API          | Axios with typed `request<T>()` helper     |
| Testing      | Vitest + React Testing Library             |
| Variants     | CVA + clsx + tailwind-merge                |
| Code Quality | ESLint 9 + Prettier                        |
| Process      | PM2 (production)                           |

## Commands

| Command           | Description                     |
| ----------------- | ------------------------------- |
| `pnpm dev`        | Dev server (Turbopack)          |
| `pnpm build`      | Production build                |
| `pnpm start`      | Start production server         |
| `pnpm lint`       | ESLint check                    |
| `pnpm lint:fix`   | ESLint auto-fix                 |
| `pnpm format`     | Prettier formatting             |
| `pnpm test`       | Run tests                       |
| `pnpm test:watch` | Tests in watch mode             |
| `pnpm clean`      | Remove `.next`, `dist`          |
| `pnpm clean:all`  | Remove `node_modules` + `.next` |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Redirect → default locale
│   ├── not-found.tsx            # Root 404
│   ├── global-error.tsx         # Global error boundary
│   ├── layout.tsx               # Root layout
│   ├── robots.ts                # robots.txt generation
│   ├── sitemap.ts               # sitemap.xml generation
│   └── [locale]/
│       ├── layout.tsx           # Locale layout (providers, header, footer)
│       ├── error.tsx            # Error boundary
│       ├── not-found.tsx        # 404 page (i18n)
│       └── (routes)/            # Page routes
│           └── home/            # Demo welcome page (delete after start)
├── components/
│   ├── layouts/                 # Header, Footer, ClientProviders
│   ├── icons/                   # SVG icon components
│   └── UI/                      # Reusable UI (Button, etc.)
├── configs/
│   ├── project/                 # Project name, locales, sitemap, robots
│   ├── metadata/                # SEO metadata helpers
│   └── constants/               # URLs, env variables
├── hooks/                       # Custom React hooks
├── lib/                         # cn(), queryClient
├── services/
│   ├── api/                     # Axios instance + request helper
│   ├── i18n/                    # Routing, navigation, middleware
│   └── storage/                 # Local/session storage
├── store/                       # Redux store + slices
├── styles/                      # Tailwind, SCSS, fonts, normalize
├── types/                       # TypeScript types
└── utils/                       # Utility functions
```

## Configuration

| Setting      | Location                                                         |
| ------------ | ---------------------------------------------------------------- |
| Project      | [`src/configs/project`](src/configs/project/index.ts)            |
| URLs         | [`src/configs/constants/urls.ts`](src/configs/constants/urls.ts) |
| Environment  | `.env.development` / `.env.production`                           |
| Translations | [`public/locales/{locale}/`](public/locales/)                    |

## Deploy

```bash
npx vercel
```

## License

MIT © [HolyMolly](https://github.com/hHolyMolly)

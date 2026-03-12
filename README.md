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
| Styling      | Tailwind CSS + SCSS + CSS Variables        |
| i18n         | next-intl (middleware, `[locale]` routing) |
| State        | Redux Toolkit + React Query                |
| API          | Axios with typed `request<T>()` helper     |
| Testing      | Vitest + React Testing Library + MSW       |
| Variants     | CVA + clsx + tailwind-merge                |
| Code Quality | ESLint 9 + Prettier + Husky + lint-staged  |
| Commits      | Commitlint (Conventional Commits)          |
| Process      | PM2 (production)                           |
| Container    | Docker + docker-compose                    |
| CI/CD        | GitHub Actions                             |

## Commands

| Command              | Description                      |
| -------------------- | -------------------------------- |
| `pnpm dev`           | Dev server (Turbopack)           |
| `pnpm build`         | Production build                 |
| `pnpm start`         | Start production server          |
| `pnpm lint`          | ESLint check                     |
| `pnpm lint:fix`      | ESLint auto-fix                  |
| `pnpm format`        | Prettier formatting              |
| `pnpm format:check`  | Check formatting without changes |
| `pnpm typecheck`     | TypeScript type checking         |
| `pnpm test`          | Run tests                        |
| `pnpm test:watch`    | Tests in watch mode              |
| `pnpm test:coverage` | Tests with coverage report       |
| `pnpm clean`         | Remove `.next`, `dist`           |
| `pnpm clean:all`     | Remove `node_modules` + `.next`  |
| `pnpm analyze`       | Bundle analyzer                  |

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
│           ├── [...]rest/       # Catch-all → 404
│           └── home/            # Demo components (delete after start)
├── components/
│   ├── layouts/                 # Header, Footer, Container, ClientProviders
│   ├── icons/                   # SVG icon components
│   └── UI/                      # Reusable UI components
│       ├── Button.tsx           # CVA button with variants
│       ├── Input.tsx            # CVA input with label/error
│       ├── Modal.tsx            # Portal-based modal dialog
│       ├── Toast.tsx            # Toast notification system
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
│   ├── useToggle                # Boolean toggle
│   └── useToast                 # Toast notifications
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
├── utils/                       # Utility functions (debounce, logger)
└── __tests__/                   # Test files
    ├── setup.ts                 # Test setup (jest-dom + MSW)
    ├── mocks/                   # MSW handlers + server
    ├── components/              # Component tests
    ├── hooks/                   # Hook tests
    ├── lib/                     # Lib tests
    └── utils/                   # Utility tests
```

## Configuration

| Setting      | Location                                                         |
| ------------ | ---------------------------------------------------------------- |
| Project      | [`src/configs/project`](src/configs/project/index.ts)            |
| URLs         | [`src/configs/constants/urls.ts`](src/configs/constants/urls.ts) |
| Environment  | `.env.example` → `.env.development` / `.env.production`          |
| Translations | [`public/locales/{locale}/`](public/locales/)                    |
| Styles       | [`src/styles/vars.css`](src/styles/vars.css)                     |

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

### Modal

```tsx
const [isOpen, toggle] = useToggle();
<Modal isOpen={isOpen} onClose={toggle} title="Confirm">
  <p>Are you sure?</p>
</Modal>;
```

### Toast

```tsx
const { success, error } = useToast();
success('Saved successfully!');
error('Something went wrong');
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

1. **Delete demo page**: remove `src/app/[locale]/(routes)/home/` folder
2. **Update home page**: edit `src/app/[locale]/page.tsx` with your content
3. **Use template page**: `src/app/[locale]/(routes)/template/` is a starter page with Header + Footer — rename and customize it
4. **Add new pages**: create folders inside `(routes)/` — they automatically get Header + Footer from `(routes)/layout.tsx`
5. **Pages without Header/Footer**: create page files directly in `[locale]/` (outside `(routes)/`)
6. **Update translations**: edit files in `public/locales/{en,ru}/`
7. **Update metadata**: edit `public/locales/{locale}/metadata.json`

### Page structure

| Route        | Header/Footer | Description                 |
| ------------ | ------------- | --------------------------- |
| `/`          | No            | Home / landing page         |
| `/template`  | Yes           | Template starter page       |
| `/any-route` | Yes           | Any page inside `(routes)/` |
| `/404`       | Yes           | Not found page              |

## Docker

```bash
# Build and run
docker-compose up -d

# Or manually
docker build -t my-app .
docker run -p 3000:3000 my-app
```

> Uncomment `output: 'standalone'` in `next.config.ts` before Docker builds.

## Deploy

```bash
# Vercel
npx vercel

# PM2
pm2 start ecosystem.config.cjs --env production

# Docker
docker-compose up -d
```

## License

MIT © [HolyMolly](https://github.com/hHolyMolly)

# Next Template — Copilot Instructions

## Проект

Next.js 16 шаблон (App Router, Turbopack) с TypeScript, Tailwind CSS, next-intl, Redux Toolkit, TanStack React Query, Axios.

## Архитектурные правила

### Алиасы

- Используем **только `@/`** алиас (= `./src/`). Других алиасов нет.

### Локализация (i18n)

- **Все тексты** хранятся в `public/locales/{locale}/{namespace}.json`.
- Файлы переводов: `translations.json` (UI-тексты), `metadata.json` (SEO).
- **Никакие строки** не хардкодятся в компонентах — всё через `useTranslations()` или `getTranslations()`.
- Исключение: `global-error.tsx` — i18n недоступен (layout сломан), текст inline.

### Стилизация

- Tailwind CSS классы. SCSS только для `index.scss` (wrapper/page layout).
- CSS-переменные в `vars.css`. Container задаётся в `tailwind.css`.
- Для объединения классов используем `cn()` из `@/utils/cn` (clsx + tailwind-merge).

### Компоненты

- UI-компоненты → `src/components/UI/` (Button, Input и т.д.).
- Layout-компоненты → `src/components/layouts/` (Header, Footer, Container, ClientProviders).
- Иконки → `src/components/icons/`.
- Страничные компоненты → `src/app/(routes)/{page}/components/`.

### API

- Axios-инстанс: `src/services/api/instance.ts`.
- `request<T>(config)` — типизированный хелпер, возвращает `data` из AxiosResponse.
- `isApiError(error)` — type guard для AxiosError.
- API-эндпоинты: `src/services/api/paths.ts`.
- Модули API: `src/services/api/{resource}/index.ts` — функции + React Query хуки.

### Типы

- Глобальные типы → `src/types/index.ts`.
- Компонентные типы — рядом с компонентом или inline.
- Папки `interfaces/` не существует — всё в `types/`.

### Хуки

- Переиспользуемые хуки → `src/hooks/index.ts`.
- Доступные: `useMediaQuery`, `useDebounce`, `useClickOutside`, `useScrollLock`, `useToggle`.

### Логирование

- Используем `logger` из `@/utils/logger` вместо `console.*`.
- В production все вызовы logger автоматически становятся noop.

### Конфигурация

- `src/configs/project/` — название, i18n, sitemap, robots.
- `src/configs/constants/urls.ts` — URL-ы (website, server API).
- `src/configs/metadata/` — `getBaseMetadata()`, `createMetadata()`.
- `src/configs/env.ts` — валидация env-переменных.
- `src/configs/routes.ts` — маршруты приложения.

### State Management

- Redux Toolkit: `src/store/` — глобальный стейт.
- TanStack React Query: серверный стейт и кэширование API.
- React Query DevTools подключены в ClientProviders.

### Тесты

- Vitest + @testing-library/react.
- Тесты в `src/__tests__/` с зеркальной структурой.
- Запуск: `pnpm test` / `pnpm test:watch`.

### Файловые конвенции

- `proxy.ts` (не middleware.ts) — конвенция Next.js 16.
- `(routes)/` — route group для страниц.
- `[...rest]/page.tsx` — catch-all для 404.
- Нет `loading.tsx` — страницы загружаются напрямую.

## Команды

```
pnpm dev          # Dev-сервер (порт 5555)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm lint:fix     # ESLint autofix
pnpm format       # Prettier
pnpm test         # Vitest
pnpm analyze      # Bundle analyzer
pnpm clean        # Очистка .next/out/dist
```

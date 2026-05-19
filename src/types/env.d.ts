// `@total-typescript/ts-reset` — hardens stdlib types so common patterns are
// safer without casts:
//   - `.json()` and `JSON.parse()` return `unknown` (instead of `any`)
//   - `.filter(Boolean)` narrows the falsy values out
//   - `Array.isArray` accepts `readonly unknown[]`
// See: https://github.com/total-typescript/ts-reset
import '@total-typescript/ts-reset';

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';

    /** Client application URL */
    readonly NEXT_PUBLIC_CLIENT_URL: string;

    /** Server API URL (for SSR requests) */
    readonly NEXT_PUBLIC_SERVER_URL?: string;
  }
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';

    /** Client application URL */
    readonly NEXT_PUBLIC_CLIENT_URL: string;

    /** Server API URL (for SSR requests) */
    readonly NEXT_PUBLIC_SERVER_URL?: string;
  }
}

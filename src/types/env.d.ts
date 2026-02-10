declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';

    /** URL клиентского приложения */
    readonly NEXT_PUBLIC_CLIENT_URL: string;

    /** URL серверного API (для proxy и SSR-запросов) */
    readonly NEXT_PUBLIC_SERVER_URL?: string;

    /** Включить анализ бандла */
    readonly ANALYZE?: string;
  }
}

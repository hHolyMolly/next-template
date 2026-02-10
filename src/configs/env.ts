/**
 * Runtime-валидация переменных окружения.
 * Вызывается при старте приложения для раннего обнаружения проблем.
 */

const requiredVars = ['NEXT_PUBLIC_CLIENT_URL'] as const;

export function validateEnv(): void {
  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables:\n${missing.map((v) => `  - ${v}`).join('\n')}\n\nCreate .env.development from .env.example and fill in the values.`,
    );
  }
}

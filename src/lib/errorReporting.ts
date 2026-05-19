import { logger } from '@/utils/logger';

type ErrorContext = {
  componentStack?: string;
  [key: string]: unknown;
};

type User = { id: string; email?: string } | null;

type Level = 'info' | 'warning' | 'error';

type Reporter = {
  captureException(error: Error, context?: ErrorContext): void;
  captureMessage(message: string, level?: Level): void;
  setUser(user: User): void;
};

const log = logger.child('errorReporting');

/**
 * Minimal error reporter that forwards to the local logger.
 *
 * Swap the implementation (e.g. Sentry, Datadog, Rollbar) without touching
 * call sites: every consumer imports `errorReporting` and uses the same API.
 */
export const errorReporting: Reporter = {
  captureException(error, context) {
    log.error(error.message, context);
  },
  captureMessage(message, level = 'info') {
    log.error(`[${level}] ${message}`);
  },
  setUser(_user) {
    // no-op until a real reporter is wired up
  },
};

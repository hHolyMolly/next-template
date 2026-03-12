import { logger } from '@/utils/logger';

type ErrorContext = {
  componentStack?: string;
  [key: string]: unknown;
};

/**
 * Abstract error reporting interface.
 * Replace the placeholder implementation with your preferred service
 * (Sentry, Bugsnag, LogRocket, Datadog, etc.)
 *
 * @example
 * // In instrumentation.ts or a setup file:
 * import * as Sentry from '@sentry/nextjs';
 * errorReporting.captureException = (error, context) => Sentry.captureException(error, { extra: context });
 * errorReporting.captureMessage = (message) => Sentry.captureMessage(message);
 * errorReporting.setUser = (user) => Sentry.setUser(user);
 */
export const errorReporting = {
  captureException(error: Error, context?: ErrorContext) {
    logger.error('Uncaught error:', error.message, context);
    // Replace with: Sentry.captureException(error, { extra: context });
  },

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    logger.error(`[${level}] ${message}`);
    // Replace with: Sentry.captureMessage(message, level);
  },

  setUser(user: { id: string; email?: string } | null) {
    logger.log('Set user:', user);
    // Replace with: Sentry.setUser(user);
  },
};

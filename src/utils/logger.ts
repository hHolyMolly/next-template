const isDev = process.env.NODE_ENV === 'development';

/**
 * Dev-only logging utilities.
 * All calls are automatically disabled in production —
 * users will never see debug messages in the console.
 *
 * @example
 * logger.log('Data loaded', data);
 * logger.warn('Deprecated API usage');
 * logger.error('Failed to fetch', error);
 * logger.group('API Request');
 * logger.table(data);
 * logger.groupEnd();
 */

function noop() {}

export const logger = {
  log: isDev ? console.log.bind(console, '[DEV]') : noop,
  warn: isDev ? console.warn.bind(console, '[DEV]') : noop,
  // Errors are always logged — critical for production debugging and error reporting.
  error: console.error.bind(console, isDev ? '[DEV]' : '[ERROR]'),
  info: isDev ? console.info.bind(console, '[DEV]') : noop,
  debug: isDev ? console.debug.bind(console, '[DEV]') : noop,
  table: isDev ? console.table.bind(console) : noop,
  group: isDev ? console.group.bind(console) : noop,
  groupEnd: isDev ? console.groupEnd.bind(console) : noop,
  time: isDev ? console.time.bind(console) : noop,
  timeEnd: isDev ? console.timeEnd.bind(console) : noop,
} as const;

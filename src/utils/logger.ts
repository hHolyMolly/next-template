const isDev = process.env.NODE_ENV === 'development';

type LogMethod = (...args: unknown[]) => void;

type Logger = {
  log: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
  debug: LogMethod;
  table: (data: unknown, columns?: string[]) => void;
  group: (label?: string) => void;
  groupEnd: () => void;
  time: (label?: string) => void;
  timeEnd: (label?: string) => void;
  /** Returns a new logger that prefixes every message with `[scope]`. */
  child: (scope: string) => Logger;
};

function noop() {}

function createLogger(prefix: string): Logger {
  const tag = `[${prefix}]`;

  const devBind = (m: keyof Console): LogMethod =>
    isDev ? (console[m] as LogMethod).bind(console, tag) : noop;

  // Kept in prod on purpose: warn carries operational signals (rate-limit
  // identity missing, config fallbacks, i18n gaps) that must reach server
  // logs, and error is critical for production debugging.
  const alwaysBind = (m: 'warn' | 'error'): LogMethod =>
    console[m].bind(console, isDev ? tag : `[${prefix}:${m}]`);

  return {
    log: devBind('log'),
    info: devBind('info'),
    warn: alwaysBind('warn'),
    error: alwaysBind('error'),
    debug: devBind('debug'),
    table: isDev
      ? (data, columns) => {
          console.log(tag);
          console.table(data, columns);
        }
      : noop,
    group: isDev ? console.group.bind(console, tag) : noop,
    groupEnd: isDev ? console.groupEnd.bind(console) : noop,
    time: isDev ? console.time.bind(console) : noop,
    timeEnd: isDev ? console.timeEnd.bind(console) : noop,
    child: (scope: string) => createLogger(`${prefix}:${scope}`),
  };
}

/**
 * Dev-friendly logger.
 * - `log/info/debug/table/group/time` — no-ops in production.
 * - `warn`/`error` — always logged; operational signals must survive prod.
 * - `child('scope')` — namespaced sub-logger. Create it once at module
 *   scope (`const apiLogger = logger.child('api')`), not per call.
 *
 * @example
 * logger.log('Data loaded', data);
 * const apiLogger = logger.child('api');
 * apiLogger.error('failed', err);
 */
export const logger: Logger = createLogger(isDev ? 'DEV' : 'APP');

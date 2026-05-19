const isDev = process.env.NODE_ENV === 'development';

type LogMethod = (...args: unknown[]) => void;

type Logger = {
  log: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
  debug: LogMethod;
  table: (data: unknown) => void;
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
    isDev ? (console[m] as (...args: unknown[]) => void).bind(console, tag) : noop;

  const errorBind: LogMethod = console.error.bind(console, isDev ? tag : `[${prefix}:error]`);

  return {
    log: devBind('log'),
    info: devBind('info'),
    warn: devBind('warn'),
    error: errorBind,
    debug: devBind('debug'),
    table: isDev ? (console.table.bind(console) as (data: unknown) => void) : noop,
    group: isDev ? console.group.bind(console, tag) : noop,
    groupEnd: isDev ? console.groupEnd.bind(console) : noop,
    time: isDev ? console.time.bind(console) : noop,
    timeEnd: isDev ? console.timeEnd.bind(console) : noop,
    child: (scope: string) => createLogger(`${prefix}:${scope}`),
  };
}

/**
 * Dev-friendly logger.
 * - `log/info/warn/debug/table/group/time` — no-ops in production.
 * - `error` — always logged; critical for production debugging.
 * - `child('scope')` — namespaced sub-logger.
 *
 * @example
 * logger.log('Data loaded', data);
 * const apiLogger = logger.child('api');
 * apiLogger.error('failed', err);
 */
export const logger: Logger = createLogger(isDev ? 'DEV' : 'APP');

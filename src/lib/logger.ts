/**
 * Development-only logger utility
 * Logs are stripped in production builds
 */

const isDev = process.env.NODE_ENV === 'development';

type LogArgs = (string | number | boolean | Record<string, unknown> | Error | null | undefined | unknown)[];

export const devLog = {
  log: (...args: LogArgs) => {
    if (isDev) console.log(...args);
  },
  error: (...args: LogArgs) => {
    if (isDev) console.error(...args);
  },
  warn: (...args: LogArgs) => {
    if (isDev) console.warn(...args);
  },
  debug: (...args: LogArgs) => {
    if (isDev) console.debug(...args);
  },
};

/**
 * Production logger - always logs errors in production
 * Use for critical issues that should always be captured
 */
export const prodLog = {
  error: (...args: LogArgs) => {
    console.error(...args);
  },
};

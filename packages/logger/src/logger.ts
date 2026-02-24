type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

function createLogEntry(level: LogLevel, message: string, data?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(data && { data }),
  };
}

function output(entry: LogEntry): void {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    const prefix = {
      debug: '🔍',
      info: 'ℹ️ ',
      warn: '⚠️ ',
      error: '❌',
    }[entry.level];

    const msg = `${prefix} [${entry.timestamp.slice(11, 19)}] ${entry.message}`;
    if (entry.data) {
      // eslint-disable-next-line no-console
      console.error(msg, JSON.stringify(entry.data, null, 2));
    } else {
      // eslint-disable-next-line no-console
      console.error(msg);
    }
  } else {
    // Production: structured JSON to stderr
    process.stderr.write(JSON.stringify(entry) + '\n');
  }
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) =>
    output(createLogEntry('debug', message, data)),

  info: (message: string, data?: Record<string, unknown>) =>
    output(createLogEntry('info', message, data)),

  warn: (message: string, data?: Record<string, unknown>) =>
    output(createLogEntry('warn', message, data)),

  error: (message: string, data?: Record<string, unknown>) =>
    output(createLogEntry('error', message, data)),
};

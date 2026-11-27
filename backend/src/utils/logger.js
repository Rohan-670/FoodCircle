/**
 * Simple structured console logger for requests, info, warnings, and errors.
 * Keeps sensitive credentials out of logs.
 */

function formatTimestamp() {
  return new Date().toISOString();
}

const logger = {
  info(message, meta = null) {
    const entry = `[${formatTimestamp()}] [INFO] ${message}`;
    if (meta) {
      console.log(entry, meta);
    } else {
      console.log(entry);
    }
  },

  warn(message, meta = null) {
    const entry = `[${formatTimestamp()}] [WARN] ${message}`;
    if (meta) {
      console.warn(entry, meta);
    } else {
      console.warn(entry);
    }
  },

  error(message, error = null) {
    const entry = `[${formatTimestamp()}] [ERROR] ${message}`;
    if (error) {
      console.error(entry, error instanceof Error ? error.message : error);
    } else {
      console.error(entry);
    }
  },

  http(method, url, statusCode, durationMs) {
    console.log(
      `[${formatTimestamp()}] [HTTP] ${method} ${url} -> ${statusCode} (${durationMs}ms)`
    );
  },
};

module.exports = logger;

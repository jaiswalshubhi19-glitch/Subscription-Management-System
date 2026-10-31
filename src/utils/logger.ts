/**
 * Safe Structured Logger
 * Automatically sanitizes sensitive keys (passwords, tokens, cookies, secrets, card data)
 */

const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'jwt_secret',
  'authorization',
  'cookie',
  'creditcard',
  'cvv',
  'cardnumber',
  'apiKey',
];

function sanitize(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitize(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.some((sk) => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = {
  info(message: string, meta?: unknown) {
    const timestamp = new Date().toISOString();
    if (meta !== undefined) {
      console.log(`[${timestamp}] [INFO] ${message}`, JSON.stringify(sanitize(meta)));
    } else {
      console.log(`[${timestamp}] [INFO] ${message}`);
    }
  },

  warn(message: string, meta?: unknown) {
    const timestamp = new Date().toISOString();
    if (meta !== undefined) {
      console.warn(`[${timestamp}] [WARN] ${message}`, JSON.stringify(sanitize(meta)));
    } else {
      console.warn(`[${timestamp}] [WARN] ${message}`);
    }
  },

  error(message: string, error?: unknown) {
    const timestamp = new Date().toISOString();
    if (error instanceof Error) {
      console.error(`[${timestamp}] [ERROR] ${message}: ${error.message}\n${error.stack}`);
    } else if (error !== undefined) {
      console.error(`[${timestamp}] [ERROR] ${message}`, JSON.stringify(sanitize(error)));
    } else {
      console.error(`[${timestamp}] [ERROR] ${message}`);
    }
  },

  debug(message: string, meta?: unknown) {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      if (meta !== undefined) {
        console.debug(`[${timestamp}] [DEBUG] ${message}`, JSON.stringify(sanitize(meta)));
      } else {
        console.debug(`[${timestamp}] [DEBUG] ${message}`);
      }
    }
  },
};

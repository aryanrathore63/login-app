const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const isValidEmail = (email: unknown): email is string =>
  typeof email === "string" && email.length <= 254 && EMAIL_RE.test(email.trim());

export const isNonEmpty = (v: unknown, max = 100): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.trim().length <= max;

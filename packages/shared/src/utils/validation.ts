import { PASSWORD_REGEX } from "../constants/validation";

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!PASSWORD_REGEX.UPPERCASE.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!PASSWORD_REGEX.LOWERCASE.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!PASSWORD_REGEX.NUMBER.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Sanitize string for safe output
 */
export function sanitizeString(str: string): string {
  return str.replace(/[<>]/g, "");
}

/**
 * Truncate string to specified length
 */
export function truncate(str: string, length: number, suffix = "..."): string {
  if (str.length <= length) {
    return str;
  }
  return str.substring(0, length - suffix.length) + suffix;
}

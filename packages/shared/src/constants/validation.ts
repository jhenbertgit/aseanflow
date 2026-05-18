// Validation constants and rules
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 100;

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;

export const TITLE_MIN_LENGTH = 3;
export const TITLE_MAX_LENGTH = 200;

export const CONTENT_MIN_LENGTH = 10;

export const EXCERPT_MAX_LENGTH = 300;

export const MAX_TAGS_PER_POST = 5;

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const PASSWORD_REGEX = {
  UPPERCASE: /[A-Z]/,
  LOWERCASE: /[a-z]/,
  NUMBER: /[0-9]/,
  SPECIAL: /[!@#$%^&*(),.?":{}|<>]/,
};

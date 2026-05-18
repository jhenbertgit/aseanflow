// Error codes and messages
export const ErrorCode = {
  // Authentication errors (1xxx)
  INVALID_CREDENTIALS: "AUTH_1001",
  TOKEN_EXPIRED: "AUTH_1002",
  TOKEN_INVALID: "AUTH_1003",
  UNAUTHORIZED: "AUTH_1004",
  FORBIDDEN: "AUTH_1005",
  USER_ALREADY_EXISTS: "AUTH_1006",
  USER_NOT_FOUND: "AUTH_1007",
  SESSION_EXPIRED: "AUTH_1008",

  // Validation errors (2xxx)
  VALIDATION_ERROR: "VAL_2001",
  INVALID_INPUT: "VAL_2002",
  MISSING_REQUIRED_FIELD: "VAL_2003",
  INVALID_FORMAT: "VAL_2004",

  // Resource errors (3xxx)
  NOT_FOUND: "RES_3001",
  ALREADY_EXISTS: "RES_3002",
  CONFLICT: "RES_3003",

  // Post errors (4xxx)
  POST_NOT_FOUND: "POST_4001",
  POST_ALREADY_PUBLISHED: "POST_4002",
  SLUG_ALREADY_EXISTS: "POST_4003",

  // Server errors (5xxx)
  INTERNAL_SERVER_ERROR: "SRV_5001",
  DATABASE_ERROR: "SRV_5002",
  CACHE_ERROR: "SRV_5003",
} as const;

export const ErrorMessage = {
  [ErrorCode.INVALID_CREDENTIALS]: "Invalid email or password",
  [ErrorCode.TOKEN_EXPIRED]: "Authentication token has expired",
  [ErrorCode.TOKEN_INVALID]: "Invalid authentication token",
  [ErrorCode.UNAUTHORIZED]: "You must be logged in to access this resource",
  [ErrorCode.FORBIDDEN]: "You do not have permission to access this resource",
  [ErrorCode.USER_ALREADY_EXISTS]: "A user with this email already exists",
  [ErrorCode.USER_NOT_FOUND]: "User not found",
  [ErrorCode.SESSION_EXPIRED]: "Your session has expired. Please log in again",

  [ErrorCode.VALIDATION_ERROR]: "Validation failed",
  [ErrorCode.INVALID_INPUT]: "Invalid input provided",
  [ErrorCode.MISSING_REQUIRED_FIELD]: "Required field is missing",
  [ErrorCode.INVALID_FORMAT]: "Invalid format",

  [ErrorCode.NOT_FOUND]: "Resource not found",
  [ErrorCode.ALREADY_EXISTS]: "Resource already exists",
  [ErrorCode.CONFLICT]: "Resource conflict",

  [ErrorCode.POST_NOT_FOUND]: "Post not found",
  [ErrorCode.POST_ALREADY_PUBLISHED]: "Post is already published",
  [ErrorCode.SLUG_ALREADY_EXISTS]: "A post with this slug already exists",

  [ErrorCode.INTERNAL_SERVER_ERROR]: "An internal server error occurred",
  [ErrorCode.DATABASE_ERROR]: "Database operation failed",
  [ErrorCode.CACHE_ERROR]: "Cache operation failed",
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

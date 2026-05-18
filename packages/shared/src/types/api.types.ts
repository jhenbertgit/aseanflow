// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface CursorPaginationMeta {
  limit: number;
  hasNextPage: boolean;
  nextCursor?: string;
}

export interface CursorPaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: CursorPaginationMeta;
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

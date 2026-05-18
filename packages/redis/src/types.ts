// Redis-related types
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export type CacheKey = string;
export type CacheValue = string | number | boolean | object;

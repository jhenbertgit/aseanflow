import { getRedisClient, type RedisClientType } from "./client";
import type { CacheKey, CacheValue, CacheOptions } from "./types";

export class Cache {
  private client: RedisClientType;
  private defaultTTL = 3600; // 1 hour
  private keyPrefix = "webgenix:";

  constructor(options: CacheOptions = {}, client?: RedisClientType) {
    this.client = client || getRedisClient();
    this.defaultTTL = options.ttl || this.defaultTTL;
    this.keyPrefix = options.prefix || this.keyPrefix;
  }

  private getKey(key: CacheKey): string {
    return `${this.keyPrefix}${key}`;
  }

  async get<T = CacheValue>(key: CacheKey): Promise<T | null> {
    try {
      const value = await this.client.get(this.getKey(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  async set(key: CacheKey, value: CacheValue, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      const expiry = ttl || this.defaultTTL;
      await this.client.setEx(this.getKey(key), expiry, serialized);
      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  async del(key: CacheKey): Promise<boolean> {
    try {
      const result = await this.client.del(this.getKey(key));
      return result > 0;
    } catch (error) {
      console.error("Cache delete error:", error);
      return false;
    }
  }

  async exists(key: CacheKey): Promise<boolean> {
    try {
      const result = await this.client.exists(this.getKey(key));
      return result > 0;
    } catch (error) {
      console.error("Cache exists error:", error);
      return false;
    }
  }

  async clear(pattern?: string): Promise<number> {
    try {
      const searchPattern = pattern
        ? `${this.keyPrefix}${pattern}*`
        : `${this.keyPrefix}*`;
      const keys = await this.client.keys(searchPattern);
      if (keys.length === 0) return 0;

      return await this.client.del(keys);
    } catch (error) {
      console.error("Cache clear error:", error);
      return 0;
    }
  }
}

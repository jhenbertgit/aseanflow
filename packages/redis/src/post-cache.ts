import { getRedisClient, type RedisClientType } from "./client";
import type { Post, PostListItem } from "@aseanflow/shared";

export class PostCache {
  private client: RedisClientType;

  constructor(client?: RedisClientType) {
    this.client = client || getRedisClient();
  }
  private readonly POST_PREFIX = "post:";
  private readonly POST_LIST_PREFIX = "posts:list:";
  private readonly POST_USER_PREFIX = "posts:user:";
  private readonly POST_TAG_PREFIX = "posts:tag:";
  private readonly POST_COUNT_KEY = "posts:count";
  private readonly TRENDING_POSTS_KEY = "posts:trending";

  // TTL values in seconds
  private readonly POST_TTL = 15 * 60; // 15 minutes
  private readonly LIST_TTL = 5 * 60; // 5 minutes
  private readonly COUNT_TTL = 10 * 60; // 10 minutes
  private readonly TRENDING_TTL = 60 * 60; // 1 hour

  /**
   * Cache a single post
   */
  async cachePost(slug: string, post: Post): Promise<boolean> {
    try {
      const key = `${this.POST_PREFIX}${slug}`;
      const serialized = JSON.stringify(post);
      await this.client.setEx(key, this.POST_TTL, serialized);
      return true;
    } catch (error) {
      console.error("Cache post error:", error);
      return false;
    }
  }

  /**
   * Get cached post
   */
  async getPost(slug: string): Promise<Post | null> {
    try {
      const key = `${this.POST_PREFIX}${slug}`;
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Get cached post error:", error);
      return null;
    }
  }

  /**
   * Cache paginated post list
   */
  async cachePostList(
    page: number,
    limit: number,
    posts: PostListItem[],
    filters?: Record<string, string>,
  ): Promise<boolean> {
    try {
      const filterKey = filters ? JSON.stringify(filters) : "all";
      const key = `${this.POST_LIST_PREFIX}${filterKey}:${page}:${limit}`;
      const serialized = JSON.stringify(posts);
      await this.client.setEx(key, this.LIST_TTL, serialized);
      return true;
    } catch (error) {
      console.error("Cache post list error:", error);
      return false;
    }
  }

  /**
   * Get cached post list
   */
  async getPostList(
    page: number,
    limit: number,
    filters?: Record<string, string>,
  ): Promise<PostListItem[] | null> {
    try {
      const filterKey = filters ? JSON.stringify(filters) : "all";
      const key = `${this.POST_LIST_PREFIX}${filterKey}:${page}:${limit}`;
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Get cached post list error:", error);
      return null;
    }
  }

  /**
   * Cache user's posts
   */
  async cacheUserPosts(
    userId: string,
    posts: PostListItem[],
  ): Promise<boolean> {
    try {
      const key = `${this.POST_USER_PREFIX}${userId}`;
      const serialized = JSON.stringify(posts);
      await this.client.setEx(key, this.LIST_TTL, serialized);
      return true;
    } catch (error) {
      console.error("Cache user posts error:", error);
      return false;
    }
  }

  /**
   * Get cached user posts
   */
  async getUserPosts(userId: string): Promise<PostListItem[] | null> {
    try {
      const key = `${this.POST_USER_PREFIX}${userId}`;
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Get cached user posts error:", error);
      return null;
    }
  }

  /**
   * Cache posts by tag
   */
  async cachePostsByTag(
    tagSlug: string,
    posts: PostListItem[],
  ): Promise<boolean> {
    try {
      const key = `${this.POST_TAG_PREFIX}${tagSlug}`;
      const serialized = JSON.stringify(posts);
      await this.client.setEx(key, this.LIST_TTL, serialized);
      return true;
    } catch (error) {
      console.error("Cache posts by tag error:", error);
      return false;
    }
  }

  /**
   * Get cached posts by tag
   */
  async getPostsByTag(tagSlug: string): Promise<PostListItem[] | null> {
    try {
      const key = `${this.POST_TAG_PREFIX}${tagSlug}`;
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Get cached posts by tag error:", error);
      return null;
    }
  }

  /**
   * Cache total post count
   */
  async cachePostCount(count: number): Promise<boolean> {
    try {
      await this.client.setEx(
        this.POST_COUNT_KEY,
        this.COUNT_TTL,
        count.toString(),
      );
      return true;
    } catch (error) {
      console.error("Cache post count error:", error);
      return false;
    }
  }

  /**
   * Get cached post count
   */
  async getPostCount(): Promise<number | null> {
    try {
      const value = await this.client.get(this.POST_COUNT_KEY);
      return value ? parseInt(value, 10) : null;
    } catch (error) {
      console.error("Get cached post count error:", error);
      return null;
    }
  }

  /**
   * Cache trending posts
   */
  async cacheTrendingPosts(posts: PostListItem[]): Promise<boolean> {
    try {
      const serialized = JSON.stringify(posts);
      await this.client.setEx(
        this.TRENDING_POSTS_KEY,
        this.TRENDING_TTL,
        serialized,
      );
      return true;
    } catch (error) {
      console.error("Cache trending posts error:", error);
      return false;
    }
  }

  /**
   * Get cached trending posts
   */
  async getTrendingPosts(): Promise<PostListItem[] | null> {
    try {
      const value = await this.client.get(this.TRENDING_POSTS_KEY);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Get cached trending posts error:", error);
      return null;
    }
  }

  /**
   * Invalidate post cache
   */
  async invalidatePost(slug: string): Promise<boolean> {
    try {
      const key = `${this.POST_PREFIX}${slug}`;
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error("Invalidate post error:", error);
      return false;
    }
  }

  /**
   * Invalidate all post list caches
   */
  async invalidateAllPostLists(): Promise<number> {
    try {
      const keys = await this.client.keys(`${this.POST_LIST_PREFIX}*`);
      if (keys.length === 0) return 0;
      return await this.client.del(keys);
    } catch (error) {
      console.error("Invalidate all post lists error:", error);
      return 0;
    }
  }

  /**
   * Invalidate user posts cache
   */
  async invalidateUserPosts(userId: string): Promise<boolean> {
    try {
      const key = `${this.POST_USER_PREFIX}${userId}`;
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error("Invalidate user posts error:", error);
      return false;
    }
  }

  /**
   * Invalidate all caches related to a post update
   */
  async invalidatePostUpdate(slug: string, userId: string): Promise<void> {
    await Promise.all([
      this.invalidatePost(slug),
      this.invalidateAllPostLists(),
      this.invalidateUserPosts(userId),
      this.client.del(this.POST_COUNT_KEY),
      this.client.del(this.TRENDING_POSTS_KEY),
    ]);
  }

  /**
   * Increment post view count
   */
  async incrementViewCount(slug: string): Promise<number> {
    try {
      const key = `${this.POST_PREFIX}${slug}:views`;
      return await this.client.incr(key);
    } catch (error) {
      console.error("Increment view count error:", error);
      return 0;
    }
  }
}

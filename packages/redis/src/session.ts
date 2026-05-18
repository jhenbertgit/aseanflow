import { getRedisClient, type RedisClientType } from "./client";

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  refreshTokenId: string;
  createdAt: number;
  expiresAt: number;
}

export interface RefreshTokenData {
  userId: string;
  sessionId: string;
  createdAt: number;
}

export class SessionManager {
  private client: RedisClientType;

  constructor(client?: RedisClientType) {
    this.client = client || getRedisClient();
  }
  private readonly SESSION_PREFIX = "session:";
  private readonly REFRESH_TOKEN_PREFIX = "refresh:";
  private readonly USER_SESSIONS_PREFIX = "user:sessions:";
  private readonly SESSION_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
  private readonly REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

  /**
   * Create a new session
   */
  async createSession(sessionId: string, data: SessionData): Promise<boolean> {
    try {
      const key = `${this.SESSION_PREFIX}${sessionId}`;
      const serialized = JSON.stringify(data);
      await this.client.setEx(key, this.SESSION_TTL, serialized);

      // Add session to user's session list
      await this.client.sAdd(
        `${this.USER_SESSIONS_PREFIX}${data.userId}`,
        sessionId,
      );

      return true;
    } catch (error) {
      console.error("Create session error:", error);
      return false;
    }
  }

  /**
   * Get session data
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const key = `${this.SESSION_PREFIX}${sessionId}`;
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Get session error:", error);
      return null;
    }
  }

  /**
   * Update session data
   */
  async updateSession(
    sessionId: string,
    data: Partial<SessionData>,
  ): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return false;

      const updated = { ...session, ...data };
      const key = `${this.SESSION_PREFIX}${sessionId}`;
      const serialized = JSON.stringify(updated);

      // Get remaining TTL
      const ttl = await this.client.ttl(key);
      if (ttl > 0) {
        await this.client.setEx(key, ttl, serialized);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Update session error:", error);
      return false;
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return false;

      const key = `${this.SESSION_PREFIX}${sessionId}`;
      await this.client.del(key);

      // Remove from user's session list
      await this.client.sRem(
        `${this.USER_SESSIONS_PREFIX}${session.userId}`,
        sessionId,
      );

      return true;
    } catch (error) {
      console.error("Delete session error:", error);
      return false;
    }
  }

  /**
   * Delete all sessions for a user
   */
  async deleteUserSessions(userId: string): Promise<number> {
    try {
      const sessions = await this.client.sMembers(
        `${this.USER_SESSIONS_PREFIX}${userId}`,
      );

      if (sessions.length === 0) return 0;

      // Delete all session keys
      const sessionKeys = sessions.map(
        (id: string) => `${this.SESSION_PREFIX}${id}`,
      );
      await this.client.del(sessionKeys);

      // Delete user sessions set
      await this.client.del(`${this.USER_SESSIONS_PREFIX}${userId}`);

      return sessions.length;
    } catch (error) {
      console.error("Delete user sessions error:", error);
      return 0;
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<string[]> {
    try {
      return await this.client.sMembers(
        `${this.USER_SESSIONS_PREFIX}${userId}`,
      );
    } catch (error) {
      console.error("Get user sessions error:", error);
      return [];
    }
  }

  /**
   * Store refresh token metadata
   */
  async storeRefreshToken(
    tokenId: string,
    data: RefreshTokenData,
  ): Promise<boolean> {
    try {
      const key = `${this.REFRESH_TOKEN_PREFIX}${tokenId}`;
      const serialized = JSON.stringify(data);
      await this.client.setEx(key, this.REFRESH_TOKEN_TTL, serialized);
      return true;
    } catch (error) {
      console.error("Store refresh token error:", error);
      return false;
    }
  }

  /**
   * Get refresh token metadata
   */
  async getRefreshToken(tokenId: string): Promise<RefreshTokenData | null> {
    try {
      const key = `${this.REFRESH_TOKEN_PREFIX}${tokenId}`;
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Get refresh token error:", error);
      return null;
    }
  }

  /**
   * Delete refresh token
   */
  async deleteRefreshToken(tokenId: string): Promise<boolean> {
    try {
      const key = `${this.REFRESH_TOKEN_PREFIX}${tokenId}`;
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error("Delete refresh token error:", error);
      return false;
    }
  }

  /**
   * Check if session exists and is valid
   */
  async isSessionValid(sessionId: string): Promise<boolean> {
    try {
      const key = `${this.SESSION_PREFIX}${sessionId}`;
      const exists = await this.client.exists(key);
      if (!exists) return false;

      const session = await this.getSession(sessionId);
      if (!session) return false;

      // Check if session is expired
      return session.expiresAt > Date.now();
    } catch (error) {
      console.error("Is session valid error:", error);
      return false;
    }
  }

  /**
   * Extend session TTL
   */
  async extendSession(
    sessionId: string,
    additionalSeconds: number = this.SESSION_TTL,
  ): Promise<boolean> {
    try {
      const key = `${this.SESSION_PREFIX}${sessionId}`;
      const exists = await this.client.exists(key);
      if (!exists) return false;

      await this.client.expire(key, additionalSeconds);
      return true;
    } catch (error) {
      console.error("Extend session error:", error);
      return false;
    }
  }
}

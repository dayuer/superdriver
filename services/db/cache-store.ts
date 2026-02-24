/**
 * CacheStore — API 缓存持久层 (SQLite L2)
 *
 * 被 services/cache.ts 的 L1 内存层调用。
 * 支持 TTL 过期 + stale-while-revalidate 模式。
 */
import { dbCore, CacheRow, CountRow } from './core';

class CacheStore {
  async get<T>(key: string): Promise<T | null> {
    const db = await dbCore.getDb();
    try {
      const row = await db.getFirstAsync<CacheRow>(
        `SELECT * FROM api_cache WHERE key = ?`, [key],
      );
      if (!row) return null;
      if (Date.now() - row.timestamp > row.ttl) return null;
      return JSON.parse(row.data);
    } catch (e) {
      console.error(`[CacheStore] get failed for ${key}:`, e);
      return null;
    }
  }

  /** 获取缓存，即使过期也返回（stale-while-revalidate） */
  async getStale<T>(key: string): Promise<{ data: T | null; isStale: boolean }> {
    const db = await dbCore.getDb();
    try {
      const row = await db.getFirstAsync<CacheRow>(
        `SELECT * FROM api_cache WHERE key = ?`, [key],
      );
      if (!row) return { data: null, isStale: true };
      const isStale = Date.now() - row.timestamp > row.ttl;
      return { data: JSON.parse(row.data), isStale };
    } catch (e) {
      console.error(`[CacheStore] getStale failed for ${key}:`, e);
      return { data: null, isStale: true };
    }
  }

  async set<T>(key: string, data: T, ttl: number): Promise<void> {
    const db = await dbCore.getDb();
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO api_cache (key, data, timestamp, ttl) VALUES (?, ?, ?, ?)`,
        [key, JSON.stringify(data), Date.now(), ttl],
      );
    } catch (e) {
      console.error(`[CacheStore] set failed for ${key}:`, e);
    }
  }

  async delete(key: string): Promise<void> {
    const db = await dbCore.getDb();
    try {
      await db.runAsync(`DELETE FROM api_cache WHERE key = ?`, [key]);
    } catch (e) {
      console.error(`[CacheStore] delete failed for ${key}:`, e);
    }
  }

  async cleanExpired(): Promise<void> {
    const db = await dbCore.getDb();
    try {
      await db.runAsync(`DELETE FROM api_cache WHERE (timestamp + ttl) < ?`, [Date.now()]);
    } catch (e) {
      console.error('[CacheStore] cleanExpired failed:', e);
    }
  }

  async clear(): Promise<void> {
    const db = await dbCore.getDb();
    try {
      await db.runAsync(`DELETE FROM api_cache`);
      if (__DEV__) console.log('[CacheStore] Cache cleared');
    } catch (e) {
      console.error('[CacheStore] clear failed:', e);
    }
  }

  async getStats(): Promise<{ dbCount: number; expiredCount: number }> {
    const db = await dbCore.getDb();
    try {
      const total = await db.getFirstAsync<CountRow>(`SELECT COUNT(*) as count FROM api_cache`);
      const expired = await db.getFirstAsync<CountRow>(
        `SELECT COUNT(*) as count FROM api_cache WHERE (timestamp + ttl) < ?`, [Date.now()],
      );
      return {
        dbCount: total?.count || 0,
        expiredCount: expired?.count || 0,
      };
    } catch (e) {
      console.error('[CacheStore] getStats failed:', e);
      return { dbCount: 0, expiredCount: 0 };
    }
  }
}

export const cacheStore = new CacheStore();

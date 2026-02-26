/**
 * CacheService — 纯内存缓存层 + SQLite 持久化
 *
 * Phase 3 of L-03: 不再自建 SQLite 连接，委托 DatabaseService 做持久化。
 * 内存层做 L1 缓存，SQLite (via db) 做 L2。
 *
 * 对外 API 保持不变，消费方无需修改 import。
 *
 * @see docs/L03-database-merge-plan.md
 */
import { db } from './database';

// ─────────────────── 配置 ───────────────────

export const CACHE_CONFIG = {
  /** 企业数据缓存 30 分钟 */
  ENTERPRISES_TTL: 30 * 60 * 1000,
  /** 招聘数据缓存 15 分钟 */
  JOBS_TTL: 15 * 60 * 1000,
  /** 通用默认缓存 10 分钟 */
  DEFAULT_TTL: 10 * 60 * 1000,
};

// ─────────────────── 类型 ───────────────────

/** 已知缓存 key (自动补全) + 可扩展字符串 */
export type KnownCacheKey =
  | 'enterprises'
  | 'jobs'
  | 'franchise'
  | 'profile'
  | 'agents'
  | 'cities'
  | 'driver_profile'
  | `service_events_${string}`;

export type CacheKey = KnownCacheKey | (string & {});

interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
}

// ─────────────────── Service ───────────────────

class CacheService {
  private memoryCache = new Map<string, CacheEntry>();

  /**
   * 初始化 — 委托给 DatabaseService
   * 保留此方法以保持向后兼容（消费方可能调 cacheService.init()）
   */
  async init(): Promise<void> {
    await db.init();
  }

  /**
   * 获取缓存数据
   * L1: 内存 → L2: SQLite
   * @returns 缓存数据，如果不存在或过期返回 null
   */
  async get<T>(key: CacheKey): Promise<T | null> {
    // L1 — 内存
    const mem = this.memoryCache.get(key);
    if (mem && !this.isExpired(mem)) {
      return mem.data as T;
    }

    // L2 — SQLite (via DatabaseService)
    const persisted = await db.cacheGet<T>(key);
    if (persisted !== null) {
      // 回填内存缓存（此处拿不到原始 ttl，设一个保守值）
      // 但 db.cacheGet 已经做了过期检查，所以到这里的一定是有效的
      this.memoryCache.set(key, {
        key,
        data: persisted,
        timestamp: Date.now(),
        ttl: CACHE_CONFIG.DEFAULT_TTL,
      });
      return persisted;
    }

    return null;
  }

  /**
   * 获取缓存，即使过期也返回（用于 stale-while-revalidate 策略）
   */
  async getStale<T>(key: CacheKey): Promise<{ data: T | null; isStale: boolean }> {
    // L1 — 内存
    const mem = this.memoryCache.get(key);
    if (mem) {
      return { data: mem.data as T, isStale: this.isExpired(mem) };
    }

    // L2 — SQLite
    return db.cacheGetStale<T>(key);
  }

  /**
   * 设置缓存数据（双写：内存 + SQLite）
   */
  async set<T>(key: CacheKey, data: T, ttl = CACHE_CONFIG.DEFAULT_TTL): Promise<void> {
    // 内存
    this.memoryCache.set(key, { key, data, timestamp: Date.now(), ttl });

    // SQLite
    await db.cacheSet(key, data, ttl);
  }

  /**
   * 删除缓存
   */
  async delete(key: CacheKey): Promise<void> {
    this.memoryCache.delete(key);
    await db.cacheDelete(key);
  }

  /**
   * 清理所有过期缓存
   */
  async cleanExpired(): Promise<void> {
    // 清理内存
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
      }
    }
    // 清理 SQLite
    await db.cacheCleanExpired();
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    await db.cacheClear();
  }

  /**
   * 获取缓存状态信息
   */
  async getStats(): Promise<{
    memoryCount: number;
    dbCount: number;
    expiredCount: number;
  }> {
    const dbStats = await db.cacheGetStats();
    return {
      memoryCount: this.memoryCache.size,
      ...dbStats,
    };
  }

  // ─── 内部 ───

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }
}

// ─────────────────── 导出单例 ───────────────────

export const cacheService = new CacheService();

// ─────────────────── 工具函数 ───────────────────

/**
 * 带缓存的数据获取工具函数
 * 实现 stale-while-revalidate 策略
 */
export async function fetchWithCache<T>(
  key: CacheKey,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    forceRefresh?: boolean;
    onStaleData?: (data: T) => void;
  } = {},
): Promise<T> {
  const { ttl = CACHE_CONFIG.DEFAULT_TTL, forceRefresh = false, onStaleData } = options;

  // 强制刷新
  if (forceRefresh) {
    const freshData = await fetcher();
    await cacheService.set(key, freshData, ttl);
    return freshData;
  }

  // 获取缓存（包括过期的）
  const { data: cachedData, isStale } = await cacheService.getStale<T>(key);

  // 有缓存且未过期，直接返回
  if (cachedData && !isStale) {
    return cachedData;
  }

  // 有过期缓存，先返回旧数据，后台刷新
  if (cachedData && isStale) {
    if (onStaleData) {
      onStaleData(cachedData);
    }

    // 后台静默刷新
    fetcher()
      .then((freshData) => {
        cacheService.set(key, freshData, ttl);
      })
      .catch((e) => {
        console.error(`[Cache] Background refresh failed: ${key}`, e);
      });

    return cachedData;
  }

  // 无缓存，必须获取新数据
  const freshData = await fetcher();
  await cacheService.set(key, freshData, ttl);
  return freshData;
}

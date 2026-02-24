/**
 * DatabaseCore — 加密 SQLite 基础层
 *
 * 职责：
 * - 打开数据库 + SQLCipher 加密
 * - WAL 模式
 * - 建表 DDL
 * - 旧版本数据迁移 (v2/v3 → v4)
 *
 * 其他模块通过 getDb() 获取数据库实例。
 */
import * as SQLite from 'expo-sqlite';
import { getDatabaseEncryptionKey } from '../../lib/security';

const DB_NAME = 'survival_v4.db';

// ─── SQLite 行类型 ───

export interface ChatMessageRow {
  id: string;
  thread_id: string;
  role: string;
  content: string;
  timestamp: string;
  status: string;
}

export interface SyncStateRow {
  thread_id: string;
  last_synced_id: string;
  last_synced_at: string;
  sync_version: number;
}

export interface CountRow {
  count: number;
}

export interface CacheRow {
  key: string;
  data: string;
  timestamp: number;
  ttl: number;
}

class DatabaseCore {
  private db: SQLite.SQLiteDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /** 懒初始化，确保只执行一次 */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = this._doInit();
    return this.initPromise;
  }

  private async _doInit(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(DB_NAME);

      // SQLCipher — 透明加密
      try {
        const encKey = await getDatabaseEncryptionKey();
        if (!/^[0-9a-f]{64}$/i.test(encKey)) {
          throw new Error('数据库加密密钥格式异常，跳过加密');
        }
        await this.db.execAsync(`PRAGMA key = '${encKey}';`);
        if (__DEV__) console.log('[DB] SQLCipher encryption enabled');
      } catch (e) {
        if (__DEV__) {
          console.warn('[DB] SQLCipher unavailable (Expo Go?), running unencrypted');
        }
      }

      // WAL 模式提升并发读写性能
      await this.db.execAsync('PRAGMA journal_mode = WAL;');

      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id TEXT PRIMARY KEY,
          thread_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          status TEXT DEFAULT 'sent'
        );
        CREATE INDEX IF NOT EXISTS idx_thread_timestamp
          ON chat_messages (thread_id, timestamp DESC);

        CREATE TABLE IF NOT EXISTS api_cache (
          key TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          ttl INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_cache_expiry
          ON api_cache (timestamp, ttl);

        CREATE TABLE IF NOT EXISTS sync_state (
          thread_id TEXT PRIMARY KEY,
          last_synced_id TEXT NOT NULL DEFAULT '0',
          last_synced_at TEXT NOT NULL DEFAULT '',
          sync_version INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS pending_messages (
          id TEXT PRIMARY KEY,
          thread_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TEXT NOT NULL,
          retry_count INTEGER DEFAULT 0,
          last_retry_at TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_pending_thread
          ON pending_messages (thread_id, created_at);
      `);

      await this._migrateIfNeeded();

      if (__DEV__) console.log('[DB] Initialized (v4, SQLCipher + WAL)');
    } catch (e) {
      console.error('[DB] Init failed:', e);
    }
  }

  /** 获取数据库实例（自动初始化） */
  async getDb(): Promise<SQLite.SQLiteDatabase> {
    await this.init();
    return this.db!;
  }

  // ─── 旧数据迁移 ───

  private async _migrateIfNeeded(): Promise<void> {
    try { await this._migrateFromV3(); } catch { /* 新安装 */ }
    try { await this._migrateCacheDb(); } catch { /* 旧库不存在 */ }
    try { await this._migrateChatDb(); } catch { /* 旧库不存在 */ }
  }

  private async _migrateFromV3(): Promise<void> {
    const oldDb = await SQLite.openDatabaseAsync('survival_v3.db');
    const chatRows = await oldDb.getAllAsync<ChatMessageRow>(
      'SELECT id, thread_id, role, content, timestamp, status FROM chat_messages',
    );
    if (chatRows.length > 0) {
      const db = this.db!;
      await db.withTransactionAsync(async () => {
        for (const row of chatRows) {
          await db.runAsync(
            'INSERT OR IGNORE INTO chat_messages (id, thread_id, role, content, timestamp, status) VALUES (?, ?, ?, ?, ?, ?)',
            [row.id, row.thread_id, row.role, row.content, row.timestamp, row.status],
          );
        }
      });
      if (__DEV__) console.log(`[DB] Migrated ${chatRows.length} messages from v3`);
    }

    const cacheRows = await oldDb.getAllAsync<CacheRow>(
      'SELECT key, data, timestamp, ttl FROM api_cache',
    );
    if (cacheRows.length > 0) {
      const db = this.db!;
      await db.withTransactionAsync(async () => {
        for (const row of cacheRows) {
          await db.runAsync(
            'INSERT OR IGNORE INTO api_cache (key, data, timestamp, ttl) VALUES (?, ?, ?, ?)',
            [row.key, row.data, row.timestamp, row.ttl],
          );
        }
      });
      if (__DEV__) console.log(`[DB] Migrated ${cacheRows.length} cache entries from v3`);
    }
  }

  private async _migrateCacheDb(): Promise<void> {
    const oldDb = await SQLite.openDatabaseAsync('survival_cache.db');
    const rows = await oldDb.getAllAsync<CacheRow>(
      'SELECT cache_key as key, data, timestamp, ttl FROM api_cache',
    );
    if (rows.length > 0) {
      const db = this.db!;
      await db.withTransactionAsync(async () => {
        for (const row of rows) {
          await db.runAsync(
            'INSERT OR IGNORE INTO api_cache (key, data, timestamp, ttl) VALUES (?, ?, ?, ?)',
            [row.key, row.data, row.timestamp, row.ttl],
          );
        }
      });
      if (__DEV__) console.log(`[DB] Migrated ${rows.length} cache entries from survival_cache.db`);
    }
  }

  private async _migrateChatDb(): Promise<void> {
    const oldDb = await SQLite.openDatabaseAsync('survival_v2.db');
    const rows = await oldDb.getAllAsync<ChatMessageRow>(
      'SELECT id, thread_id, role, content, timestamp, status FROM chat_messages',
    );
    if (rows.length > 0) {
      const db = this.db!;
      await db.withTransactionAsync(async () => {
        for (const row of rows) {
          await db.runAsync(
            'INSERT OR IGNORE INTO chat_messages (id, thread_id, role, content, timestamp, status) VALUES (?, ?, ?, ?, ?, ?)',
            [row.id, row.thread_id, row.role, row.content, row.timestamp, row.status],
          );
        }
      });
      if (__DEV__) console.log(`[DB] Migrated ${rows.length} chat messages from survival_v2.db`);
    }
  }
}

/** 全局唯一核心实例 */
export const dbCore = new DatabaseCore();

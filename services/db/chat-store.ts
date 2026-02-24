/**
 * ChatStore — 聊天消息存储 + 增量同步
 *
 * 职责：
 * - saveMessage / getHistory
 * - incrementalSync (游标式 O(Δ) 同步)
 * - syncMessages (全量同步，向后兼容)
 * - 同步诊断
 */
import { ChatMessage } from '../../types';
import { dbCore, ChatMessageRow, SyncStateRow, CountRow } from './core';

// ─── 增量同步结果类型 ───

export interface SyncResult {
  newCount: number;
  messages: ChatMessage[];
}

class ChatStore {
  async saveMessage(
    msg: ChatMessage,
    threadId: string,
    status: 'sending' | 'sent' | 'failed' = 'sent',
  ): Promise<void> {
    const db = await dbCore.getDb();
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO chat_messages (id, thread_id, role, content, timestamp, status) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          msg.id,
          threadId,
          msg.type === 'yin' ? 'yin' : msg.type,
          msg.content,
          typeof msg.timestamp === 'string' ? msg.timestamp : msg.timestamp.toISOString(),
          status,
        ],
      );
    } catch (e) {
      console.error('[ChatStore] saveMessage failed:', e);
    }
  }

  async getHistory(threadId: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
    const db = await dbCore.getDb();
    try {
      const rows = await db.getAllAsync<ChatMessageRow>(
        `SELECT * FROM chat_messages WHERE thread_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
        [threadId, limit, offset],
      );
      return rows.map((r) => ({
        id: r.id,
        type: r.role,
        content: r.content,
        timestamp: r.timestamp,
      }));
    } catch (e) {
      console.error('[ChatStore] getHistory failed:', e);
      return [];
    }
  }

  // ─── 增量同步 ───

  async incrementalSync(
    threadId: string,
    fetchRemote: (afterId: string) => Promise<ChatMessage[]>,
  ): Promise<SyncResult> {
    const db = await dbCore.getDb();
    try {
      const cursor = await this._getSyncCursor(db, threadId);
      const serverMsgs = await fetchRemote(cursor);
      if (!serverMsgs.length) {
        return { newCount: 0, messages: await this.getHistory(threadId) };
      }

      let newCount = 0;
      await db.withTransactionAsync(async () => {
        for (const msg of serverMsgs) {
          const result = await db.runAsync(
            `INSERT OR IGNORE INTO chat_messages (id, thread_id, role, content, timestamp, status) VALUES (?, ?, ?, ?, ?, 'synced')`,
            [
              msg.id,
              threadId,
              msg.type === 'yin' ? 'yin' : msg.type,
              msg.content,
              typeof msg.timestamp === 'string' ? msg.timestamp : msg.timestamp.toISOString(),
            ],
          );
          if (result?.changes && result.changes > 0) newCount++;
        }

        const maxId = serverMsgs.reduce(
          (max, m) => (String(m.id) > max ? String(m.id) : max),
          cursor,
        );
        await this._updateSyncCursor(db, threadId, maxId);
      });

      if (__DEV__) console.log(`[ChatStore] Incremental sync: +${newCount} new msgs for ${threadId}`);
      return { newCount, messages: await this.getHistory(threadId) };
    } catch (e) {
      console.error('[ChatStore] incrementalSync failed:', e);
      return { newCount: 0, messages: await this.getHistory(threadId) };
    }
  }

  /** @deprecated 优先使用 incrementalSync() */
  async syncMessages(threadId: string, serverMessages: ChatMessage[]): Promise<void> {
    const db = await dbCore.getDb();
    try {
      await db.withTransactionAsync(async () => {
        for (const msg of serverMessages) {
          await db.runAsync(
            `INSERT OR REPLACE INTO chat_messages (id, thread_id, role, content, timestamp, status) VALUES (?, ?, ?, ?, ?, 'sent')`,
            [
              msg.id,
              threadId,
              msg.type === 'yin' ? 'yin' : msg.type,
              msg.content,
              typeof msg.timestamp === 'string' ? msg.timestamp : msg.timestamp.toISOString(),
            ],
          );
        }
      });
    } catch (e) {
      console.error('[ChatStore] syncMessages failed:', e);
    }
  }

  /** 获取同步诊断信息 */
  async getSyncInfo(threadId: string) {
    const db = await dbCore.getDb();
    const sync = await db.getFirstAsync<SyncStateRow>(
      'SELECT * FROM sync_state WHERE thread_id = ?', [threadId],
    );
    const msgCount = await db.getFirstAsync<CountRow>(
      'SELECT COUNT(*) as count FROM chat_messages WHERE thread_id = ?', [threadId],
    );
    const pendCount = await db.getFirstAsync<CountRow>(
      'SELECT COUNT(*) as count FROM pending_messages WHERE thread_id = ?', [threadId],
    );
    return {
      lastSyncedId: sync?.last_synced_id || '0',
      lastSyncedAt: sync?.last_synced_at || '',
      syncVersion: sync?.sync_version || 0,
      localMessageCount: msgCount?.count || 0,
      pendingCount: pendCount?.count || 0,
    };
  }

  // ─── 游标管理 (内部) ───

  private async _getSyncCursor(db: any, threadId: string): Promise<string> {
    const row = await db.getFirstAsync<SyncStateRow>(
      'SELECT last_synced_id FROM sync_state WHERE thread_id = ?', [threadId],
    );
    return row?.last_synced_id || '0';
  }

  private async _updateSyncCursor(db: any, threadId: string, lastId: string): Promise<void> {
    await db.runAsync(
      `INSERT INTO sync_state (thread_id, last_synced_id, last_synced_at, sync_version)
       VALUES (?, ?, ?, 1)
       ON CONFLICT(thread_id) DO UPDATE SET
         last_synced_id = excluded.last_synced_id,
         last_synced_at = excluded.last_synced_at,
         sync_version = sync_version + 1`,
      [threadId, lastId, new Date().toISOString()],
    );
  }
}

export const chatStore = new ChatStore();

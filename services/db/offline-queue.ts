/**
 * OfflineQueue — 离线消息队列
 *
 * 网络断开时消息入队，恢复后自动重发。
 * 含重试计数 + 死信清理。
 */
import { ChatMessage } from '../../types';
import { dbCore } from './core';

export interface PendingMessage {
  id: string;
  thread_id: string;
  role: string;
  content: string;
  created_at: string;
  retry_count: number;
  last_retry_at: string | null;
}

class OfflineQueue {
  /** 将消息加入离线发送队列 */
  async enqueue(msg: ChatMessage, threadId: string): Promise<void> {
    const db = await dbCore.getDb();
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO pending_messages (id, thread_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)`,
        [msg.id, threadId, msg.type, msg.content, new Date().toISOString()],
      );
    } catch (e) {
      console.error('[OfflineQueue] enqueue failed:', e);
    }
  }

  /** 获取待发送消息 */
  async getPending(threadId?: string, maxRetries = 5): Promise<PendingMessage[]> {
    const db = await dbCore.getDb();
    try {
      const sql = threadId
        ? 'SELECT * FROM pending_messages WHERE thread_id = ? AND retry_count < ? ORDER BY created_at'
        : 'SELECT * FROM pending_messages WHERE retry_count < ? ORDER BY created_at';
      const params = threadId ? [threadId, maxRetries] : [maxRetries];
      return (await db.getAllAsync(sql, params)) as PendingMessage[];
    } catch (e) {
      console.error('[OfflineQueue] getPending failed:', e);
      return [];
    }
  }

  /** 消息发送成功 → 移出队列 */
  async dequeue(msgId: string): Promise<void> {
    const db = await dbCore.getDb();
    try {
      await db.runAsync('DELETE FROM pending_messages WHERE id = ?', [msgId]);
    } catch (e) {
      console.error('[OfflineQueue] dequeue failed:', e);
    }
  }

  /** 标记重试 (递增 retry_count) */
  async markRetry(msgId: string): Promise<void> {
    const db = await dbCore.getDb();
    try {
      await db.runAsync(
        `UPDATE pending_messages SET retry_count = retry_count + 1, last_retry_at = ? WHERE id = ?`,
        [new Date().toISOString(), msgId],
      );
    } catch (e) {
      console.error('[OfflineQueue] markRetry failed:', e);
    }
  }

  /** 清除已超过最大重试次数的死信消息 */
  async cleanDeadLetters(maxRetries = 5): Promise<number> {
    const db = await dbCore.getDb();
    try {
      const result = await db.runAsync(
        'DELETE FROM pending_messages WHERE retry_count >= ?', [maxRetries],
      );
      return result?.changes || 0;
    } catch (e) {
      console.error('[OfflineQueue] cleanDeadLetters failed:', e);
      return 0;
    }
  }
}

export const offlineQueue = new OfflineQueue();

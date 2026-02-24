/**
 * database.ts — 向后兼容 Re-export
 *
 * ⚠️ 此文件仅作为过渡入口。新代码应直接导入 db/ 子模块:
 *   import { chatStore } from './db/chat-store';
 *   import { cacheStore } from './db/cache-store';
 *   import { offlineQueue } from './db/offline-queue';
 *
 * @deprecated 将在下个版本移除
 */
import { ChatMessage } from '../types';

// 全部从 db/ 子模块重新导出
export { db, dbCore, chatStore, cacheStore, offlineQueue } from './db';
export type { SyncResult, PendingMessage, ChatMessageRow, SyncStateRow, CountRow, CacheRow } from './db';

// ─── 向后兼容函数别名 ───

import { db } from './db';

/** @deprecated Use db.init() or dbCore.init() */
export const initDatabase = () => db.init();

/** @deprecated Use dbCore.getDb() */
export const getDb = () => db.getDb();

/** @deprecated Use chatStore.saveMessage() */
export const saveMessageLocal = (
  msg: ChatMessage,
  threadId: string,
  status: 'sending' | 'sent' = 'sent',
) => db.saveMessage(msg, threadId, status);

/** @deprecated Use chatStore.getHistory() */
export const getLocalHistory = (threadId: string, limit = 50, offset = 0) =>
  db.getHistory(threadId, limit, offset);

/** @deprecated Use chatStore.incrementalSync() */
export const syncMessages = (threadId: string, serverMessages: ChatMessage[]) =>
  db.syncMessages(threadId, serverMessages);

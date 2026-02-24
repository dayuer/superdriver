/**
 * db/index.ts — 统一入口 + 向后兼容
 *
 * 新代码应直接导入子模块:
 *   import { chatStore } from './db/chat-store';
 *   import { cacheStore } from './db/cache-store';
 *
 * database.ts 将重新导出此文件，保持旧导入路径不变。
 */
export { dbCore } from './core';
export { chatStore, SyncResult } from './chat-store';
export { cacheStore } from './cache-store';
export { offlineQueue, PendingMessage } from './offline-queue';
export type { ChatMessageRow, SyncStateRow, CountRow, CacheRow } from './core';

// ─── 向后兼容 ───
// 旧代码 `import { db } from './database'` 需要一个 db 对象
// 提供一个 facade 聚合所有方法（将在 database.ts 中 re-export）

import { dbCore } from './core';
import { chatStore } from './chat-store';
import { cacheStore } from './cache-store';
import { offlineQueue } from './offline-queue';

/** 向后兼容的 facade — 聚合所有子模块方法 */
export const db = {
  // 核心
  init: () => dbCore.init(),
  getDb: () => dbCore.getDb(),

  // 聊天
  saveMessage: chatStore.saveMessage.bind(chatStore),
  getHistory: chatStore.getHistory.bind(chatStore),
  incrementalSync: chatStore.incrementalSync.bind(chatStore),
  syncMessages: chatStore.syncMessages.bind(chatStore),
  getSyncInfo: chatStore.getSyncInfo.bind(chatStore),

  // 离线队列
  enqueueMessage: offlineQueue.enqueue.bind(offlineQueue),
  getPendingMessages: offlineQueue.getPending.bind(offlineQueue),
  dequeueMessage: offlineQueue.dequeue.bind(offlineQueue),
  markRetry: offlineQueue.markRetry.bind(offlineQueue),
  cleanDeadLetters: offlineQueue.cleanDeadLetters.bind(offlineQueue),

  // 缓存
  cacheGet: <T>(key: string) => cacheStore.get<T>(key),
  cacheGetStale: <T>(key: string) => cacheStore.getStale<T>(key),
  cacheSet: <T>(key: string, data: T, ttl: number) => cacheStore.set(key, data, ttl),
  cacheDelete: (key: string) => cacheStore.delete(key),
  cacheCleanExpired: () => cacheStore.cleanExpired(),
  cacheClear: () => cacheStore.clear(),
  cacheGetStats: () => cacheStore.getStats(),
};

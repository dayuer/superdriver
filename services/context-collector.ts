/**
 * context-collector.ts — 环境上下文采集器
 *
 * 可插拔架构：注册自定义采集器后，每次发送消息时自动聚合所有上下文。
 *
 * Phase 1 内置采集器：
 *   - GPS 位置 (expo-location)
 *   - 当前页面标识 (手动 set)
 *   - 设备信息 (expo-device)
 */

// ============================================================================
// 类型定义
// ============================================================================

/** 环境上下文（所有字段可选，采集到什么就有什么） */
export interface EnvironmentContext {
  gps?: { latitude: number; longitude: number; accuracy?: number };
  speed?: number;            // m/s
  currentScreen?: string;    // 当前页面标识
  deviceModel?: string;      // 设备型号
  osVersion?: string;        // 系统版本
  appVersion?: string;       // App 版本
  batteryLevel?: number;     // 电量 0-1
  networkType?: string;      // wifi / cellular
  [key: string]: unknown;    // 扩展字段
}

/** 采集器函数签名 — 返回部分上下文 */
export type CollectorFn = () => Promise<Partial<EnvironmentContext>> | Partial<EnvironmentContext>;

/** 注册的采集器 */
interface RegisteredCollector {
  name: string;
  fn: CollectorFn;
  /** 采集超时 ms，默认 3000 */
  timeoutMs: number;
}

// ============================================================================
// 采集器注册表
// ============================================================================

const _collectors: RegisteredCollector[] = [];

/** 当前页面状态 — 由导航层手动设置 */
let _currentScreen = 'unknown';

/**
 * 注册一个上下文采集器
 *
 * @param name 采集器名称（唯一标识，重复注册会覆盖）
 * @param fn 采集函数
 * @param timeoutMs 超时时间（默认 3000ms，超时后忽略该采集器结果）
 */
export function registerCollector(
  name: string,
  fn: CollectorFn,
  timeoutMs = 3000,
): void {
  // 移除同名采集器（实现幂等覆盖）
  const idx = _collectors.findIndex(c => c.name === name);
  if (idx >= 0) _collectors.splice(idx, 1);

  _collectors.push({ name, fn, timeoutMs });
}

/** 注销采集器 */
export function unregisterCollector(name: string): void {
  const idx = _collectors.findIndex(c => c.name === name);
  if (idx >= 0) _collectors.splice(idx, 1);
}

/** 设置当前页面标识（由 TabBar/Navigation 层调用） */
export function setCurrentScreen(screen: string): void {
  _currentScreen = screen;
}

// ============================================================================
// 聚合采集
// ============================================================================

/**
 * 执行所有已注册的采集器，聚合返回环境上下文
 *
 * 每个采集器独立超时，单个失败不影响整体。
 * 整体采集 < 500ms（大部分场景）。
 */
export async function collectContext(): Promise<EnvironmentContext> {
  const ctx: EnvironmentContext = {
    currentScreen: _currentScreen,
  };

  if (_collectors.length === 0) return ctx;

  // 并行执行所有采集器，带独立超时
  const results = await Promise.allSettled(
    _collectors.map(async (collector) => {
      const result = await Promise.race([
        Promise.resolve(collector.fn()),
        new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), collector.timeoutMs),
        ),
      ]);
      return { name: collector.name, result };
    }),
  );

  // 合并结果
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.result) {
      Object.assign(ctx, r.value.result);
    }
    // rejected 或超时返回 null 的采集器静默忽略
  }

  return ctx;
}

// ============================================================================
// 内置采集器
// ============================================================================

/**
 * 初始化内置采集器
 *
 * 在 App 启动时调用一次。
 * 依赖的原生模块缺失时优雅降级（不会崩溃）。
 */
export function initBuiltinCollectors(): void {
  // GPS 位置采集
  registerCollector('gps', async () => {
    try {
      const Location = require('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return {};

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        gps: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy: loc.coords.accuracy,
        },
        speed: loc.coords.speed ?? undefined,
      };
    } catch {
      return {};
    }
  }, 5000);  // GPS 可能需要较长时间

  // 设备信息采集（几乎无耗时）
  registerCollector('device', () => {
    try {
      const Device = require('expo-device');
      return {
        deviceModel: Device.modelName || undefined,
        osVersion: Device.osVersion || undefined,
      };
    } catch {
      return {};
    }
  }, 1000);
}

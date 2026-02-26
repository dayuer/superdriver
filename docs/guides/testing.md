# 测试指南

## 测试环境

- **框架**: Jest 29 + ts-jest
- **运行环境**: Node.js（不依赖模拟器）
- **Mock 策略**: 所有原生模块在 `__tests__/setup.ts` 中全局 Mock

## 运行测试

```bash
# 全部测试
npm test

# 指定文件
npx jest __tests__/hooks/usePlatforms.test.ts

# 覆盖率报告
npm run test:coverage

# 监听模式（开发时推荐）
npm run test:watch
```

## 编写新测试

### 1. 创建测试文件

```
__tests__/
├── [模块名]/
│   └── [组件名].test.ts
```

### 2. Mock 原生模块

如果你的代码引用了 Expo 原生模块，需要在 `__tests__/setup.ts` 添加 Mock：

```typescript
jest.mock('expo-new-module', () => ({
  someMethod: jest.fn().mockResolvedValue(null),
}));
```

### 3. 测试 Hooks

使用 `@testing-library/react-hooks` Mock（项目内已提供）：

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useMyHook } from '../../hooks/useMyHook';

describe('useMyHook', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(expected);
  });

  it('should update on action', () => {
    const { result } = renderHook(() => useMyHook());
    act(() => {
      result.current.doSomething();
    });
    expect(result.current.value).toBe(newExpected);
  });
});
```

### 4. 测试纯函数

```typescript
import { formatCurrency } from '../../utils/formatters';

describe('formatCurrency', () => {
  it('should format number to CNY', () => {
    expect(formatCurrency(1234.5)).toBe('¥1,234.50');
  });
});
```

## Mock 清单

当前已 Mock 的原生模块（`__tests__/setup.ts`）：

| 模块 | Mock 内容 |
|------|-----------|
| `react-native` | Platform / Dimensions / StyleSheet / Linking |
| `expo-device` | DeviceType / brand / modelName |
| `expo-haptics` | impactAsync / selectionAsync |
| `expo-secure-store` | getItemAsync / setItemAsync / deleteItemAsync |
| `expo-crypto` | digestStringAsync / getRandomBytesAsync |
| `expo-sqlite` | openDatabaseAsync (含 execAsync 等方法) |
| `axios` | create + interceptors + get/post |

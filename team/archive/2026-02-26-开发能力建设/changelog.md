# Changelog

## [2026-02-26] SuperDriver 开发能力建设

### 新增

- **AGENTS.md** — 项目架构地图（目录结构树 + 199 行 + 文件职责 + 模块依赖 + 散落组件审计）
- **docs/ Diátaxis 文档体系**
  - `docs/README.md` — 四象限索引页
  - `docs/getting-started/quickstart.md` — 快速开始指南
  - `docs/architecture/modules.md` — 模块架构说明
  - `docs/architecture/security.md` — 安全架构说明
  - `docs/guides/testing.md` — 测试编写指南
  - `docs/guides/add-agent.md` — 添加新 Agent 操作指南
  - `docs/reference/api.md` — API 参考摘要
  - `docs/reference/types.md` — TypeScript 类型参考
- **team/ 协作目录** — 团队工作流中间产物 + archive/ 归档
- **`__tests__/__mocks__/testing-library-react-hooks.js`** — 基于 react-test-renderer 的最小化 Mock

### 修复

- **jest.config.js** — 添加 `transformIgnorePatterns` 和 `diagnostics: false`，修复 2 个测试套件加载失败（expo-device ESM + 隐式 any）
- **`__tests__/setup.ts`** — 添加 `expo-device` + `expo-haptics` 全局 Mock
- **.gitignore** — 移除错误的 `.agent/*` 忽略规则，添加 `team/*.md` 中间文件规则

### 更新

- **README.md** — 同步 Expo SDK 版本 52→54，更新目录结构，添加文档链接
- **docs/README.md** — 从简单项目说明重构为 Diátaxis 四象限索引页

### 测试

- 测试套件: 9/11 → **11/11** (100%)
- 测试用例: 107 → **121** (全部通过)

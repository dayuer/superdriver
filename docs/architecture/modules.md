# 模块架构

## 四层架构

SuperDriver 采用分层架构，由上到下依赖关系单向流动：

```
┌─────────────────────────────────┐
│         screens/ (页面层)        │  路由 + 页面组合
├─────────────────────────────────┤
│        components/ (视图层)      │  可复用 UI 组件
├─────────────────────────────────┤
│  hooks/ (领域层)  │  packages/  │  业务逻辑 + SDK
├───────────────────┤             │
│        services/ (数据层)        │  API 调用 + 本地存储
├─────────────────────────────────┤
│      lib/ (基础设施层)           │  安全 + 加密
└─────────────────────────────────┘
```

## 组件目录划分

| 目录 | 职责 | 文件数 |
|------|------|--------|
| `cargo/` | 货运信息匹配 | 3 |
| `chat/` | 旧版聊天界面（逐步迁移到 im/） | 6 |
| `community/` | 社区 + 招聘功能 | 4 |
| `development/` | 发展中心（企业入驻 / 培训） | 8 |
| `im/` | IM 即时通讯（微信风格） | 7 |
| `omni-orb/` | 全能交互球（Agent 入口） | 2 |
| `performance/` | 业绩数据可视化 | 5 |
| `profile/` | 个人中心 | 6 |
| `service/` | 服务事件全生命周期管理 | 9 |
| `ui/` | 通用 UI（按钮 / 卡片 / 模态框） | 10 |
| `workbench/` | 工作台仪表盘 | 8 |

## Hooks 职责

| Hook | 职责 | 依赖 |
|------|------|------|
| `useAuth` | 三方登录 + Token 管理 | `lib/security.ts`, `services/apple.ts` |
| `useAppData` | 全局数据加载（Agent / 会话 / 档案） | `services/api.ts` |
| `useOpenClaw` | Agent SDK 交互 | `packages/agent-sdk/` |
| `useServiceEvents` | 服务事件 CRUD + 分页 | `services/service-api.ts` |
| `usePlatforms` | 平台绑定状态管理 | `config/mock-data.ts` |
| `useNotifications` | 通知 CRUD + 未读计数 | 无外部依赖 |

## 服务层设计

### API 实例 (`services/api.ts`)

所有远程 API 调用必须通过统一的 axios 实例，该实例自动处理：
- 请求签名 (HMAC-SHA256)
- Token 注入 (x-session-id)
- Token 过期自动刷新
- 错误统一包装为 `ApiError`

### 本地存储 (`services/db/`)

基于 `expo-sqlite` 的模块化存储：
- `core.ts` — 数据库初始化 + SQLCipher 加密 + 迁移管理
- `chat-store.ts` — 聊天消息持久化
- `cache-store.ts` — 通用 KV 缓存
- `offline-queue.ts` — 离线操作队列（网络恢复后重放）

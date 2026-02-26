# SuperDriver 架构地图

> 最后更新: 2026-02-26 · **此文件由架构变更自动触发更新**

## 项目概览

SuperDriver（超级司机）是 Survival OS 的移动端入口，基于 Expo SDK 54 + React Native 0.81 + TypeScript 5.9 构建。为 3000 万职业驾驶员提供 AI Agent 驱动的日常运营服务。

## 技术栈

| 层 | 技术 | 版本 |
|---|------|------|
| 框架 | Expo (React Native) | SDK 54 |
| 语言 | TypeScript | 5.9 |
| 本地存储 | expo-sqlite (SQLCipher) | AES-256 加密 |
| 认证 | expo-secure-store | 安全 Token 存储 |
| 动画 | react-native-reanimated | 4.1 |
| Agent SDK | @survival/agent-sdk | 内嵌包 |

## 目录结构

```
superdriver/
├── App.tsx                          # 应用根组件 — 路由 + Tab 导航 + 状态管理
├── index.ts                         # Expo 入口点
├── types.ts                         # 全局类型定义 (Agent/Chat/Service/User)
├── constants.ts                     # [已废弃] → config/constants.ts 的 re-export
│
├── components/                      # UI 组件库 ⚠️ 根目录存在 24 个散落组件
│   ├── *.tsx (24 files)             # 散落在根目录的组件（待整理）
│   ├── cargo/                       # 货运匹配模块 (3 文件)
│   ├── chat/                        # 旧版聊天组件 (6 文件)
│   ├── community/                   # 社区/招聘功能 (4 文件)
│   ├── mud/                          # MUD 社区组件 (11 文件)
│   │   ├── MudFeedScreen.tsx        #   传闻流主屏 (引导+档案+帖子流)
│   │   ├── MudOnboarding.tsx        #   职业选择引导页
│   │   ├── MudPostCard.tsx          #   武侠帖子卡片 (MUD/原文切换)
│   │   ├── MudActionBar.tsx         #   烈酒/怒骂/围炉 三按钮
│   │   ├── MudPlayerProfile.tsx     #   玩家档案 (职业/真气/碎银)
│   │   ├── MudDisclaimer.tsx        #   免责声明条
│   │   ├── MudBroadcast.tsx         #   全服播报 (轮播动画)
│   │   ├── MudNpcEventCard.tsx      #   NPC 事件卡片
│   │   ├── MudArenaScreen.tsx       #   恩怨台 (战斗+掉落)
│   │   ├── MudScreens.tsx           #   悬赏/黑市/公会/语音 子屏
│   │   └── index.ts                 #   模块导出
│   ├── development/                 # 发展中心组件 (8 文件)
│   ├── im/                          # IM 即时通讯模块 (7 文件)
│   ├── omni-orb/                    # 全能交互球 (2 文件)
│   ├── performance/                 # 业绩数据展示 (5 文件)
│   ├── profile/                     # 个人中心组件 (6 文件)
│   ├── service/                     # 服务事件管理 (9 文件)
│   ├── ui/                          # 通用 UI 组件 (10 文件)
│   └── workbench/                   # 工作台仪表盘 (8 文件)
│
├── screens/                         # 页面级组件
│   ├── CargoFeedScreen.tsx          # 货运信息流页
│   ├── LoginScreen.tsx              # 登录页 (Apple Sign-In + 微信)
│   ├── MyOrdersScreen.tsx           # 我的订单页
│   └── ProfileScreen.tsx            # 个人档案页
│
├── hooks/                           # 自定义 Hooks (11 文件)
│   ├── useAuth.ts                   # 认证状态管理 (Apple/微信/游客)
│   ├── useAppData.ts                # 全局应用数据加载
│   ├── useOpenClaw.ts               # Agent SDK 交互钩子
│   ├── useServiceEvents.ts          # 服务事件 CRUD
│   ├── usePlatforms.ts              # 平台绑定管理
│   ├── useNotifications.ts          # 通知管理
│   ├── useCargoMatch.ts             # 货运匹配
│   ├── useAnimatedHeader.ts         # 动画头部
│   ├── useCommandDeckAnimation.ts   # 仪表盘动画
│   └── useDraggableFAB.ts           # 可拖拽悬浮按钮
│
├── services/                        # 服务层
│   ├── api.ts                       # 主 API 实例 (axios + 认证拦截器 + Token 刷新)
│   ├── apple.ts                     # Apple Sign-In 服务
│   ├── wechat.ts                    # 微信登录 + 分享
│   ├── cache.ts                     # 内存 + 持久化缓存
│   ├── community-api.ts             # 社区 API
│   ├── mud-api.ts                   # MUD 社区 API (档案/NPC/恩怨台/悬赏/公会/商店/语音)
│   ├── recruitment-api.ts           # 招聘 API
│   ├── service-api.ts               # 服务事件 API
│   ├── development.ts               # 发展中心 API
│   ├── context-collector.ts         # 上下文采集 (Agent 所需环境数据)
│   ├── openclaw-client.ts           # Agent 运行时客户端 (WebSocket)
│   ├── database.ts                  # SQLite 数据库入口
│   └── db/                          # 模块化本地存储
│       ├── core.ts                  # DB 初始化 + 加密 + 迁移
│       ├── chat-store.ts            # 聊天消息本地存储
│       ├── cache-store.ts           # 通用缓存存储
│       ├── offline-queue.ts         # 离线操作队列
│       └── index.ts                 # DB 模块导出
│
├── lib/                             # 安全基础设施
│   └── security.ts                  # Token 安全存储 + HMAC 签名 + 设备 ID
│
├── config/                          # 配置中心
│   ├── constants.ts                 # Agent 常量 + 业务配置 (7.8 KB)
│   ├── mock-data.ts                 # 开发环境 Mock 数据
│   └── index.ts                     # 配置导出
│
├── styles/                          # 设计系统
│   ├── base.ts                      # 基础布局样式
│   ├── colors.ts                    # 色彩系统
│   ├── typography.ts                # 字体排版
│   ├── cards.ts                     # 卡片样式
│   └── index.ts                     # 样式导出
│
├── utils/                           # 工具函数
│   ├── formatters.ts                # 数据格式化 (货币/时间/百分比)
│   ├── status-helpers.ts            # 状态映射 (颜色/图标/文案)
│   ├── commandDeck-helpers.ts       # 仪表盘辅助函数
│   └── index.ts                     # 工具导出
│
├── packages/                        # 内嵌包
│   └── agent-sdk/                   # @survival/agent-sdk
│       ├── index.ts                 # SDK 导出 (AgentProvider/useAgent/OmniOrb)
│       ├── package.json             # 包元数据
│       └── providers/               # SDK Provider 实现
│
├── assets/                          # 静态资源
│   ├── avatars/                     # Agent + 用户头像
│   └── images/                      # 图片资源
│
├── __tests__/                       # 测试套件 (11 套件 / 121 用例)
│   ├── setup.ts                     # 全局 Mock (RN/Expo/Axios)
│   ├── __mocks__/                   # 模块 Mock
│   ├── components/                  # 组件测试
│   ├── config/                      # 配置测试
│   ├── hooks/                       # Hooks 测试
│   ├── services/                    # 服务测试
│   ├── types/                       # 类型测试
│   └── utils/                       # 工具测试
│
├── docs/                            # 项目文档 (Diátaxis 四象限)
│   ├── README.md                    # 文档索引
│   ├── getting-started/             # 📘 入门教程
│   ├── architecture/                # 📖 架构解释
│   ├── guides/                      # 📗 操作指南
│   └── reference/                   # 📕 技术参考
│
├── team/                            # 团队协作 (workflow 中间产物)
│   └── archive/                     # 历史归档
│
│   # Agent 规则使用全局 ~/.gemini/ 目录
│   # 角色: ~/.gemini/roles/
│   # 工作流: ~/.gemini/antigravity/.agent/workflows/
│
└── 配置文件
    ├── app.json                     # Expo 配置
    ├── package.json                 # NPM 包配置
    ├── tsconfig.json                # TypeScript 配置 (strict)
    ├── babel.config.js              # Babel 配置 (reanimated 插件)
    ├── jest.config.js               # Jest 测试配置
    └── .gitignore                   # Git 忽略规则
```

## 模块依赖关系

```
App.tsx (根组件)
  ├─→ hooks/useAuth.ts (认证)
  ├─→ hooks/useAppData.ts (数据加载)
  ├─→ packages/agent-sdk/ (Agent SDK)
  ├─→ lib/security.ts (Token)
  ├─→ services/api.ts (API)
  └─→ components/
       ├── WorkbenchScreen.tsx → 工作台
       ├── DevelopmentCenter.tsx → 发展中心
       ├── TabBar.tsx → 底部Tab
       ├── AgentProfile.tsx → 专家档案
       └── service/ → 服务事件模块

services/api.ts (API 核心)
  ├─→ lib/security.ts (签名 + Token)
  └─← 被所有业务 API 依赖

services/db/ (本地存储)
  ├── core.ts → 初始化 + 加密
  ├── chat-store.ts → 聊天记录
  ├── cache-store.ts → 通用缓存
  └── offline-queue.ts → 离线队列

packages/agent-sdk/ (Agent SDK)
  ├─→ services/openclaw-client.ts (WebSocket)
  ├─→ services/context-collector.ts (上下文)
  └─← App.tsx (AgentProvider + OmniOrb)
```

## 散落组件审计

> ⚠️ `components/` 根目录存在 24 个 `.tsx` 文件，应按功能归入子目录。

| 组件 | 建议归属 | 被引用方 | 风险 |
|------|----------|----------|------|
| WorkbenchScreen.tsx | workbench/ | App.tsx | 中 — App 直接引用 |
| DevelopmentCenter.tsx | development/ | App.tsx | 中 — App 直接引用 |
| TabBar.tsx | ui/ | App.tsx | 中 — App 直接引用 |
| AgentProfile.tsx | ui/ 或 chat/ | App.tsx | 中 |
| CommandDeck.tsx | workbench/ | WorkbenchScreen | 低 |
| ChatList.tsx, ChatRoom.tsx | chat/ | 多处 | 低 |
| DashboardHeader/Sheet.tsx | performance/ | WorkbenchScreen | 低 |
| AggregateDashboard.tsx | performance/ | 工作台 | 低 |
| 其余 14 个 | 各自对应子目录 | 少量引用 | 低 |

> **本次仅标注，不执行移动。** 下次迭代可专门处理组件归位。

## 已知问题

1. `constants.ts` 根文件标记 `@deprecated`，应逐步消除引用
2. `docs/README.md` 中 Expo SDK 版本 (52) 与 `package.json` (54) 不一致 → 已在本次修复
3. 2 个测试套件原本加载失败 (`expo-device` ESM) → 已在本次修复

# SuperDriver · 超级司机

> React Native + Expo 移动端应用

## 项目定位

超级司机是 Survival OS 的移动端入口，为司机群体提供 AI Agent 驱动的日常运营服务。

## 技术栈

| 技术                    | 版本         |
| ----------------------- | ------------ |
| React Native            | 0.76+        |
| Expo SDK                | 52           |
| TypeScript              | 5.x          |
| expo-sqlite + SQLCipher | 本地加密存储 |

## 目录结构

```
superdriver/
├── components/          # UI 组件库
│   ├── chat/            # 聊天界面
│   ├── community/       # 社区功能
│   ├── im/              # IM 会话
│   ├── omni-orb/        # 全能交互球 (Agent SDK 入口)
│   ├── service/         # 服务事件
│   └── workbench/       # 工作台
├── hooks/               # 自定义 Hooks
├── screens/             # 页面
├── services/            # API 客户端
│   ├── api.ts           # 主 API 实例 (auth + token refresh)
│   ├── db/              # 模块化本地存储
│   │   ├── core.ts      # 初始化 + 加密 + 迁移
│   │   ├── chat-store.ts
│   │   ├── cache-store.ts
│   │   └── offline-queue.ts
│   └── openclaw-client.ts
├── lib/                 # 安全工具 (签名/加密)
├── styles/              # 设计系统
└── packages/
    └── agent-sdk/       # @survival/agent-sdk
```

## 安全

- SQLCipher AES-256 全库加密（密钥从 iOS Keychain / Android Keystore 获取）
- API 请求 HMAC-SHA256 签名
- 所有凭证通过 expo-secure-store 管理
- 无硬编码 API Key

## 关联

- 后端: [Survival OS](https://github.com/dayuer/survival) (oss/ 数据中台)
- AI 运行时: [OpenClaw](https://github.com/openclaw/openclaw)

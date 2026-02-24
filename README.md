# 🚗 SuperDriver 超级司机

> **你只管握好方向盘，剩下的世界交给我**
>
> 3000 万职业驾驶员在数字世界的全能分身 (Digital Avatar) —
> IM 群聊 + 6 位 AI 专家团 + 工作台 + 发展中心。

---

## 📊 产品定位

| 维度 | 说明 |
| --- | --- |
| 核心人群 | 3000 万职业驾驶员 (代驾 · 网约车 · 货运) |
| 产品定位 | 数字分身 — AI 替你处理数字世界的一切事务 |
| 核心价值 | 工作代理人 + 生活大管家 + 利益捍卫者 |

## 🏗️ 技术栈

| 层 | 技术 | 版本 |
| --- | --- | --- |
| 框架 | Expo (React Native) | SDK 54 |
| 语言 | TypeScript | 5.x |
| IM | SQLite + API | 本地消息缓存 |
| 认证 | expo-secure-store | 安全 Token 存储 |
| 动画 | Reanimated | latest |
| 后端 | Next.js API + Lovrabet OpenAPI | [../backend](../backend) |

## 📱 页面架构

```
4 Tab 导航 (App.tsx)
┌──────────┬──────────┬──────────┬──────────┐
│   消息    │  工作台   │  发展    │   我的   │
│ 💬 IM    │ 📊 面板  │ 🏢 企业  │ 👤 档案  │
└──────────┴──────────┴──────────┴──────────┘
     │           │           │          │
     │           │           │          └── ProfileScreen (个人档案)
     │           │           │
     │           │           └── DevelopmentCenter (企业入驻/培训)
     │           │
     │           └── WorkbenchScreen (收入统计/接单/快捷操作)
     │               ├── CommandDeck (仪表盘)
     │               └── 快捷操作面板
     │
     └── IMScreen (微信风格 IM)
         ├── IMChatList (会话列表)
         ├── IMChatRoom (聊天室 — 群聊+私聊)
         ├── IMContacts (联系人)
         └── IMSettings (设置)
```

## 🎭 AI 专家团

| 专家 | 身份 | 核心能力 |
| --- | --- | --- |
| 🎯 **翔哥** | 群主 / 总调度 | 任务分发、全局把控、江湖经验 |
| ⚖️ **叶律** | 法务顾问 | 交通事故定责、维权申诉、合同审查 |
| 🔧 **老周** | 车辆管家 | 故障诊断、维修预约、保养提醒 |
| 📊 **阿 K** | 算法分析师 | 平台规则解读、收益优化、数据分析 |
| 🔮 **裴大师** | 心理顾问 | 情绪疏导、运势参考、出车建议 |
| 💚 **林姨** | 健康管家 | 职业病预防、疲劳提醒、就医挂号 |

## 📂 目录结构

```
superdriver/
├── App.tsx                     # 根入口 + 导航
├── components/
│   ├── im/                     # IM 模块 (WeChat-style)
│   │   ├── IMScreen.tsx        # IM 主控制器
│   │   ├── IMChatList.tsx      # 会话列表
│   │   ├── IMChatRoom.tsx      # 聊天室
│   │   └── IMContacts.tsx      # 联系人
│   ├── workbench/              # 工作台组件
│   ├── profile/                # 个人中心
│   ├── development/            # 发展中心
│   └── ui/                     # 通用 UI 组件
├── services/
│   ├── api.ts                  # API 调用封装
│   ├── auth.ts                 # 认证状态管理
│   ├── cache.ts                # 本地缓存
│   └── database.ts             # SQLite 本地数据
├── lib/
│   └── security.ts             # Token 安全存储 + 签名
├── styles/                     # 样式系统
└── assets/                     # 静态资源
```

## 🚀 快速开始

```bash
cd superdriver
npm install

# iOS 模拟器
npm run ios

# Android 模拟器
npm run android
```

### 环境要求

- Node.js 18+
- Xcode 15+ (iOS)
- 后端服务运行中 (`cd ../backend && npm run dev`)

## 📋 关联文档

| 文档 | 位置 | 说明 |
| --- | --- | --- |
| API 参考 | [`API_REFERENCE.md`](API_REFERENCE.md) | 客户端 API 调用手册 |
| IM 模块 | [`components/im/README.md`](components/im/README.md) | 聊天模块指南 |
| 安全审计 | [`docs/SECURITY_AUDIT_20260207.md`](docs/SECURITY_AUDIT_20260207.md) | 安全评估报告 |
| 后端 API | [`../docs/api/README.md`](../docs/api/README.md) | API 接口总索引 |

---
description: 如何通过自建 OTA 服务发布工具箱热更新 (无第三方依赖)
---

# 自建 OTA 热更新发布流程

## 架构

```
你的 Mac
  │  npx expo export   → 生成 JS bundle
  │  复制到 backend/public/ota-bundles/
  │  POST /api/updates/publish  → 注册版本
  ↓
你的后端 (Next.js)
  │  GET /api/updates/manifest  → 返回最新版本信息
  │  GET /api/updates/assets/*  → 返回 bundle 文件
  ↓
用户 App
  │  expo-updates 启动时检查
  │  GET /api/updates/manifest
  │  对比版本 → 下载新 bundle → 下次启动生效
```

## 一键发布

修改任意工具代码后:

// turbo

```bash
./scripts/ota-publish.sh "修复WiFi测速bug"
```

发布到预览环境 (内部测试):

```bash
./scripts/ota-publish.sh "新增电压计算器" preview
```

## 发布前配置

### 1. 设置后端域名

修改 `fixall/app.json` 中的 `updates.url` 为你的生产域名:

```json
"url": "https://你的域名/api/updates/manifest"
```

### 2. 设置发布密钥

在 `backend/.env` 中设置:

```
OTA_PUBLISH_SECRET=你的安全密钥
```

在发布时设置环境变量:

```bash
export OTA_PUBLISH_SECRET=你的安全密钥
export OTA_BACKEND_URL=https://你的域名
./scripts/ota-publish.sh "更新说明"
```

## 回滚

如果新版本有问题，可以通过 API 回滚:

```bash
# 查看版本列表
curl -s http://localhost:3000/api/updates/publish \
  -H "x-ota-secret: fixall-ota-secret-change-me" | jq

# 回滚: 将当前版本标记为非激活即可
# (之前的版本会自动成为最新的激活版本)
```

## 监控

- 后端日志会打印每次 manifest 请求和发布记录
- 设置页「检查更新」可手动触发
- 数据库 `ota_updates` 表记录所有版本历史

## 什么情况需要重新发版

| 场景                   | 是否需要发版 |
| ---------------------- | ------------ |
| 修复工具 bug           | ❌ OTA 更新  |
| 调整 UI 样式           | ❌ OTA 更新  |
| 新增工具组件           | ❌ OTA 更新  |
| 修改计算逻辑           | ❌ OTA 更新  |
| 升级 Expo SDK          | ✅ 需要发版  |
| 新增原生模块           | ✅ 需要发版  |
| 修改 app.json 原生配置 | ✅ 需要发版  |

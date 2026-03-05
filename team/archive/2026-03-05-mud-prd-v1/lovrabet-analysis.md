# Lovrabet 实现方案分析

> 2026-03-05 · 基于 [MCP 文档](https://open.lovrabet.com/docs/mcp/intro) + SDK 代码生成测试

## Lovrabet 平台能力概览

| 能力 | 说明 | 对应 MCP 工具 |
|------|------|-------------|
| 数据集 CRUD | filter/create/update/delete/getOne | `generate_sdk_code` |
| 自定义 SQL | 编写→验证→保存→执行 | `validate_sql_content` → `save_or_update_custom_sql` → `execute_custom_sql` |
| Backend Function | Before/After 脚本做服务端逻辑 | `list_bff_scripts` / `save_or_update_bff_script` |
| SDK 代码生成 | 自动生成 TypeScript 标准调用代码 | `generate_sdk_code` / `generate_sql_code` |

## 关键发现：字段命名映射

SDK 生成的代码使用 **snake_case** (DB 原始字段名)，而 Lovrabet 平台在运行时自动做 **snake→camel 转换**：

| DB 字段 (snake_case) | Python 后端 (camelCase) | 前端 TS (camelCase) |
|---------------------|----------------------|-------------------|
| `profession_code` | `professionCode` | `professionCode` |
| `battle_count` | `battleCount` | `battleCount` |
| `guild_id` | `guildId` | `guildId` |
| `publisher_id` | `publisherId` | `publisherId` |
| `taker_id` | `takerId` | `takerId` |
| `mud_content` | `mudContent` | `mudContent` |

## 当前 MUD 功能 → Lovrabet 实现路径

### 1. 档案 CRUD (✅ 已可直接前端 SDK 调用)

**现状**: 后端 `routers/mud.py` 做了一层代理，前端 → Python → Lovrabet
**优化**: 前端直接用 `@lovrabet/sdk` 调用，省去 Python 中间层

```typescript
// 前端直接查询档案 (替代 GET /community/mud-profile)
const result = await client.models.mudProfiles.filter({
    where: { user_id: { $eq: userId } },
    pageSize: 1,
});
```

**适用**: 档案查看、悬赏列表、商店列表、公会列表、NPC 事件列表 — 所有纯读取场景

### 2. 悬赏接取/完成 (⚠️ 需 Backend Function)

**原因**: 涉及多表事务（bounty 状态变更 + profile 奖励更新），不能在前端做
**方案**: 用 **Backend Function (BFF)** 在 Lovrabet 平台层实现 Before/After 脚本

```typescript
// bounty update 的 Before 脚本 — 校验是否可accept
export default async function beforeUpdate(params, context) {
    if (params.data.status === 'accepted') {
        // 校验档案存在 + 当前状态为 open
        // 写入 taker_id 和 taken_at
    }
    return params;
}

// bounty update 的 After 脚本 — 完成后发放奖励
export default async function afterUpdate(result, params, context) {
    if (params.data.status === 'completed') {
        // 累加 silver/qi/battleCount 到 mud_profiles
    }
    return result;
}
```

### 3. 恩怨台战斗 (⚠️ 需 Backend Function + 自定义 SQL)

**NPC 生成**: 可用前端硬编码模板（已实现）
**战斗逻辑**: 需 Backend Function — 随机胜负 + 掉落计算 + 写入 battle_logs + 更新 profiles
**排行榜**: 自定义 SQL

```sql
-- 恩怨台排行榜
SELECT user_id, COUNT(*) as total_battles,
       SUM(CASE WHEN reward_type='silver' THEN 1 ELSE 0 END) as wins
FROM mud_battle_logs
GROUP BY user_id
ORDER BY wins DESC
LIMIT 20
```

### 4. 公会操作 (⚠️ 需 Backend Function)

**原因**: 创建/加入涉及邀请码生成、成员数递增、guild_id 回写档案
**方案**: guild create 的 After 脚本自动生成邀请码 + 更新档案

### 5. 商店兑换 (⚠️ 需 Backend Function)

**原因**: 碎银余额校验 + 扣减 — 这是一个事务操作
**方案**: shopItem "兑换" 操作用自定义 SQL 实现原子扣减

### 6. 帖子 MUD 翻译 (✅ 自定义 SQL)

```sql
-- 帖子 + 翻译关联查询
SELECT p.*, t.mud_content
FROM community_posts p
LEFT JOIN mud_post_translations t ON p.id = t.post_id
WHERE p.depth = 0
ORDER BY p.created_at DESC
```

## 改进路线图

### Phase A: 前端直连 (消除 Python 代理层)

所有 **纯读取** 的 GET 路由可被前端 `@lovrabet/sdk` 直接调用替代：
- `GET /community/mud-profile` → `client.models.mudProfiles.filter()`
- `GET /community/bounties` → `client.models.mudBounties.filter()`
- `GET /community/shop` → `client.models.mudShopItems.filter()`
- `GET /community/guilds` → `client.models.mudGuilds.filter()`
- `GET /community/arena` → `client.models.mudBattleLogs.filter()`
- `GET /community/factions` → `client.models.mudFactions.filter()`

### Phase B: Backend Function 迁移 (业务逻辑上移)

将 Python 后端的业务逻辑迁移到 Lovrabet Backend Function：
- 悬赏接取/完成 → bounty update 的 Before/After 脚本
- 恩怨台战斗 → battle_logs create 的 Before 脚本
- 商店兑换 → 自定义 SQL 原子操作
- 公会操作 → guild create/update 的 After 脚本

### Phase C: 自定义 SQL (复杂查询)

需要 `save_or_update_custom_sql` 创建的查询：
- 帖子 + MUD 翻译关联
- 恩怨台排行榜
- 公会排名
- 用户综合战力计算

## 保留 Python 后端的场景

| 功能 | 原因 |
|------|------|
| OCR 截图识别 | 需要调用 Vision AI 模型，非 CRUD |
| 订单 → 悬赏转化 | 复杂业务编排（OCR → 解析 → 创建订单 → 生成悬赏），涉及外部 API |
| 合规检查 | 可能需要外部敏感词服务 |
| 浏览器自动化 SSE | 长连接 + Chrome 扩展通信 |

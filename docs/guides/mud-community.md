# MUD 社区前端组件文档

> SuperDriver MUD 社区模块 — 武侠世界观 UI 层

## 概览

MUD 社区将 survival 后端的 34 条 AC (验收标准) 在 SuperDriver 移动端呈现。所有组件位于 `components/mud/`，API 调用通过 `services/mud-api.ts`。

## 组件清单

| 组件 | 文件 | 功能 | 关联 AC |
|------|------|------|---------|
| MudFeedScreen | `MudFeedScreen.tsx` | 传闻流主屏 (引导/档案/帖子流) | P0 入口 |
| MudOnboarding | `MudOnboarding.tsx` | 职业选择引导 (3职业) | AC-4.1 |
| MudPostCard | `MudPostCard.tsx` | 武侠帖子 + MUD/原文切换 | AC-2.3 |
| MudActionBar | `MudActionBar.tsx` | 烈酒🍶/怒骂😤/围炉🔥 | AC-3.1 |
| MudPlayerProfile | `MudPlayerProfile.tsx` | 玩家档案 (职业/真气/碎银) | AC-4 |
| MudDisclaimer | `MudDisclaimer.tsx` | 免责声明条 | AC-10.3 |
| MudBroadcast | `MudBroadcast.tsx` | 全服播报轮播 | AC-8.6 |
| MudNpcEventCard | `MudNpcEventCard.tsx` | NPC 事件卡片 | AC-5 |
| MudArenaScreen | `MudArenaScreen.tsx` | 恩怨台 (战斗+掉落) | AC-6 |
| MudBountyBoard | `MudScreens.tsx` | 悬赏布告榜 | AC-7 |
| MudShopScreen | `MudScreens.tsx` | 黑市兑换 | AC-9 |
| MudGuildScreen | `MudScreens.tsx` | 公会门派 | AC-8 |
| MudVoiceInput | `MudScreens.tsx` | 语音录入+配额+购买 | AC-11 |

## 使用方式

```tsx
import { MudFeedScreen } from './components/mud';

// 在 App.tsx 路由中添加
<Tab.Screen name="MUD" component={MudFeedScreen} />
```

## API Service

`services/mud-api.ts` 封装了 13 个后端 API 路由：

| 方法 | 端点 | 用途 |
|------|------|------|
| `getMudProfile` | GET /community/mud-profile | 获取玩家档案 |
| `createMudProfile` | POST /community/mud-profile | 创建档案 (选职业) |
| `getNpcEvents` | GET /community/npc-events | NPC 事件流 |
| `reportRoadblock` | POST /community/npc-events | 上报拦路虎 |
| `generateArenaNpc` | POST /community/arena | 生成 NPC 对手 |
| `executeBattle` | POST /community/arena | 执行战斗 |
| `getBounties` | GET /community/bounties | 悬赏列表 |
| `takeBounty` | POST /community/bounties | 揭榜 |
| `getShopItems` | GET /community/shop | 黑市商品 |
| `exchangeItem` | POST /community/shop | 碎银兑换 |
| `getVoiceQuota` | GET /community/voice/quota | 语音配额 |
| `uploadVoice` | POST /community/voice/upload | 语音上传 |
| `buyCredits` | POST /community/voice/buy-credits | 购买点数 |

## 设计系统

- **配色**: 暗色武侠风 (`#0A0A1A` 底 / `#1A1A2E` 卡片)
- **强调色**: 紫 `#5856D6` / 金 `#FFD700` / 红 `#FF3B30`
- **圆角**: 16px 卡片 / 12px 标签
- **动画**: Broadcast 轮播使用 `Animated.timing` 淡入淡出

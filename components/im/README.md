# IM 聊天模块使用指南

## 概述

本模块实现了类似微信的聊天页面，支持：

1. **专属群聊（核心议事厅）** - 每个用户有一个专属群，群里包含 6 个核心 Agent
2. **私聊** - 可以与任意 Agent 进行一对一对话
3. **可选配的合作 Agent** - 除了 6 个核心成员外，还可以添加合作顾问

## 组件结构

```
app/components/im/
├── index.ts              # 模块导出
├── IMScreen.tsx          # 主入口（包含 Tab 切换）
├── IMChatList.tsx        # 消息列表
├── IMChatRoom.tsx        # 聊天室（群聊/私聊）
├── IMContacts.tsx        # 通讯录
└── IMSessionSettings.tsx # 会话设置弹窗
```

## 使用方法

### 基础用法

```tsx
import { IMScreen } from "./components/im";

function App() {
  return (
    <IMScreen
      profile={userProfile}
      initialTab="messages"
      onBack={() => navigation.goBack()}
    />
  );
}
```

### 单独使用聊天列表

```tsx
import { IMChatList, IMSession } from "./components/im";

function ChatListScreen() {
  const [sessions, setSessions] = useState<IMSession[]>([]);

  return (
    <IMChatList
      sessions={sessions}
      isLoading={false}
      onRefresh={() => loadSessions()}
      onSessionPress={(session) => navigateToChatRoom(session)}
      onSessionLongPress={(session) => showActionSheet(session)}
      agentsMap={agentsMap}
    />
  );
}
```

### 单独使用聊天室

```tsx
import { IMChatRoom } from "./components/im";

function ChatRoomScreen({ route }) {
  const { sessionId, sessionType, sessionName, targetAgent } = route.params;

  return (
    <IMChatRoom
      sessionId={sessionId}
      sessionType={sessionType}
      sessionName={sessionName}
      agentsMap={agentsMap}
      targetAgent={targetAgent}
      profile={userProfile}
      onBack={() => navigation.goBack()}
      groupMembers={groupMembers} // 仅群聊需要
    />
  );
}
```

## 核心 Agent 配置

6 个核心 Agent ID：

| ID            | 名称 | 角色     |
| ------------- | ---- | -------- |
| `general`     | 翔哥 | 总参谋   |
| `legal`       | 叶律 | 法律顾问 |
| `mechanic`    | 老周 | 技术专家 |
| `health`      | 林姨 | 健康顾问 |
| `algo`        | 阿K  | 数据分析 |
| `metaphysics` | 裴姐 | 运势指导 |

## 数据类型

### IMSession

```typescript
interface IMSession {
  id: string;
  type: "group" | "private";
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageAt: Date | string;
  unreadCount: number;
  isPinned: boolean;
  agentId?: string;
  agent?: Agent;
  // 群聊专用
  memberCount?: number;
  memberAvatars?: string[];
}
```

## 设计规范

### 颜色

- 用户消息气泡：`#95EC69` (微信绿)
- Agent 消息气泡：`#FFFFFF` (白色)
- 聊天背景：`#EDEDED` (浅灰)
- 头部背景：`#F7F7F7`
- 主题色：`#007AFF` (iOS 蓝)
- 未读角标：`#FF3B30` (红色)

### 头像

- 列表头像：50px
- 聊天气泡头像：40px
- 群成员栏头像：36px

### 交互

- 下拉刷新消息列表
- 长按会话显示操作菜单（置顶/删除）
- 群成员栏可点击跳转私聊
- 输入框根据内容切换发送/语音按钮

## API 依赖

组件依赖以下 API：

```typescript
// 获取 Agent 列表
getAgents(): Promise<Agent[]>

// 获取聊天列表
getChatList(): Promise<ChatListItem[]>

// 获取聊天历史
getChatHistory(agentId: string, limit: number): Promise<Message[]>

// 发送消息
sendVentingMessage(content: string, agentId?: string): Promise<Response>
```

## 本地存储

使用 SQLite 进行本地消息缓存：

```typescript
// 初始化数据库
initDatabase()

// 获取本地历史
getLocalHistory(target: string, limit: number)

// 保存消息
saveMessageLocal(message: ChatMessage, target: string, status: string)

// 同步消息
syncMessages(target: string, messages: ChatMessage[])
```

## 后续优化

- [ ] 消息搜索功能
- [ ] 语音消息支持
- [ ] 图片/文件发送
- [ ] 消息撤回
- [ ] 已读回执
- [ ] 消息引用/回复
- [ ] 群公告功能

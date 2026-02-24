# Survival App API Reference

Server Base URL:

- Android Emulator: `http://10.0.2.2:3000/api`
- iOS Simulator: `http://localhost:3000/api`
- Production: `https://your-api-domain.com/api`

## Authentication

The API uses a Session ID mechanism.
All requests **MUST** include the following header to maintain user state:

```http
x-session-id: <unique-device-id-or-uuid>
```

If not provided, the server will treat the request as a transient guest session.

---

## 1. Agents (专家资源)

### `GET /agents`

获取所有可用的 AI 专家配置列表。

**Response:** `Record<string, Agent>`

```json
{
  "general": {
    "id": "general",
    "name": "翔哥",
    "title": "带头大哥",
    "avatar": "/avatars/xiangge_v2.png",
    "description": "...",
    "category": "native",
    "isPaid": false,
    ...
  },
  "legal": { ... }
}
```

---

## 2. User Profile (用户档案)

### `GET /profile`

获取当前用户的详细档案。如果用户不存在，返回默认初始档案。

**Response:** `UserProfile`

```json
{
  "userId": "guest_123...",
  "nickname": "老哥",
  "avatarId": "/avatars/users/user_male_1.png",
  "isVip": false,
  "city": "北京",
  "birthDate": "1990-01-01T00:00:00.000Z",
  "consentedAt": "2026-02-01T12:00:00.000Z" // If signed privacy policy
}
```

### `POST /profile`

执行用户档案相关操作（更新信息或签署协议）。

**Request (JSON):**

**Action 1: Update Profile**

```json
{
  "action": "update",
  "data": {
    "nickname": "新名字",
    "city": "上海",
    "avatarId": "/avatars/users/user_female_2.png",
    "gender": "男"
  }
}
```

**Action 2: Record Consent**

```json
{
  "action": "consent"
}
```

**Response:**

```json
{ "success": true, "data": { ...updatedProfile } }
```

---

## 3. Chat System (聊天系统)

### `GET /chat/list`

获取首页会话列表（包含私聊群聊）。

**Response:** `Array<ChatSession>`

```json
[
  {
    "agentId": "super_driver_group",
    "lastMessage": "数字化战友已集结...",
    "timestamp": "2026-02-03T10:00:00.000Z"
  },
  {
    "agentId": "legal",
    "lastMessage": "这个违章可以申诉...",
    "timestamp": "2026-02-03T09:30:00.000Z"
  }
]
```

### `GET /chat/history`

获取特定对象的聊天记录。

**Query Parameters:**

- `agentId`: (Required) target agent ID (e.g., `general`, `legal`) or `super_driver_group`.
- `limit`: (Optional) number of messages (default: 20).
- `cursorId`: (Optional) id of the last message for pagination.

**Response:** `Array<Message>`

```json
[
  {
    "id": "msg_123",
    "role": "assistant",
    "type": "legal", // 'user' or agentId
    "content": "你好，有什么可以帮你？",
    "timestamp": "2026-02-03T10:00:00.000Z"
  }
]
```

### `POST /chat/vent` (Core Sending)

发送消息给 AI (支持群聊自动路由)。

**Headers:**

- `Content-Type`: `application/json` (Recommended) OR `multipart/form-data`

**Request Body:**

```json
{
  "content": "我车坏了，怎么办？",
  "routedAgentId": "mechanic" // Optional: Force route to specific agent (Private Chat)
}
```

_Note: If `routedAgentId` is omitted, the system performs auto-routing (Group Chat mode)._

**Response:**

1. **Simple Response (Single Agent):**

```json
{
  "success": true,
  "agentId": "mechanic",
  "content": "别急，先告诉我哪里响？"
}
```

2. **Complex Response (Multi-turn / Routing):**

```json
{
  "success": true,
  "scenarios": [
    { "agentId": "router", "content": "正在为您联系修车老周..." },
    { "agentId": "mechanic", "content": "发个照片来看看。" }
  ]
}
```

---

## 4. TypeScript Interfaces

```typescript
export interface Agent {
  id: string;
  name: string;
  title: string;
  avatar: string;
  description: string;
  style: { color: string };
  isPaid: boolean;
  category: string;
}

export interface UserProfile {
  userId: string;
  nickname?: string;
  avatarId?: string;
  isVip: boolean;
  city?: string;
  consentedAt?: string;
}

export interface Message {
  id: string;
  type: string; // 'user' | agentId
  content: string;
  timestamp: string;
}
```

---

## 5. Development Center (发展中心)

### `GET /enterprises`

获取所有合作企业列表及其入驻状态。

**Response:** `Array<Enterprise>`

```json
[
  {
    "id": "didi",
    "name": "滴滴出行",
    "city": "北京",
    "isBound": true,
    ... // detailed fields
  }
]
```

### `POST /enterprises`

执行企业入驻/绑定操作。

**Request (JSON):**

```json
{
  "action": "toggle",
  "enterpriseId": "didi"
}
```

**Response:**

```json
{
  "isBound": false // New status after toggle
}
```


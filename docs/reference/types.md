# 类型定义参考

> 源文件: [`types.ts`](../../types.ts)

## Agent 相关

```typescript
interface AgentStyle {
  color: string;         // 主题色
  [key: string]: unknown;
}

interface Agent {
  id: string;            // 唯一标识
  name: string;          // 显示名称
  title: string;         // 职称
  avatar: string;        // 头像路径
  description: string;   // 简介
  systemPrompt?: string; // AI 人设
  knowledgePrefix?: string;
  style: AgentStyle;
  keywords: string[];    // 路由关键词
  isPaid: boolean;       // 付费标记
  companyName: string;
  priority: number;      // 排序优先级
  category: string;      // 'native' | 'premium'
  welcomeMessage?: string;
}
```

## 聊天相关

```typescript
interface ChatListItem {
  id: string;
  type: 'group' | 'private';
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string | Date;
  unread?: number;
  agent?: Agent;
}

interface ChatMessage {
  id: string;
  type: string;          // 'user' | agentId
  content: string;
  timestamp: Date | string;
  isTyping?: boolean;
}

type Message = ChatMessage;
```

## 用户相关

```typescript
interface UserProfile {
  userId: string;
  nickname?: string;
  avatarId?: string;
  isVip: boolean;
  consentedAt?: Date | string;
  city?: string;
}
```

## 业务数据

```typescript
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

interface DashboardMetrics {
  revenue: number;
  orders: number;
  onlineHours: number;
  percentile: number;
  status: 'online' | 'offline' | 'busy';
}
```

## 服务事件

```typescript
type ServiceEventType = 'legal_case' | 'insurance_claim' | 'vehicle_repair' | 'compound' | string;
type ServicePriority = 'urgent' | 'high' | 'normal' | 'low';

interface ServiceEvent {
  id: number;
  user_id: number;
  title: string;
  event_type: ServiceEventType;
  status: string;
  priority: ServicePriority;
  total_steps: number;
  completed_steps: number;
  expert_role_ids: string;    // JSON: ["legal","insurance"]
  primary_role_id: string;
  summary: string;
  estimated_cost?: number;
  actual_cost?: number;
  resolved_at?: string;
  createdAt: string;
  updatedAt?: string;
}

interface ServiceStep {
  id: number;
  event_id: number;
  title: string;
  content: string;
  step_type: number;          // 1=analysis 2=action 3=document 4=summary
  role_id: string;
  sort_order: number;
  is_done: number | boolean;
  done_at?: number;
  action_type?: number;
  action_payload?: string;    // JSON string
  source_message_id?: number;
  createdAt: string;
}
```

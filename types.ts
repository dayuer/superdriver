// ============================================================================
// Agent 相关
// ============================================================================

/** [L-05] Agent 样式配置 */
export interface AgentStyle {
  /** Tailwind 颜色类名，如 'bg-red-500' */
  color: string;
  [key: string]: unknown;
}

export interface Agent {
  id: string;
  name: string;
  title: string;
  avatar: string;
  description: string;
  systemPrompt?: string;
  knowledgePrefix?: string;
  style: AgentStyle;
  keywords: string[];
  isPaid: boolean;
  companyName: string;
  priority: number;
  category: string;
  welcomeMessage?: string; // 首次聊天时的欢迎语
}

// ============================================================================
// 聊天相关
// ============================================================================

export interface ChatListItem {
  id: string;
  type: 'group' | 'private';
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string | Date; // API returns string (ISO)
  unread?: number;
  agent?: Agent;
}

export interface ChatMessage {
  id: string;
  type: string;
  content: string;
  timestamp: Date | string;
  isTyping?: boolean;
}

export type Message = ChatMessage;

// ============================================================================
// 用户相关
// ============================================================================

export interface UserProfile {
  userId: string;
  nickname?: string;
  avatarId?: string;
  isVip: boolean;
  consentedAt?: Date | string;
  city?: string;
}

// ============================================================================
// 业务数据
// ============================================================================

/** [L-06] 通用分页响应 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** [L-06] 分页列表响应，替代 `{ data: T[]; pagination: any }` */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface ActionCard {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  title: string;
  content: string;
  timestamp: string;
  type: 'order' | 'issue' | 'alert' | 'health';
  actions: {
    label: string;
    action: string;
    primary?: boolean;
    payload?: Record<string, unknown>;
  }[];
}

export interface DashboardMetrics {
  revenue: number;
  orders: number;
  onlineHours: number;
  percentile: number;
  status: 'online' | 'offline' | 'busy';
}

export interface EnterpriseMetric {
  id: string;
  name: string;
  color: string;
  metrics: DashboardMetrics;
  latestIntel?: string;
  rating?: number;
}

// ============================================================================
// 服务化跟进
// ============================================================================

export type ServiceEventType = 'legal_case' | 'insurance_claim' | 'vehicle_repair' | 'compound' | string;
export type ServicePriority = 'urgent' | 'high' | 'normal' | 'low';
export type ServiceStepType = 'analysis' | 'action' | 'document' | 'summary';

/** 服务事件 — 对应 sd_service_events 表 */
export interface ServiceEvent {
  id: number;
  user_id: number;
  title: string;
  event_type: ServiceEventType;
  status: string;
  priority: ServicePriority;
  total_steps: number;
  completed_steps: number;
  expert_role_ids: string;   // JSON string: ["legal","insurance"]
  primary_role_id: string;
  summary: string;
  estimated_cost?: number;
  actual_cost?: number;
  resolved_at?: string;
  createdAt: string;
  updatedAt?: string;
}

/** 服务步骤 — 对应 sd_service_steps 表 */
export interface ServiceStep {
  id: number;
  event_id: number;
  title: string;
  content: string;
  step_type: number;       // 1=analysis 2=action 3=document 4=summary
  role_id: string;
  sort_order: number;
  is_done: number | boolean; // API 可能返回 0/1 或 false/true
  done_at?: number;        // timestamp ms
  action_type?: number;
  action_payload?: string; // JSON string
  source_message_id?: number;
  createdAt: string;
}

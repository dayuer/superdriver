/**
 * 全局常量配置
 * 应用级别的常量定义
 *
 * [M-004] 合并了根目录 constants.ts 的 AGENTS 数据
 */
import { Platform, Dimensions } from 'react-native';
import { Agent } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// 屏幕尺寸
// ============================================================================

export const SCREEN = {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
} as const;

// ============================================================================
// 动画配置
// ============================================================================

export const ANIMATION = {
    // 头部动画
    header: {
        expandedHeight: Platform.OS === 'ios' ? 200 : 180,
        compactHeight: Platform.OS === 'ios' ? 80 : 70,
        get scrollRange() { return this.expandedHeight - this.compactHeight; },
    },
    // 下拉面板
    dropdown: {
        height: SCREEN_HEIGHT * 0.85,
        tension: 65,
        friction: 11,
    },
    // 悬浮按钮
    fab: {
        size: 60,
        margin: 20,
        minY: 100,
        get maxY() { return SCREEN_HEIGHT - 180; },
    },
} as const;

// ============================================================================
// Tab 栏配置
// ============================================================================

export const TAB_BAR = {
    height: Platform.OS === 'ios' ? 92 : 68,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 10,
} as const;

// ============================================================================
// 发展中心 Tab 配置
// ============================================================================

export type DevelopmentTabId = 'recommend' | 'jobs' | 'community';

export const DEVELOPMENT_TABS: { id: DevelopmentTabId; label: string; icon: string }[] = [
    { id: 'recommend', label: '发现', icon: 'compass' },
    { id: 'jobs', label: '招聘', icon: 'briefcase' },
    { id: 'community', label: '同行圈', icon: 'chatbubbles' },
];

// ============================================================================
// 快捷入口配置
// ============================================================================

export interface QuickEntry {
    id: string;
    icon: string;
    label: string;
    color: string;
    badge?: string;
}

export const QUICK_ENTRIES: QuickEntry[] = [
    { id: 'jobs', icon: 'briefcase', label: '招聘', color: '#007AFF', badge: 'HOT' },
    { id: 'franchise', icon: 'storefront', label: '加盟', color: '#FF9500' },
    { id: 'fleet', icon: 'people', label: '车队', color: '#34C759' },
    { id: 'services', icon: 'apps', label: '服务', color: '#5856D6' },
];

// ============================================================================
// 工作台快捷操作
// ============================================================================

export interface QuickAction {
    id: string;
    icon: string;
    label: string;
    color: string;
    badge?: number;
}

export const WORKBENCH_QUICK_ACTIONS: QuickAction[] = [
    { id: 'orders', icon: 'document-text', label: '今日订单', color: '#007AFF', badge: 10 },
    { id: 'income', icon: 'wallet', label: '收入明细', color: '#FF9500' },
];

// ============================================================================
// 个人中心服务配置
// ============================================================================

export const PROFILE_GRID_SERVICES = [
    { id: 'orders', icon: 'receipt-outline', label: '我的订单', color: '#FF6B35', badge: 0 },
    { id: 'wallet', icon: 'wallet-outline', label: '钱包', color: '#34C759', badge: 0 },
    { id: 'support', icon: 'headset-outline', label: '客服', color: '#007AFF', badge: 1 },
    { id: 'settings', icon: 'settings-outline', label: '设置', color: '#8E8E93', badge: 0 },
];

// ============================================================================
// Agent ID 映射（后端 numeric ↔ 前端 string）
// ============================================================================

/**
 * Agent 字符串 ID → 后端数字 ID 映射
 * 
 * [M-001] 集中管理，避免多处硬编码
 * TODO: 长期方案 — 从后端 /api/agents 接口动态获取映射
 */
export const AGENT_NUMERIC_IDS: Record<string, number> = {
    'general': 1,    // 翔哥
    'mechanic': 2,   // 老周
    'legal': 3,      // 叶律
    'health': 4,     // 林姨
    'algo': 5,       // 阿K
    'metaphysics': 6, // 裴姐
};

/** 反向映射：后端数字 ID → 前端字符串 ID */
export const AGENT_ID_BY_NUMERIC: Record<number, string> = Object.fromEntries(
    Object.entries(AGENT_NUMERIC_IDS).map(([k, v]) => [v, k])
);

/** 核心顾问列表 — 无聊天记录时保底显示 */
export const CORE_ADVISORS: string[] = ['mechanic', 'legal'];

// ============================================================================
// Agent 预设数据（离线 fallback / 默认值）
// ============================================================================

/**
 * 预设 Agent 配置
 * 当后端不可用时作为 fallback，正常情况由 getAgents() API 获取
 */
export const DEFAULT_AGENTS: Record<string, Agent> = {
    'general': {
        id: 'general', name: '翔哥', title: '带头大哥', avatar: '🧢',
        description: '啊也别说了，都是兄弟。心情不好来找我，陪你骂街。',
        systemPrompt: '', knowledgePrefix: 'general',
        style: { color: 'bg-red-500' }, keywords: [],
        category: 'native', priority: 10, isPaid: false, companyName: '',
    },
    'legal': {
        id: 'legal', name: '叶律', title: '律政御姐', avatar: '⚖️',
        description: '别怕惹事。只要你有理，这官司我帮你打到底。',
        systemPrompt: '', knowledgePrefix: 'legal',
        style: { color: 'bg-indigo-600' }, keywords: [],
        category: 'native', priority: 9, isPaid: false, companyName: '',
    },
    'mechanic': {
        id: 'mechanic', name: '老周', title: '避坑技师', avatar: '🔧',
        description: '修车先问我。有些毛病，踹两脚其实就好了。',
        systemPrompt: '', knowledgePrefix: 'mechanic',
        style: { color: 'bg-slate-600' }, keywords: [],
        category: 'native', priority: 8, isPaid: false, companyName: '',
    },
    'health': {
        id: 'health', name: '林姨', title: '健康管家', avatar: '🍵',
        description: '累了就歇会儿。身体是咱们自己的。',
        systemPrompt: '', knowledgePrefix: 'health',
        style: { color: 'bg-emerald-600' }, keywords: [],
        category: 'native', priority: 7, isPaid: false, companyName: '',
    },
    'algo': {
        id: 'algo', name: '阿K', title: '算法游侠', avatar: '💻',
        description: '我看透了派单逻辑。',
        systemPrompt: '', knowledgePrefix: 'algo',
        style: { color: 'bg-violet-600' }, keywords: [],
        category: 'native', priority: 6, isPaid: false, companyName: '',
    },
    'metaphysics': {
        id: 'metaphysics', name: '裴姐', title: '玄学顾问', avatar: '🔮',
        description: '运势也是实力。',
        systemPrompt: '', knowledgePrefix: 'metaphysics',
        style: { color: 'bg-purple-800' }, keywords: [],
        category: 'native', priority: 5, isPaid: false, companyName: '',
    },
};

// Agent 别名
// e.g. agents['yin'] === agents['general']
DEFAULT_AGENTS['yin'] = DEFAULT_AGENTS['general'];
DEFAULT_AGENTS['ye'] = DEFAULT_AGENTS['legal'];
DEFAULT_AGENTS['zhou'] = DEFAULT_AGENTS['mechanic'];
DEFAULT_AGENTS['lin'] = DEFAULT_AGENTS['health'];
DEFAULT_AGENTS['k'] = DEFAULT_AGENTS['algo'];
DEFAULT_AGENTS['pei'] = DEFAULT_AGENTS['metaphysics'];


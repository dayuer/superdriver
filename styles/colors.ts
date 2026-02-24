/**
 * 全局颜色常量
 * 集中管理所有颜色，确保一致性
 */

// 主题色
export const PRIMARY = '#007AFF';
export const SUCCESS = '#34C759';
export const WARNING = '#FF9500';
export const DANGER = '#FF3B30';
export const PURPLE = '#5856D6';
export const GOLD = '#FFD700';

// 状态色映射
export const STATUS_COLORS = {
    online: SUCCESS,
    busy: WARNING,
    offline: '#8E8E93',
} as const;

// 通知类型色映射
export const NOTIFICATION_COLORS = {
    order: PRIMARY,
    finance: SUCCESS,
    alert: WARNING,
    system: DANGER,
    promotion: '#AF52DE',
} as const;

// 平台品牌色
export const PLATFORM_COLORS = {
    didi: '#FF6600',
    huolala: '#00AA00',
    caocao: '#1890FF',
    dida: '#FF4D4F',
    meituan: '#FFD700',
    amap: '#00BFFF',
} as const;

// 背景与界面
export const BACKGROUND = {
    primary: '#FFFFFF',
    secondary: '#F5F5F7',
    card: '#FFFFFF',
    dark: '#1A1A2E',
    darkSecondary: '#16213E',
    darkTertiary: '#0F3460',
} as const;

// 文字颜色
export const TEXT = {
    primary: '#1C1C1E',
    secondary: '#8E8E93',
    tertiary: '#C7C7CC',
    quaternary: '#D1D1D6',
    inverse: '#FFFFFF',
    inverseSecondary: 'rgba(255,255,255,0.7)',
    inverseTertiary: 'rgba(255,255,255,0.5)',
} as const;

// 系统色
export const SYSTEM = {
    blue: '#007AFF',
    green: '#34C759',
    indigo: '#5856D6',
    orange: '#FF9500',
    pink: '#FF2D55',
    purple: '#AF52DE',
    red: '#FF3B30',
    teal: '#5AC8FA',
    yellow: '#FFCC00',
} as const;

// 边框
export const BORDER = {
    light: '#E5E5EA',
    dark: 'rgba(255,255,255,0.1)',
} as const;

// 渐变色组合
export const GRADIENTS = {
    darkHeader: ['#1A1A2E', '#16213E', '#0F3460'] as const,
    purple: ['#667eea', '#764ba2'] as const,
    teal: ['#00C7BE', '#00A89D'] as const,
} as const;

// 导出统一对象供快速访问
export const COLORS = {
    primary: PRIMARY,
    success: SUCCESS,
    warning: WARNING,
    danger: DANGER,
    purple: PURPLE,
    gold: GOLD,
    status: STATUS_COLORS,
    notification: NOTIFICATION_COLORS,
    platform: PLATFORM_COLORS,
    bg: BACKGROUND,
    text: TEXT,
    border: BORDER,
    gradients: GRADIENTS,
};

export default COLORS;

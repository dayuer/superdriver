/**
 * 格式化工具函数
 * 金额、时间、数字等格式化
 */

// ============================================================================
// 金额格式化
// ============================================================================

/**
 * 格式化金额 (保留2位小数)
 * @param amount 金额数值
 * @param prefix 前缀，默认 '¥'
 */
export const formatCurrency = (amount: number, prefix = '¥'): string => {
    // 如果是整数，不显示小数点
    if (Number.isInteger(amount)) {
        return `${prefix}${amount}`;
    }
    return `${prefix}${amount.toFixed(2)}`;
};

/**
 * 格式化金额 (整数)
 */
export const formatCurrencyInt = (amount: number, prefix = '¥'): string => {
    return `${prefix}${Math.floor(amount)}`;
};

/**
 * 格式化大金额 (带单位 万/亿)
 */
export const formatLargeCurrency = (amount: number, prefix = '¥'): string => {
    if (amount >= 100000000) {
        return `${prefix}${(amount / 100000000).toFixed(1)}亿`;
    }
    if (amount >= 10000) {
        return `${prefix}${(amount / 10000).toFixed(1)}万`;
    }
    return formatCurrency(amount, prefix);
};

// ============================================================================
// 时间格式化
// ============================================================================

/**
 * 格式化相对时间
 * @param date 日期对象或ISO字符串
 */
export const formatRelativeTime = (date: Date | string): string => {
    const now = new Date();
    const target = typeof date === 'string' ? new Date(date) : date;
    const diff = now.getTime() - target.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;

    // 超过7天显示日期
    const month = target.getMonth() + 1;
    const day = target.getDate();
    return `${month}月${day}日`;
};

/**
 * 格式化时间戳为 HH:mm
 */
export const formatTime = (date: Date | string): string => {
    const target = typeof date === 'string' ? new Date(date) : date;
    const hours = target.getHours().toString().padStart(2, '0');
    const minutes = target.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

/**
 * 格式化日期为 MM-DD
 */
export const formatDate = (date: Date | string): string => {
    const target = typeof date === 'string' ? new Date(date) : date;
    const month = (target.getMonth() + 1).toString().padStart(2, '0');
    const day = target.getDate().toString().padStart(2, '0');
    return `${month}-${day}`;
};

/**
 * 格式化完整日期时间
 */
export const formatDateTime = (date: Date | string): string => {
    const target = typeof date === 'string' ? new Date(date) : date;
    return `${formatDate(target)} ${formatTime(target)}`;
};

/**
 * 格式化聊天时间戳 (智能显示)
 */
export const formatChatTimestamp = (date: Date | string): string => {
    const now = new Date();
    const target = typeof date === 'string' ? new Date(date) : date;

    const isToday = now.toDateString() === target.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = yesterday.toDateString() === target.toDateString();

    if (isToday) {
        return formatTime(target);
    } else if (isYesterday) {
        return `昨天 ${formatTime(target)}`;
    } else {
        return formatDateTime(target);
    }
};

// ============================================================================
// 数字格式化
// ============================================================================

/**
 * 格式化大数字 (带单位 K/W)
 */
export const formatNumber = (num: number): string => {
    if (num >= 10000) {
        return `${(num / 10000).toFixed(1)}万`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
};

/**
 * 格式化百分比
 */
export const formatPercent = (value: number, decimals = 0): string => {
    return `${value.toFixed(decimals)}%`;
};

/**
 * 格式化时长 (小时)
 */
/**
 * 格式化时长 (小时) - 简短格式
 */
export const formatHours = (hours: number): string => {
    return `${hours.toFixed(1)}h`;
};

/**
 * 格式化百分比变化
 */
export const formatPercentageChange = (value: number): string => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}${value}%`;
};

/**
 * 格式化时间戳 (智能) - 别名
 */
export const formatTimestamp = formatChatTimestamp;


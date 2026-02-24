/**
 * Mock 数据集中管理
 * 开发测试用的模拟数据
 */

// ============================================================================
// 平台数据
// ============================================================================

export interface PlatformBinding {
    id: string;
    name: string;
    logo: string;
    color: string;
    isBound: boolean;
    status: 'online' | 'offline' | 'busy';
    todayRevenue: number;
    todayOrders: number;
    unreadNotifications: number;
}

export const MOCK_PLATFORMS: PlatformBinding[] = [
    { id: 'didi', name: '滴滴出行', logo: '🚕', color: '#FF6600', isBound: true, status: 'online', todayRevenue: 420, todayOrders: 8, unreadNotifications: 3 },
    { id: 'huolala', name: '货拉拉', logo: '🚛', color: '#00AA00', isBound: true, status: 'busy', todayRevenue: 180, todayOrders: 2, unreadNotifications: 1 },
    { id: 'caocao', name: '曹操出行', logo: '🚗', color: '#1890FF', isBound: true, status: 'offline', todayRevenue: 0, todayOrders: 0, unreadNotifications: 0 },
    { id: 'dida', name: '嘀嗒出行', logo: '🚙', color: '#FF4D4F', isBound: false, status: 'offline', todayRevenue: 0, todayOrders: 0, unreadNotifications: 0 },
    { id: 'meituan', name: '美团打车', logo: '🟡', color: '#FFD700', isBound: false, status: 'offline', todayRevenue: 0, todayOrders: 0, unreadNotifications: 0 },
    { id: 'amap', name: '高德打车', logo: '🗺️', color: '#00BFFF', isBound: false, status: 'offline', todayRevenue: 0, todayOrders: 0, unreadNotifications: 0 },
];

// ============================================================================
// 工作流通知
// ============================================================================

export interface WorkflowNotification {
    id: string;
    type: 'order' | 'alert' | 'system' | 'finance' | 'promotion';
    title: string;
    content: string;
    timestamp: string;
    isRead: boolean;
    priority: 'high' | 'medium' | 'low';
    action?: {
        label: string;
        payload: string;
    };
}

export const MOCK_NOTIFICATIONS: WorkflowNotification[] = [
    { id: 'n1', type: 'order', title: '新订单提醒', content: '机场方向有高价值长单，预计收入¥128', timestamp: '刚刚', isRead: false, priority: 'high', action: { label: '抢单', payload: 'grab_order' } },
    { id: 'n2', type: 'finance', title: '收入到账', content: '昨日收入¥580.00已到账银行卡', timestamp: '10分钟前', isRead: false, priority: 'medium' },
    { id: 'n3', type: 'alert', title: '平台通知', content: '滴滴出行：今日高峰期奖励2倍积分', timestamp: '30分钟前', isRead: true, priority: 'medium' },
    { id: 'n4', type: 'system', title: '车辆提醒', content: '电瓶电压偏低，建议尽快检查', timestamp: '1小时前', isRead: true, priority: 'low' },
    { id: 'n5', type: 'promotion', title: '限时活动', content: '完成5单即可获得早高峰红包', timestamp: '2小时前', isRead: true, priority: 'low' },
];

// ============================================================================
// 今日业绩订单数据
// ============================================================================

export interface MockOrder {
    id: string;
    platform: string;
    platformColor: string;
    time: string;
    from: string;
    to: string;
    amount: number;
    type: 'completed' | 'ongoing' | 'cancelled';
    duration: string;
}

export const MOCK_ORDERS: MockOrder[] = [
    { id: '1', platform: '滴滴出行', platformColor: '#FF6600', time: '14:32', from: '虹桥机场T2', to: '人民广场', amount: 128.5, type: 'completed', duration: '42分钟' },
    { id: '2', platform: '货拉拉', platformColor: '#00B578', time: '12:18', from: '静安区仓库', to: '浦东新区', amount: 95.0, type: 'completed', duration: '55分钟' },
    { id: '3', platform: '滴滴出行', platformColor: '#FF6600', time: '10:45', from: '徐汇区', to: '浦东国际机场', amount: 156.0, type: 'completed', duration: '38分钟' },
    { id: '4', platform: '滴滴出行', platformColor: '#FF6600', time: '09:20', from: '陆家嘴', to: '南京路步行街', amount: 42.0, type: 'completed', duration: '18分钟' },
    { id: '5', platform: '货拉拉', platformColor: '#00B578', time: '08:30', from: '嘉定区工厂', to: '青浦物流中心', amount: 85.0, type: 'completed', duration: '35分钟' },
];

// ============================================================================
// 平台收入统计
// ============================================================================

export interface PlatformRevenue {
    name: string;
    logo: string;
    color: string;
    orders: number;
    amount: number;
    percentage: number;
}

export const MOCK_PLATFORM_REVENUE: PlatformRevenue[] = [
    { name: '滴滴出行', logo: '🚕', color: '#FF6600', orders: 7, amount: 420.0, percentage: 72 },
    { name: '货拉拉', logo: '🚛', color: '#00B578', orders: 3, amount: 180.0, percentage: 28 },
    { name: '曹操出行', logo: '🚗', color: '#1A1A2E', orders: 0, amount: 0, percentage: 0 },
];

// ============================================================================
// 城市数据
// ============================================================================

export const HOT_CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '重庆', '苏州', '天津'];

export const CITY_DATA: { [key: string]: string[] } = {
    'A': ['安庆', '安阳', '鞍山', '安康'],
    'B': ['北京', '保定', '包头', '蚌埠', '滨州', '亳州', '北海', '本溪', '白城'],
    'C': ['成都', '重庆', '长沙', '常州', '长春', '沧州', '常德', '赤峰', '潮州', '承德', '池州', '滁州'],
    'D': ['大连', '东莞', '德州', '大同', '丹东', '德阳', '达州', '大庆', '东营'],
    'E': ['鄂尔多斯', '恩施'],
    'F': ['福州', '佛山', '抚州', '阜阳', '抚顺', '防城港'],
    'G': ['广州', '贵阳', '桂林', '赣州', '广元', '广安'],
    'H': ['杭州', '合肥', '哈尔滨', '海口', '惠州', '呼和浩特', '湖州', '邯郸', '衡阳', '淮安', '黄冈', '黄石', '鹤岗', '葫芦岛', '衡水', '菏泽', '怀化', '淮南', '淮北', '汉中', '黄山'],
    'J': ['济南', '嘉兴', '金华', '江门', '吉林', '焦作', '济宁', '九江', '荆州', '荆门', '揭阳', '晋中', '晋城', '酒泉', '吉安'],
    'K': ['昆明', '开封', '克拉玛依'],
    'L': ['兰州', '洛阳', '廊坊', '柳州', '临沂', '连云港', '龙岩', '娄底', '乐山', '泸州', '聊城', '丽水', '六安', '辽阳', '辽源', '吕梁', '漯河', '拉萨', '丽江', '临汾'],
    'M': ['牡丹江', '茂名', '眉山', '绵阳', '马鞍山', '梅州'],
    'N': ['南京', '宁波', '南昌', '南宁', '南通', '南阳', '南充', '内江', '宁德'],
    'P': ['莆田', '平顶山', '盘锦', '濮阳', '萍乡', '攀枝花'],
    'Q': ['青岛', '泉州', '秦皇岛', '齐齐哈尔', '清远', '曲靖', '衢州', '钦州', '庆阳'],
    'R': ['日照', '汝州', '瑞金'],
    'S': ['上海', '深圳', '苏州', '沈阳', '石家庄', '绍兴', '三亚', '汕头', '十堰', '宿迁', '邵阳', '上饶', '韶关', '随州', '遂宁', '商丘', '宿州', '三明', '松原', '朔州'],
    'T': ['天津', '太原', '唐山', '台州', '泰州', '通辽', '铜陵', '铜川', '泰安', '通化', '铁岭'],
    'W': ['武汉', '无锡', '温州', '芜湖', '威海', '潍坊', '乌鲁木齐', '渭南', '梧州', '文山', '吴忠'],
    'X': ['西安', '厦门', '徐州', '西宁', '邢台', '咸阳', '新乡', '许昌', '咸宁', '湘潭', '襄阳', '孝感', '信阳', '忻州', '宣城', '仙桃'],
    'Y': ['烟台', '扬州', '银川', '宜昌', '岳阳', '盐城', '玉林', '运城', '宜宾', '宜春', '营口', '益阳', '玉溪', '延安', '阳泉', '榆林', '永州', '鹰潭'],
    'Z': ['郑州', '珠海', '中山', '淄博', '镇江', '漳州', '株洲', '张家口', '肇庆', '周口', '驻马店', '遵义', '资阳', '自贡', '枣庄', '舟山', '湛江', '张掖'],
};

export const CITY_LETTERS = Object.keys(CITY_DATA).sort();

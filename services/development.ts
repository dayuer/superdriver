/**
 * 发展中心数据服务
 * 封装所有数据获取逻辑，支持缓存和异步加载
 */
import { cacheService, fetchWithCache, CACHE_CONFIG, CacheKey } from './cache';
import { getEnterprises as apiGetEnterprises, toggleEnterprise as apiToggleEnterprise } from './api';

// 数据类型定义
export interface EnterpriseData {
    id: string;
    name: string;
    logoColor: string;
    logoText: string;
    city: string;
    category: string;
    tags: string[];
    description: string;
    incentives: string[];
    requirements: string;
    isBound: boolean;
    memberCount: number;
    rating: number;
}

export interface JobPosition {
    id: string;
    title: string;
    company: string;
    salary: string;
    city: string;
    tags: string[];
    isHot: boolean;
    isNew: boolean;
    logoColor: string;
    logoText: string;
}

export interface FranchiseItem {
    id: string;
    name: string;
    category: string;
    investment: string;
    profit: string;
    logoColor: string;
    logoText: string;
    advantage: string;
}

// 预置数据 - 导出供组件立即使用，实现即时渲染
// 后续可以替换为 API 调用
export const INITIAL_JOBS: JobPosition[] = [
    { id: 'j1', title: '网约车司机', company: '滴滴出行', salary: '8K-15K', city: '北京', tags: ['五险一金', '弹性工作'], isHot: true, isNew: true, logoColor: '#FF6600', logoText: '滴' },
    { id: 'j2', title: '货运司机', company: '货拉拉', salary: '10K-18K', city: '上海', tags: ['包吃住', '高提成'], isHot: true, isNew: false, logoColor: '#00AA00', logoText: '货' },
    { id: 'j3', title: '专车司机', company: '曹操出行', salary: '9K-16K', city: '杭州', tags: ['新能源', '补贴多'], isHot: false, isNew: true, logoColor: '#1890FF', logoText: '曹' },
    { id: 'j4', title: '顺风车车主', company: '嘀嗒出行', salary: '灵活收入', city: '全国', tags: ['兼职可', '顺路赚'], isHot: false, isNew: false, logoColor: '#FF4D4F', logoText: '嘀' },
];

// 预置加盟数据 - 导出供组件立即使用
export const INITIAL_FRANCHISE: FranchiseItem[] = [
    { id: 'f1', name: '京东物流站点', category: '物流配送', investment: '20-50万', profit: '年利润50万+', logoColor: '#E1251B', logoText: '京', advantage: '品牌背书，货源稳定' },
    { id: 'f2', name: '顺丰速运代理', category: '快递物流', investment: '30-80万', profit: '年利润80万+', logoColor: '#000000', logoText: '顺', advantage: '高端市场，利润丰厚' },
    { id: 'f3', name: '货拉拉城市合伙人', category: '同城货运', investment: '10-30万', profit: '年利润30万+', logoColor: '#00AA00', logoText: '货', advantage: '轻资产，收益快' },
    { id: 'f4', name: '满帮集团区域代理', category: '长途货运', investment: '50-100万', profit: '年利润100万+', logoColor: '#FF6600', logoText: '满', advantage: '垄断资源，持续收益' },
];

/**
 * 数据加载状态
 */
export interface LoadingState {
    enterprises: boolean;
    jobs: boolean;
    franchise: boolean;
}

/**
 * 发展中心数据 Hook 返回类型
 */
export interface DevelopmentData {
    enterprises: EnterpriseData[];
    jobs: JobPosition[];
    franchise: FranchiseItem[];
    loading: LoadingState;
    error: string | null;
}

/**
 * 获取企业数据（带缓存）
 */
export async function getEnterprises(options: {
    forceRefresh?: boolean;
    onStaleData?: (data: EnterpriseData[]) => void;
} = {}): Promise<EnterpriseData[]> {
    return fetchWithCache<EnterpriseData[]>(
        'enterprises',
        async () => {
            const data = await apiGetEnterprises();
            return data || [];
        },
        {
            ttl: CACHE_CONFIG.ENTERPRISES_TTL,
            forceRefresh: options.forceRefresh,
            onStaleData: options.onStaleData,
        }
    );
}

/**
 * 获取招聘数据（带缓存）
 * 当前使用 Mock 数据，后续可替换为 API 调用
 */
export async function getJobs(options: {
    forceRefresh?: boolean;
    onStaleData?: (data: JobPosition[]) => void;
} = {}): Promise<JobPosition[]> {
    // TODO: 替换为真实 API 调用
    // return fetchWithCache<JobPosition[]>(
    //     'jobs',
    //     async () => { const res = await api.get('/jobs'); return res.data; },
    //     { ttl: CACHE_CONFIG.JOBS_TTL, ...options }
    // );

    // 直接返回预置数据，无延迟
    return INITIAL_JOBS;
}

/**
 * 获取加盟数据（带缓存）
 * 当前使用 Mock 数据，后续可替换为 API 调用
 */
export async function getFranchise(options: {
    forceRefresh?: boolean;
    onStaleData?: (data: FranchiseItem[]) => void;
} = {}): Promise<FranchiseItem[]> {
    // TODO: 替换为真实 API 调用
    // 直接返回预置数据，无延迟
    return INITIAL_FRANCHISE;
}

/**
 * 并行加载所有发展中心数据
 * 使用 Promise.allSettled 确保部分失败不影响其他数据
 */
export async function loadAllDevelopmentData(options: {
    forceRefresh?: boolean;
    onEnterprisesLoaded?: (data: EnterpriseData[]) => void;
    onJobsLoaded?: (data: JobPosition[]) => void;
    onFranchiseLoaded?: (data: FranchiseItem[]) => void;
} = {}): Promise<DevelopmentData> {
    const startTime = Date.now();
    console.log('[DevelopmentService] Starting parallel data load...');

    const results = await Promise.allSettled([
        getEnterprises({
            forceRefresh: options.forceRefresh,
            onStaleData: options.onEnterprisesLoaded,
        }),
        getJobs({ forceRefresh: options.forceRefresh }),
        getFranchise({ forceRefresh: options.forceRefresh }),
    ]);

    const [enterprisesResult, jobsResult, franchiseResult] = results;

    const data: DevelopmentData = {
        enterprises: enterprisesResult.status === 'fulfilled' ? enterprisesResult.value : [],
        jobs: jobsResult.status === 'fulfilled' ? jobsResult.value : [],
        franchise: franchiseResult.status === 'fulfilled' ? franchiseResult.value : [],
        loading: {
            enterprises: false,
            jobs: false,
            franchise: false,
        },
        error: null,
    };

    // 收集错误信息
    const errors: string[] = [];
    if (enterprisesResult.status === 'rejected') {
        errors.push('企业数据加载失败');
        console.error('[DevelopmentService] Enterprises load failed:', enterprisesResult.reason);
    }
    if (jobsResult.status === 'rejected') {
        errors.push('招聘数据加载失败');
        console.error('[DevelopmentService] Jobs load failed:', jobsResult.reason);
    }
    if (franchiseResult.status === 'rejected') {
        errors.push('加盟数据加载失败');
        console.error('[DevelopmentService] Franchise load failed:', franchiseResult.reason);
    }

    if (errors.length > 0) {
        data.error = errors.join('; ');
    }

    console.log(`[DevelopmentService] Data load completed in ${Date.now() - startTime}ms`);

    return data;
}

/**
 * 切换企业绑定状态
 * 同时更新本地缓存
 */
export async function toggleEnterpriseBind(enterpriseId: string): Promise<{ isBound: boolean }> {
    const result = await apiToggleEnterprise(enterpriseId);

    // 更新本地缓存中的企业数据
    const cached = await cacheService.get<EnterpriseData[]>('enterprises');
    if (cached) {
        const updated = cached.map(ent =>
            ent.id === enterpriseId
                ? { ...ent, isBound: result.isBound }
                : ent
        );
        await cacheService.set('enterprises', updated, CACHE_CONFIG.ENTERPRISES_TTL);
    }

    return result;
}

/**
 * 预加载发展中心数据
 * 在 App 启动或进入页面前调用
 */
export async function preloadDevelopmentData(): Promise<void> {
    console.log('[DevelopmentService] Preloading data...');

    // 检查缓存是否存在且有效
    const cached = await cacheService.get<EnterpriseData[]>('enterprises');
    if (cached && cached.length > 0) {
        console.log('[DevelopmentService] Valid cache exists, skip preload');
        return;
    }

    // 无有效缓存，后台加载
    loadAllDevelopmentData().catch(e => {
        console.error('[DevelopmentService] Preload failed:', e);
    });
}

/**
 * 清除发展中心相关缓存
 */
export async function clearDevelopmentCache(): Promise<void> {
    await Promise.all([
        cacheService.delete('enterprises'),
        cacheService.delete('jobs'),
        cacheService.delete('franchise'),
    ]);
    console.log('[DevelopmentService] Cache cleared');
}

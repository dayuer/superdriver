/**
 * MUD 社区 API Service
 *
 * SuperDriver 前端对接 survival 后端的 MUD 专属 API。
 * 复用主 api 实例 (含 auth token + 签名拦截器)。
 *
 * @alpha: MUD 前端 V1.0
 */

import api from './api';

// ============================================================================
// 辅助
// ============================================================================

const unwrap = <T>(res: { data: { success?: boolean; data?: T } | T }): T => {
    const d = res.data;
    if (d && typeof d === 'object' && 'data' in d && 'success' in d) return (d as any).data;
    return d as T;
};

// ============================================================================
// Types — 玩家档案
// ============================================================================

// @alpha: 对齐数据平台 mud_profiles 表 schema
export interface MudProfile {
    id: string;
    userId: string;
    professionCode: string;    // DB: profession_code (非 profession)
    rank: string;
    qi: number;
    silver: number;
    equipment: string | null;  // DB: equipment (JSON)
    battleCount: number;       // DB: battle_count (非 dailyBattles)
    guildId: string | null;    // DB: guild_id
    tenantId: string | null;   // DB: tenant_id
}

// ============================================================================
// Types — NPC 事件
// ============================================================================

export interface NpcEvent {
    id: string;
    sourceType: string;
    npcType: string;
    npcName: string;
    npcDialogue: string;
    geoLat: number | null;
    geoLng: number | null;
    geoRadius: number | null;
    targetProfession: string | null;
    expiresAt: string;
}

// ============================================================================
// Types — 恩怨台
// ============================================================================

export interface ArenaNpc {
    name: string;
    type: string;
    level: number;
    dialogue: string;
    weakness: string;
}

export interface BattleResult {
    victory: boolean;
    log: string[];
    reward: { type: string; amount: number; label: string };
    qiGained: number;
}

// ============================================================================
// Types — 悬赏
// ============================================================================

// @alpha: 对齐数据平台 mud_bounties 表 schema
export interface Bounty {
    id: string;
    publisherId: string;
    targetProfession: string;
    content: string;
    mudContent: string | null;      // DB: mud_content
    reward: number;
    status: string;                 // open | accepted | completed | expired | cancelled
    takerId: string | null;         // DB: taker_id
    takenAt: string | null;         // DB: taken_at
    relatedOrderId: string | null;  // DB: related_order_id
    geoLat: number | null;          // DB: geo_lat
    geoLng: number | null;          // DB: geo_lng
    tenantId: string | null;        // DB: tenant_id
}

// ============================================================================
// Types — 公会
// ============================================================================

export interface Guild {
    id: string;
    masterUserId: string;
    guildName: string;
    faction: string;
    inviteCode: string;
    treasury: number;
    memberCount: number;
    maxMembers: number;
}

// ============================================================================
// Types — 商店
// ============================================================================

export interface ShopItem {
    id: string;
    itemName: string;
    itemType: string;
    priceSilver: number;
    stock: number | null;
    description: string | null;
}

// ============================================================================
// Types — 语音
// ============================================================================

export interface VoiceQuota {
    dailyFreeRemaining: number;
    credits: number;
    dailyFreeLimit: number;
}

export interface VoiceResult {
    text: string;
    durationMs: number;
    source: 'free' | 'credit';
    message: string;
}

export interface CreditPack {
    id: string;
    credits: number;
    priceSilver: number;
    label: string;
}

// ============================================================================
// 档案 API
// ============================================================================

/** 获取/创建 MUD 档案 */
export async function getMudProfile(): Promise<MudProfile | null> {
    try {
        const res = await api.get('/community/mud-profile');
        return unwrap(res);
    } catch { return null; }
}

/** 创建档案 (选职业 + 起名号) */
export async function createMudProfile(profession: string, alias?: string): Promise<MudProfile> {
    const res = await api.post('/community/mud-profile', { profession, alias });
    return unwrap(res);
}

// ============================================================================
// NPC 事件 API
// ============================================================================

/** 获取活跃 NPC 事件 */
export async function getNpcEvents(opts?: {
    profession?: string;
    lat?: number;
    lng?: number;
    limit?: number;
}): Promise<{ events: NpcEvent[]; count: number }> {
    const res = await api.get('/community/npc-events', { params: opts });
    return unwrap(res);
}

// @alpha: 对齐后端 POST /community/npc-events body 字段
export async function reportRoadblock(data: {
    eventType?: string;
    description: string;
    geoLat?: number;
    geoLng?: number;
}): Promise<{ eventId: string; eventType: string }> {
    const res = await api.post('/community/npc-events', {
        eventType: data.eventType || 'roadblock',
        description: data.description,
        geoLat: data.geoLat,
        geoLng: data.geoLng,
    });
    return unwrap(res);
}

// ============================================================================
// 恩怨台 API
// ============================================================================

/** 生成 NPC 对手 */
export async function generateArenaNpc(): Promise<{ npc: ArenaNpc }> {
    const res = await api.post('/community/arena', { action: 'generate' });
    return unwrap(res);
}

/** 执行战斗 */
export async function executeBattle(skillIndex: number): Promise<BattleResult> {
    const res = await api.post('/community/arena', { action: 'battle', skillIndex });
    return unwrap(res);
}

/** 剩余战斗次数 */
export async function getRemainingBattles(): Promise<{ remaining: number; limit: number }> {
    const res = await api.get('/community/arena');
    return unwrap(res);
}

// ============================================================================
// 悬赏 API
// ============================================================================

export async function getBounties(opts?: {
    status?: string;
    profession?: string;
    page?: number;
}): Promise<{ bounties: Bounty[]; pagination: any }> {
    const res = await api.get('/community/bounties', { params: opts });
    return unwrap(res);
}

/**
 * @deprecated 悬赏通过订单转化产生（截图上报 → OCR → 悬赏转化），不支持手动发布
 * @see uploadOrderScreenshot
 */
export async function publishBounty(_data: {
    targetProfession: string;
    content: string;
    reward?: number;
}): Promise<never> {
    throw new Error('[MUD] 悬赏不支持手动发布，请使用「上报战果」截图识别流程');
}

// @alpha: 对齐后端 POST /community/bounties/{id}/accept (RESTful 路径参数)
export async function takeBounty(bountyId: string): Promise<{
    bountyId: string;
    status: string;
    takerId: string;
    takenAt: string;
}> {
    const res = await api.post(`/community/bounties/${bountyId}/accept`);
    return unwrap(res);
}

// @alpha: 新增 — 对齐后端 POST /community/bounties/{id}/complete
export async function completeBounty(bountyId: string): Promise<{
    bountyId: string;
    status: string;
    reward: {
        silver: number;
        qi: number;
        newSilver?: number;
        newQi?: number;
        newBattleCount?: number;
    };
}> {
    const res = await api.post(`/community/bounties/${bountyId}/complete`);
    return unwrap(res);
}

/** 上报战果 — 截图识别订单 → 悬赏转化 */
export async function uploadOrderScreenshot(
    imageBase64: string,
    mimeType: string = 'image/jpeg',
): Promise<{ data: any }> {
    const res = await api.post('/community/bounties/upload-screenshot', {
        image: imageBase64,
        mimeType,
    });
    return unwrap(res);
}

// ============================================================================
// 公会 API
// ============================================================================

export async function getGuildInfo(): Promise<Guild | null> {
    try {
        const res = await api.get('/community/guilds');
        const data = unwrap(res) as any;
        return data.guild || null;
    } catch { return null; }
}

export async function createGuild(guildName: string, faction: string): Promise<Guild> {
    const res = await api.post('/community/guilds', { action: 'create', guildName, faction });
    return unwrap(res);
}

export async function joinGuild(inviteCode: string): Promise<{ message: string }> {
    const res = await api.post('/community/guilds', { action: 'join', inviteCode });
    return unwrap(res);
}

// ============================================================================
// 黑市商店 API
// ============================================================================

export async function getShopItems(): Promise<{ items: ShopItem[] }> {
    const res = await api.get('/community/shop');
    return unwrap(res);
}

export async function exchangeItem(itemId: string): Promise<{ message: string }> {
    const res = await api.post('/community/shop', { itemId });
    return unwrap(res);
}

// ============================================================================
// 语音 API
// ============================================================================

export async function getVoiceQuota(): Promise<{ quota: VoiceQuota }> {
    const res = await api.get('/community/voice/quota');
    return unwrap(res);
}

export async function uploadVoice(formData: FormData): Promise<VoiceResult> {
    const res = await api.post('/community/voice/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(res);
}

export async function getCreditPacks(): Promise<{ packs: CreditPack[] }> {
    const res = await api.get('/community/voice/buy-credits');
    return unwrap(res);
}

export async function buyCredits(packId: string): Promise<{
    creditsAdded: number;
    totalCredits: number;
    silverCost: number;
    message: string;
}> {
    const res = await api.post('/community/voice/buy-credits', { packId });
    return unwrap(res);
}

// ============================================================================
// 合规 / 免责
// ============================================================================

export async function getDisclaimer(): Promise<string> {
    try {
        const res = await api.get('/config', { params: { key: 'mud_community_disclaimer' } });
        const data = unwrap(res) as any;
        return data.value || '本社区为虚拟武侠世界，内容不代表真实事件。';
    } catch {
        return '本社区为虚拟武侠世界，内容不代表真实事件。';
    }
}

// ============================================================================
// 门派/阵营数据
// ============================================================================

export async function getFactions(): Promise<any[]> {
    const res = await api.get('/community/factions');
    const data = unwrap(res) as any;
    return data.factions || [];
}

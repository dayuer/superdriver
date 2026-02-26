/**
 * App.tsx - 应用根组件
 *
 * 路由逻辑：
 * - 首页 FAB 按下 → 语音录制遮罩 → 创建服务事件 → 跳服务Tab
 * - 服务Tab → 事件列表 → 详情（含内嵌对话）
 * - OmniOrb 悬浮球 → Agent 直接对话入口（全局可用）
 */
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth } from './hooks/useAuth';
import { useAppData } from './hooks/useAppData';

// ── SDK 导入（业务层唯一联系点）──
import { AgentProvider, useAgent, OmniOrb } from './packages/agent-sdk';
import { getAccessToken } from './lib/security';

import WorkbenchScreen from './components/WorkbenchScreen';
import { AgentProfile } from './components/AgentProfile';
import DevelopmentCenter from './components/DevelopmentCenter';
import { ServiceScreen, VoiceRecordingOverlay } from './components/service';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import TabBar, { TabId } from './components/TabBar';

import { Agent } from './types';
import { BASE_URL } from './services/api';
import { preloadDevelopmentData } from './services/development';



export default function App() {
    const [activeTab, setActiveTab] = useState<TabId>('mission');
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [showVoice, setShowVoice] = useState(false);
    const [pendingEventId, setPendingEventId] = useState<number | null>(null);

    const auth = useAuth();
    const data = useAppData();

    useEffect(() => {
        auth.onAuthReady(async () => {
            // 并行：主数据 + 发展中心预加载
            await Promise.all([
                data.loadAppData(),
                preloadDevelopmentData(),
            ]);
        });
    }, [data.loadAppData]);

    // FAB 按下 → 直接开始语音
    const handleVoicePress = useCallback(() => {
        setShowVoice(true);
    }, []);

    // 服务创建完成
    const handleServiceCreated = useCallback((eventId: number) => {
        setPendingEventId(eventId);
        setActiveTab('contacts');
    }, []);

    // 语音确认发送 → 创建事件
    const handleVoiceSend = useCallback(async (text: string) => {
        setShowVoice(false);
        if (__DEV__) console.log('[App] handleVoiceSend:', { text: text.slice(0, 30) });
        try {
            // [C-03 修复] 使用带认证的 api 实例替代裸 fetch
            const { data: result } = await (await import('./services/api')).default.post('/service/events', {
                title: text.slice(0, 50),
                event_type: 'compound',
                status: 'consulting',
                priority: 'normal',
                summary: text,
                expert_role_ids: '["general"]',
                primary_role_id: 'general',
                total_steps: 0,
            });
            if (__DEV__) console.log('[App] create event result:', result);
            if (result.success && result.data?.id) {
                handleServiceCreated(result.data.id);
            } else {
                console.warn('[App] create event failed:', result);
            }
        } catch (e) {
            console.warn('[App] create event error:', e);
        }
    }, [handleServiceCreated]);

    const renderContent = () => {
        switch (activeTab) {
            case 'mission':
                return <WorkbenchScreen onVoicePress={handleVoicePress} onRefresh={data.refreshAppData} />;
            case 'contacts':
                return (
                    <ServiceScreen
                        agentsMap={data.agentsMap}
                        pendingEventId={pendingEventId}
                        onPendingConsumed={() => setPendingEventId(null)}
                        onVoicePress={handleVoicePress}
                    />
                );
            case 'shop':
                return <DevelopmentCenter />;
            case 'me':
                return <ProfileScreen profile={data.profile || undefined} onRefresh={data.loadAppData} />;
        }
    };

    if (auth.isCheckingAuth) {
        return (
            <SafeAreaProvider>
                <StatusBar barStyle="dark-content" backgroundColor="#F5F5F7" />
                <View style={[styles.container, styles.loadingContainer]}>
                    <ActivityIndicator size="large" color="#667eea" />
                    <Text style={styles.loadingText}>正在加载...</Text>
                </View>
            </SafeAreaProvider>
        );
    }

    if (!auth.isLoggedIn) {
        return (
            <SafeAreaProvider>
                <LoginScreen onLoginSuccess={auth.handleLoginSuccess} />
            </SafeAreaProvider>
        );
    }

    // ── WS 地址推导 ──
    const wsUrl = (() => {
        try {
            const url = new URL(BASE_URL);
            if (__DEV__) return `ws://${url.hostname}:3002`;
            const isSecure = url.protocol === 'https:';
            return `${isSecure ? 'wss' : 'ws'}://${url.host}/ws`;
        } catch {
            return 'ws://localhost:3002';
        }
    })();

    return (
        <SafeAreaProvider>
            <AgentProvider
                serverUrl={wsUrl}
                authProvider={getAccessToken}
            >
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                <View style={styles.container}>
                    <View style={{ flex: 1 }}>{renderContent()}</View>

                    <TabBar
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        unreadCount={data.totalUnread}
                    />

                    {/* 语音遮罩 — 服务事件创建入口 */}
                    <VoiceRecordingOverlay
                        visible={showVoice}
                        onCancel={() => setShowVoice(false)}
                        onSend={handleVoiceSend}
                    />

                    {/* 全能交互球 — 通过 SDK 提供 */}
                    <AgentOmniOrb />

                    {selectedAgent && (
                        <AgentProfile
                            agent={selectedAgent}
                            visible={true}
                            onClose={() => setSelectedAgent(null)}
                            onChat={() => {
                                setSelectedAgent(null);
                                setShowVoice(true);
                            }}
                        />
                    )}
                </View>
            </AgentProvider>
        </SafeAreaProvider>
    );
}

/**
 * 悬浮球包装：内部使用 SDK 的 useAgent Hook
 * 必须在 AgentProvider 内部渲染
 */
function AgentOmniOrb() {
    const claw = useAgent();
    return (
        <OmniOrb
            state={claw.phase}
            onLongPress={claw.startListening}
            onRelease={() => claw.stopListening('')}
            onTap={claw.togglePanel}
            onAbort={claw.abort}
            responseText={claw.responseText}
            agentName={claw.agentName}
            expanded={claw.expanded}
        />
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    loadingContainer: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F7' },
    loadingText: { marginTop: 12, fontSize: 14, color: '#8E8E93' },
});

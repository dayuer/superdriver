/**
 * useCargoMatch - 货源匹配 Hook
 */
import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import {
    getRecommendedCargos,
    acceptCargoMatch,
    rejectCargoMatch,
    CargoMatch,
} from '../services/recruitment-api';

export interface UseCargoMatchReturn {
    matches: CargoMatch[];
    loading: boolean;
    refreshing: boolean;
    loadMatches: () => Promise<void>;
    handleAccept: (match: CargoMatch) => Promise<void>;
    handleReject: (match: CargoMatch) => Promise<void>;
    refresh: () => Promise<void>;
}

export function useCargoMatch(): UseCargoMatchReturn {
    const [matches, setMatches] = useState<CargoMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadMatches = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getRecommendedCargos({ status: 'matched', limit: 20 });
            setMatches(response.data);
        } catch (error) {
            Alert.alert('加载失败', '无法获取推荐货源，请稍后重试');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleAccept = useCallback(async (match: CargoMatch) => {
        try {
            await acceptCargoMatch(match.id);
            Alert.alert('抢单成功！', '请及时联系货主确认装货细节');
            setMatches(prev => prev.filter(m => m.id !== match.id));
        } catch (error) {
            Alert.alert('抢单失败', error instanceof Error ? error.message : '请稍后重试');
        }
    }, []);

    const handleReject = useCallback(async (match: CargoMatch) => {
        try {
            await rejectCargoMatch(match.id);
            setMatches(prev => prev.filter(m => m.id !== match.id));
        } catch (error) {
            console.error('拒绝失败:', error);
        }
    }, []);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        await loadMatches();
        setRefreshing(false);
    }, [loadMatches]);

    useEffect(() => {
        loadMatches();
    }, [loadMatches]);

    return {
        matches,
        loading,
        refreshing,
        loadMatches,
        handleAccept,
        handleReject,
        refresh,
    };
}

export default useCargoMatch;

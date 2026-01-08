import { useState, useCallback } from 'react';
import api from '../services/api';

export type RelayEligibility = {
    eligible: boolean;
    reason?: string;
};

export type RelayObjectType = 'content' | 'prediction' | 'drop' | 'campaign' | 'event' | 'coupon' | 'season';

export type RelayParams = {
    objectType: RelayObjectType;
    objectId: string;
    parentRelayId?: string;
    context?: any;
};

export const useRelay = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkEligibility = useCallback(async (objectType: RelayObjectType, objectId: string): Promise<RelayEligibility> => {
        try {
            const { data } = await api.get<RelayEligibility>(`/relays/check-eligibility?objectType=${objectType}&objectId=${objectId}`);
            return data || { eligible: false, reason: 'Unknown error' };
        } catch (err: any) {
            const msg = err.message || 'Failed to check eligibility';
            //  setError(msg); // Don't set main error state for check, just return
            return { eligible: false, reason: msg };
        }
    }, []);

    const createRelay = useCallback(async (params: RelayParams): Promise<{ success: boolean; data?: any }> => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.post<any>('/relays', params);
            return { success: true, data };
        } catch (err: any) {
            const msg = err.message || 'Failed to relay object';
            setError(msg);
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        checkEligibility,
        createRelay,
        isLoading,
        error,
        clearError: () => setError(null)
    };
};

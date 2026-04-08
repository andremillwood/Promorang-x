import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Helper to get API URL
const getApiUrl = () => {
    // Replace with your actual production API URL or local IP for dev
    // For iOS Simulator, localhost works. For Android, 10.0.2.2.
    // For physical device, use your machine's LAN IP.
    const localhost = Platform.OS === 'ios' ? 'http://localhost:3000' : 'http://10.0.2.2:3000';
    return process.env.EXPO_PUBLIC_API_URL || localhost;
};

export interface PayoutMethod {
    id: string;
    method_type: 'bank_transfer' | 'paypal' | 'venmo' | 'other';
    details: any;
    is_default: boolean;
    created_at: string;
}

export interface WithdrawalRequest {
    id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    created_at: string;
}

export function usePayouts() {
    const { user, session } = useAuth();
    const [methods, setMethods] = useState<PayoutMethod[]>([]);
    const [history, setHistory] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch Methods (Direct DB)
    const fetchMethods = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('user_payout_methods')
                .select('*')
                .eq('user_id', user.id)
                .order('is_default', { ascending: false });

            if (error) throw error;
            setMethods(data || []);
        } catch (err: any) {
            console.error('Error fetching payout methods:', err);
            setError(err.message);
        }
    };

    // Fetch History (Direct DB)
    const fetchHistory = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('withdrawal_requests')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setHistory(data || []);
        } catch (err: any) {
            console.error('Error fetching withdrawal history:', err);
            setError(err.message);
        }
    };

    // Add Method (Direct DB)
    const addPayoutMethod = async (type: string, details: any) => {
        if (!user) return;
        setLoading(true);
        try {
            // Unset other defaults if this is default (omitted for MVP simplicity)
            const { error } = await supabase
                .from('user_payout_methods')
                .insert({
                    user_id: user.id,
                    method_type: type,
                    details,
                    is_default: methods.length === 0 // First one is default
                });

            if (error) throw error;
            await fetchMethods();
            return { success: true };
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Request Withdrawal (VIA API for Logic)
    const requestWithdrawal = async (amount: number, payoutMethodId: string) => {
        if (!user || !session) return;
        setLoading(true);
        try {
            const API_URL = getApiUrl();
            const response = await fetch(`${API_URL}/api/payouts/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ amount, payoutMethodId })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Withdrawal failed');

            await fetchHistory(); // Refresh history
            return { success: true, transaction: data.transaction };
        } catch (err: any) {
            console.error('Withdrawal Error:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMethods();
            fetchHistory();
            setLoading(false);
        }
    }, [user]);

    return {
        methods,
        history,
        loading,
        error,
        addPayoutMethod,
        requestWithdrawal,
        refresh: () => { fetchMethods(); fetchHistory(); }
    };
}

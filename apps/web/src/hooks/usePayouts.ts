import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    payout_method: PayoutMethod;
    created_at: string;
    admin_note?: string;
}

export const usePayouts = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [methods, setMethods] = useState<PayoutMethod[]>([]);
    const [history, setHistory] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchMethods();
            fetchHistory();
        }
    }, [user]);

    const fetchMethods = async () => {
        try {
            // Direct supabase call for simplicity or via API endpoint if preferred
            // Using API endpoint as per plan
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payouts/methods`, {
                headers: {
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                }
            });
            const data = await response.json();
            if (data.methods) setMethods(data.methods);
        } catch (error) {
            console.error('Error fetching payout methods:', error);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payouts/history`, {
                headers: {
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                }
            });
            const data = await response.json();
            if (data.history) setHistory(data.history);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching withdrawal history:', error);
            setLoading(false);
        }
    };

    const addPayoutMethod = async (type: string, details: any, isDefault: boolean = false) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payouts/methods`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                },
                body: JSON.stringify({ type, details, is_default: isDefault })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to add method');

            toast({
                title: "Success",
                description: "Payout method added successfully.",
            });

            fetchMethods();
            return data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
            throw error;
        }
    };

    const requestWithdrawal = async (amount: number, payoutMethodId: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payouts/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                },
                body: JSON.stringify({ amount, payout_method_id: payoutMethodId })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to request withdrawal');

            toast({
                title: "Request Submitted",
                description: "Your withdrawal request is pending review.",
            });

            fetchHistory();
            return data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
            throw error;
        }
    };

    return {
        methods,
        history,
        loading,
        addPayoutMethod,
        requestWithdrawal,
        refresh: () => { fetchMethods(); fetchHistory(); }
    };
};

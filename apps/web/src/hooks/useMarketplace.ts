import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useMarketplace = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [processing, setProcessing] = useState(false);

    const purchase = async (productId: string, method: 'cash' | 'points', quantity: number = 1) => {
        if (!user) {
            toast({
                title: "Authentication Required",
                description: "Please sign in to make a purchase.",
                variant: "destructive"
            });
            return;
        }

        setProcessing(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/marketplace/purchase`, { // Updated to use correct endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                },
                body: JSON.stringify({ product_id: productId, method, quantity })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Purchase failed');

            toast({
                title: "Success!",
                description: data.message || "Transaction completed.",
            });

            return data;
        } catch (error: any) {
            toast({
                title: "Purchase Failed",
                description: error.message,
                variant: "destructive"
            });
            throw error;
        } finally {
            setProcessing(false);
        }
    };

    return {
        purchase,
        processing
    };
};

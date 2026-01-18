import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { apiFetch } from '../utils/api';

export function useCart() {
    const { user } = useAuth() as any;
    const [itemCount, setItemCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchCartCount = useCallback(async () => {
        if (!user) {
            setItemCount(0);
            return;
        }
        try {
            setLoading(true);
            const response = await apiFetch('/api/marketplace/cart');
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.data.cart) {
                    const count = data.data.cart.cart_items.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
                    setItemCount(count);
                } else {
                    setItemCount(0);
                }
            }
        } catch (error) {
            console.error('Failed to fetch cart count:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchCartCount();
        } else {
            setItemCount(0);
        }

        // Listen for custom event 'cart-updated' for cross-component sync
        const handleUpdate = () => {
            fetchCartCount();
        };

        window.addEventListener('cart-updated', handleUpdate);
        return () => window.removeEventListener('cart-updated', handleUpdate);
    }, [user, fetchCartCount]);

    return { itemCount, loading, refreshCart: fetchCartCount };
}

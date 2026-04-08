import { create } from 'zustand';
import { api } from '@/lib/api';
import { Product, ProductCategory, ShoppingCart, Store } from '../types';

interface ProductState {
    products: Product[];
    categories: ProductCategory[];
    cart: ShoppingCart | null;
    isLoading: boolean;
    error: string | null;

    fetchProducts: (filters?: any) => Promise<void>;
    fetchCategories: () => Promise<void>;
    fetchProductById: (productId: string) => Promise<Product | null>;
    fetchCart: () => Promise<void>;
    addToCart: (productId: string, quantity: number) => Promise<boolean>;
    removeFromCart: (itemId: string) => Promise<boolean>;
    fetchStore: (identifier: string) => Promise<Store | null>;
    fetchStoreProducts: (storeId: string) => Promise<Product[]>;
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    categories: [],
    cart: null,
    isLoading: false,
    error: null,

    fetchProducts: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const data = await api.get<any>(`/api/marketplace/products?${queryParams}`);
            if (data.status === 'success' || data.success) {
                set({ products: data.data?.products || data.products || [] });
            } else {
                set({ error: data.message || 'Failed to fetch products' });
            }
        } catch (error: any) {
            console.error('Fetch products error:', error);
            set({ error: error.message || 'Network error or server unavailable' });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchCategories: async () => {
        try {
            const data = await api.get<any>('/api/marketplace/categories');
            if (data.status === 'success' || data.success) {
                set({ categories: data.data?.categories || data.categories || [] });
            }
        } catch (error) {
            console.error('Fetch categories error:', error);
        }
    },

    fetchProductById: async (productId: string) => {
        set({ isLoading: true, error: null });
        try {
            const data = await api.get<any>(`/api/marketplace/products/${productId}`);
            if (data.status === 'success' || data.success) {
                return data.data?.product || data.product;
            }
            return null;
        } catch (error) {
            console.error('Fetch product by id error:', error);
            return null;
        } finally {
            set({ isLoading: false });
        }
    },

    fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await api.get<any>('/api/marketplace/cart');
            if (data.status === 'success' || data.success) {
                set({ cart: data.data?.cart || data.cart });
            }
        } catch (error) {
            console.error('Fetch cart error:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    addToCart: async (productId: string, quantity: number) => {
        try {
            const data = await api.post<any>('/api/marketplace/cart/items', { product_id: productId, quantity });
            if (data.status === 'success' || data.success) {
                get().fetchCart();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Add to cart error:', error);
            return false;
        }
    },

    removeFromCart: async (itemId: string) => {
        try {
            const data = await api.delete<any>(`/api/marketplace/cart/items/${itemId}`);
            if (data.status === 'success' || data.success) {
                get().fetchCart();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Remove from cart error:', error);
            return false;
        }
    },

    fetchStore: async (identifier: string) => {
        set({ isLoading: true, error: null });
        try {
            const data = await api.get<any>(`/api/marketplace/stores/${identifier}/public`);
            if (data.status === 'success' || data.success) {
                return data.data?.store || data.store;
            }
            return null;
        } catch (error) {
            console.error('Fetch store error:', error);
            return null;
        } finally {
            set({ isLoading: false });
        }
    },

    fetchStoreProducts: async (storeId: string) => {
        try {
            const data = await api.get<any>(`/api/marketplace/stores/${storeId}/products`);
            if (data.status === 'success' || data.success) {
                return data.data?.products || data.products || [];
            }
            return [];
        } catch (error) {
            console.error('Fetch store products error:', error);
            return [];
        }
    }
}));

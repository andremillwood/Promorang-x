import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { Product, ProductCategory, ShoppingCart, Store } from '../types';

const API_URL = 'https://promorang-api.vercel.app';

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
            const token = useAuthStore.getState().token;
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`${API_URL}/api/marketplace/products?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.status === 'success') {
                set({ products: data.data.products });
            } else {
                set({ error: data.message || 'Failed to fetch products' });
            }
        } catch (error) {
            console.error('Fetch products error:', error);
            set({ error: 'Network error or server unavailable' });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchCategories: async () => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/marketplace/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.status === 'success') {
                set({ categories: data.data.categories });
            }
        } catch (error) {
            console.error('Fetch categories error:', error);
        }
    },

    fetchProductById: async (productId: string) => {
        set({ isLoading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/marketplace/products/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.status === 'success') {
                return data.data.product;
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
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/marketplace/cart`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.status === 'success') {
                set({ cart: data.data.cart });
            }
        } catch (error) {
            console.error('Fetch cart error:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    addToCart: async (productId: string, quantity: number) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/marketplace/cart/items`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ product_id: productId, quantity })
            });
            const data = await response.json();
            if (data.status === 'success') {
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
        // Note: Backend might need an endpoint for this, using demo logic for now if not available
        try {
            const token = useAuthStore.getState().token;
            // Assuming DELETE /api/marketplace/cart/items/:itemId or similar
            const response = await fetch(`${API_URL}/api/marketplace/cart/items/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.status === 'success') {
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
            const token = useAuthStore.getState().token;
            // Public endpoint for stores
            const response = await fetch(`${API_URL}/api/marketplace/stores/${identifier}/public`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.status === 'success') {
                return data.data.store;
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
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/marketplace/stores/${storeId}/products`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.status === 'success') {
                return data.data.products;
            }
            return [];
        } catch (error) {
            console.error('Fetch store products error:', error);
            return [];
        }
    }
}));

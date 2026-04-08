import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'https://promorang-api.vercel.app';

interface RequestOptions extends RequestInit {
    token?: string | null;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, headers, ...customConfig } = options;

    // Use provided token or fall back to store token
    const authToken = token !== undefined ? token : useAuthStore.getState().token;

    const config: RequestInit = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            ...headers,
        },
        ...customConfig,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

export const api = {
    get: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, { ...options, method: 'GET' }),
    post: <T>(endpoint: string, body: any, options?: RequestOptions) => request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: <T>(endpoint: string, body: any, options?: RequestOptions) => request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    patch: <T>(endpoint: string, body: any, options?: RequestOptions) => request<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
    delete: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, { ...options, method: 'DELETE' }),
};

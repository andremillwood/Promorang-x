import { ActivationMechanic } from '../types/ami';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const amiService = {
    async getMechanics(filters?: {
        category?: string;
        outcome?: string;
        difficulty?: string;
        sort?: string;
    }): Promise<ActivationMechanic[]> {
        const params = new URLSearchParams();
        if (filters?.category) params.append('category', filters.category);
        if (filters?.outcome) params.append('outcome', filters.outcome);
        if (filters?.difficulty) params.append('difficulty', filters.difficulty);
        if (filters?.sort) params.append('sort', filters.sort);

        const response = await fetch(`${API_URL}/ami?${params.toString()}`);

        if (!response.ok) {
            throw new Error('Failed to fetch activation mechanics');
        }

        const json = await response.json();
        return json.data;
    },

    async getMechanicById(id: string): Promise<ActivationMechanic> {
        const response = await fetch(`${API_URL}/ami/${id}`);

        if (!response.ok) {
            throw new Error('Failed to fetch mechanic details');
        }

        const json = await response.json();
        return json.data;
    }
};

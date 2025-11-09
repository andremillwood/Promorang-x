import api from './api';
import type { ApiResponse } from './api';
import type { ContentPieceType } from '../../shared/types';

// Enable debug logging
const DEBUG = true;
const debugLog = (...args: any[]) => {
  if (DEBUG) {
    console.log('[ContentService]', ...args);
  }
};

const CONTENT_API_PREFIX = '/api/content';

export const contentService = {
  // Get content by ID
  getContent: async (id: string | number): Promise<ContentPieceType> => {
    debugLog(`Fetching content with ID: ${id}`);
    try {
      const response = await api.get<{ content: ContentPieceType }>(`${CONTENT_API_PREFIX}/${id}`);
      debugLog('Content fetched successfully:', response.data);
      
      if (!response.data?.content) {
        throw new Error('No content data received from API');
      }
      
      return response.data.content;
    } catch (error) {
      debugLog('Error fetching content:', error);
      throw new Error(`Failed to fetch content: ${error.message}`);
    }
  },

  // Get content metrics
  getContentMetrics: async (id: string | number) => {
    const { data } = await api.get(`${CONTENT_API_PREFIX}/${id}/metrics`);
    return data;
  },

  // Get user's interaction status with content
  getUserContentStatus: async (contentId: string | number) => {
    const { data } = await api.get(`${CONTENT_API_PREFIX}/${contentId}/user-status`);
    return data;
  },

  // Like content
  likeContent: async (contentId: string | number) => {
    const { data } = await api.post(`${CONTENT_API_PREFIX}/${contentId}/like`, {});
    return data;
  },

  // Unlike content
  unlikeContent: async (contentId: string | number) => {
    const { data } = await api.delete(`${CONTENT_API_PREFIX}/${contentId}/like`);
    return data;
  },

  // Save content
  saveContent: async (contentId: string | number) => {
    const { data } = await api.post(`${CONTENT_API_PREFIX}/${contentId}/save`, {});
    return data;
  },

  // Unsave content
  unsaveContent: async (contentId: string | number) => {
    const { data } = await api.delete(`${CONTENT_API_PREFIX}/${contentId}/save`);
    return data;
  },

  // Get content comments
  getContentComments: async (contentId: string | number) => {
    const { data } = await api.get(`${CONTENT_API_PREFIX}/${contentId}/comments`);
    return data?.comments || [];
  },

  // Add comment to content
  addComment: async (contentId: string | number, comment: string) => {
    const { data } = await api.post(`${CONTENT_API_PREFIX}/${contentId}/comments`, { comment });
    return data;
  },

  // Get related content
  getRelatedContent: async (contentId: string | number) => {
    const { data } = await api.get<{ items: ContentPieceType[] }>(
      `${CONTENT_API_PREFIX}/${contentId}/related`
    );
    return data?.items || [];
  },

  // Report content
  reportContent: async (contentId: string | number, reason: string) => {
    const { data } = await api.post(`${CONTENT_API_PREFIX}/${contentId}/report`, { reason });
    return data;
  },
};

export default contentService;

import api from './api';
import type { UserType, WalletType } from '../../shared/types';

const USER_API_PREFIX = '/api/users';

export const userService = {
  // Get current user profile
  getCurrentUser: async (): Promise<UserType> => {
    const { data } = await api.get<{ user: UserType }>(`${USER_API_PREFIX}/me`);
    if (!data?.user) throw new Error('User data not found');
    return data.user;
  },

  // Update user profile
  updateProfile: async (updates: Partial<UserType>): Promise<UserType> => {
    const { data } = await api.put<{ user: UserType }>(`${USER_API_PREFIX}/me`, updates);
    if (!data?.user) throw new Error('Failed to update profile');
    return data.user;
  },

  // Get user wallets
  getUserWallets: async (): Promise<WalletType[]> => {
    const { data } = await api.get<{ wallets: WalletType[] }>(`${USER_API_PREFIX}/me/wallets`);
    return data?.wallets || [];
  },

  // Add a new wallet
  addWallet: async (walletData: Partial<WalletType>): Promise<WalletType> => {
    const { data } = await api.post<{ wallet: WalletType }>(`${USER_API_PREFIX}/me/wallets`, walletData);
    if (!data?.wallet) throw new Error('Failed to add wallet');
    return data.wallet;
  },

  // Remove a wallet
  removeWallet: async (walletId: string): Promise<boolean> => {
    await api.delete(`${USER_API_PREFIX}/me/wallets/${walletId}`);
    return true;
  },

  // Request to become an advertiser
  becomeAdvertiser: async (businessDetails: {
    businessName: string;
    website?: string;
    industry: string;
    description: string;
  }): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.post<{ success: boolean; message: string }>(
      `${USER_API_PREFIX}/me/become-advertiser`,
      businessDetails
    );
    
    if (!data) throw new Error('Failed to process advertiser request');
    return data;
  },

  // Get user's content
  getUserContent: async (userId: string | number): Promise<{ items: any[] }> => {
    const { data } = await api.get<{ items: any[] }>(`${USER_API_PREFIX}/${userId}/content`);
    return data || { items: [] };
  },

  // Get user's saved content
  getSavedContent: async (): Promise<{ items: any[] }> => {
    const { data } = await api.get<{ items: any[] }>(`${USER_API_PREFIX}/me/saved-content`);
    return data || { items: [] };
  },

  // Get user's activity
  getUserActivity: async (userId: string | number) => {
    const { data } = await api.get(`${USER_API_PREFIX}/${userId}/activity`);
    return data || [];
  },

  // Update user settings
  updateSettings: async (settings: Record<string, any>) => {
    const { data } = await api.put(`${USER_API_PREFIX}/me/settings`, { settings });
    return data || {};
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<{ url: string }>(
      `${USER_API_PREFIX}/me/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data?.url;
  },

  // Get user's notifications
  getNotifications: async () => {
    const { data } = await api.get(`${USER_API_PREFIX}/me/notifications`);
    return data?.notifications || [];
  },

  // Mark notifications as read
  markNotificationsAsRead: async (notificationIds: string[]) => {
    await api.post(`${USER_API_PREFIX}/me/notifications/read`, { notificationIds });
    return true;
  },

  // Delete account
  deleteAccount: async (password: string) => {
    await api.delete(`${USER_API_PREFIX}/me`, { data: { password } });
    return true;
  },
};

export default userService;

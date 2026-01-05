import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';

const API_URL = 'https://promorang-api.vercel.app';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initializeUser: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signUp: (name: string, email: string, password: string, referralCode?: string, username?: string) => Promise<void>;
  demoLogin: (type: 'creator' | 'investor' | 'advertiser') => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  becomeAdvertiser: (brandName: string, brandLogoUrl?: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set: (state: Partial<AuthState>) => void, get: () => AuthState) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      initializeUser: async () => {
        if (get().user && get().isAuthenticated) {
          return;
        }
      },
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Login failed');

          const mappedUser: User = {
            id: data.user.id,
            name: data.user.display_name || data.user.username,
            display_name: data.user.display_name,
            username: data.user.username,
            email: data.user.email,
            avatar: data.user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=1760&q=80',
            avatar_url: data.user.avatar_url,
            bio: data.user.bio,
            role: data.user.user_type === 'advertiser' ? 'advertiser' : 'user',
            followers: data.user.follower_count || 0,
            following: data.user.following_count || 0,
            earnings: data.user.total_earnings_usd || 0,
            total_earnings_usd: data.user.total_earnings_usd,
            points_balance: data.user.points_balance,
            keys_balance: data.user.keys_balance,
            gems_balance: data.user.gems_balance,
            promoGems: data.user.gems_balance,
            referralCode: data.user.referral_code || '',
            referral_code: data.user.referral_code,
            joinedAt: data.user.created_at || new Date().toISOString(),
            created_at: data.user.created_at,
            level: data.user.level,
            xp: data.user.xp_points,
            instagram_handle: data.user.instagram_handle,
            instagram_verified: data.user.instagram_verified,
          };
          set({ user: mappedUser, token: data.token, isAuthenticated: true });
        } catch (error: any) {
          console.error('Login error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      demoLogin: async (type: 'creator' | 'investor' | 'advertiser') => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_URL}/api/auth/demo/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ device: 'mobile' }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Demo login failed');

          const mappedUser: User = {
            id: data.user.id,
            name: data.user.display_name || data.user.username,
            display_name: data.user.display_name,
            username: data.user.username,
            email: data.user.email,
            avatar: data.user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=1760&q=80',
            avatar_url: data.user.avatar_url,
            bio: data.user.bio,
            role: data.user.user_type === 'advertiser' ? 'advertiser' : 'user',
            followers: data.user.follower_count || 0,
            following: data.user.following_count || 0,
            earnings: data.user.total_earnings_usd || 0,
            total_earnings_usd: data.user.total_earnings_usd,
            points_balance: data.user.points_balance,
            keys_balance: data.user.keys_balance,
            gems_balance: data.user.gems_balance,
            promoGems: data.user.gems_balance,
            referralCode: data.user.referral_code || '',
            referral_code: data.user.referral_code,
            joinedAt: data.user.created_at || new Date().toISOString(),
            created_at: data.user.created_at,
            level: data.user.level,
            xp: data.user.xp_points,
            instagram_handle: data.user.instagram_handle,
            instagram_verified: data.user.instagram_verified,
          };
          set({ user: mappedUser, token: data.token, isAuthenticated: true });
        } catch (error: any) {
          console.error('Demo login error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      updateProfile: async (updates: Partial<User>) => {
        set({ isLoading: true });
        try {
          const { user, token } = get();
          if (!user || !token) throw new Error('Not authenticated');

          // Map frontend fields back to backend expected fields if necessary
          // For now passing updates directly assuming matching keys (display_name etc)
          const payload = {
            ...updates,
            display_name: updates.name || updates.display_name, // Map 'name' to 'display_name' if needed
          };

          const response = await fetch(`${API_URL}/api/users/${user.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });

          const data = await response.json();
          if (!data.success) throw new Error(data.error);

          set({ user: { ...user, ...data.user } });
        } catch (error) {
          console.error('Update profile error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      becomeAdvertiser: async (brandName: string, brandLogoUrl?: string) => {
        set({ isLoading: true });
        try {
          const { user, token } = get();
          if (!user || !token) throw new Error('Not authenticated');

          const response = await fetch(`${API_URL}/api/users/become-advertiser`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ brand_name: brandName, brand_logo_url: brandLogoUrl })
          });

          const data = await response.json();
          if (!data.success) throw new Error(data.error);

          // Update local user with new role/fields
          set({ user: { ...user, ...data.user } });
        } catch (error) {
          console.error('Become advertiser error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      signUp: async (name: string, email: string, password: string, referralCode?: string, username?: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              display_name: name,
              email,
              password,
              referral_code: referralCode,
              username: username || email.split('@')[0]
            }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Registration failed');

          const mappedUser: User = {
            id: data.user.id,
            name: data.user.display_name || data.user.username,
            display_name: data.user.display_name,
            username: data.user.username,
            email: data.user.email,
            avatar: data.user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=1760&q=80',
            avatar_url: data.user.avatar_url,
            bio: data.user.bio,
            role: data.user.user_type === 'advertiser' ? 'advertiser' : 'user',
            followers: data.user.follower_count || 0,
            following: data.user.following_count || 0,
            earnings: data.user.total_earnings_usd || 0,
            total_earnings_usd: data.user.total_earnings_usd,
            points_balance: data.user.points_balance,
            keys_balance: data.user.keys_balance,
            gems_balance: data.user.gems_balance,
            promoGems: data.user.gems_balance,
            referralCode: data.user.referral_code || '',
            referral_code: data.user.referral_code,
            joinedAt: data.user.created_at || new Date().toISOString(),
            created_at: data.user.created_at,
            level: data.user.level,
            xp: data.user.xp_points,
            instagram_handle: data.user.instagram_handle,
            instagram_verified: data.user.instagram_verified,
          };
          set({ user: mappedUser, token: data.token, isAuthenticated: true });
        } catch (error) {
          console.error('Registration error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'promorang-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
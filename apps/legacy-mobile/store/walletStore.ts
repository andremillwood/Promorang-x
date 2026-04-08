import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Transaction } from '@/types';
import { api } from '@/lib/api';

interface WalletState {
  balance: number;
  pendingBalance: number;
  promoGems: number;
  promoCoins: number;
  transactions: Transaction[];
  isLoading: boolean;
  fetchTransactions: () => Promise<void>;
  withdraw: (amount: number, method: string) => Promise<void>;
  syncWithAuth: (userData: any) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: 0,
      pendingBalance: 0,
      promoGems: 0,
      promoCoins: 0,
      transactions: [],
      isLoading: false,
      syncWithAuth: (userData: any) => {
        if (!userData) return;
        set({
          balance: userData.total_earnings_usd || 0,
          promoGems: userData.gems_balance || 0,
          promoCoins: userData.points_balance || 0,
        });
      },
      fetchTransactions: async () => {
        set({ isLoading: true });

        try {
          const backendTransactions = await api.get<any[]>('/api/users/transactions');

          // Map backend transactions to mobile Transaction format
          const mappedTransactions: Transaction[] = backendTransactions.map((t: any) => ({
            id: t.id,
            type: t.transaction_type || 'earning',
            amount: t.amount,
            description: t.description || (t.transaction_type === 'withdrawal' ? 'Withdrawal' : 'Earnings'),
            status: t.status || 'completed',
            createdAt: t.created_at || new Date().toISOString(),
            created_at: t.created_at,
            currency_type: t.currency_type,
          }));

          set({ transactions: mappedTransactions });
        } catch (error) {
          console.error('Fetch transactions error:', error);
          // Don't clear transactions on error to keep offline access
        } finally {
          set({ isLoading: false });
        }
      },
      withdraw: async (amount: number, method: string) => {
        set({ isLoading: true });

        try {
          await api.post('/api/users/withdraw', { amount, method });

          // Re-fetch transactions to show the new withdrawal
          await get().fetchTransactions();

          // Update local balance (though it should ideally sync from backend)
          set({
            balance: get().balance - amount,
            pendingBalance: get().pendingBalance + amount,
          });
        } catch (error) {
          console.error('Withdrawal error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'promorang-wallet-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
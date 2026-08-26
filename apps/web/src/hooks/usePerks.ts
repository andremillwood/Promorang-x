import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllPerks, claimPerk, toggleSavePerk, redeemPerk, saveMerchantPerk } from '@/lib/perks';
import { Perk, PerkClaimResult } from '@/types/perk';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function usePerks(category?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const perksQuery = useQuery({
    queryKey: ['promorang-perks-feed', category || 'all'],
    queryFn: async () => {
      const all = await fetchAllPerks();
      if (!category || category === 'all') return all;
      return all.filter(
        (p) =>
          p.category?.toLowerCase().includes(category.toLowerCase()) ||
          p.perkType?.toLowerCase().includes(category.toLowerCase())
      );
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const claimMutation = useMutation({
    mutationFn: async (perk: Perk) => {
      const result: PerkClaimResult = claimPerk(perk, user?.id);
      return { result, perk };
    },
    onSuccess: ({ result, perk }) => {
      toast.success(result.message || `Claimed ${perk.title}!`);
      queryClient.invalidateQueries({ queryKey: ['promorang-perks-feed'] });
      queryClient.invalidateQueries({ queryKey: ['vault-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-points-balance'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to claim perk.');
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (perkId: string) => {
      const isSaved = toggleSavePerk(perkId);
      return { isSaved, perkId };
    },
    onSuccess: ({ isSaved }) => {
      toast.success(isSaved ? 'Perk saved to your Vault!' : 'Removed from saved perks.');
      queryClient.invalidateQueries({ queryKey: ['promorang-perks-feed'] });
    },
  });

  const redeemMutation = useMutation({
    mutationFn: async ({ perkId, code }: { perkId: string; code?: string }) => {
      const ok = redeemPerk(perkId, code);
      return { ok, perkId };
    },
    onSuccess: () => {
      toast.success('Perk successfully redeemed! Proof recorded.');
      queryClient.invalidateQueries({ queryKey: ['promorang-perks-feed'] });
      queryClient.invalidateQueries({ queryKey: ['vault-data'] });
    },
  });

  const createPerkMutation = useMutation({
    mutationFn: async (newPerk: Perk) => {
      saveMerchantPerk(newPerk);
      return newPerk;
    },
    onSuccess: (newPerk) => {
      toast.success(`Perk "${newPerk.title}" posted successfully!`);
      queryClient.invalidateQueries({ queryKey: ['promorang-perks-feed'] });
    },
  });

  return {
    perks: perksQuery.data || [],
    isLoading: perksQuery.isLoading,
    isError: perksQuery.isError,
    refetch: perksQuery.refetch,
    claimPerk: claimMutation.mutate,
    isClaiming: claimMutation.isPending,
    toggleSave: saveMutation.mutate,
    redeemPerk: redeemMutation.mutate,
    isRedeeming: redeemMutation.isPending,
    createPerk: createPerkMutation.mutate,
    isCreating: createPerkMutation.isPending,
  };
}

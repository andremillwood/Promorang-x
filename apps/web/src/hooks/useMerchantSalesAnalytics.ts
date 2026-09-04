import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import { nextWeeklyPayoutAt } from "@/lib/payout-calendar";

export type MerchantFunnel = {
  issued: number;
  claimed: number;
  redeemed: number;
  cameBack: number;
  totalSales: number;
  totalRevenue: number;
  validatedRedemptions: number;
  pendingRedemptions: number;
  uniqueCustomers: number;
  repeatCustomerRate: number;
  nextPayoutAt: string;
};

export function useMerchantSalesAnalytics(days = 30) {
  const { session } = useAuth();

  return useQuery({
    queryKey: ["merchant-sales-analytics", session?.user?.id, days],
    enabled: Boolean(session?.access_token),
    queryFn: async (): Promise<MerchantFunnel> => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      });
      const headers = { Authorization: `Bearer ${session!.access_token}` };
      const [summaryRes, customersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/merchant/analytics/summary?${params}`, { headers }),
        fetch(`${API_BASE_URL}/merchant/analytics/customers?${params}`, { headers }),
      ]);
      if (!summaryRes.ok) throw new Error("Sales summary unavailable");
      const summary = await summaryRes.json();
      const customers = customersRes.ok ? await customersRes.json() : {};
      const issued = Number(summary.issued ?? summary.totalSales ?? 0);
      const redeemed = Number(summary.redeemed ?? summary.validatedRedemptions ?? 0);
      const claimed = Number(summary.claimed ?? redeemed + Number(summary.pendingRedemptions ?? 0));
      return {
        issued,
        claimed,
        redeemed,
        cameBack: Number(summary.cameBack ?? summary.totalRevenue ?? 0),
        totalSales: Number(summary.totalSales ?? issued),
        totalRevenue: Number(summary.totalRevenue ?? 0),
        validatedRedemptions: redeemed,
        pendingRedemptions: Number(summary.pendingRedemptions ?? 0),
        uniqueCustomers: Number(customers.uniqueCustomers ?? 0),
        repeatCustomerRate: Number(customers.repeatCustomerRate ?? 0),
        nextPayoutAt: summary.nextPayoutAt || nextWeeklyPayoutAt().toISOString(),
      };
    },
    staleTime: 30_000,
  });
}

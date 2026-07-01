import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";

export type RewardReceipt = {
  id: string;
  lifecycle_status: "submitted" | "verified" | "issued" | "available" | "reversed" | "failed";
  headline: string;
  description?: string | null;
  rewards: Array<{ currency: string; amount: number; label?: string; balance_after?: number }>;
  proof?: Record<string, unknown>;
  next_action?: { label?: string; href?: string };
  created_at: string;
};

export type EngagementCap = {
  action_type: string;
  used: number;
  daily_limit: number;
  remaining: number;
};

export function useValueReceipts(limit = 12) {
  const { session } = useAuth();
  const [receipts, setReceipts] = useState<RewardReceipt[]>([]);
  const [caps, setCaps] = useState<EngagementCap[]>([]);
  const [resetsAt, setResetsAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session?.access_token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${session.access_token}` };
      const [receiptResponse, capResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/economy/receipts?limit=${limit}`, { headers }),
        fetch(`${API_BASE_URL}/economy/engagement-caps`, { headers }),
      ]);
      if (receiptResponse.ok) {
        const result = await receiptResponse.json();
        setReceipts(result.receipts || []);
      }
      if (capResponse.ok) {
        const result = await capResponse.json();
        setCaps(result.caps || []);
        setResetsAt(result.resets_at || null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [limit, session?.access_token]);

  useEffect(() => { refresh(); }, [refresh]);
  return { receipts, caps, resetsAt, isLoading, refresh };
}

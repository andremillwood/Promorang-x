import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { activationRpc } from "@/lib/activation-rpc";
import { API_BASE_URL } from "@/lib/api";
import type { PromoPushCampaign } from "@/hooks/usePromoPush";
import { Button } from "@/components/ui/button";

export function PromoPushActivation({ campaign }: { campaign: PromoPushCampaign }) {
  const { session } = useAuth();
  const client = useQueryClient();
  const action = useMutation({
    mutationFn: async (kind: "fund" | "launch" | "cancel") => {
      if (kind === "fund" && !campaign.pricing?.quote_id) throw new Error("Refresh and review a quote first.");
      if (kind !== "launch") {
        const { error } = kind === "fund"
          ? await activationRpc("fund_promopush", { p_campaign_id: campaign.id, p_quote_id: campaign.pricing!.quote_id! })
          : await activationRpc("cancel_promopush", { p_campaign_id: campaign.id });
        if (error) throw error;
      } else {
        const response = await fetch(`${API_BASE_URL}/promopush/campaigns/${campaign.id}/launch`, {
          method: "POST", headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Launch could not be verified. Refresh and retry.");
      }
    },
    onSettled: () => client.invalidateQueries({ queryKey: ["promopush-campaigns"] }),
  });
  const quote = campaign.pricing;
  const secured = campaign.funding_status === "secured" && Number(campaign.funding_available_gems || 0) >= Number(quote?.total_gems || Infinity);
  const expired = !!quote?.expires_at && Date.parse(quote.expires_at) <= Date.now();
  if (campaign.status === "active") return <p className="mb-4">Live — confirmed by the server.</p>;
  if (quote?.cancelled) return <p className="mb-4">Cancelled. Any reserved Gems were returned to the wallet.</p>;
  if (campaign.status !== "draft") return null;
  return <div className="mb-6 space-y-3 rounded-lg border border-white/20 p-4">
    <p>{campaign.push_mode === "organic" ? "Organic draft ready for launch checks." : secured
      ? "Gems secured. Review your distribution details before launch."
      : !quote?.quote_id ? "Awaiting a staff quote. Nothing has been charged or launched."
      : expired ? "Quote expired. Request a new quote before funding."
      : `Quote: ${Number(quote.total_gems).toLocaleString()} Gems. Valid until ${new Date(quote.expires_at!).toLocaleString()}.`}</p>
    {!secured && campaign.push_mode !== "organic" && <p className="text-sm text-white/60">Funding uses your Gem wallet. If your balance is insufficient, <Link className="underline" to="/wallet">add Gems in your wallet</Link> and return here. Pending, failed or cancelled payments do not secure this campaign; wait for the verified wallet credit, then retry.</p>}
    {action.error && <p role="alert">{action.error.message}</p>}
    {action.isPending && <p role="status">Checking server state…</p>}
    <div className="flex flex-wrap gap-3">
      {!secured && quote?.quote_id && !expired && <Button disabled={action.isPending} onClick={() => action.mutate("fund")}>Approve quote and secure {quote.total_gems} Gems</Button>}
      {(secured || campaign.push_mode === "organic") && <Button disabled={action.isPending} onClick={() => action.mutate("launch")}>Launch PromoPush</Button>}
      <Button variant="outline" disabled={action.isPending} onClick={() => action.mutate("cancel")}>Cancel draft{secured ? " and return Gems" : ""}</Button>
      <Button variant="outline" disabled={action.isPending} onClick={() => client.invalidateQueries({ queryKey: ["promopush-campaigns"] })}>Refresh status</Button>
    </div>
  </div>;
}

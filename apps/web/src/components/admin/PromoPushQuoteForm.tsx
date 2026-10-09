import { useI18n as useWebI18n } from "@/i18n/I18nContext";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PromoPushQuoteForm({ campaigns }: { campaigns: Array<{ id: string; title: string; status: string }> }) {
  const { t: webT } = useWebI18n();
  const { session } = useAuth();
  const client = useQueryClient();
  const key = useRef(crypto.randomUUID());
  const [campaignId, setCampaignId] = useState("");
  const [amount, setAmount] = useState("");
  const [expires, setExpires] = useState("");
  const quote = useMutation({ mutationFn: async () => {
    const response = await fetch(`${API_BASE_URL}/promopush/admin/campaigns/${encodeURIComponent(campaignId)}/quote`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ total_gems: Number(amount), expires_at: new Date(expires).toISOString(), quote_id: key.current }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Quote was not saved");
  }, onSuccess: () => { key.current = crypto.randomUUID(); void client.invalidateQueries({ queryKey: ["promopush-admin"] }); } });
  return <form className="space-y-3 rounded border p-4" onSubmit={e => { e.preventDefault(); quote.mutate(); }}>
    <h3 className="font-bold">Issue a reviewed PromoPush quote</h3>
    <p>Platform administrators only. Confirm the scope and Gem amount with operations first. This does not fund or launch the campaign.</p>
    <label className="block">Campaign ID<select required className="block w-full rounded border bg-background p-2" value={campaignId} onChange={e => setCampaignId(e.target.value)}><option value="">Choose a draft</option>{campaigns.filter(c => c.status === "draft").map(c => <option key={c.id} value={c.id}>{c.title} ({c.id})</option>)}</select></label>
    <label className="block">{webT("web.totalGems")}<Input required type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} /></label>
    <label className="block">Quote expires<Input required type="datetime-local" value={expires} onChange={e => setExpires(e.target.value)} /></label>
    <Button disabled={quote.isPending}>Issue quote</Button>
    {quote.error && <p role="alert">{quote.error.message}</p>}
    {quote.isSuccess && <p>Quote saved. The buyer must approve it and secure Gems.</p>}
  </form>;
}

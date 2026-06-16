import { FormEvent, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useClaimIssuance, useCreateOffer, useDirectOfferClaim, useOfferWallet, useOwnerOffers, usePublicOffers, useRedeemOffer, useUpdateOffer } from "@/hooks/useOffers";
import { CheckCircle2, Gift, PackageCheck, Plus, QrCode, Radio, Share2, Sparkles, Ticket } from "lucide-react";
import { toast } from "sonner";

const channelCopy = {
  direct: { label: "Direct claim", event: "claim", icon: Ticket, help: "Anyone eligible can claim while stock lasts." },
  moment: { label: "Moment activity", event: "checkin", icon: QrCode, help: "Issue after joining, checking in, or verified proof." },
  content: { label: "Content engagement", event: "share", icon: Share2, help: "Issue after a view, click, comment, or share." },
  promoshare: { label: "PromoShare giveaway", event: "winner", icon: Sparkles, help: "Add the offer to a qualified winner cycle." },
} as const;

const initialForm = {
  title: "",
  description: "",
  terms: "",
  reward_type: "coupon",
  fulfillment_type: "merchant_validation",
  value_amount: "",
  value_currency: "JMD",
  quantity_total: "100",
  per_user_limit: "1",
  ends_at: "",
  channel: "direct" as keyof typeof channelCopy,
  trigger_event: "claim",
  source_id: "",
  status: "active",
};

const OfferStudio = () => {
  const { activeRole, activeOrgId } = useAuth();
  const canManage = ["brand", "merchant", "host", "creator", "admin"].includes(activeRole || "");
  const [form, setForm] = useState(initialForm);
  const [redemptionCode, setRedemptionCode] = useState("");
  const ownerOffers = useOwnerOffers();
  const wallet = useOfferWallet();
  const publicOffers = usePublicOffers();
  const createOffer = useCreateOffer();
  const updateOffer = useUpdateOffer();
  const claimIssuance = useClaimIssuance();
  const directClaim = useDirectOfferClaim();
  const redeemOffer = useRedeemOffer();

  const totals = useMemo(() => (ownerOffers.data || []).reduce((acc, offer) => {
    acc.issued += offer.offer_issuances?.length || 0;
    acc.redeemed += offer.offer_issuances?.filter((row) => row.status === "redeemed").length || 0;
    return acc;
  }, { issued: 0, redeemed: 0 }), [ownerOffers.data]);

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await createOffer.mutateAsync({
        organization_id: activeOrgId,
        owner_type: activeRole || "business",
        title: form.title,
        description: form.description,
        terms: form.terms,
        reward_type: form.reward_type,
        fulfillment_type: form.fulfillment_type,
        value_amount: form.value_amount ? Number(form.value_amount) : null,
        value_currency: form.value_currency,
        quantity_total: form.quantity_total ? Number(form.quantity_total) : null,
        per_user_limit: Number(form.per_user_limit || 1),
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        status: form.status,
        distributions: [{
          channel: form.channel,
          trigger_event: form.trigger_event,
          source_id: form.source_id || null,
          qualification_rules: form.channel === "moment" ? { proof_required: form.trigger_event === "proof_verified" } : {},
        }],
      });
      toast.success("Offer published");
      setForm(initialForm);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not create offer"); }
  };

  const redeem = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await redeemOffer.mutateAsync({ code: redemptionCode });
      toast.success("Offer redeemed and recorded");
      setRedemptionCode("");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not redeem offer"); }
  };

  return (
    <div className="container max-w-7xl px-4 py-8 md:py-12">
      <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <Badge className="mb-4">Unified Offers</Badge>
          <h1 className="font-serif text-4xl font-bold md:text-6xl">Create value once. Distribute it anywhere.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">Run coupons, product giveaways, vouchers, experiences, or prizes through Moments, content sharing, direct claims, and PromoShare without splitting inventory across separate tools.</p>
        </div>
        {canManage && <div className="grid grid-cols-2 gap-3"><Card><CardContent className="p-4"><p className="text-2xl font-bold">{totals.issued}</p><p className="text-xs text-muted-foreground">Issued</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-2xl font-bold">{totals.redeemed}</p><p className="text-xs text-muted-foreground">Redeemed</p></CardContent></Card></div>}
      </div>

      <Tabs defaultValue={canManage ? "create" : "wallet"}>
        <TabsList className="mb-6 flex h-auto flex-wrap justify-start">
          {canManage && <TabsTrigger value="create">Create offer</TabsTrigger>}
          {canManage && <TabsTrigger value="manage">Manage</TabsTrigger>}
          <TabsTrigger value="discover">Available now</TabsTrigger>
          <TabsTrigger value="wallet">My offers</TabsTrigger>
          {canManage && <TabsTrigger value="redeem">Validate redemption</TabsTrigger>}
        </TabsList>

        {canManage && <TabsContent value="create"><form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
          <Card><CardHeader><CardTitle>Offer value</CardTitle></CardHeader><CardContent className="grid gap-5">
            <div><Label htmlFor="offer-title">Title</Label><Input id="offer-title" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="20% off your next visit" required /></div>
            <div><Label htmlFor="offer-description">Description</Label><Textarea id="offer-description" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Tell people what they receive and why it matters." /></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><Label>Reward type</Label><Select value={form.reward_type} onValueChange={(value) => update("reward_type", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["coupon", "product", "voucher", "experience", "cash", "gems", "points", "keys", "other"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div><div><Label>Fulfillment</Label><Select value={form.fulfillment_type} onValueChange={(value) => update("fulfillment_type", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["merchant_validation", "code", "qr", "automatic", "manual", "shipping"].map((value) => <SelectItem key={value} value={value}>{value.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select></div></div>
            <div className="grid gap-4 sm:grid-cols-3"><div><Label>Value</Label><Input type="number" min="0" value={form.value_amount} onChange={(e) => update("value_amount", e.target.value)} placeholder="20" /></div><div><Label>Currency/unit</Label><Input value={form.value_currency} onChange={(e) => update("value_currency", e.target.value)} /></div><div><Label>Inventory</Label><Input type="number" min="1" value={form.quantity_total} onChange={(e) => update("quantity_total", e.target.value)} /></div></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><Label>Limit per person</Label><Input type="number" min="1" value={form.per_user_limit} onChange={(e) => update("per_user_limit", e.target.value)} /></div><div><Label>Ends</Label><Input type="datetime-local" value={form.ends_at} onChange={(e) => update("ends_at", e.target.value)} /></div></div>
            <div><Label>Terms</Label><Textarea value={form.terms} onChange={(e) => update("terms", e.target.value)} placeholder="Redemption conditions, exclusions, collection instructions..." /></div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle>Distribution</CardTitle></CardHeader><CardContent className="space-y-5">
            <div className="grid gap-3">{Object.entries(channelCopy).map(([key, item]) => <button type="button" key={key} onClick={() => setForm((current) => ({ ...current, channel: key as keyof typeof channelCopy, trigger_event: item.event }))} className={`rounded-xl border p-4 text-left transition ${form.channel === key ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}><div className="flex items-center gap-3"><item.icon className="h-5 w-5 text-primary" /><div><p className="font-bold">{item.label}</p><p className="text-sm text-muted-foreground">{item.help}</p></div></div></button>)}</div>
            <div><Label>Trigger event</Label><Select value={form.trigger_event} onValueChange={(value) => update("trigger_event", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{form.channel === "moment" && ["join", "checkin", "proof_verified"].map((value) => <SelectItem key={value} value={value}>{value.replaceAll("_", " ")}</SelectItem>)}{form.channel === "content" && ["view", "click", "like", "comment", "share"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}{form.channel === "direct" && <SelectItem value="claim">claim</SelectItem>}{form.channel === "promoshare" && <SelectItem value="winner">winner</SelectItem>}</SelectContent></Select></div>
            {form.channel !== "direct" && <div><Label>Source ID</Label><Input value={form.source_id} onChange={(e) => update("source_id", e.target.value)} placeholder="Moment, content, campaign, or PromoShare cycle ID" /><p className="mt-2 text-xs text-muted-foreground">Leave blank to match every source using this trigger.</p></div>}
            <Button type="submit" className="w-full" disabled={createOffer.isPending}><Plus className="mr-2 h-4 w-4" />Publish offer</Button>
          </CardContent></Card>
        </form></TabsContent>}

        {canManage && <TabsContent value="manage"><div className="grid gap-4">{ownerOffers.data?.map((offer) => <Card key={offer.id}><CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-serif text-xl font-bold">{offer.title}</h3><Badge variant="outline">{offer.status}</Badge><Badge variant="secondary">{offer.reward_type}</Badge></div><p className="mt-2 text-sm text-muted-foreground">{offer.description}</p><p className="mt-3 text-xs text-muted-foreground">{offer.quantity_redeemed} redeemed · {offer.quantity_reserved} reserved · {offer.quantity_total ?? "Unlimited"} total</p></div><Button variant="outline" onClick={() => updateOffer.mutate({ id: offer.id, status: offer.status === "active" ? "paused" : "active" })}>{offer.status === "active" ? "Pause" : "Activate"}</Button></CardContent></Card>)}{!ownerOffers.isLoading && !ownerOffers.data?.length && <Card><CardContent className="p-10 text-center text-muted-foreground">Create your first offer to begin distributing value.</CardContent></Card>}</div></TabsContent>}

        <TabsContent value="discover"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{publicOffers.data?.map((offer) => <Card key={offer.id}><CardContent className="flex h-full flex-col p-5"><div className="flex items-center justify-between"><Badge>{offer.reward_type}</Badge><Gift className="h-5 w-5 text-primary" /></div><h3 className="mt-4 font-serif text-2xl font-bold">{offer.title}</h3><p className="mt-2 flex-1 text-sm text-muted-foreground">{offer.description}</p><p className="mt-4 text-sm font-bold">{offer.value_amount ? `${offer.value_amount} ${offer.value_currency || ""}` : "Special offer"}</p><Button className="mt-4" onClick={async () => { try { await directClaim.mutateAsync(offer.id); toast.success("Offer added to My offers"); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not claim offer"); } }}>Claim offer</Button></CardContent></Card>)}{!publicOffers.isLoading && !publicOffers.data?.length && <Card className="md:col-span-2 lg:col-span-3"><CardContent className="p-12 text-center text-muted-foreground">No direct offers are available right now. Moment, content, and PromoShare rewards will still appear in your wallet when earned.</CardContent></Card>}</div></TabsContent>

        <TabsContent value="wallet"><div className="grid gap-4 md:grid-cols-2">{wallet.data?.map((issuance) => <Card key={issuance.id}><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div><Badge variant="secondary">{issuance.offers.reward_type}</Badge><h3 className="mt-3 font-serif text-2xl font-bold">{issuance.offers.title}</h3></div>{issuance.status === "redeemed" ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <Gift className="h-6 w-6 text-primary" />}</div><p className="mt-3 text-sm text-muted-foreground">{issuance.offers.description}</p><div className="mt-5 rounded-xl bg-muted p-4"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Redemption code</p><p className="mt-1 font-mono text-2xl font-bold tracking-wider">{issuance.redemption_code}</p></div><div className="mt-4 flex items-center justify-between"><Badge variant="outline">{issuance.status.replaceAll("_", " ")}</Badge>{issuance.status === "issued" && <Button onClick={() => claimIssuance.mutate(issuance.id)}>Claim</Button>}</div></CardContent></Card>)}{!wallet.isLoading && !wallet.data?.length && <Card className="md:col-span-2"><CardContent className="p-12 text-center"><PackageCheck className="mx-auto mb-4 h-10 w-10 text-muted-foreground" /><p className="font-bold">No offers issued yet</p><p className="mt-1 text-sm text-muted-foreground">Offers earned through Moments, content, direct claims, and PromoShare will appear here.</p></CardContent></Card>}</div></TabsContent>

        {canManage && <TabsContent value="redeem"><Card className="max-w-xl"><CardHeader><CardTitle>Validate a customer offer</CardTitle></CardHeader><CardContent><form onSubmit={redeem} className="space-y-4"><div><Label htmlFor="redemption-code">Redemption code</Label><Input id="redemption-code" value={redemptionCode} onChange={(e) => setRedemptionCode(e.target.value.toUpperCase())} placeholder="PR-XXXXXXXX" className="font-mono uppercase" required /></div><Button className="w-full" disabled={redeemOffer.isPending}><Radio className="mr-2 h-4 w-4" />Validate and redeem</Button></form></CardContent></Card></TabsContent>}
      </Tabs>
    </div>
  );
};

export default OfferStudio;

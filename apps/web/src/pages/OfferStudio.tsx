import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { GuidanceDisclosure } from "@/components/guidance/GuidanceDisclosure";
import { useAuth } from "@/contexts/AuthContext";
import { useClaimIssuance, useCreateOffer, useDirectOfferClaim, useOfferWallet, useOwnerOffers, usePublicOffers, useRedeemOffer, useUpdateOffer } from "@/hooks/useOffers";
import { ArrowRight, Banknote, CheckCircle2, ChevronDown, Gift, MapPin, PackageCheck, Plus, QrCode, Radio, ReceiptText, Settings2, Share2, ShieldCheck, Sparkles, Ticket, Users } from "lucide-react";
import { toast } from "sonner";
import { cultureImages } from "@/data/culture-demo";

const channelCopy = {
  direct: { label: "Direct claim", event: "claim", icon: Ticket, help: "Anyone eligible can claim while stock lasts." },
  moment: { label: "Moment activity", event: "checkin", icon: QrCode, help: "Issue after joining, checking in, or verified proof." },
  content: { label: "Content engagement", event: "share", icon: Share2, help: "Issue after a view, click, comment, or share." },
  promoshare: { label: "PromoShare giveaway", event: "winner", icon: Sparkles, help: "Add the offer to a qualified winner cycle." },
} as const;

const activationTemplates = [
  {
    id: "slow-hour-checkin",
    roles: ["merchant", "host", "brand", "admin"],
    quickTitle: "Bring people in",
    title: "Slow-hour check-in",
    goal: "Fill low-demand hours with verified visits.",
    bestFor: "Restaurants, cafes, salons, gyms, venues",
    icon: MapPin,
    form: {
      title: "Slow-hour check-in reward",
      description: "Check in during the selected window and validate at the venue to unlock this perk.",
      terms: "Valid during the published Moment window only. One redemption per person while inventory lasts.",
      reward_type: "coupon",
      fulfillment_type: "merchant_validation",
      value_amount: "10",
      value_currency: "JMD",
      quantity_total: "25",
      channel: "moment" as keyof typeof channelCopy,
      trigger_event: "checkin",
      funding_source: "merchant_inventory",
      proof_required: "qr_gps",
      promoshare_rate: "5",
    },
  },
  {
    id: "content-mission",
    roles: ["creator", "brand", "merchant", "host", "admin"],
    quickTitle: "Get content made",
    title: "Content mission",
    goal: "Reward useful posts, proof uploads, and creator-led action.",
    bestFor: "UGC, creator drops, launches, venue stories",
    icon: Share2,
    form: {
      title: "Verified content mission",
      description: "Complete the content action, submit proof, and qualify for the funded reward pool.",
      terms: "Proof must be approved before reward issue. Posts must stay live through the campaign review window.",
      reward_type: "gems",
      fulfillment_type: "automatic",
      value_amount: "250",
      value_currency: "Gems",
      quantity_total: "20",
      channel: "content" as keyof typeof channelCopy,
      trigger_event: "share",
      funding_source: "sponsor_budget",
      proof_required: "post_url",
      promoshare_rate: "3",
    },
  },
  {
    id: "referral-visit",
    roles: ["merchant", "brand", "creator", "host", "admin"],
    quickTitle: "Reward referrals",
    title: "Referral visit",
    goal: "Only reward sharing when a referred person completes the action.",
    bestFor: "Founding waves, campus teams, community launches",
    icon: Users,
    form: {
      title: "Bring a friend unlock",
      description: "Invite someone who completes the Moment action. Reward issues after the referred action is verified.",
      terms: "Referral must be new to this Moment. Both accounts must pass verification checks.",
      reward_type: "keys",
      fulfillment_type: "automatic",
      value_amount: "1",
      value_currency: "Keys",
      quantity_total: "50",
      channel: "moment" as keyof typeof channelCopy,
      trigger_event: "proof_verified",
      funding_source: "sponsor_budget",
      proof_required: "referral_checkin",
      promoshare_rate: "2",
    },
  },
  {
    id: "promoshare-funded-cycle",
    roles: ["brand", "merchant", "host", "admin"],
    quickTitle: "Run PromoShare safely",
    title: "Funded PromoShare cycle",
    goal: "Activate PromoShare from committed campaign value only.",
    bestFor: "Sponsored campaigns, featured placements, launch pools",
    icon: Banknote,
    form: {
      title: "Funded PromoShare cycle",
      description: "Eligible verified participants enter a PromoShare cycle backed by committed sponsor value.",
      terms: "PromoShare allocation is capped by the committed funded pool and released only to eligible verified participants.",
      reward_type: "gems",
      fulfillment_type: "automatic",
      value_amount: "500",
      value_currency: "Gems",
      quantity_total: "10",
      channel: "promoshare" as keyof typeof channelCopy,
      trigger_event: "winner",
      funding_source: "campaign_revenue",
      proof_required: "verified_moment_activity",
      promoshare_rate: "5",
    },
  },
] as const;

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
  funding_source: "merchant_inventory",
  committed_value: "",
  proof_required: "qr_gps",
  promoshare_rate: "0",
};

const OfferStudio = () => {
  const { activeRole, activeOrgId } = useAuth();
  const [searchParams] = useSearchParams();
  const canManage = ["brand", "merchant", "host", "creator", "admin"].includes(activeRole || "");
  const [form, setForm] = useState(initialForm);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
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

  const availableTemplates = useMemo(() => {
    const role = activeRole || "participant";
    return activationTemplates.filter((template) => (template.roles as readonly string[]).includes(role));
  }, [activeRole]);

  const committedValue = Number(form.committed_value || 0);
  const quantityTotal = Number(form.quantity_total || 0);
  const valueAmount = Number(form.value_amount || 0);
  const maxLiability = quantityTotal * valueAmount;
  const promoShareAllocation = Math.floor(committedValue * (Number(form.promoshare_rate || 0) / 100));
  const hasCommittedBacking =
    form.funding_source === "merchant_inventory" ||
    form.funding_source === "in_kind_perk" ||
    committedValue >= maxLiability;
  const needsCashBacking = !["merchant_inventory", "in_kind_perk"].includes(form.funding_source);

  const applyTemplate = (template: typeof activationTemplates[number]) => {
    setSelectedTemplateId(template.id);
    setForm((current) => ({
      ...current,
      ...template.form,
      committed_value:
        template.form.funding_source === "merchant_inventory" || template.form.funding_source === "in_kind_perk"
          ? current.committed_value
          : String(Number(template.form.value_amount) * Number(template.form.quantity_total)),
    }));
  };

  useEffect(() => {
    const templateId = searchParams.get("template");
    if (!templateId) return;
    const template = activationTemplates.find((item) => item.id === templateId);
    if (template) applyTemplate(template);
  }, [searchParams]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!hasCommittedBacking) {
      toast.error("Committed funding must cover the maximum reward liability before this can launch.");
      return;
    }
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
        metadata: {
          activation_safety: {
            funding_source: form.funding_source,
            committed_value: committedValue || null,
            max_liability: maxLiability || null,
            promoshare_rate_pct: Number(form.promoshare_rate || 0),
            promoshare_allocation: promoShareAllocation,
            liability_guard: hasCommittedBacking ? "backed" : "blocked",
          },
        },
        distributions: [{
          channel: form.channel,
          trigger_event: form.trigger_event,
          source_id: form.source_id || null,
          qualification_rules: {
            proof_required: form.proof_required,
            funding_source: form.funding_source,
            committed_value: committedValue || null,
            max_liability: maxLiability || null,
            promoshare_rate_pct: Number(form.promoshare_rate || 0),
            promoshare_allocation: promoShareAllocation,
            release_rule: "verified_action_only",
          },
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
    <div className="min-h-screen bg-[#090909] pb-16 text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <img src={cultureImages.momentFoodFestival} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/40" />
      <div className="relative mx-auto grid min-h-[330px] max-w-7xl items-end gap-5 px-5 pb-10 pt-20 sm:px-8 lg:grid-cols-[1fr_auto]">
        <div>
          <Badge className="mb-4 bg-orange-500 text-black">Funded Activation Studio</Badge>
          <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">Put real value behind the action you want.</h1>
          <GuidanceDisclosure
            id="offer-studio:activation-context"
            eyebrow="Activation guide"
            title="What funded offers are for"
            summary="Build check-in perks, content missions, referral unlocks, and PromoShare cycles from committed value."
            className="mt-4 max-w-3xl"
          >
            <p className="text-base leading-7 text-white/55">Build check-in perks, content missions, referral unlocks, and PromoShare cycles from committed inventory, sponsor budget, or campaign revenue.</p>
          </GuidanceDisclosure>
        </div>
        {canManage && <div className="grid grid-cols-2 gap-3"><Card><CardContent className="p-4"><p className="text-2xl font-bold">{totals.issued}</p><p className="text-xs text-muted-foreground">Issued</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-2xl font-bold">{totals.redeemed}</p><p className="text-xs text-muted-foreground">Redeemed</p></CardContent></Card></div>}
      </div></section>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">

      {canManage && (
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_0.72fr]">
          <GuidanceDisclosure
            id="offer-studio:market-backed-rule"
            eyebrow="Reward rule"
            title="How to keep an activation launch-safe"
            summary="Commit value, require proof, and cap PromoShare from committed backing only."
            className="mt-0"
            tone="light"
          >
            <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
              <div className="rounded-lg border border-border bg-background/70 p-4">
                <p className="font-bold text-foreground">1. Commit value</p>
                <p className="mt-1">Use inventory, off-peak perks, sponsor budget, campaign revenue, or paid placement revenue.</p>
              </div>
              <div className="rounded-lg border border-border bg-background/70 p-4">
                <p className="font-bold text-foreground">2. Require proof</p>
                <p className="mt-1">Rewards issue after QR, GPS, host validation, post URL, referral, or approved proof.</p>
              </div>
              <div className="rounded-lg border border-border bg-background/70 p-4">
                <p className="font-bold text-foreground">3. Cap PromoShare</p>
                <p className="mt-1">PromoShare is calculated from committed value only, so upside never becomes an open liability.</p>
              </div>
            </div>
          </GuidanceDisclosure>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ReceiptText className="h-5 w-5 text-primary" /> Liability preview</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Max reward liability</span><span className="font-bold">{maxLiability.toLocaleString()} {form.value_currency}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Committed backing</span><span className="font-bold">{needsCashBacking ? committedValue.toLocaleString() : "Inventory / in-kind"} {needsCashBacking ? form.value_currency : ""}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">PromoShare allocation</span><span className="font-bold">{promoShareAllocation.toLocaleString()} {form.value_currency}</span></div>
              <Badge variant={hasCommittedBacking ? "default" : "destructive"}>{hasCommittedBacking ? "Launch-safe" : "Needs funding"}</Badge>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue={canManage ? "create" : "wallet"}>
        <TabsList className="mb-6 flex h-auto flex-wrap justify-start">
          {canManage && <TabsTrigger value="create">Create offer</TabsTrigger>}
          {canManage && <TabsTrigger value="manage">Manage</TabsTrigger>}
          <TabsTrigger value="discover">Available now</TabsTrigger>
          <TabsTrigger value="wallet">My offers</TabsTrigger>
          {canManage && <TabsTrigger value="redeem">Validate redemption</TabsTrigger>}
        </TabsList>

        {canManage && <TabsContent value="create"><form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Badge variant="outline" className="mb-3">Quick Launch</Badge>
                  <CardTitle className="font-serif text-3xl">What do you want to make happen?</CardTitle>
                  <GuidanceDisclosure
                    id="offer-studio:quick-launch"
                    eyebrow="Template guide"
                    title="How quick launch templates work"
                    summary="Pick the outcome and Promorang fills in incentive, proof, funding guardrail, and PromoShare cap."
                    className="mt-3"
                    tone="light"
                  >
                    <p className="text-sm text-muted-foreground">Pick the outcome. Promorang fills in the incentive, proof, funding guardrail, and PromoShare cap.</p>
                  </GuidanceDisclosure>
                </div>
                {selectedTemplateId && <Badge className="w-fit">Ready to tune</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              {availableTemplates.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {availableTemplates.map((template) => {
                    const isSelected = selectedTemplateId === template.id;
                    return (
                      <button
                        type="button"
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className={`group flex min-h-48 flex-col rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-soft ${isSelected ? "border-primary bg-primary/10" : "border-border bg-background"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="rounded-xl bg-primary/10 p-3 text-primary"><template.icon className="h-5 w-5" /></div>
                          <ArrowRight className={`h-4 w-4 text-primary transition ${isSelected ? "translate-x-1" : "group-hover:translate-x-1"}`} />
                        </div>
                        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">{template.title}</p>
                        <h3 className="mt-1 font-serif text-2xl font-bold text-foreground">{template.quickTitle}</h3>
                        <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{template.goal}</p>
                        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">{template.bestFor}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card><CardHeader><CardTitle>Launch details</CardTitle></CardHeader><CardContent className="grid gap-5">
            {availableTemplates.length > 0 && (
              <div className="hidden">
                <Label>Start from a market incentive</Label>
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  {availableTemplates.map((template) => (
                    <button
                      type="button"
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      className="rounded-xl border border-border p-4 text-left transition hover:border-primary/40 hover:bg-muted/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary"><template.icon className="h-4 w-4" /></div>
                        <div>
                          <p className="font-bold text-foreground">{template.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{template.goal}</p>
                          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary/80">{template.bestFor}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div><Label htmlFor="offer-title">Title</Label><Input id="offer-title" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="20% off your next visit" required /></div>
            <div><Label htmlFor="offer-description">Description</Label><Textarea id="offer-description" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Tell people what they receive and why it matters." /></div>
            <div className="grid gap-4 sm:grid-cols-3"><div><Label>Reward value</Label><Input type="number" min="0" value={form.value_amount} onChange={(e) => update("value_amount", e.target.value)} placeholder="20" /></div><div><Label>Unit</Label><Input value={form.value_currency} onChange={(e) => update("value_currency", e.target.value)} /></div><div><Label>How many claims?</Label><Input type="number" min="1" value={form.quantity_total} onChange={(e) => update("quantity_total", e.target.value)} /></div></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><Label>Limit per person</Label><Input type="number" min="1" value={form.per_user_limit} onChange={(e) => update("per_user_limit", e.target.value)} /></div><div><Label>Ends</Label><Input type="datetime-local" value={form.ends_at} onChange={(e) => update("ends_at", e.target.value)} /></div></div>
            <div><Label>Terms</Label><Textarea value={form.terms} onChange={(e) => update("terms", e.target.value)} placeholder="Redemption conditions, exclusions, collection instructions..." /></div>
            <details className="group rounded-2xl border border-border bg-muted/30 p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-foreground">
                <span className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-primary" /> Advanced incentive controls</span>
                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
              </summary>
              <div className="mt-5 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2"><div><Label>Reward type</Label><Select value={form.reward_type} onValueChange={(value) => update("reward_type", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["coupon", "product", "voucher", "experience", "cash", "gems", "points", "keys", "other"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div><div><Label>Fulfillment</Label><Select value={form.fulfillment_type} onValueChange={(value) => update("fulfillment_type", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["merchant_validation", "code", "qr", "automatic", "manual", "shipping"].map((value) => <SelectItem key={value} value={value}>{value.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select></div></div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div><Label>Funding source</Label><Select value={form.funding_source} onValueChange={(value) => update("funding_source", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["merchant_inventory", "in_kind_perk", "sponsor_budget", "campaign_revenue", "featured_placement_revenue"].map((value) => <SelectItem key={value} value={value}>{value.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Committed backing</Label><Input type="number" min="0" value={form.committed_value} onChange={(e) => update("committed_value", e.target.value)} placeholder={needsCashBacking ? "Must cover liability" : "Optional"} disabled={!needsCashBacking} /></div>
                  <div><Label>PromoShare %</Label><Input type="number" min="0" max="25" value={form.promoshare_rate} onChange={(e) => update("promoshare_rate", e.target.value)} /></div>
                </div>
              </div>
            </details>
          </CardContent></Card>

          <Card><CardHeader><CardTitle>Proof and launch</CardTitle></CardHeader><CardContent className="space-y-5">
            <div><Label>Proof requirement</Label><Select value={form.proof_required} onValueChange={(value) => update("proof_required", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["qr_gps", "host_validation", "post_url", "photo_video", "purchase_code", "referral_checkin", "verified_moment_activity"].map((value) => <SelectItem key={value} value={value}>{value.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select></div>
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              <p className="font-bold text-foreground">Launch rule</p>
              <p className="mt-1">Reward issue is capped at {quantityTotal || 0} claims and requires {form.proof_required.replaceAll("_", " ")}.</p>
              <p className="mt-2">PromoShare can allocate up to {promoShareAllocation.toLocaleString()} {form.value_currency} from committed value.</p>
            </div>
            <Button type="submit" className="w-full" disabled={createOffer.isPending || !hasCommittedBacking}><Plus className="mr-2 h-4 w-4" />Publish funded activation</Button>
            {!hasCommittedBacking && <p className="text-sm text-destructive">Committed backing must be at least {maxLiability.toLocaleString()} {form.value_currency} for this reward pool.</p>}
            <Button asChild variant="outline" className="w-full">
              <Link to="/create/moment?firstTime=true">Create the linked Moment</Link>
            </Button>
            <details className="group rounded-2xl border border-border bg-background p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-foreground">
                <span className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-primary" /> Advanced distribution</span>
                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
              </summary>
              <div className="mt-5 space-y-5">
                <div className="grid gap-3">{Object.entries(channelCopy).map(([key, item]) => <button type="button" key={key} onClick={() => setForm((current) => ({ ...current, channel: key as keyof typeof channelCopy, trigger_event: item.event }))} className={`rounded-xl border p-4 text-left transition ${form.channel === key ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}><div className="flex items-center gap-3"><item.icon className="h-5 w-5 text-primary" /><div><p className="font-bold">{item.label}</p><p className="text-sm text-muted-foreground">{item.help}</p></div></div></button>)}</div>
                <div><Label>Trigger event</Label><Select value={form.trigger_event} onValueChange={(value) => update("trigger_event", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{form.channel === "moment" && ["join", "checkin", "proof_verified"].map((value) => <SelectItem key={value} value={value}>{value.replaceAll("_", " ")}</SelectItem>)}{form.channel === "content" && ["view", "click", "like", "comment", "share"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}{form.channel === "direct" && <SelectItem value="claim">claim</SelectItem>}{form.channel === "promoshare" && <SelectItem value="winner">winner</SelectItem>}</SelectContent></Select></div>
                {form.channel !== "direct" && <div><Label>Source ID</Label><Input value={form.source_id} onChange={(e) => update("source_id", e.target.value)} placeholder="Moment, content, campaign, or PromoShare cycle ID" /><p className="mt-2 text-xs text-muted-foreground">Leave blank to match every source using this trigger.</p></div>}
              </div>
            </details>
          </CardContent></Card>
        </form></TabsContent>}

        {canManage && <TabsContent value="manage"><div className="grid gap-4">{ownerOffers.data?.map((offer) => <Card key={offer.id}><CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-serif text-xl font-bold">{offer.title}</h3><Badge variant="outline">{offer.status}</Badge><Badge variant="secondary">{offer.reward_type}</Badge></div><p className="mt-2 text-sm text-muted-foreground">{offer.description}</p><p className="mt-3 text-xs text-muted-foreground">{offer.quantity_redeemed} redeemed · {offer.quantity_reserved} reserved · {offer.quantity_total ?? "Unlimited"} total</p></div><Button variant="outline" onClick={() => updateOffer.mutate({ id: offer.id, status: offer.status === "active" ? "paused" : "active" })}>{offer.status === "active" ? "Pause" : "Activate"}</Button></CardContent></Card>)}{!ownerOffers.isLoading && !ownerOffers.data?.length && <Card><CardContent className="p-10 text-center text-muted-foreground">Create your first offer to begin distributing value.</CardContent></Card>}</div></TabsContent>}

        <TabsContent value="discover"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{publicOffers.data?.map((offer) => <Card key={offer.id}><CardContent className="flex h-full flex-col p-5"><div className="flex items-center justify-between"><Badge>{offer.reward_type}</Badge><Gift className="h-5 w-5 text-primary" /></div><h3 className="mt-4 font-serif text-2xl font-bold">{offer.title}</h3><p className="mt-2 flex-1 text-sm text-muted-foreground">{offer.description}</p><p className="mt-4 text-sm font-bold">{offer.value_amount ? `${offer.value_amount} ${offer.value_currency || ""}` : "Special offer"}</p><Button className="mt-4" onClick={async () => { try { await directClaim.mutateAsync(offer.id); toast.success("Offer added to My offers"); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not claim offer"); } }}>Claim offer</Button></CardContent></Card>)}{!publicOffers.isLoading && !publicOffers.data?.length && <Card className="md:col-span-2 lg:col-span-3"><CardContent className="p-12 text-center text-muted-foreground">No direct offers are available right now. Moment, content, and PromoShare rewards will still appear in your wallet when earned.</CardContent></Card>}</div></TabsContent>

        <TabsContent value="wallet"><div className="grid gap-4 md:grid-cols-2">{wallet.data?.map((issuance) => <Card key={issuance.id}><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div><Badge variant="secondary">{issuance.offers.reward_type}</Badge><h3 className="mt-3 font-serif text-2xl font-bold">{issuance.offers.title}</h3></div>{issuance.status === "redeemed" ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <Gift className="h-6 w-6 text-primary" />}</div><p className="mt-3 text-sm text-muted-foreground">{issuance.offers.description}</p><div className="mt-5 rounded-xl bg-muted p-4"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Redemption code</p><p className="mt-1 font-mono text-2xl font-bold tracking-wider">{issuance.redemption_code}</p></div><div className="mt-4 flex items-center justify-between"><Badge variant="outline">{issuance.status.replaceAll("_", " ")}</Badge>{issuance.status === "issued" && <Button onClick={() => claimIssuance.mutate(issuance.id)}>Claim</Button>}</div></CardContent></Card>)}{!wallet.isLoading && !wallet.data?.length && <Card className="md:col-span-2"><CardContent className="p-12 text-center"><PackageCheck className="mx-auto mb-4 h-10 w-10 text-muted-foreground" /><p className="font-bold">No offers issued yet</p><p className="mt-1 text-sm text-muted-foreground">Offers earned through Moments, content, direct claims, and PromoShare will appear here.</p></CardContent></Card>}</div></TabsContent>

        {canManage && <TabsContent value="redeem"><Card className="max-w-xl"><CardHeader><CardTitle>Validate a customer offer</CardTitle></CardHeader><CardContent><form onSubmit={redeem} className="space-y-4"><div><Label htmlFor="redemption-code">Redemption code</Label><Input id="redemption-code" value={redemptionCode} onChange={(e) => setRedemptionCode(e.target.value.toUpperCase())} placeholder="PR-XXXXXXXX" className="font-mono uppercase" required /></div><Button className="w-full" disabled={redeemOffer.isPending}><Radio className="mr-2 h-4 w-4" />Validate and redeem</Button></form></CardContent></Card></TabsContent>}
      </Tabs>
      </div>
    </div>
  );
};

export default OfferStudio;

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
import { OfferFulfillmentQueue } from "@/components/offers/OfferFulfillmentQueue";
import { OfferIssuancePass } from "@/components/offers/OfferIssuancePass";
import { OfferQrScanner } from "@/components/offers/OfferQrScanner";
import { useCreateOffer, useDirectOfferClaim, useOfferWallet, useOwnerOffers, usePublicOffers, useRedeemOffer, useUpdateOffer } from "@/hooks/useOffers";
import { decodeOfferRedeemPayload } from "@promorang/shared";
import { ArrowRight, Banknote, ChevronDown, Gift, MapPin, PackageCheck, Plus, QrCode, Radio, Settings2, Share2, Sparkles, Ticket } from "lucide-react";
import { toast } from "sonner";
import { cultureImages } from "@/data/culture-demo";
import { useI18n } from "@/i18n/I18nContext";
import { TranslationKey } from "@/i18n/translations";

const channelDefinitions = {
  direct: { labelKey: "offerStudio.channel.direct" as TranslationKey, event: "claim", icon: Ticket, helpKey: "offerStudio.channel.directHelp" as TranslationKey },
  moment: { labelKey: "offerStudio.channel.moment" as TranslationKey, event: "checkin", icon: QrCode, helpKey: "offerStudio.channel.momentHelp" as TranslationKey },
  content: { labelKey: "offerStudio.channel.content" as TranslationKey, event: "share", icon: Share2, helpKey: "offerStudio.channel.contentHelp" as TranslationKey },
  promoshare: { labelKey: "offerStudio.channel.promoshare" as TranslationKey, event: "winner", icon: Sparkles, helpKey: "offerStudio.channel.promoshareHelp" as TranslationKey },
} as const;

const activationTemplates = [
  {
    id: "slow-hour-checkin",
    roles: ["merchant", "host", "brand", "admin"],
    quickTitleKey: "offerStudio.template1Quick" as TranslationKey,
    titleKey: "offerStudio.template1Title" as TranslationKey,
    goalKey: "offerStudio.template1Goal" as TranslationKey,
    bestForKey: "offerStudio.template1BestFor" as TranslationKey,
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
      channel: "moment" as keyof typeof channelDefinitions,
      trigger_event: "checkin",
      funding_source: "merchant_inventory",
      proof_required: "qr_gps",
      promoshare_rate: "5",
    },
  },
  {
    id: "content-mission",
    roles: ["creator", "brand", "merchant", "host", "admin"],
    quickTitleKey: "offerStudio.template2Quick" as TranslationKey,
    titleKey: "offerStudio.template2Title" as TranslationKey,
    goalKey: "offerStudio.template2Goal" as TranslationKey,
    bestForKey: "offerStudio.template2BestFor" as TranslationKey,
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
      channel: "content" as keyof typeof channelDefinitions,
      trigger_event: "share",
      funding_source: "sponsor_budget",
      proof_required: "post_url",
      promoshare_rate: "3",
    },
  },
  {
    id: "referral-visit",
    roles: ["merchant", "brand", "creator", "host", "admin"],
    quickTitleKey: "offerStudio.template3Quick" as TranslationKey,
    titleKey: "offerStudio.template3Title" as TranslationKey,
    goalKey: "offerStudio.template3Goal" as TranslationKey,
    bestForKey: "offerStudio.template3BestFor" as TranslationKey,
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
      channel: "moment" as keyof typeof channelDefinitions,
      trigger_event: "proof_verified",
      funding_source: "sponsor_budget",
      proof_required: "referral_checkin",
      promoshare_rate: "2",
    },
  },
  {
    id: "promoshare-funded-cycle",
    roles: ["brand", "merchant", "host", "admin"],
    quickTitleKey: "offerStudio.template4Quick" as TranslationKey,
    titleKey: "offerStudio.template4Title" as TranslationKey,
    goalKey: "offerStudio.template4Goal" as TranslationKey,
    bestForKey: "offerStudio.template4BestFor" as TranslationKey,
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
      channel: "promoshare" as keyof typeof channelDefinitions,
      trigger_event: "winner",
      funding_source: "campaign_revenue",
      proof_required: "verified_moment_activity",
      promoshare_rate: "5",
    },
  },
] as const;

const fulfillmentHelp: Record<string, string> = {
  merchant_validation: "The issuing business types or scans the code at the counter.",
  code: "The customer shows a code. Anyone with the code can redeem it.",
  qr: "The customer shows a scannable pass. Only the issuing business can complete it.",
  automatic: "Claiming puts the value in the wallet immediately. No merchant scan.",
  manual: "Claiming waits for the business to confirm it was given.",
  shipping: "The customer leaves a delivery address. You pack, ship, then mark delivered.",
};

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
  channel: "direct" as keyof typeof channelDefinitions,
  trigger_event: "claim",
  source_id: "",
  status: "active",
  funding_source: "merchant_inventory",
  committed_value: "",
  proof_required: "qr_gps",
  promoshare_rate: "0",
};

const OfferStudio = () => {
  const { t } = useI18n();
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
      toast.error(t("offerStudio.mustCoverLiability", { amount: maxLiability.toLocaleString(), currency: form.value_currency }));
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
      toast.success(t("offerStudio.toastPublished"));
      setForm(initialForm);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not create offer"); }
  };

  const redeemCode = async (raw: string) => {
    const code = decodeOfferRedeemPayload(raw);
    if (!code) return;
    try {
      await redeemOffer.mutateAsync({ code, notes: "merchant_scan" });
      toast.success(t("offerStudio.toastRedeemed"));
      setRedemptionCode("");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not redeem offer"); }
  };

  const redeem = async (event: FormEvent) => {
    event.preventDefault();
    await redeemCode(redemptionCode);
  };

  return (
    <div className="min-h-screen bg-[#090909] pb-16 text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <img src={cultureImages.momentFoodFestival} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/40" />
      <div className="relative mx-auto grid min-h-[330px] max-w-7xl items-end gap-5 px-5 pb-10 pt-20 sm:px-8 lg:grid-cols-[1fr_auto]">
        <div>
          <Badge className="mb-4 bg-orange-500 text-black">{t("offerStudio.heroBadge")}</Badge>
          <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">{t("offerStudio.heroTitle")}</h1>
          <GuidanceDisclosure
            id="offer-studio:activation-context"
            eyebrow={t("offerStudio.guideEyebrow")}
            title={t("offerStudio.guideTitle")}
            summary={t("offerStudio.guideSummary")}
            className="mt-4 max-w-3xl"
          >
            <p className="text-base leading-7 text-white/55">{t("offerStudio.guideCopy")}</p>
          </GuidanceDisclosure>
        </div>
        {canManage && <div className="grid grid-cols-2 gap-3"><Card><CardContent className="p-4"><p className="text-2xl font-bold">{totals.issued}</p><p className="text-xs text-muted-foreground">{t("offerStudio.statIssued")}</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-2xl font-bold">{totals.redeemed}</p><p className="text-xs text-muted-foreground">{t("offerStudio.statRedeemed")}</p></CardContent></Card></div>}
      </div></section>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">

      {canManage && (
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_0.72fr]">
          <GuidanceDisclosure
            id="offer-studio:market-backed-rule"
            eyebrow={t("offerStudio.ruleEyebrow")}
            title={t("offerStudio.ruleTitle")}
            summary={t("offerStudio.ruleSummary")}
            className="mt-0"
            tone="light"
          >
            <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
              <div className="rounded-lg border border-border bg-background/70 p-4">
                <p className="font-bold text-foreground">{t("offerStudio.rule1Title")}</p>
                <p className="mt-1">{t("offerStudio.rule1Copy")}</p>
              </div>
              <div className="rounded-lg border border-border bg-background/70 p-4">
                <p className="font-bold text-foreground">{t("offerStudio.rule2Title")}</p>
                <p className="mt-1">{t("offerStudio.rule2Copy")}</p>
              </div>
              <div className="rounded-lg border border-border bg-background/70 p-4">
                <p className="font-bold text-foreground">{t("offerStudio.rule3Title")}</p>
                <p className="mt-1">{t("offerStudio.rule3Copy")}</p>
              </div>
            </div>
          </GuidanceDisclosure>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ReceiptText className="h-5 w-5 text-primary" /> {t("offerStudio.liabilityPreview")}</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">{t("offerStudio.maxLiability")}</span><span className="font-bold">{maxLiability.toLocaleString()} {form.value_currency}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">{t("offerStudio.committedBacking")}</span><span className="font-bold">{needsCashBacking ? committedValue.toLocaleString() : t("offerStudio.inventoryInKind")} {needsCashBacking ? form.value_currency : ""}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">{t("offerStudio.promoshareAllocation")}</span><span className="font-bold">{promoShareAllocation.toLocaleString()} {form.value_currency}</span></div>
              <Badge variant={hasCommittedBacking ? "default" : "destructive"}>{hasCommittedBacking ? t("offerStudio.launchSafe") : t("offerStudio.needsFunding")}</Badge>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue={canManage ? "create" : "wallet"}>
        <TabsList className="mb-6 flex h-auto flex-wrap justify-start">
          {canManage && <TabsTrigger value="create">{t("offerStudio.tabCreate")}</TabsTrigger>}
          {canManage && <TabsTrigger value="manage">{t("offerStudio.tabManage")}</TabsTrigger>}
          <TabsTrigger value="discover">{t("offerStudio.tabDiscover")}</TabsTrigger>
          <TabsTrigger value="wallet">{t("offerStudio.tabWallet")}</TabsTrigger>
          {canManage && <TabsTrigger value="redeem">{t("offerStudio.tabRedeem")}</TabsTrigger>}
        </TabsList>

        {canManage && <TabsContent value="create"><form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Badge variant="outline" className="mb-3">{t("offerStudio.quickLaunchBadge")}</Badge>
                  <CardTitle className="font-serif text-3xl">{t("offerStudio.quickLaunchHeading")}</CardTitle>
                  <GuidanceDisclosure
                    id="offer-studio:quick-launch"
                    eyebrow={t("offerStudio.quickLaunchGuideEyebrow")}
                    title={t("offerStudio.quickLaunchGuideTitle")}
                    summary={t("offerStudio.quickLaunchGuideSummary")}
                    className="mt-3"
                    tone="light"
                  >
                    <p className="text-sm text-muted-foreground">{t("offerStudio.quickLaunchGuideCopy")}</p>
                  </GuidanceDisclosure>
                </div>
                {selectedTemplateId && <Badge className="w-fit">{t("offerStudio.readyToTune")}</Badge>}
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
                        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">{t(template.titleKey)}</p>
                        <h3 className="mt-1 font-serif text-2xl font-bold text-foreground">{t(template.quickTitleKey)}</h3>
                        <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{t(template.goalKey)}</p>
                        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">{t(template.bestForKey)}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card><CardHeader><CardTitle>{t("offerStudio.launchDetails")}</CardTitle></CardHeader><CardContent className="grid gap-5">
            <div><Label htmlFor="offer-title">{t("offerStudio.titleLabel")}</Label><Input id="offer-title" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder={t("offerStudio.titlePlaceholder")} required /></div>
            <div><Label htmlFor="offer-description">{t("offerStudio.descLabel")}</Label><Textarea id="offer-description" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder={t("offerStudio.descPlaceholder")} /></div>
            <div className="grid gap-4 sm:grid-cols-3"><div><Label>{t("offerStudio.rewardValueLabel")}</Label><Input type="number" min="0" value={form.value_amount} onChange={(e) => update("value_amount", e.target.value)} placeholder="20" /></div><div><Label>{t("offerStudio.unitLabel")}</Label><Input value={form.value_currency} onChange={(e) => update("value_currency", e.target.value)} /></div><div><Label>{t("offerStudio.claimsLabel")}</Label><Input type="number" min="1" value={form.quantity_total} onChange={(e) => update("quantity_total", e.target.value)} /></div></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><Label>{t("offerStudio.limitPerPersonLabel")}</Label><Input type="number" min="1" value={form.per_user_limit} onChange={(e) => update("per_user_limit", e.target.value)} /></div><div><Label>{t("offerStudio.endsLabel")}</Label><Input type="datetime-local" value={form.ends_at} onChange={(e) => update("ends_at", e.target.value)} /></div></div>
            <div><Label>{t("offerStudio.termsLabel")}</Label><Textarea value={form.terms} onChange={(e) => update("terms", e.target.value)} placeholder={t("offerStudio.termsPlaceholder")} /></div>
            <details className="group rounded-2xl border border-border bg-muted/30 p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-foreground">
                <span className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-primary" /> {t("offerStudio.advancedControls")}</span>
                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
              </summary>
              <div className="mt-5 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2"><div><Label>{t("offerStudio.rewardTypeLabel")}</Label><Select value={form.reward_type} onValueChange={(value) => update("reward_type", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["coupon", "product", "voucher", "experience", "cash", "gems", "points", "keys", "other"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div><div><Label>{t("offerStudio.fulfillmentLabel")}</Label><Select value={form.fulfillment_type} onValueChange={(value) => update("fulfillment_type", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["merchant_validation", "code", "qr", "automatic", "manual", "shipping"].map((value) => <SelectItem key={value} value={value}>{value.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select><p className="mt-2 text-xs text-muted-foreground">{fulfillmentHelp[form.fulfillment_type] || "Choose how the person actually receives this."}</p></div></div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div><Label>{t("offerStudio.fundingSourceLabel")}</Label><Select value={form.funding_source} onValueChange={(value) => update("funding_source", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["merchant_inventory", "in_kind_perk", "sponsor_budget", "campaign_revenue", "featured_placement_revenue"].map((value) => <SelectItem key={value} value={value}>{value.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>{t("offerStudio.committedBacking")}</Label><Input type="number" min="0" value={form.committed_value} onChange={(e) => update("committed_value", e.target.value)} placeholder={needsCashBacking ? "Must cover liability" : "Optional"} disabled={!needsCashBacking} /></div>
                  <div><Label>{t("offerStudio.promoshareRateLabel")}</Label><Input type="number" min="0" max="25" value={form.promoshare_rate} onChange={(e) => update("promoshare_rate", e.target.value)} /></div>
                </div>
              </div>
            </details>
          </CardContent></Card>

          <Card><CardHeader><CardTitle>{t("offerStudio.proofAndLaunch")}</CardTitle></CardHeader><CardContent className="space-y-5">
            <div><Label>{t("offerStudio.proofRequirementLabel")}</Label><Select value={form.proof_required} onValueChange={(value) => update("proof_required", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["qr_gps", "host_validation", "post_url", "photo_video", "purchase_code", "referral_checkin", "verified_moment_activity"].map((value) => <SelectItem key={value} value={value}>{value.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select></div>
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              <p className="font-bold text-foreground">{t("offerStudio.launchRuleTitle")}</p>
              <p className="mt-1">{t("offerStudio.launchRuleCapped", { count: (quantityTotal || 0).toString(), proof: form.proof_required.replaceAll("_", " ") })}</p>
              <p className="mt-2">{t("offerStudio.launchRulePromoshare", { amount: promoShareAllocation.toLocaleString(), currency: form.value_currency })}</p>
            </div>
            <Button type="submit" className="w-full" disabled={createOffer.isPending || !hasCommittedBacking}><Plus className="mr-2 h-4 w-4" />{t("offerStudio.publishButton")}</Button>
            {!hasCommittedBacking && <p className="text-sm text-destructive">{t("offerStudio.mustCoverLiability", { amount: maxLiability.toLocaleString(), currency: form.value_currency })}</p>}
            <Button asChild variant="outline" className="w-full">
              <Link to="/create/moment?firstTime=true">{t("offerStudio.createLinkedMoment")}</Link>
            </Button>
            <details className="group rounded-2xl border border-border bg-background p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-foreground">
                <span className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-primary" /> {t("offerStudio.advancedDistribution")}</span>
                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
              </summary>
              <div className="mt-5 space-y-5">
                <div className="grid gap-3">{Object.entries(channelDefinitions).map(([key, item]) => <button type="button" key={key} onClick={() => setForm((current) => ({ ...current, channel: key as keyof typeof channelDefinitions, trigger_event: item.event }))} className={`rounded-xl border p-4 text-left transition ${form.channel === key ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}><div className="flex items-center gap-3"><item.icon className="h-5 w-5 text-primary" /><div><p className="font-bold">{t(item.labelKey)}</p><p className="text-sm text-muted-foreground">{t(item.helpKey)}</p></div></div></button>)}</div>
                <div><Label>{t("offerStudio.triggerEventLabel")}</Label><Select value={form.trigger_event} onValueChange={(value) => update("trigger_event", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{form.channel === "moment" && ["join", "checkin", "proof_verified"].map((value) => <SelectItem key={value} value={value}>{value.replaceAll("_", " ")}</SelectItem>)}{form.channel === "content" && ["view", "click", "like", "comment", "share"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}{form.channel === "direct" && <SelectItem value="claim">claim</SelectItem>}{form.channel === "promoshare" && <SelectItem value="winner">winner</SelectItem>}</SelectContent></Select></div>
                {form.channel !== "direct" && <div><Label>{t("offerStudio.sourceIdLabel")}</Label><Input value={form.source_id} onChange={(e) => update("source_id", e.target.value)} placeholder={t("offerStudio.sourceIdPlaceholder")} /><p className="mt-2 text-xs text-muted-foreground">{t("offerStudio.sourceIdHelp")}</p></div>}
              </div>
            </details>
          </CardContent></Card>
        </form></TabsContent>}

        {canManage && <TabsContent value="manage"><div className="grid gap-4">{ownerOffers.data?.map((offer) => <Card key={offer.id}><CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-serif text-xl font-bold">{offer.title}</h3><Badge variant="outline">{offer.status}</Badge><Badge variant="secondary">{offer.reward_type}</Badge></div><p className="mt-2 text-sm text-muted-foreground">{offer.description}</p><p className="mt-3 text-xs text-muted-foreground">{t("offerStudio.statsRedeemedReservedTotal", { redeemed: (offer.quantity_redeemed || 0).toString(), reserved: (offer.quantity_reserved || 0).toString(), total: (offer.quantity_total ?? "Unlimited").toString() })}</p></div><Button variant="outline" onClick={() => updateOffer.mutate({ id: offer.id, status: offer.status === "active" ? "paused" : "active" })}>{offer.status === "active" ? t("offerStudio.pause") : t("offerStudio.activate")}</Button></CardContent></Card>)}{!ownerOffers.isLoading && !ownerOffers.data?.length && <Card><CardContent className="p-10 text-center text-muted-foreground">{t("offerStudio.emptyManage")}</CardContent></Card>}</div></TabsContent>}

        <TabsContent value="discover"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{publicOffers.data?.map((offer) => <Card key={offer.id}><CardContent className="flex h-full flex-col p-5"><div className="flex items-center justify-between"><Badge>{offer.reward_type}</Badge><Gift className="h-5 w-5 text-primary" /></div><h3 className="mt-4 font-serif text-2xl font-bold">{offer.title}</h3><p className="mt-2 flex-1 text-sm text-muted-foreground">{offer.description}</p><p className="mt-4 text-sm font-bold">{offer.value_amount ? `${offer.value_amount} ${offer.value_currency || ""}` : t("offerStudio.specialOffer")}</p><Button className="mt-4" onClick={async () => { try { await directClaim.mutateAsync(offer.id); toast.success(t("offerStudio.toastAddedToWallet")); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not claim offer"); } }}>{t("offerStudio.claimOffer")}</Button></CardContent></Card>)}{!publicOffers.isLoading && !publicOffers.data?.length && <Card className="md:col-span-2 lg:col-span-3"><CardContent className="p-12 text-center text-muted-foreground">{t("offerStudio.emptyDiscover")}</CardContent></Card>}</div></TabsContent>

        <TabsContent value="wallet"><div className="grid gap-4 md:grid-cols-2">{wallet.data?.map((issuance) => <OfferIssuancePass key={issuance.id} issuance={issuance} />)}{!wallet.isLoading && !wallet.data?.length && <Card className="md:col-span-2"><CardContent className="p-12 text-center"><PackageCheck className="mx-auto mb-4 h-10 w-10 text-muted-foreground" /><p className="font-bold">{t("offerStudio.emptyWalletTitle")}</p><p className="mt-1 text-sm text-muted-foreground">{t("offerStudio.emptyWalletCopy")}</p></CardContent></Card>}</div></TabsContent>

        {canManage && <TabsContent value="redeem"><div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]"><Card className="max-w-xl"><CardHeader><CardTitle>{t("offerStudio.validateTitle")}</CardTitle></CardHeader><CardContent className="space-y-5"><OfferQrScanner disabled={redeemOffer.isPending} onCode={(value) => void redeemCode(value)} /><form onSubmit={redeem} className="space-y-4"><div><Label htmlFor="redemption-code">{t("offerStudio.redemptionCodeLabel")}</Label><Input id="redemption-code" value={redemptionCode} onChange={(e) => setRedemptionCode(e.target.value.toUpperCase())} placeholder="PR-XXXXXXXX" className="font-mono uppercase" required /></div><Button className="w-full" disabled={redeemOffer.isPending}><Radio className="mr-2 h-4 w-4" />{t("offerStudio.validateButton")}</Button></form></CardContent></Card><OfferFulfillmentQueue /></div></TabsContent>}
      </Tabs>
      </div>
    </div>
  );
};

export default OfferStudio;

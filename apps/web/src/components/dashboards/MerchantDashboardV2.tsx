import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Plus,
  QrCode,
  Repeat2,
  ShoppingBag,
  Store,
  Target,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useOwnerOffers, useCreateOffer, type Offer } from "@/hooks/useOffers";
import { useMerchantVenues } from "@/hooks/useVenues";
import { DiscoveryDemandInbox } from "@/components/discovery/DiscoveryDemandInbox";
import MerchantScannerStation from "@/components/merchant/MerchantScannerStation";
import MerchantStorefrontConsole from "@/components/merchant/MerchantStorefrontConsole";
import MerchantOrdersHub from "@/components/merchant/MerchantOrdersHub";
import MerchantVenueStudio from "@/components/merchant/MerchantVenueStudio";
import MerchantYieldAnalytics from "@/components/merchant/MerchantYieldAnalytics";

type MerchantTab = "home" | "promotions" | "customers" | "results" | "business";
type MerchantGoal =
  | "acquire_customers"
  | "retain_customers"
  | "promote_item"
  | "fill_slow_period"
  | "increase_bookings"
  | "increase_spend"
  | "generate_reviews_content"
  | "reward_customers";

type BusinessTool = "storefront" | "locations" | "orders" | "scanner";

const merchantTabs: Array<{
  id: MerchantTab;
  label: string;
  icon: typeof Store;
}> = [
  { id: "home", label: "Home", icon: Store },
  { id: "promotions", label: "Promotions", icon: Target },
  { id: "customers", label: "Customers", icon: Users },
  { id: "results", label: "Sales & Results", icon: BarChart3 },
  { id: "business", label: "Business", icon: Building2 },
];

const merchantGoals: Array<{
  id: MerchantGoal;
  title: string;
  copy: string;
  icon: typeof Store;
}> = [
  {
    id: "acquire_customers",
    title: "Get more customers",
    copy: "Give new customers a clear reason to visit or buy.",
    icon: Users,
  },
  {
    id: "retain_customers",
    title: "Bring customers back",
    copy: "Create a reason for a previous customer to return.",
    icon: Repeat2,
  },
  {
    id: "promote_item",
    title: "Promote something",
    copy: "Move a specific product, service, menu item, or package.",
    icon: ShoppingBag,
  },
  {
    id: "fill_slow_period",
    title: "Fill a slow period",
    copy: "Create demand for the days or hours that need it most.",
    icon: CalendarClock,
  },
  {
    id: "increase_bookings",
    title: "Get more bookings",
    copy: "Give people a reason to reserve an appointment, table, or service.",
    icon: CheckCircle2,
  },
  {
    id: "increase_spend",
    title: "Increase spending",
    copy: "Reward a higher basket, package, or minimum spend.",
    icon: BarChart3,
  },
  {
    id: "generate_reviews_content",
    title: "Get reviews or content",
    copy: "Ask customers for useful proof, reviews, or customer content.",
    icon: Target,
  },
  {
    id: "reward_customers",
    title: "Reward existing customers",
    copy: "Give current customers a reason to stay active with your business.",
    icon: Store,
  },
];

const formatDate = (value?: string | null) => {
  if (!value) return "No end date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No end date";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
};

const isActiveOffer = (offer: Offer) => {
  if (offer.status !== "active") return false;
  if (!offer.ends_at) return true;
  const end = new Date(offer.ends_at).getTime();
  return Number.isNaN(end) || end >= Date.now();
};

function SimplePromotionBuilder({
  open,
  onOpenChange,
  initialGoal,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialGoal: MerchantGoal;
  onCreated: () => void;
}) {
  const { activeOrgId } = useAuth();
  const createOffer = useCreateOffer();
  const [goal, setGoal] = useState<MerchantGoal>(initialGoal);
  const [title, setTitle] = useState("");
  const [customerValue, setCustomerValue] = useState("");
  const [schedule, setSchedule] = useState("");
  const [quantity, setQuantity] = useState("50");

  useEffect(() => {
    if (open) setGoal(initialGoal);
  }, [initialGoal, open]);

  const selectedGoal = merchantGoals.find((item) => item.id === goal) || merchantGoals[0];

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !customerValue.trim()) {
      toast.error("Add a promotion name and tell customers what they get.");
      return;
    }

    const cap = Math.max(1, Number(quantity) || 1);
    const slowPeriod = goal === "fill_slow_period";
    const contentGoal = goal === "generate_reviews_content";
    const bookingGoal = goal === "increase_bookings";
    const channel = contentGoal ? "content" : slowPeriod ? "moment" : "direct";
    const triggerEvent = contentGoal ? "proof_verified" : slowPeriod ? "checkin" : "claim";
    const proofRequired = contentGoal ? "post_url" : bookingGoal ? "booking_confirmation" : slowPeriod ? "qr_gps" : "merchant_validation";
    const fulfillmentType = contentGoal ? "manual" : "merchant_validation";

    try {
      await createOffer.mutateAsync({
        organization_id: activeOrgId,
        owner_type: "merchant",
        title: title.trim(),
        description: customerValue.trim(),
        terms: schedule.trim()
          ? `Available ${schedule.trim()}. One redemption per customer while availability lasts.`
          : "One redemption per customer while availability lasts.",
        reward_type: "coupon",
        fulfillment_type: fulfillmentType,
        value_amount: null,
        value_currency: "JMD",
        quantity_total: cap,
        per_user_limit: 1,
        status: "active",
        metadata: {
          merchant_goal: goal,
          customer_value: customerValue.trim(),
          schedule: schedule.trim() || null,
          availability: contentGoal ? "anywhere" : "local",
          surface: contentGoal ? "commerce" : "place",
          activation_safety: {
            funding_source: "merchant_inventory",
            liability_guard: "backed",
          },
        },
        distributions: [
          {
            channel,
            trigger_event: triggerEvent,
            qualification_rules: {
              proof_required: proofRequired,
              funding_source: "merchant_inventory",
              merchant_goal: goal,
            },
          },
        ],
      });

      toast.success("Promotion published.");
      setTitle("");
      setCustomerValue("");
      setSchedule("");
      setQuantity("50");
      onOpenChange(false);
      onCreated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not publish this promotion.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-white/10 bg-[#0d0f12] text-white">
        <DialogHeader>
          <DialogTitle>Create a promotion</DialogTitle>
          <DialogDescription className="text-white/55">
            Start with the business result. Promorang will configure the mechanics underneath it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold text-white/70">What are you trying to achieve?</label>
            <select
              value={goal}
              onChange={(event) => setGoal(event.target.value as MerchantGoal)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-emerald-500"
            >
              {merchantGoals.map((item) => (
                <option key={item.id} value={item.id} className="bg-zinc-950">
                  {item.title}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-white/45">{selectedGoal.copy}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-bold text-white/70">Promotion name</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Tuesday lunch special"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-bold text-white/70">What does the customer get?</label>
              <input
                value={customerValue}
                onChange={(event) => setCustomerValue(event.target.value)}
                placeholder="e.g. 20% off lunch or a complimentary drink"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-white/70">When is it available?</label>
              <input
                value={schedule}
                onChange={(event) => setSchedule(event.target.value)}
                placeholder="e.g. Tue–Thu, 2–5 PM"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-white/70">How many customers can use it?</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">Customer preview</p>
            <p className="mt-2 font-black text-white">{title.trim() || "Your promotion"}</p>
            <p className="mt-1 text-sm text-white/70">{customerValue.trim() || "What the customer receives will appear here."}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/50">
              {schedule.trim() ? <span>{schedule.trim()}</span> : <span>Available while live</span>}
              <span>•</span>
              <span>Limited to {Math.max(1, Number(quantity) || 1)} customers</span>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="ghost" asChild className="text-white/60 hover:text-white">
              <Link to="/stock">Advanced settings</Link>
            </Button>
            <Button type="submit" disabled={createOffer.isPending} className="bg-emerald-500 font-black text-black hover:bg-emerald-400">
              {createOffer.isPending ? "Publishing…" : "Publish promotion"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MerchantDashboardV2() {
  const { user, organizations, activeOrgId } = useAuth();
  const ownerOffers = useOwnerOffers();
  const { data: venues, isLoading: venuesLoading } = useMerchantVenues();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab") as MerchantTab | null;
  const validTab = merchantTabs.some((tab) => tab.id === requestedTab) ? requestedTab : "home";
  const [activeTab, setActiveTab] = useState<MerchantTab>(validTab || "home");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderGoal, setBuilderGoal] = useState<MerchantGoal>("acquire_customers");
  const [showMoreGoals, setShowMoreGoals] = useState(false);
  const [businessTool, setBusinessTool] = useState<BusinessTool>("storefront");

  useEffect(() => {
    const tab = searchParams.get("tab") as MerchantTab | null;
    setActiveTab(merchantTabs.some((item) => item.id === tab) ? (tab as MerchantTab) : "home");
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    const tab = value as MerchantTab;
    setActiveTab(tab);
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (tab === "home") next.delete("tab");
      else next.set("tab", tab);
      return next;
    });
  };

  const openBuilder = (goal: MerchantGoal = "acquire_customers") => {
    setBuilderGoal(goal);
    setBuilderOpen(true);
  };

  const offers = ownerOffers.data || [];
  const activeOffers = useMemo(() => offers.filter(isActiveOffer), [offers]);
  const totalRedemptions = useMemo(
    () => offers.reduce((sum, offer) => sum + (offer.quantity_redeemed || offer.offer_issuances?.filter((item) => item.status === "redeemed").length || 0), 0),
    [offers],
  );
  const totalClaims = useMemo(
    () => offers.reduce((sum, offer) => sum + (offer.offer_issuances?.length || offer.quantity_reserved || 0), 0),
    [offers],
  );
  const venueCount = venues?.length || 0;
  const activeOrg = organizations.find((org) => org.id === activeOrgId);
  const businessName = activeOrg?.name || user?.user_metadata?.company_name || user?.user_metadata?.full_name || "Your business";

  const nextMove = venueCount === 0
    ? {
        eyebrow: "Finish setup",
        title: "Add the place where customers will redeem promotions.",
        copy: "Once the business location is ready, Promorang can connect promotions to verified in-person activity.",
        action: "Set up business",
        run: () => handleTabChange("business"),
      }
    : offers.length === 0
      ? {
          eyebrow: "Start here",
          title: "Launch your first customer promotion.",
          copy: "Choose the result you want. You do not need to configure channels, triggers, funding rules, or verification mechanics.",
          action: "Create promotion",
          run: () => openBuilder("acquire_customers"),
        }
      : totalRedemptions === 0
        ? {
            eyebrow: "Promotion live",
            title: "Get the live promotion in front of customers.",
            copy: "Your next proof point is the first verified redemption. Share the promotion and make sure staff know how to validate it.",
            action: "Open staff verification",
            run: () => {
              setBusinessTool("scanner");
              handleTabChange("business");
            },
          }
        : {
            eyebrow: "Build on proof",
            title: "You have verified customer activity. Give people a reason to return.",
            copy: "The next useful move is not another feature. It is a second customer action from people you already reached.",
            action: "Bring customers back",
            run: () => openBuilder("retain_customers"),
          };

  const primaryGoals = merchantGoals.slice(0, 4);
  const visibleGoals = showMoreGoals ? merchantGoals : primaryGoals;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in-50 duration-300">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_90%_0%,rgba(16,185,129,.18),transparent_35%),linear-gradient(135deg,#090b0d,#111315)] p-6 text-white sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Merchant</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{businessName}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Get customers, bring them back, and see what Promorang can actually prove for the business.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {user?.id ? (
              <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link to={`/storefront/${user.id}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Public storefront
                </Link>
              </Button>
            ) : null}
            <Button onClick={() => openBuilder()} className="bg-emerald-500 font-black text-black hover:bg-emerald-400">
              <Plus className="mr-2 h-4 w-4" />
              Create promotion
            </Button>
          </div>
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-2 sm:grid-cols-5">
          {merchantTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-2 rounded-xl py-2.5 text-xs sm:text-sm">
                <Icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="home" className="mt-0 space-y-6">
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Choose the outcome</p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.03em]">What would you like to do?</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowMoreGoals((value) => !value)}>
                {showMoreGoals ? "Show less" : "More goals"}
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {visibleGoals.map((goal) => {
                const Icon = goal.icon;
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => openBuilder(goal.id)}
                    className="group rounded-3xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-lg"
                  >
                    <span className="inline-flex rounded-2xl bg-emerald-500/10 p-2.5 text-emerald-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-black">{goal.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{goal.copy}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                      Start <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Verified customer visits", value: ownerOffers.isLoading ? "…" : totalRedemptions.toLocaleString(), help: "Confirmed promotion redemptions" },
              { label: "Attributed sales", value: "—", help: "Shown when transaction value is captured" },
              { label: "Returning customers", value: "—", help: "Available when repeat-customer identity is resolved" },
              { label: "Active promotions", value: ownerOffers.isLoading ? "…" : activeOffers.length.toLocaleString(), help: "Currently available to customers" },
            ].map((metric) => (
              <div key={metric.label} className="rounded-3xl border border-border bg-card p-5">
                <p className="text-xs font-bold text-muted-foreground">{metric.label}</p>
                <p className="mt-2 text-3xl font-black tracking-[-0.04em]">{metric.value}</p>
                <p className="mt-2 text-xs text-muted-foreground">{metric.help}</p>
              </div>
            ))}
          </section>

          <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.06] p-6 sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">{nextMove.eyebrow}</p>
            <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-black tracking-[-0.03em]">{nextMove.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{nextMove.copy}</p>
              </div>
              <Button onClick={nextMove.run} className="shrink-0 bg-emerald-600 font-black text-white hover:bg-emerald-500">
                {nextMove.action}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Live promotions</p>
                <h2 className="mt-1 text-xl font-black">What customers can use now</h2>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleTabChange("promotions")}>View all</Button>
            </div>

            <div className="mt-5 space-y-3">
              {ownerOffers.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading promotions…</p>
              ) : activeOffers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                  <p className="font-bold">No live promotions yet.</p>
                  <p className="mt-1 text-sm text-muted-foreground">Create one from the business result you want.</p>
                  <Button className="mt-4" onClick={() => openBuilder()}>Create promotion</Button>
                </div>
              ) : (
                activeOffers.slice(0, 4).map((offer) => (
                  <div key={offer.id} className="flex flex-col gap-3 rounded-2xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black">{offer.title}</p>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700">Live</span>
                      </div>
                      {offer.description ? <p className="mt-1 text-sm text-muted-foreground">{offer.description}</p> : null}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {offer.quantity_redeemed || 0} redeemed · {formatDate(offer.ends_at)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleTabChange("results")}>View results</Button>
                  </div>
                ))
              )}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="promotions" className="mt-0 space-y-6">
          <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Promotions</p>
              <h2 className="mt-1 text-2xl font-black">Give customers a reason to act.</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Create, review, and repeat customer promotions. Advanced mechanics stay out of the way unless you need them.</p>
            </div>
            <Button onClick={() => openBuilder()} className="bg-emerald-600 font-black text-white hover:bg-emerald-500">
              <Plus className="mr-2 h-4 w-4" /> Create promotion
            </Button>
          </section>

          <div className="space-y-3">
            {ownerOffers.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading promotions…</p>
            ) : offers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center">
                <p className="text-lg font-black">No promotions yet.</p>
                <p className="mt-2 text-sm text-muted-foreground">Choose a business goal and publish the first one.</p>
                <Button className="mt-4" onClick={() => openBuilder()}>Create promotion</Button>
              </div>
            ) : (
              offers.map((offer) => (
                <div key={offer.id} className="rounded-3xl border border-border bg-card p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black">{offer.title}</h3>
                        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-black uppercase text-muted-foreground">{offer.status}</span>
                      </div>
                      {offer.description ? <p className="mt-1 text-sm text-muted-foreground">{offer.description}</p> : null}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {offer.quantity_redeemed || 0} redeemed · {offer.offer_issuances?.length || offer.quantity_reserved || 0} claimed · ends {formatDate(offer.ends_at)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleTabChange("results")}>View results</Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            Need channels, proof rules, funding controls, or other expert settings? <Link to="/stock" className="font-bold text-foreground underline underline-offset-4">Open advanced promotion settings</Link>.
          </div>
        </TabsContent>

        <TabsContent value="customers" className="mt-0 space-y-6">
          <section className="rounded-3xl border border-border bg-card p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Customers</p>
            <h2 className="mt-1 text-2xl font-black">Understand the people who actually acted.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              This view prioritizes verified customer activity over impressions. Repeat-customer identity and attributable sales appear only when Promorang has enough evidence to support them.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs text-muted-foreground">Claims</p>
                <p className="mt-1 text-2xl font-black">{ownerOffers.isLoading ? "…" : totalClaims.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs text-muted-foreground">Verified redemptions</p>
                <p className="mt-1 text-2xl font-black">{ownerOffers.isLoading ? "…" : totalRedemptions.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs text-muted-foreground">Returning customers</p>
                <p className="mt-1 text-2xl font-black">—</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Shown when repeat identity is available</p>
              </div>
            </div>
            <Button className="mt-5" variant="outline" onClick={() => openBuilder("retain_customers")}>Create a return promotion</Button>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Customer demand</p>
            <h3 className="mt-1 text-xl font-black">What people are asking for</h3>
            <div className="mt-5">
              <DiscoveryDemandInbox role="merchant" />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="results" className="mt-0 space-y-6">
          <section className="rounded-3xl border border-border bg-card p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Sales & Results</p>
            <h2 className="mt-1 text-2xl font-black">What happened because of your promotions.</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Separate verified activity from estimates. Do not treat scans or claims as sales unless transaction value was captured.</p>
          </section>
          <MerchantYieldAnalytics />
        </TabsContent>

        <TabsContent value="business" className="mt-0 space-y-6">
          <section className="rounded-3xl border border-border bg-card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Business</p>
                <h2 className="mt-1 text-2xl font-black">Storefront, locations, orders, and staff tools.</h2>
              </div>
              <p className="text-xs text-muted-foreground">{venuesLoading ? "Checking locations…" : `${venueCount} ${venueCount === 1 ? "location" : "locations"}`}</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { id: "storefront" as BusinessTool, label: "Storefront", copy: "Products, services, and public business page", icon: Store },
                { id: "locations" as BusinessTool, label: "Locations", copy: "Where customers can visit or redeem", icon: MapPin },
                { id: "orders" as BusinessTool, label: "Orders", copy: "Paid orders and fulfillment", icon: ShoppingBag },
                { id: "scanner" as BusinessTool, label: "Staff verification", copy: "Validate customer codes at the counter", icon: QrCode },
              ].map((tool) => {
                const Icon = tool.icon;
                const selected = businessTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setBusinessTool(tool.id)}
                    className={`rounded-2xl border p-4 text-left transition ${selected ? "border-emerald-500 bg-emerald-500/10" : "border-border hover:border-emerald-500/30"}`}
                  >
                    <Icon className="h-5 w-5 text-emerald-600" />
                    <p className="mt-3 font-black">{tool.label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{tool.copy}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {businessTool === "storefront" ? (
            <MerchantStorefrontConsole
              onOpenProducts={() => setBusinessTool("storefront")}
              onOpenScanner={() => setBusinessTool("scanner")}
            />
          ) : null}
          {businessTool === "locations" ? <MerchantVenueStudio onOpenMoments={() => setBusinessTool("locations")} /> : null}
          {businessTool === "orders" ? <MerchantOrdersHub onOpenScanner={() => setBusinessTool("scanner")} /> : null}
          {businessTool === "scanner" ? <MerchantScannerStation /> : null}
        </TabsContent>
      </Tabs>

      <SimplePromotionBuilder
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        initialGoal={builderGoal}
        onCreated={() => handleTabChange("promotions")}
      />
    </div>
  );
}

export default MerchantDashboardV2;

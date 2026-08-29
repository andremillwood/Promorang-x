import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserBalance, useEconomyHistory, useGemWalletActions, useGemWithdrawals } from "@/hooks/useEconomy";
import { useValueReceipts } from "@/hooks/useValueReceipts";
import StripeCheckout from "@/components/stripe/StripeCheckout";
import { API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { GuidanceDisclosure } from "@/components/guidance/GuidanceDisclosure";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  WalletCards,
  Coins,
  KeyRound,
  Gem,
  CreditCard,
  ArrowDownLeft,
  RefreshCw,
  DollarSign,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Eye,
  Heart,
  Bookmark,
  MessageSquare,
  Share2,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { cultureEvents } from "@/data/culture-demo";
import { CommerceReceiptRail } from "@/components/commerce/CommerceReceiptRail";
import { CouponWalletRail } from "@/components/commerce/CouponWalletRail";
import { PersonalValueNav } from "@/components/value/PersonalValueNav";
import { DigitalWalletPass3D } from "@/components/wallet/DigitalWalletPass3D";
import { PARTICIPANT_ECONOMY } from "@promorang/shared";
import { useMarket } from "@/contexts/MarketContext";
import { useI18n } from "@/i18n/I18nContext";
import { ValueInstrumentCard } from "@/components/value/ValueInstrumentCard";
import { getPromoKeyAccessState } from "@/lib/promo-key-access";

type GemsTransaction = {
  id: string;
  transaction_type: string;
  amount: number;
  balance_after?: number | null;
  fiat_amount?: number | null;
  fiat_currency?: string | null;
  description?: string | null;
  effective_redemption_status?: string | null;
  redeemable_after?: string | null;
  objective_status?: string | null;
  created_at: string;
};

type GemsBalanceSnapshot = {
  balance: number;
  usd_value: number;
  exchange_rate: number;
  withdrawable_balance?: number;
  pending_purchase_redemption_balance?: number;
  locked_bonus_balance?: number;
  purchased_balance?: number;
  bonus_balance?: number;
  trade_balance?: number;
  next_purchase_redemption_at?: string | null;
};

const GEM_PACKS = [10, 25, 50, 100];

const formatCurrency = (value: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);

const formatSignedValue = (value: number) => `${value >= 0 ? "+" : ""}${Number(value).toLocaleString()}`;
const errorMessage = (error: unknown) => error instanceof Error ? error.message : "Something went wrong";

const Wallet = () => {
  const { t, locale, formatNumber } = useI18n();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const { country, isFeatureEnabled } = useMarket();
  const canBuyGems = isFeatureEnabled("gemPurchases");
  const canWithdrawGems = isFeatureEnabled("gemWithdrawals");
  const { data: walletBalance, isLoading: walletLoading, refetch: refetchWalletBalance } = useUserBalance();
  const { refetch: refetchEconomyHistory } = useEconomyHistory();
  const { data: gemWithdrawals = [], isLoading: withdrawalsLoading, refetch: refetchGemWithdrawals } = useGemWithdrawals();
  const gemActions = useGemWalletActions();
  const { receipts, caps, resetsAt, isLoading: receiptsLoading, refresh: refreshReceipts } = useValueReceipts();

  const [gemsSnapshot, setGemsSnapshot] = useState<GemsBalanceSnapshot>({
    balance: 0,
    usd_value: 0,
    exchange_rate: 1,
  });
  const [gemsTransactions, setGemsTransactions] = useState<GemsTransaction[]>([]);
  const [gemsLoading, setGemsLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [walletRefreshTick, setWalletRefreshTick] = useState(0);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [checkoutActive, setCheckoutActive] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState<number>(25);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [convertQuantity, setConvertQuantity] = useState(1);
  const [converting, setConverting] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("250");
  const [withdrawNote, setWithdrawNote] = useState("");

  useEffect(() => {
    if (!session?.access_token) {
      setGemsLoading(false);
      setTransactionsLoading(false);
      return;
    }

    fetchGemsBalance();
    fetchGemsTransactions();
  }, [session?.access_token, walletRefreshTick]);

  const fetchGemsBalance = async () => {
    if (!session?.access_token) return;

    setGemsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pieces/gems/balance`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || `Gems balance request failed with ${response.status}`);
      }

      const data = await response.json();
      setGemsSnapshot({
        balance: Number(data.balance || 0),
        usd_value: Number(data.usd_value || 0),
        exchange_rate: Number(data.exchange_rate || 1),
        withdrawable_balance: Number(data.withdrawable_balance || 0),
        pending_purchase_redemption_balance: Number(data.pending_purchase_redemption_balance || 0),
        locked_bonus_balance: Number(data.locked_bonus_balance || 0),
        purchased_balance: Number(data.purchased_balance || 0),
        bonus_balance: Number(data.bonus_balance || 0),
        trade_balance: Number(data.trade_balance || 0),
        next_purchase_redemption_at: data.next_purchase_redemption_at || null,
      });
    } catch (error: unknown) {
      toast({
        title: "Wallet unavailable",
        description: errorMessage(error) || "Could not load Gems balance.",
        variant: "destructive",
      });
    } finally {
      setGemsLoading(false);
    }
  };

  const fetchGemsTransactions = async () => {
    if (!session?.access_token) return;

    setTransactionsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pieces/gems/transactions?limit=10`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || `Gems transactions request failed with ${response.status}`);
      }

      const data = await response.json();
      setGemsTransactions(data.transactions || []);
    } catch (error: unknown) {
      toast({
        title: "Transactions unavailable",
        description: errorMessage(error) || "Could not load Gems transactions.",
        variant: "destructive",
      });
    } finally {
      setTransactionsLoading(false);
    }
  };

  const refreshWallet = async () => {
    await Promise.all([
      refetchWalletBalance(),
      refetchEconomyHistory(),
      refreshReceipts(),
      refetchGemWithdrawals(),
    ]);
    setWalletRefreshTick((value) => value + 1);
  };

  const handlePurchaseSuccess = async () => {
    setCheckoutActive(false);
    setBuyDialogOpen(false);

    toast({
      title: "Payment confirmed",
      description: "Your Gems balance should update shortly after payment settlement.",
    });

    setTimeout(() => {
      refreshWallet();
    }, 2500);
  };

  const convertPoints = async () => {
    if (!session?.access_token) return;
    setConverting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/economy/convert/points-to-promokeys`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: convertQuantity }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Conversion failed");
      await refreshWallet();
      setConvertDialogOpen(false);
      toast({
        title: `${convertQuantity} PromoKey${convertQuantity > 1 ? "s" : ""} unlocked`,
        description: `${(convertQuantity * PARTICIPANT_ECONOMY.pointsPerPromoKey).toLocaleString()} Points moved into access you can use.`,
      });
    } catch (error: unknown) {
      toast({ title: "Could not convert Points", description: errorMessage(error), variant: "destructive" });
    } finally {
      setConverting(false);
    }
  };

  const points = Number(walletBalance?.points || 0);
  const gems = Number(walletBalance?.gems || 0);
  const pendingWithdrawalGems = gemWithdrawals
    .filter((request) => ["requested", "reviewing", "approved"].includes(request.status))
    .reduce((sum, request) => sum + Number(request.gems_amount || 0), 0);
  const pointsPerKey = PARTICIPANT_ECONOMY.pointsPerPromoKey;
  const availableConversions = Math.min(PARTICIPANT_ECONOMY.maxDailyPromoKeyConversions, Math.floor(points / pointsPerKey));
  const nextKeyProgress = Math.min(100, ((points % pointsPerKey) / pointsPerKey) * 100);
  const keyAccess = getPromoKeyAccessState(points);
  const submitGemWithdrawal = async () => {
    try {
      await gemActions.requestWithdrawal.mutateAsync({ amount: Number(withdrawAmount), note: withdrawNote });
      setWithdrawDialogOpen(false);
      setWithdrawNote("");
      toast({ title: "Withdrawal requested", description: `${Number(withdrawAmount).toLocaleString()} Gems are now pending review.` });
      await refreshWallet();
    } catch (error: unknown) {
      toast({ title: "Could not request withdrawal", description: errorMessage(error), variant: "destructive" });
    }
  };

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <WalletCards className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-4 text-2xl font-bold">{t("wallet.title")}</h1>
            <p className="mt-2 text-muted-foreground">{t("wallet.signInCopy")}</p>
            <Button asChild className="mt-6">
              <Link to="/auth">{t("wallet.signIn")}</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative min-h-[500px] overflow-hidden border-b border-white/10 bg-black">
        <img src={cultureEvents[1]?.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/35" />
        <div className="relative w-full grid min-h-[500px] gap-8 px-4 sm:px-6 lg:px-8 py-8 md:py-10 md:grid-cols-[1fr_420px] md:items-end">
          <div className="text-white">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">
              <WalletCards className="h-3.5 w-3.5" />
              {t("wallet.eyebrow")}
            </div>
            <h1 className="max-w-3xl font-sans text-5xl font-black uppercase leading-[0.84] tracking-[-0.07em] text-white md:text-7xl">
              {t("wallet.hero1")}<br /><span className="text-primary">{t("wallet.hero2")}</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
              {t("wallet.heroCopy")}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <DigitalWalletPass3D
              displayName={user.user_metadata?.full_name || user.user_metadata?.name}
              userEmail={user.email}
              userId={user.id}
              points={walletBalance?.points || 0}
              promoKeys={walletBalance?.promokeys || 0}
              gems={gems}
            />
            <div className="flex w-full max-w-[420px] gap-2">
              <Button className="flex-1 rounded-xl shadow-lg" asChild>
                <Link to="/discover"><Sparkles className="mr-2 h-4 w-4" />{t("wallet.earn")}</Link>
              </Button>
              <Button variant="outline" size="icon" className="rounded-xl border-white/20 bg-black/40 text-white hover:bg-white/10 hover:text-white" onClick={refreshWallet} title={t("wallet.refresh")}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8">
        <PersonalValueNav className="relative z-20 -mt-6" />
      </div>

      <main className="w-full space-y-8 px-4 sm:px-6 lg:px-8 py-6">
        <GuidanceDisclosure
          id="wallet:economy-path"
          eyebrow="Wallet path"
          title="How participation becomes usable value"
          summary={`Show up, verify, unlock PromoKeys, and earn Gems through funded work. ${pointsPerKey} Points becomes 1 PromoKey.`}
          className="mt-0"
        >
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid md:grid-cols-4">
              {[
                ["01", "Show up", "Join a Moment or useful action"],
                ["02", "Verify", "Proof turns activity into standing"],
                ["03", "Unlock", `${pointsPerKey} Points becomes 1 PromoKey`],
                ["04", "Earn", "Funded work settles as Gems"],
              ].map(([number, title, text], index) => (
                <div key={number} className={`relative p-5 ${index < 3 ? "border-b border-border md:border-b-0 md:border-r" : ""}`}>
                  <div className="text-[10px] font-black tracking-[0.25em] text-primary">{number}</div>
                  <div className="mt-2 font-semibold">{title}</div>
                  <div className="mt-1 text-xs leading-5 text-muted-foreground">{text}</div>
                </div>
              ))}
            </div>
          </section>
        </GuidanceDisclosure>

        <section aria-labelledby="available-value-heading" className="space-y-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.24em] text-primary">Available now</p>
              <h2 id="available-value-heading" className="mt-1 text-3xl font-black tracking-[-.045em]">What your value can do</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Each balance has one job. Use it, convert it, or see exactly why it is waiting.</p>
            </div>
            <Button asChild variant="outline" className="rounded-xl"><Link to="/portfolio">View your Pieces <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <ValueInstrumentCard icon={Coins} label="Participation points" value={formatNumber(points)} meaning="Proof that you showed up. Enough Points become a pass into a funded Moment." status="Builds a pass" tone="amber" loading={walletLoading} progress={keyAccess.progress} progressLabel={keyAccess.canConvert ? t(keyAccess.readyCount === 1 ? "wallet.unlockReady" : "wallet.unlockReadyPlural", { count: formatNumber(keyAccess.readyCount) }) : t("wallet.unlockNeed", { count: formatNumber(keyAccess.pointsNeeded) })} actionLabel={t("wallet.unlockOutcome")} onAction={() => setConvertDialogOpen(true)} disabled={!keyAccess.canConvert} disabledReason={t("wallet.unlockNeed", { count: formatNumber(keyAccess.pointsNeeded) })} />
            <ValueInstrumentCard icon={KeyRound} label="PromoKeys" value={formatNumber(Number(walletBalance?.promokeys || 0))} meaning="Your ticket into a funded tasting, drop, or reserved table." status="Ready to use" tone="orange" loading={walletLoading} actionLabel={t("wallet.useKeys")} onAction={() => window.location.assign("/discover")} />
            <ValueInstrumentCard icon={Gem} label="Gems" value={formatNumber(gemsSnapshot.balance || gems)} meaning="Value earned through funded work. Some Gems may need to clear before withdrawal." status={Number(gemsSnapshot.pending_purchase_redemption_balance || 0) > 0 ? "Partly pending" : "Usable value"} tone="violet" loading={gemsLoading} actionLabel={canBuyGems ? "Buy or manage Gems" : "View Gem details"} onAction={() => { setCheckoutActive(false); setBuyDialogOpen(true); }} />
            <ValueInstrumentCard icon={DollarSign} label="Withdrawable" value={formatCurrency(Number(gemsSnapshot.withdrawable_balance || 0))} meaning={pendingWithdrawalGems > 0 ? `${formatNumber(pendingWithdrawalGems)} Gems are already under review.` : "The portion currently eligible to request as a payout."} status={pendingWithdrawalGems > 0 ? "Request pending" : "Eligible now"} tone="emerald" loading={gemsLoading || withdrawalsLoading} actionLabel="Request withdrawal" onAction={() => setWithdrawDialogOpen(true)} disabled={!canWithdrawGems || Number(gemsSnapshot.withdrawable_balance || 0) <= 0} disabledReason={!canWithdrawGems ? `Unavailable in ${country.name}` : "Nothing eligible yet"} />
          </div>
        </section>

        <div className="hidden" aria-hidden="true">
          {/* 1. Points Card */}
          <Card className="relative overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-neutral-900/90 to-black/95 shadow-xl backdrop-blur-xl">
            <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                  <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <Coins className="h-4 w-4" />
                  </span>
                  Points
                </CardTitle>
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px] uppercase font-black tracking-wider">
                  Participation
                </Badge>
              </div>
              <CardDescription className="text-xs">{t("wallet.pointsCopy")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-4">
              {walletLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div>
                  <div className="text-3xl font-black text-foreground tracking-tight">
                    {walletBalance?.points?.toLocaleString() || 0}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{t("wallet.pointsBody")}</p>
                </div>
              )}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">PromoKey Progress</span>
                  <span className="text-amber-400">{Math.round(nextKeyProgress)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-800 border border-neutral-700/50">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500" style={{ width: `${nextKeyProgress}%` }} />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {t("wallet.nextKey", { count: formatNumber(Math.max(0, pointsPerKey - (points % pointsPerKey))) })}
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full border-amber-500/30 hover:bg-amber-500/10 text-amber-300 font-bold text-xs"
                size="sm"
                onClick={() => setConvertDialogOpen(true)}
                disabled={availableConversions < 1}
              >
                Convert to PromoKeys
              </Button>
            </CardContent>
          </Card>

          {/* 2. PromoKeys Card */}
          <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-neutral-900/90 to-black/95 shadow-xl backdrop-blur-xl">
            <div className="absolute top-0 right-0 h-24 w-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                  <span className="p-1.5 rounded-lg bg-primary/15 text-primary border border-primary/30">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  PromoKeys
                </CardTitle>
                <Badge variant="outline" className="border-primary/30 text-primary text-[10px] uppercase font-black tracking-wider">
                  Access Key
                </Badge>
              </div>
              <CardDescription className="text-xs">{t("wallet.keysCopy")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-4">
              {walletLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div>
                  <div className="text-3xl font-black text-foreground tracking-tight">
                    {walletBalance?.promokeys || 0}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{t("wallet.keysBody")}</p>
                </div>
              )}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-xs text-muted-foreground">
                <span className="font-semibold text-primary">Unlocks:</span> Funded Moments, gated drops, and proof-backed experiences.
              </div>
              <Button
                className="w-full font-bold text-xs shadow-md"
                size="sm"
                onClick={() => setConvertDialogOpen(true)}
                disabled={availableConversions < 1}
              >
                {t("wallet.convert")}
              </Button>
            </CardContent>
          </Card>

          {/* 3. Gems Card */}
          <Card className="relative overflow-hidden border-violet-500/30 bg-gradient-to-br from-violet-950/25 via-neutral-900/90 to-black/95 shadow-xl backdrop-blur-xl">
            <div className="absolute top-0 right-0 h-24 w-24 bg-violet-500/15 rounded-full blur-2xl pointer-events-none" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                  <span className="p-1.5 rounded-lg bg-violet-500/15 text-violet-400 border border-violet-500/30">
                    <Gem className="h-4 w-4" />
                  </span>
                  Gems
                </CardTitle>
                <Badge variant="outline" className="border-violet-500/30 text-violet-400 text-[10px] uppercase font-black tracking-wider">
                  $1 = 1 Gem
                </Badge>
              </div>
              <CardDescription className="text-xs">{t("wallet.gemsCopy")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-4">
              {gemsLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <>
                  <div>
                    <div className="text-3xl font-black text-foreground tracking-tight">
                      {gems.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">Gems</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Spendable on Pieces, Moments, & Creator drops.
                    </p>
                  </div>
                  <div className="space-y-1 rounded-xl border border-violet-500/20 bg-violet-950/20 p-2.5 text-[11px] text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Available:</span>
                      <span className="font-semibold text-foreground">{formatNumber(gems)} Gems</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending settlement:</span>
                      <span className="font-semibold text-violet-300">{formatNumber(pendingWithdrawalGems)} Gems</span>
                    </div>
                  </div>
                </>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  size="sm"
                  className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs"
                  disabled={!canBuyGems}
                  onClick={() => { setCheckoutActive(false); setBuyDialogOpen(true); }}
                >
                  <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                  {canBuyGems ? t("wallet.buy") : "Unavailable"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-violet-500/30 hover:bg-violet-500/10 text-violet-300 font-bold text-xs"
                  disabled={!canWithdrawGems}
                  onClick={() => setWithdrawDialogOpen(true)}
                >
                  <ArrowDownLeft className="mr-1.5 h-3.5 w-3.5" />
                  {t("wallet.withdraw")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 4. Withdrawal Queue Card */}
          <Card className="relative overflow-hidden border-emerald-500/30 bg-gradient-to-br from-emerald-950/25 via-neutral-900/90 to-black/95 shadow-xl backdrop-blur-xl">
            <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                  <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  Withdrawal Queue
                </CardTitle>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-black tracking-wider">
                  Settlement
                </Badge>
              </div>
              <CardDescription className="text-xs">{t("wallet.queueCopy")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-4">
              <div>
                <div className="text-3xl font-black text-foreground tracking-tight">
                  {pendingWithdrawalGems.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">Gems</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  ≈ ${pendingWithdrawalGems.toLocaleString()} USD in review.
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2.5 text-xs text-muted-foreground">
                <span className="font-semibold text-emerald-400">1 Gem = US$1</span> before external banking fees.
              </div>
              <Button
                className="w-full border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-300 font-bold text-xs"
                size="sm"
                variant="outline"
                disabled={!canWithdrawGems}
                onClick={() => setWithdrawDialogOpen(true)}
              >
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                {canWithdrawGems ? t("wallet.request") : `Unavailable in ${country.name}`}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* History and Activity Grids */}
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          {/* Left: Gem Activity History */}
          <Card className="border-border/60 bg-card/80 backdrop-blur-xl shadow-xl">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">{t("wallet.history")}</CardTitle>
                  <CardDescription className="text-xs">{t("wallet.historyCopy")}</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  {gemsTransactions.length} Events
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {transactionsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              ) : gemsTransactions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center bg-neutral-900/30">
                  <Gem className="mx-auto h-10 w-10 text-violet-400/60" />
                  <h3 className="mt-3 font-bold text-foreground">{t("wallet.noActivity")}</h3>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">{t("wallet.noActivityCopy")}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/40">
                        <TableHead className="text-xs font-bold uppercase">{t("wallet.type")}</TableHead>
                        <TableHead className="text-xs font-bold uppercase">{t("wallet.amount")}</TableHead>
                        <TableHead className="text-xs font-bold uppercase">{t("wallet.balanceAfter")}</TableHead>
                        <TableHead className="text-xs font-bold uppercase">{t("wallet.when")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gemsTransactions.map((transaction) => (
                        <TableRow key={transaction.id} className="border-border/30 hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="space-y-0.5">
                              <div className="font-semibold text-sm capitalize text-foreground flex items-center gap-1.5">
                                <span className={`h-2 w-2 rounded-full ${transaction.amount >= 0 ? "bg-emerald-500" : "bg-rose-500"}`} />
                                {transaction.transaction_type.replace(/_/g, " ")}
                              </div>
                              {transaction.description ? (
                                <div className="text-xs text-muted-foreground line-clamp-1">{transaction.description}</div>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`font-black text-sm ${transaction.amount >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {formatSignedValue(transaction.amount)} Gems
                            </span>
                            {transaction.fiat_amount ? (
                              <div className="text-[11px] text-muted-foreground">
                                {formatCurrency(Number(transaction.fiat_amount), transaction.fiat_currency || "USD")}
                              </div>
                            ) : null}
                          </TableCell>
                          <TableCell className="font-semibold text-xs text-foreground">
                            {Number(transaction.balance_after || 0).toLocaleString()} Gems
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(transaction.created_at).toLocaleDateString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column: Requests, Proof Receipts, Contribution Limits */}
          <div className="space-y-6">
            {/* Gem Requests */}
            <Card className="border-border/60 bg-card/80 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" /> {t("wallet.requests")}
                </CardTitle>
                <CardDescription className="text-xs">{t("wallet.requestsCopy")}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {withdrawalsLoading ? (
                  <Skeleton className="h-20 w-full rounded-xl" />
                ) : gemWithdrawals.length ? (
                  gemWithdrawals.slice(0, 4).map((request) => (
                    <div key={request.id} className="rounded-xl border border-border/60 bg-neutral-900/40 p-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-sm text-foreground">{Number(request.gems_amount).toLocaleString()} Gems</p>
                        <p className="text-xs text-muted-foreground">US${Number(request.usd_amount).toLocaleString()} · {new Date(request.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant={request.status === "requested" ? "secondary" : "outline"} className="capitalize text-[10px]">
                          {request.status}
                        </Badge>
                        {["requested", "reviewing"].includes(request.status) && (
                          <div>
                            <button
                              className="text-[11px] font-semibold text-rose-400 hover:underline"
                              disabled={gemActions.cancelWithdrawal.isPending}
                              onClick={async () => {
                                try {
                                  await gemActions.cancelWithdrawal.mutateAsync(request.id);
                                  toast({ title: "Withdrawal cancelled", description: "The Gems returned to your wallet." });
                                  await refreshWallet();
                                } catch (error: unknown) {
                                  toast({ title: "Could not cancel request", description: errorMessage(error), variant: "destructive" });
                                }
                              }}
                            >
                              {t("wallet.cancelRequest")}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground py-2 text-center">{t("wallet.noRequests")}</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Proof Receipts */}
            <Card className="border-border/60 bg-card/80 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> {t("wallet.proofReceipts")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <GuidanceDisclosure
                  id="wallet:proof-receipts"
                  title={t("wallet.proofMeaning")}
                  summary={t("wallet.proofSummary")}
                  className="mb-2 mt-0"
                >
                  <p className="text-xs text-muted-foreground">
                    {t("wallet.proofCopy")}
                  </p>
                </GuidanceDisclosure>

                {receiptsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} className="h-14 w-full rounded-xl" />
                    ))}
                  </div>
                ) : receipts.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2 text-center">{t("wallet.noProof")}</p>
                ) : (
                  <div className="space-y-2.5">
                    {receipts.slice(0, 4).map((receipt) => (
                      <div key={receipt.id} className="rounded-xl border border-border/60 bg-neutral-900/40 p-3 hover:border-primary/40 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-xs text-foreground">{receipt.headline}</div>
                            <div className="text-[11px] text-muted-foreground line-clamp-1">{receipt.description}</div>
                          </div>
                          <Badge variant={receipt.lifecycle_status === "available" ? "default" : "secondary"} className="capitalize text-[10px]">
                            {receipt.lifecycle_status}
                          </Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center justify-between border-t border-border/40 pt-2 gap-2 text-xs">
                          <div className="flex flex-wrap gap-1.5">
                            {(receipt.rewards || []).filter((reward) => Number(reward.amount) !== 0).map((reward, index) => (
                              <Badge key={`${reward.currency}-${index}`} variant="outline" className="text-[10px] bg-primary/10 border-primary/20 text-primary">
                                {formatSignedValue(Number(reward.amount))} {reward.label || reward.currency}
                              </Badge>
                            ))}
                          </div>
                          <Link
                            to={`/r/${receipt.id}`}
                            className="inline-flex items-center gap-1 font-bold text-[11px] text-primary hover:underline"
                          >
                            Inspect <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Today's Contribution Limits (Gamified progress meters) */}
            <Card className="border-border/60 bg-card/80 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> {t("wallet.limits")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <GuidanceDisclosure
                  id="wallet:contribution-limits"
                  title={t("wallet.limitsWhy")}
                  summary={t("wallet.limitsSummary")}
                  className="mt-0"
                >
                  <p className="text-xs text-muted-foreground">
                    {t("wallet.limitsCopy")}
                  </p>
                </GuidanceDisclosure>

                {caps.length > 0 ? (
                  <div className="space-y-3.5">
                    {caps.map((cap) => {
                      const percent = Math.min(100, Math.round((cap.used / cap.daily_limit) * 100));
                      const isMaxed = cap.used >= cap.daily_limit;

                      const actionIcons: Record<string, any> = {
                        view: Eye,
                        like: Heart,
                        save: Bookmark,
                        comment: MessageSquare,
                        share: Share2,
                      };
                      const IconComponent = actionIcons[cap.action_type.toLowerCase()] || Coins;

                      return (
                        <div key={cap.action_type} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold capitalize text-foreground flex items-center gap-1.5">
                              <IconComponent className="w-3.5 h-3.5 text-primary" />
                              {cap.action_type}s
                            </span>
                            <span className="font-medium text-muted-foreground flex items-center gap-2">
                              <span>{cap.used} / {cap.daily_limit}</span>
                              <Badge variant={isMaxed ? "default" : "outline"} className={`text-[10px] py-0 px-1.5 ${isMaxed ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : ""}`}>
                                {percent}%
                              </Badge>
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-neutral-800 border border-neutral-700/40">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isMaxed
                                  ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                                  : percent > 50
                                  ? "bg-amber-500"
                                  : "bg-primary"
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : !receiptsLoading ? (
                  <p className="text-xs text-muted-foreground py-2 text-center">{t("wallet.noLimits")}</p>
                ) : (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-6 w-full rounded-full" />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <section aria-labelledby="saved-value-heading" className="space-y-5 border-t border-border/60 pt-8">
          <div><p className="text-[10px] font-black uppercase tracking-[.24em] text-primary">Saved for later</p><h2 id="saved-value-heading" className="mt-1 text-2xl font-black tracking-[-.04em]">Passes, offers, and receipts</h2><p className="mt-2 text-sm text-muted-foreground">The things you can return to, redeem, or use as proof—kept separate from spendable balances.</p></div>
          <CouponWalletRail />
          <CommerceReceiptRail />
        </section>
      </main>

      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("wallet.convertTitle")}</DialogTitle>
            <DialogDescription>
              Convert {pointsPerKey} Points into 1 PromoKey. PromoKeys enter funded drops and gated opportunities once today's Master Key is active. Maximum {PARTICIPANT_ECONOMY.maxDailyPromoKeyConversions} conversions per day.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{t("wallet.availablePoints")}</span><strong>{formatNumber(points)}</strong></div>
              <div className="mt-2 flex items-center justify-between"><span className="text-sm text-muted-foreground">{t("wallet.conversion")}</span><strong>{formatNumber(convertQuantity * pointsPerKey)} Points → {formatNumber(convertQuantity)} PromoKeys</strong></div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="promokey-quantity">{t("wallet.keysToUnlock")}</Label>
              <Input id="promokey-quantity" type="number" min={1} max={availableConversions} value={convertQuantity} onChange={(event) => setConvertQuantity(Math.max(1, Math.min(availableConversions || 1, Number(event.target.value || 1))))} />
              <p className="text-xs text-muted-foreground">{t("wallet.convertAvailable", { count: formatNumber(availableConversions) })}</p>
            </div>
            <Button className="w-full" onClick={convertPoints} disabled={converting || availableConversions < 1}>
              {converting ? t("wallet.converting") : t("wallet.unlockKeys", { count: formatNumber(convertQuantity) })}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={buyDialogOpen}
        onOpenChange={(open) => {
          if (!checkoutActive) setBuyDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("wallet.buyTitle")}</DialogTitle>
            <DialogDescription>
              This market settles Gem purchases in USD through Stripe. Your local currency is {country.currency}; your bank may apply conversion fees. Purchased and promotional Gems remain separately traceable. Purchases above US$100 require KYC.
            </DialogDescription>
          </DialogHeader>

          {checkoutActive ? (
            <StripeCheckout
              amount={purchaseAmount}
              currency="usd"
              paymentIntentPath="/api/pieces/gems/purchase"
              paymentIntentBody={{ usd_amount: purchaseAmount }}
              onSuccess={handlePurchaseSuccess}
              onCancel={() => setCheckoutActive(false)}
            />
          ) : (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-4">
                {GEM_PACKS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setPurchaseAmount(amount)}
                    className={`rounded-2xl border p-4 text-left transition-colors ${
                      purchaseAmount === amount
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-border hover:border-violet-500/40"
                    }`}
                  >
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("wallet.pack")}</div>
                    <div className="mt-2 text-2xl font-bold">${amount}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{amount} Gems</div>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet-gems-amount">{t("wallet.customAmount")}</Label>
                <Input
                  id="wallet-gems-amount"
                  type="number"
                  min={5}
                  max={1000}
                  step={1}
                  value={purchaseAmount}
                  onChange={(event) => setPurchaseAmount(Number(event.target.value || 0))}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum $5. Maximum $1,000 per transaction. Current rate: 1 Gem = US$1. Purchased Gems can fund merchant-specific Gem Cards; they are not cash-redeemable by customers.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">{t("wallet.receive")}</span>
                  <span className="text-lg font-semibold">{Number(purchaseAmount || 0).toLocaleString()} Gems</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setBuyDialogOpen(false)}>
                  {t("wallet.cancel")}
                </Button>
                <Button
                  onClick={() => setCheckoutActive(true)}
                  disabled={!purchaseAmount || purchaseAmount < 5 || purchaseAmount > 1000}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {t("wallet.continuePayment")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("wallet.withdrawTitle")}</DialogTitle>
            <DialogDescription>
              Earned Gems can be reviewed for payout at 1 Gem = US$1. Minimum request is 250 Gems.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{t("wallet.walletGems")}</span><strong>{formatNumber(gems)}</strong></div>
              <div className="mt-2 flex items-center justify-between text-sm"><span className="text-muted-foreground">{t("wallet.alreadyPending")}</span><strong>{formatNumber(pendingWithdrawalGems)}</strong></div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gem-withdraw-amount">{t("wallet.gemsToWithdraw")}</Label>
              <Input id="gem-withdraw-amount" type="number" min={250} value={withdrawAmount} onChange={(event) => setWithdrawAmount(event.target.value)} />
              <p className="text-xs text-muted-foreground">{t("wallet.withdrawHold")}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gem-withdraw-note">{t("wallet.payoutNote")}</Label>
              <Textarea id="gem-withdraw-note" value={withdrawNote} onChange={(event) => setWithdrawNote(event.target.value)} placeholder={t("wallet.payoutPlaceholder")} />
            </div>
            <Button className="w-full" disabled={gemActions.requestWithdrawal.isPending || Number(withdrawAmount) < 250 || Number(withdrawAmount) > gems} onClick={submitGemWithdrawal}>
              {gemActions.requestWithdrawal.isPending ? t("wallet.requesting") : t("wallet.request")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Wallet;

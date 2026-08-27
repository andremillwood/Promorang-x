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
} from "lucide-react";
import { cultureEvents } from "@/data/culture-demo";
import { CommerceReceiptRail } from "@/components/commerce/CommerceReceiptRail";
import { CouponWalletRail } from "@/components/commerce/CouponWalletRail";
import { PersonalValueNav } from "@/components/value/PersonalValueNav";
import { DigitalWalletPass3D } from "@/components/wallet/DigitalWalletPass3D";
import { PARTICIPANT_ECONOMY } from "@promorang/shared";
import { useMarket } from "@/contexts/MarketContext";
import { useI18n } from "@/i18n/I18nContext";
import { DigitalPromoCard } from "@/components/promocard";
import { PiecesDividendWalletCard } from "@/components/wallet/PiecesDividendWalletCard";

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
        <DigitalPromoCard onCardUpdate={() => refreshWallet()} />
        <PiecesDividendWalletCard userId={user.id} />
        <CouponWalletRail />
        <CommerceReceiptRail />
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Coins className="h-4 w-4 text-amber-500" />
                Points
              </CardTitle>
              <CardDescription>{t("wallet.pointsCopy")}</CardDescription>
            </CardHeader>
            <CardContent>
              {walletLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="text-3xl font-bold">{walletBalance?.points?.toLocaleString() || 0}</div>
              )}
              <p className="mt-3 text-sm text-muted-foreground">{t("wallet.pointsBody")}</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-amber-500" style={{ width: `${nextKeyProgress}%` }} /></div>
              <p className="mt-2 text-xs text-muted-foreground">{t("wallet.nextKey", { count: formatNumber(Math.max(0, pointsPerKey - (points % pointsPerKey))) })}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="h-4 w-4 text-primary" />
                PromoKeys
              </CardTitle>
              <CardDescription>{t("wallet.keysCopy")}</CardDescription>
            </CardHeader>
            <CardContent>
              {walletLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="text-3xl font-bold">{walletBalance?.promokeys || 0}</div>
              )}
              <p className="mt-3 text-sm text-muted-foreground">{t("wallet.keysBody")}</p>
              <Button className="mt-4 w-full" size="sm" onClick={() => setConvertDialogOpen(true)} disabled={availableConversions < 1}>
                {t("wallet.convert")}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-violet-500/20 bg-violet-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Gem className="h-4 w-4 text-violet-500" />
                Gems
              </CardTitle>
              <CardDescription>{t("wallet.gemsCopy")}</CardDescription>
            </CardHeader>
            <CardContent>
              {gemsLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{gems.toLocaleString()}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{t("wallet.gemsBody")}</p>
                  <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                    <div>{t("wallet.available")}: {formatNumber(gems)} Gems</div>
                    <div>{t("wallet.pending")}: {formatNumber(pendingWithdrawalGems)} Gems</div>
                    <div>Older hold data: {Number(gemsSnapshot.pending_purchase_redemption_balance || 0).toLocaleString()} Gems</div>
                    {gemsSnapshot.next_purchase_redemption_at ? (
                      <div>Next purchase batch unlocks: {new Date(gemsSnapshot.next_purchase_redemption_at).toLocaleString()}</div>
                    ) : null}
                  </div>
                </>
              )}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button size="sm" disabled={!canBuyGems} onClick={() => { setCheckoutActive(false); setBuyDialogOpen(true); }}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  {canBuyGems ? t("wallet.buy") : `Purchases unavailable in ${country.name}`}
                </Button>
                <Button size="sm" variant="outline" disabled={!canWithdrawGems} onClick={() => setWithdrawDialogOpen(true)}>
                  <ArrowDownLeft className="mr-2 h-4 w-4" />
                  {t("wallet.withdraw")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><DollarSign className="h-4 w-4 text-emerald-500" />{t("wallet.queue")}</CardTitle>
              <CardDescription>{t("wallet.queueCopy")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingWithdrawalGems.toLocaleString()} Gems</div>
              <p className="mt-3 text-sm text-muted-foreground">Requests are reviewed before settlement. 1 Gem withdraws as US$1 before any external provider fees.</p>
              <Button className="mt-4 w-full" size="sm" variant="outline" disabled={!canWithdrawGems} onClick={() => setWithdrawDialogOpen(true)}><ShieldCheck className="mr-2 h-4 w-4" />{canWithdrawGems ? t("wallet.request") : `Withdrawals unavailable in ${country.name}`}</Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>{t("wallet.history")}</CardTitle>
              <CardDescription>{t("wallet.historyCopy")}</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : gemsTransactions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center">
                  <Gem className="mx-auto h-8 w-8 text-violet-500" />
                  <h3 className="mt-3 font-semibold">{t("wallet.noActivity")}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t("wallet.noActivityCopy")}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("wallet.type")}</TableHead>
                      <TableHead>{t("wallet.amount")}</TableHead>
                      <TableHead>{t("wallet.redemption")}</TableHead>
                      <TableHead>{t("wallet.balanceAfter")}</TableHead>
                      <TableHead>{t("wallet.when")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gemsTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium capitalize">{transaction.transaction_type.replace(/_/g, " ")}</div>
                            {transaction.description ? (
                              <div className="text-xs text-muted-foreground">{transaction.description}</div>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={transaction.amount >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-rose-600"}>
                            {formatSignedValue(transaction.amount)}
                          </span>
                          {transaction.fiat_amount ? (
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(Number(transaction.fiat_amount), transaction.fiat_currency || "USD")}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {transaction.effective_redemption_status ? (
                            <>
                              <div className="capitalize">{transaction.effective_redemption_status.replace(/_/g, " ")}</div>
                              {transaction.redeemable_after ? (
                                <div>{t("wallet.after", { date: new Date(transaction.redeemable_after).toLocaleDateString(locale) })}</div>
                              ) : null}
                            </>
                          ) : (
                            t("wallet.notApplicable")
                          )}
                        </TableCell>
                        <TableCell>{Number(transaction.balance_after || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleString(locale)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("wallet.requests")}</CardTitle>
                <CardDescription>{t("wallet.requestsCopy")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {withdrawalsLoading ? <Skeleton className="h-20 w-full" /> : gemWithdrawals.length ? gemWithdrawals.slice(0, 5).map((request) => (
                  <div key={request.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{Number(request.gems_amount).toLocaleString()} Gems</p>
                        <p className="text-xs text-muted-foreground">US${Number(request.usd_amount).toLocaleString()} value · {new Date(request.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={request.status === "requested" ? "secondary" : "outline"} className="capitalize">{request.status}</Badge>
                    </div>
                    {["requested", "reviewing"].includes(request.status) && (
                      <button className="mt-2 text-xs font-semibold text-primary" disabled={gemActions.cancelWithdrawal.isPending} onClick={async () => { try { await gemActions.cancelWithdrawal.mutateAsync(request.id); toast({ title: "Withdrawal cancelled", description: "The Gems returned to your wallet." }); await refreshWallet(); } catch (error: unknown) { toast({ title: "Could not cancel request", description: errorMessage(error), variant: "destructive" }); } }}>{t("wallet.cancelRequest")}</button>
                    )}
                  </div>
                )) : <p className="text-sm text-muted-foreground">{t("wallet.noRequests")}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("wallet.proofReceipts")}</CardTitle>
              </CardHeader>
              <CardContent>
                <GuidanceDisclosure
                  id="wallet:proof-receipts"
                  title={t("wallet.proofMeaning")}
                  summary={t("wallet.proofSummary")}
                  className="mb-4 mt-0"
                >
                  <p className="text-sm text-muted-foreground">
                    {t("wallet.proofCopy")}
                  </p>
                </GuidanceDisclosure>
                {receiptsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Skeleton key={index} className="h-12 w-full" />
                    ))}
                  </div>
                ) : receipts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("wallet.noProof")}</p>
                ) : (
                  <div className="space-y-3">
                    {receipts.slice(0, 6).map((receipt) => (
                      <div key={receipt.id} className="rounded-xl border border-border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium">{receipt.headline}</div>
                            <div className="text-sm text-muted-foreground">{receipt.description}</div>
                          </div>
                          <Badge variant={receipt.lifecycle_status === "available" ? "default" : "secondary"} className="capitalize">
                            {receipt.lifecycle_status}
                          </Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(receipt.rewards || []).filter((reward) => Number(reward.amount) !== 0).map((reward, index) => (
                            <Badge key={`${reward.currency}-${index}`} variant="outline">
                              {formatSignedValue(Number(reward.amount))} {reward.label || reward.currency}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-xs">
                          <span className="text-muted-foreground">{new Date(receipt.created_at).toLocaleString()}</span>
                          <Link
                            to={`/r/${receipt.id}`}
                            className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                          >
                            Inspect Value Receipt <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("wallet.limits")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <GuidanceDisclosure
                  id="wallet:contribution-limits"
                  title={t("wallet.limitsWhy")}
                  summary={t("wallet.limitsSummary")}
                  className="mt-0"
                >
                  <p className="text-sm text-muted-foreground">
                    {t("wallet.limitsCopy")}
                  </p>
                </GuidanceDisclosure>
                {caps.map((cap) => (
                  <div key={cap.action_type}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="capitalize">{cap.action_type}s</span>
                      <span className="text-muted-foreground">{t("wallet.rewarded", { used: cap.used, limit: cap.daily_limit })}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]"
                        style={{ width: `${Math.min(100, (cap.used / cap.daily_limit) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
                {!receiptsLoading && caps.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t("wallet.noLimits")}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
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

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
} from "lucide-react";
import { cultureEvents } from "@/data/culture-demo";
import { CommerceReceiptRail } from "@/components/commerce/CommerceReceiptRail";
import { CouponWalletRail } from "@/components/commerce/CouponWalletRail";
import { PersonalValueNav } from "@/components/value/PersonalValueNav";
import { PARTICIPANT_ECONOMY } from "@promorang/shared";

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
  const { user, session } = useAuth();
  const { toast } = useToast();
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
            <h1 className="mt-4 text-2xl font-bold">Wallet</h1>
            <p className="mt-2 text-muted-foreground">Sign in to view balances and manage Gems.</p>
            <Button asChild className="mt-6">
              <Link to="/auth">Sign In</Link>
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
        <div className="relative mx-auto grid min-h-[500px] max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1fr_420px] md:items-end">
          <div className="text-white">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">
              <WalletCards className="h-3.5 w-3.5" />
              Value Layer
            </div>
            <h1 className="max-w-3xl font-sans text-5xl font-black uppercase leading-[0.84] tracking-[-0.07em] text-white md:text-7xl">
              Value you can<br /><span className="text-primary">actually use.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
              See what your participation created, what is ready to use, and the shortest path to your next funded opportunity.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-black/60 p-5 text-white backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Next usable unlock</p><p className="mt-2 text-5xl font-black">{availableConversions > 0 ? `${availableConversions} Key${availableConversions > 1 ? "s" : ""}` : `${Math.max(0, pointsPerKey - (points % pointsPerKey))} pts`}</p><p className="mt-1 text-sm text-white/45">{availableConversions > 0 ? "Ready to convert from Points" : "until your next PromoKey"}</p></div>
              <KeyRound className="h-10 w-10 text-primary" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/[0.06] p-3"><p className="text-xl font-black">{walletLoading ? "..." : walletBalance?.points?.toLocaleString() || 0}</p><p className="text-[9px] uppercase text-white/35">Points</p></div>
              <div className="rounded-xl bg-white/[0.06] p-3"><p className="text-xl font-black">{walletLoading ? "..." : walletBalance?.promokeys || 0}</p><p className="text-[9px] uppercase text-white/35">PromoKeys</p></div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" asChild><Link to="/discover"><Sparkles className="mr-2 h-4 w-4" />Earn your next unlock</Link></Button>
              <Button variant="outline" size="icon" className="border-white/15 bg-black/20 text-white hover:bg-white/10 hover:text-white" onClick={refreshWallet}><RefreshCw className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </div>

      <PersonalValueNav className="relative z-20 -mt-4 px-2" />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
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
              <CardDescription>Activity and proof accumulation</CardDescription>
            </CardHeader>
            <CardContent>
              {walletLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="text-3xl font-bold">{walletBalance?.points?.toLocaleString() || 0}</div>
              )}
              <p className="mt-3 text-sm text-muted-foreground">Points are your participation signal for status, access, and reward eligibility.</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-amber-500" style={{ width: `${nextKeyProgress}%` }} /></div>
              <p className="mt-2 text-xs text-muted-foreground">{Math.max(0, pointsPerKey - (points % pointsPerKey))} Points to the next PromoKey</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="h-4 w-4 text-primary" />
                PromoKeys
              </CardTitle>
              <CardDescription>Access currency for gated action</CardDescription>
            </CardHeader>
            <CardContent>
              {walletLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="text-3xl font-bold">{walletBalance?.promokeys || 0}</div>
              )}
              <p className="mt-3 text-sm text-muted-foreground">Use PromoKeys on funded Moments, gated drops, and proof-backed surfaces.</p>
              <Button className="mt-4 w-full" size="sm" onClick={() => setConvertDialogOpen(true)} disabled={availableConversions < 1}>
                Convert Points
              </Button>
            </CardContent>
          </Card>

          <Card className="border-violet-500/20 bg-violet-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Gem className="h-4 w-4 text-violet-500" />
                Gems
              </CardTitle>
              <CardDescription>Spendable balance tied to Pieces</CardDescription>
            </CardHeader>
            <CardContent>
              {gemsLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{gems.toLocaleString()}</div>
                  <p className="mt-2 text-sm text-muted-foreground">1 Gem = US$1 of platform value. Use Gems for access, funding, rewards, and creator/host earnings.</p>
                  <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                    <div>Available in wallet: {gems.toLocaleString()} Gems</div>
                    <div>Pending withdrawal: {pendingWithdrawalGems.toLocaleString()} Gems</div>
                    <div>Older hold data: {Number(gemsSnapshot.pending_purchase_redemption_balance || 0).toLocaleString()} Gems</div>
                    {gemsSnapshot.next_purchase_redemption_at ? (
                      <div>Next purchase batch unlocks: {new Date(gemsSnapshot.next_purchase_redemption_at).toLocaleString()}</div>
                    ) : null}
                  </div>
                </>
              )}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button size="sm" onClick={() => { setCheckoutActive(false); setBuyDialogOpen(true); }}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Buy Gems
                </Button>
                <Button size="sm" variant="outline" onClick={() => setWithdrawDialogOpen(true)}>
                  <ArrowDownLeft className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><DollarSign className="h-4 w-4 text-emerald-500" />Withdrawal Queue</CardTitle>
              <CardDescription>Earned Gems waiting to leave the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingWithdrawalGems.toLocaleString()} Gems</div>
              <p className="mt-3 text-sm text-muted-foreground">Requests are reviewed before settlement. 1 Gem withdraws as US$1 before any external provider fees.</p>
              <Button className="mt-4 w-full" size="sm" variant="outline" onClick={() => setWithdrawDialogOpen(true)}><ShieldCheck className="mr-2 h-4 w-4" />Request withdrawal</Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Recent Gems Movement</CardTitle>
              <CardDescription>Purchases, trades, holds, unlocks, and Gems becoming usable.</CardDescription>
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
                  <h3 className="mt-3 font-semibold">No Gems activity yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Buy Gems here, then use them across marketplace, Pieces, and liquidity flows.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Redemption</TableHead>
                      <TableHead>Balance After</TableHead>
                      <TableHead>When</TableHead>
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
                                <div>After {new Date(transaction.redeemable_after).toLocaleDateString()}</div>
                              ) : null}
                            </>
                          ) : (
                            "Not applicable"
                          )}
                        </TableCell>
                        <TableCell>{Number(transaction.balance_after || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleString()}
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
                <CardTitle>Gem Requests</CardTitle>
                <CardDescription>Withdrawals and reviews connected to your wallet.</CardDescription>
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
                      <button className="mt-2 text-xs font-semibold text-primary" disabled={gemActions.cancelWithdrawal.isPending} onClick={async () => { try { await gemActions.cancelWithdrawal.mutateAsync(request.id); toast({ title: "Withdrawal cancelled", description: "The Gems returned to your wallet." }); await refreshWallet(); } catch (error: unknown) { toast({ title: "Could not cancel request", description: errorMessage(error), variant: "destructive" }); } }}>Cancel request</button>
                    )}
                  </div>
                )) : <p className="text-sm text-muted-foreground">No Gem withdrawal requests yet.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Proof Receipts</CardTitle>
              </CardHeader>
              <CardContent>
                <GuidanceDisclosure
                  id="wallet:proof-receipts"
                  title="What proof receipts mean"
                  summary="Backend-issued proof of what was recorded, why, and when it became available."
                  className="mb-4 mt-0"
                >
                  <p className="text-sm text-muted-foreground">
                    Proof receipts are the record behind wallet movement: what action was accepted, what value was attached, and whether that value is available, pending, or locked.
                  </p>
                </GuidanceDisclosure>
                {receiptsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Skeleton key={index} className="h-12 w-full" />
                    ))}
                  </div>
                ) : receipts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No proof receipts yet. Join a Moment or complete an action to start building value.</p>
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
                        <div className="mt-2 text-xs text-muted-foreground">{new Date(receipt.created_at).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today’s contribution limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <GuidanceDisclosure
                  id="wallet:contribution-limits"
                  title="Why contribution limits exist"
                  summary={`Daily limits protect genuine participation from automated farming.${resetsAt ? ` Resets ${new Date(resetsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.` : ""}`}
                  className="mt-0"
                >
                  <p className="text-sm text-muted-foreground">
                    Genuine participation earns value. Daily limits keep automated farming from diluting everyone else.
                    {resetsAt ? ` Your current limits reset ${new Date(resetsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.` : ""}
                  </p>
                </GuidanceDisclosure>
                {caps.map((cap) => (
                  <div key={cap.action_type}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="capitalize">{cap.action_type}s</span>
                      <span className="text-muted-foreground">{cap.used} / {cap.daily_limit} rewarded</span>
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
                  <p className="text-sm text-muted-foreground">Contribution limits will appear after the economy receipt migration is active.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Turn Points into access</DialogTitle>
            <DialogDescription>
              Convert {pointsPerKey} Points into 1 PromoKey. PromoKeys enter funded drops and gated opportunities once today's Master Key is active. Maximum {PARTICIPANT_ECONOMY.maxDailyPromoKeyConversions} conversions per day.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Available Points</span><strong>{points.toLocaleString()}</strong></div>
              <div className="mt-2 flex items-center justify-between"><span className="text-sm text-muted-foreground">Conversion</span><strong>{(convertQuantity * pointsPerKey).toLocaleString()} Points → {convertQuantity} Key{convertQuantity > 1 ? "s" : ""}</strong></div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="promokey-quantity">PromoKeys to unlock</Label>
              <Input id="promokey-quantity" type="number" min={1} max={availableConversions} value={convertQuantity} onChange={(event) => setConvertQuantity(Math.max(1, Math.min(availableConversions || 1, Number(event.target.value || 1))))} />
              <p className="text-xs text-muted-foreground">You can convert up to {availableConversions} with your current balance today.</p>
            </div>
            <Button className="w-full" onClick={convertPoints} disabled={converting || availableConversions < 1}>
              {converting ? "Converting…" : `Unlock ${convertQuantity} PromoKey${convertQuantity > 1 ? "s" : ""}`}
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
            <DialogTitle>Buy Gems</DialogTitle>
            <DialogDescription>
              Gems are purchased by the unit in USD and credited only after Stripe confirms payment. Purchased and promotional Gems remain separately traceable. Purchases above $100 require KYC.
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
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Pack</div>
                    <div className="mt-2 text-2xl font-bold">${amount}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{amount} Gems</div>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet-gems-amount">Custom USD amount</Label>
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
                  <span className="text-sm text-muted-foreground">You will receive</span>
                  <span className="text-lg font-semibold">{Number(purchaseAmount || 0).toLocaleString()} Gems</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setBuyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setCheckoutActive(true)}
                  disabled={!purchaseAmount || purchaseAmount < 5 || purchaseAmount > 1000}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Gem withdrawal</DialogTitle>
            <DialogDescription>
              Earned Gems can be reviewed for payout at 1 Gem = US$1. Minimum request is 250 Gems.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Wallet Gems</span><strong>{gems.toLocaleString()}</strong></div>
              <div className="mt-2 flex items-center justify-between text-sm"><span className="text-muted-foreground">Already pending</span><strong>{pendingWithdrawalGems.toLocaleString()}</strong></div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gem-withdraw-amount">Gems to withdraw</Label>
              <Input id="gem-withdraw-amount" type="number" min={250} value={withdrawAmount} onChange={(event) => setWithdrawAmount(event.target.value)} />
              <p className="text-xs text-muted-foreground">This will hold the Gems immediately while the request is reviewed.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gem-withdraw-note">Payout note</Label>
              <Textarea id="gem-withdraw-note" value={withdrawNote} onChange={(event) => setWithdrawNote(event.target.value)} placeholder="Bank, PayPal, or preferred payout details for review." />
            </div>
            <Button className="w-full" disabled={gemActions.requestWithdrawal.isPending || Number(withdrawAmount) < 250 || Number(withdrawAmount) > gems} onClick={submitGemWithdrawal}>
              {gemActions.requestWithdrawal.isPending ? "Requesting..." : "Request withdrawal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Wallet;

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserBalance, useEconomyHistory, type EconomyTransaction } from "@/hooks/useEconomy";
import StripeCheckout from "@/components/stripe/StripeCheckout";
import { API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  WalletCards,
  Coins,
  KeyRound,
  Gem,
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
  ArrowDownLeft,
  RefreshCw,
} from "lucide-react";

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

const Wallet = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const { data: walletBalance, isLoading: walletLoading, refetch: refetchWalletBalance } = useUserBalance();
  const { data: economyHistory, isLoading: economyHistoryLoading, refetch: refetchEconomyHistory } = useEconomyHistory();

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
    } catch (error: any) {
      toast({
        title: "Wallet unavailable",
        description: error.message || "Could not load Gems balance.",
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
    } catch (error: any) {
      toast({
        title: "Transactions unavailable",
        description: error.message || "Could not load Gems transactions.",
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

  const latestActivity = useMemo(() => {
    return (economyHistory || []).slice(0, 6) as EconomyTransaction[];
  }, [economyHistory]);

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
      <div className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">
              <WalletCards className="h-3.5 w-3.5" />
              Wallet
            </div>
            <h1 className="text-3xl font-bold">Balances & Gems</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              See your Points, PromoKeys, and Gems in one place. Purchased Gems unlock for cash redemption after 30 days. Bonus Gems stay locked for cash redemption until their objective is completed.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={refreshWallet}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => { setCheckoutActive(false); setBuyDialogOpen(true); }}>
              <CreditCard className="mr-2 h-4 w-4" />
              Buy Gems
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <Alert className="border-primary/20 bg-primary/5">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>How the wallet is split today</AlertTitle>
          <AlertDescription>
            Points and PromoKeys track participation and access. Gems are the spendable balance used across pieces, marketplace, and liquidity. Cash redemption follows the ledger rules: purchased Gems have a 30-day hold, and objective-based bonus Gems unlock only after the objective is completed. Purchases over $100 require KYC.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-3">
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
              <p className="mt-3 text-sm text-muted-foreground">Points convert toward access and reward state.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="h-4 w-4 text-primary" />
                PromoKeys
              </CardTitle>
              <CardDescription>Unlock and access currency</CardDescription>
            </CardHeader>
            <CardContent>
              {walletLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="text-3xl font-bold">{walletBalance?.promokeys || 0}</div>
              )}
              <p className="mt-3 text-sm text-muted-foreground">Use PromoKeys on funded and gated moment surfaces.</p>
            </CardContent>
          </Card>

          <Card className="border-violet-500/20 bg-violet-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Gem className="h-4 w-4 text-violet-500" />
                Gems
              </CardTitle>
              <CardDescription>Spendable marketplace balance</CardDescription>
            </CardHeader>
            <CardContent>
              {gemsLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{gemsSnapshot.balance.toLocaleString()}</div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatCurrency(gemsSnapshot.usd_value)} value at {formatCurrency(gemsSnapshot.exchange_rate)} per Gem
                  </p>
                  <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                    <div>Withdrawable now: {Number(gemsSnapshot.withdrawable_balance || 0).toLocaleString()} Gems</div>
                    <div>30-day purchase hold: {Number(gemsSnapshot.pending_purchase_redemption_balance || 0).toLocaleString()} Gems</div>
                    <div>Bonus locked to objectives: {Number(gemsSnapshot.locked_bonus_balance || 0).toLocaleString()} Gems</div>
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
                <Button asChild size="sm" variant="outline">
                  <Link to="/marketplace">
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Open Marketplace
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Recent Gems Transactions</CardTitle>
              <CardDescription>Purchases, trades, and Gems movement.</CardDescription>
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
                    Buy Gems here, or earn and trade through marketplace flows.
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
                <CardTitle>Quick Paths</CardTitle>
                <CardDescription>Use balances across the current app surfaces.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link to="/dashboard/rewards">
                    View Rewards
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link to="/vault">
                    Open Vault
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link to="/marketplace">
                    Trade Pieces
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link to="/kyc">
                    Review KYC
                    <ArrowDownLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Wallet Activity</CardTitle>
                <CardDescription>Latest points, keys, and economy changes.</CardDescription>
              </CardHeader>
              <CardContent>
                {economyHistoryLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Skeleton key={index} className="h-12 w-full" />
                    ))}
                  </div>
                ) : latestActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent wallet activity recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {latestActivity.map((event) => (
                      <div key={event.id} className="rounded-xl border border-border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium capitalize">{event.currency}</div>
                            <div className="text-sm text-muted-foreground">{event.description || event.transaction_type}</div>
                          </div>
                          <Badge variant="secondary">{formatSignedValue(event.amount)}</Badge>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">{new Date(event.created_at).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

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
              Gems are purchased in USD and credited after Stripe confirms payment. Purchases above $100 require KYC.
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
                  Minimum $5. Maximum $1,000 per transaction. Current rate: 1 Gem = {formatCurrency(gemsSnapshot.exchange_rate)}. Purchased Gems can be redeemed for cash only after a 30-day hold.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">You will receive</span>
                  <span className="text-lg font-semibold">{Math.floor(purchaseAmount / gemsSnapshot.exchange_rate).toLocaleString()} Gems</span>
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
    </div>
  );
};

export default Wallet;

/**
 * Limited, read-only liquidity surface.
 *
 * Pool, LP-position and Gems state must come from the recorded Piece APIs.
 * Production add/remove liquidity remains disabled until the server can settle
 * reserve and LP-position mutations atomically.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Droplets,
  Gem,
  Info,
  PieChart,
  RefreshCw,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GuidanceDisclosure } from "@/components/guidance/GuidanceDisclosure";
import { useI18n } from "@/i18n/I18nContext";

interface Pool {
  id: string;
  piece_type: "content" | "moment" | "host" | "venue";
  asset_id: string;
  pieces_reserve: number;
  currency_reserve: number;
  last_price: number;
  swap_fee_percent?: number | null;
  lp_fee_percent?: number | null;
  volume_24h?: number | null;
  volume_7d?: number | null;
  status?: string;
  asset?: {
    id: string;
    title?: string;
    name?: string;
    image_url?: string;
  };
}

interface LPPosition {
  pool_id: string;
  lp_tokens: number;
  pieces_deposited: number;
  currency_deposited: number;
  fees_earned_pieces: number;
  fees_earned_currency: number;
  pool: Pool;
}

interface GemsBalancePayload {
  balance?: number;
  available_balance?: number;
}

const typeLabels: Record<Pool["piece_type"], string> = {
  content: "Content",
  moment: "Moment",
  host: "Host",
  venue: "Venue",
};

const typeColors: Record<Pool["piece_type"], string> = {
  content: "bg-blue-100 text-blue-800",
  moment: "bg-purple-100 text-purple-800",
  host: "bg-green-100 text-green-800",
  venue: "bg-orange-100 text-orange-800",
};

export function LiquidityDashboard() {
  const { t } = useI18n();
  const { session } = useAuth();
  const [pools, setPools] = useState<Pool[]>([]);
  const [positions, setPositions] = useState<LPPosition[]>([]);
  const [gemsBalance, setGemsBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const apiBaseUrl = (import.meta.env.VITE_API_URL || "https://api.promorang.co").replace(/\/$/, "");
  const apiUrl = (path: string) => `${apiBaseUrl}${apiBaseUrl.endsWith("/api") ? "" : "/api"}${path}`;

  const loadLiquidityState = useCallback(async () => {
    if (!session?.access_token) {
      setLoading(false);
      setLoadError("Sign in to review recorded liquidity positions.");
      return;
    }

    setLoading(true);
    setLoadError(null);

    const headers = { Authorization: `Bearer ${session.access_token}` };

    try {
      const [poolsResponse, positionsResponse, gemsResponse] = await Promise.all([
        fetch(apiUrl("/pieces/pools"), { headers }),
        fetch(apiUrl("/pieces/lp/positions"), { headers }),
        fetch(apiUrl("/pieces/gems/balance"), { headers }),
      ]);

      const [poolsPayload, positionsPayload, gemsPayload] = await Promise.all([
        poolsResponse.json().catch(() => ({})),
        positionsResponse.json().catch(() => ({})),
        gemsResponse.json().catch(() => ({})),
      ]);

      if (!poolsResponse.ok) throw new Error(poolsPayload.error || "Failed to load recorded liquidity pools");
      if (!positionsResponse.ok) throw new Error(positionsPayload.error || "Failed to load your recorded liquidity positions");
      if (!gemsResponse.ok) throw new Error(gemsPayload.error || "Failed to load your recorded Gems balance");

      setPools(Array.isArray(poolsPayload.pools) ? poolsPayload.pools : []);
      setPositions(Array.isArray(positionsPayload.positions) ? positionsPayload.positions : []);

      const balancePayload = gemsPayload as GemsBalancePayload;
      const recordedBalance = balancePayload.available_balance ?? balancePayload.balance;
      setGemsBalance(Number.isFinite(Number(recordedBalance)) ? Number(recordedBalance) : null);
    } catch (error) {
      setPools([]);
      setPositions([]);
      setGemsBalance(null);
      setLoadError(error instanceof Error ? error.message : "Liquidity sources are unavailable");
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    loadLiquidityState();
  }, [loadLiquidityState]);

  const feeEstimate = (pool: Pool) => {
    const volume = Number(pool.volume_24h);
    const reserve = Number(pool.currency_reserve);
    const feeRate = Number(pool.lp_fee_percent);

    if (!Number.isFinite(volume) || volume <= 0 || !Number.isFinite(reserve) || reserve <= 0 || !Number.isFinite(feeRate) || feeRate < 0) {
      return null;
    }

    const dailyFees = volume * feeRate;
    const poolValueSignal = reserve * 2;
    return poolValueSignal > 0 ? (dailyFees * 365 / poolValueSignal) * 100 : null;
  };

  const totalDeposited = useMemo(
    () => positions.reduce((sum, position) => sum + Number(position.currency_deposited || 0), 0),
    [positions]
  );
  const totalFeesEarned = useMemo(
    () => positions.reduce((sum, position) => sum + Number(position.fees_earned_currency || 0), 0),
    [positions]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <main className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-4 text-center">
        <div>
          <Droplets className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-5 text-3xl font-black">Liquidity state unavailable</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{loadError}</p>
          <Button type="button" variant="outline" className="mt-6" onClick={loadLiquidityState}>
            <RefreshCw className="mr-2 h-4 w-4" />Retry recorded sources
          </Button>
        </div>
      </main>
    );
  }

  const rankedPools = [...pools]
    .map((pool) => ({ pool, estimate: feeEstimate(pool) }))
    .filter((item): item is { pool: Pool; estimate: number } => item.estimate != null)
    .sort((a, b) => b.estimate - a.estimate)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_34%),linear-gradient(135deg,rgba(10,10,10,0.98),rgba(18,18,18,0.94))] backdrop-blur">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">
                <Droplets className="h-3.5 w-3.5" />
                {t("liquidityDash.eyebrow")}
              </div>
              <h1 className="max-w-3xl text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-white md:text-6xl">
                Recorded backing state
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
                Review recorded pools, your LP positions, configured fee rates and Gems available to your account. This limited surface is read-only while atomic liquidity settlement is being hardened.
              </p>
            </div>
            <Button asChild>
              <Link to="/marketplace">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                {t("liquidityDash.openMarketplace")}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertTitle>Limited · read-only</AlertTitle>
          <AlertDescription>
            Pool and position values below come from recorded Piece sources. A pool's LP fee rate is shown only when configured. Adding or removing liquidity is not available from this screen until reserve and LP-position changes can settle atomically.
          </AlertDescription>
        </Alert>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Wallet className="h-4 w-4" />Recorded Gems committed</div>
              <div className="mt-1 text-2xl font-bold">{totalDeposited.toFixed(2)} Gems</div>
              <div className="text-sm text-muted-foreground">Across your recorded LP positions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingUp className="h-4 w-4" />Recorded fee accrual</div>
              <div className="mt-1 text-2xl font-bold text-green-600">+{totalFeesEarned.toFixed(4)} Gems</div>
              <div className="text-sm text-muted-foreground">From LP position records</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><PieChart className="h-4 w-4" />Active positions</div>
              <div className="mt-1 text-2xl font-bold">{positions.length}</div>
              <div className="text-sm text-muted-foreground">Recorded LP positions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Gem className="h-4 w-4" />Available Gems</div>
              <div className="mt-1 text-2xl font-bold">{gemsBalance == null ? "—" : gemsBalance.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Account balance; no USD equivalence implied</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Recorded pools</TabsTrigger>
            <TabsTrigger value="my-positions">My positions ({positions.length})</TabsTrigger>
            <TabsTrigger value="fee-estimate">Fee estimate</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {pools.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-10 text-center text-muted-foreground">No active liquidity pools are recorded.</CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pools.map((pool) => {
                  const estimate = feeEstimate(pool);
                  const position = positions.find((item) => item.pool_id === pool.id);
                  return (
                    <Card key={pool.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Badge className={typeColors[pool.piece_type]}>{typeLabels[pool.piece_type]}</Badge>
                            <CardTitle className="mt-2 text-lg">{pool.asset?.title || pool.asset?.name || "Recorded pool"}</CardTitle>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">{estimate == null ? "—" : `${estimate.toFixed(0)}%`}</div>
                            <div className="max-w-28 text-[10px] leading-4 text-muted-foreground">24h-volume annualized fee estimate</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Piece reserve</span><span>{Number(pool.pieces_reserve || 0).toFixed(0)} Pieces</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Recorded price</span><span>{pool.last_price == null ? "—" : `${Number(pool.last_price).toFixed(2)} Gems`}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">24h volume</span><span>{pool.volume_24h == null ? "—" : `${Number(pool.volume_24h).toFixed(0)} Gems`}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Configured LP fee</span><span>{pool.lp_fee_percent == null ? "—" : `${(Number(pool.lp_fee_percent) * 100).toFixed(2)}%`}</span></div>
                        {position ? (
                          <div className="rounded-lg bg-emerald-500/10 p-3">
                            <p className="font-semibold text-emerald-700">Your recorded position</p>
                            <p className="mt-1 text-xs text-muted-foreground">{Number(position.pieces_deposited || 0).toFixed(2)} Pieces + {Number(position.currency_deposited || 0).toFixed(2)} Gems committed</p>
                          </div>
                        ) : null}
                        <Button asChild variant="outline" className="w-full">
                          <Link to={`/pieces/${pool.piece_type}/${pool.asset_id}`}>Open Piece record</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-positions">
            {positions.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-10 text-center text-muted-foreground">No LP positions are recorded for this account.</CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {positions.map((position) => (
                  <Card key={position.pool_id}>
                    <CardHeader>
                      <Badge className={typeColors[position.pool.piece_type]}>{typeLabels[position.pool.piece_type]}</Badge>
                      <CardTitle className="mt-2 text-lg">{position.pool.asset?.title || position.pool.asset?.name || "Recorded pool"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">LP tokens</span><span>{Number(position.lp_tokens || 0).toFixed(4)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Pieces deposited</span><span>{Number(position.pieces_deposited || 0).toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Gems deposited</span><span>{Number(position.currency_deposited || 0).toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Recorded Gem fees</span><span>{Number(position.fees_earned_currency || 0).toFixed(4)}</span></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="fee-estimate">
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                These are simple annualized estimates from each pool's recorded last-24-hour volume and configured LP fee rate. They are not promised returns or forecasts.
              </AlertDescription>
            </Alert>
            {rankedPools.length === 0 ? (
              <Card className="border-dashed"><CardContent className="p-10 text-center text-muted-foreground">No pool has enough recorded data for a fee estimate.</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rankedPools.map(({ pool, estimate }) => (
                  <Card key={pool.id}>
                    <CardHeader>
                      <CardTitle>{pool.asset?.title || pool.asset?.name || "Recorded pool"}</CardTitle>
                      <CardDescription>{estimate.toFixed(1)}% annualized fee estimate from current 24h volume</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild variant="outline" className="w-full"><Link to={`/pieces/${pool.piece_type}/${pool.asset_id}`}>Review source record</Link></Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <GuidanceDisclosure
          id="liquidity-dashboard:how-it-works"
          title="What this limited surface means"
          summary="Recorded pool state is visible; production liquidity changes are not exposed here until atomic settlement is complete."
          className="mt-8"
        >
          <div className="space-y-3 text-sm leading-6">
            <p>A pool records Piece and Gem reserves, a configured fee rate, volume and LP positions. Those records may change with real market activity.</p>
            <p>A fee estimate is calculated from recorded 24-hour volume. It does not guarantee future volume, fees, exit value or a buyer.</p>
            <p>Gems remain Gems on this surface. PROMORANG does not convert the displayed balance into an unsupported cash-equivalent figure.</p>
          </div>
        </GuidanceDisclosure>
      </div>
    </div>
  );
}

export default LiquidityDashboard;

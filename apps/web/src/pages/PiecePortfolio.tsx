import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { WalletCards, Loader2, Gem, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { cultureImages } from '@/data/culture-demo';
import { useI18n } from '@/i18n/I18nContext';

type PieceType = 'content' | 'moment' | 'host' | 'venue';

interface PortfolioPosition {
  id: string;
  piece_type: PieceType;
  asset_id: string;
  pieces_owned: number;
  avg_purchase_price: number;
  current_price: number;
  market_value: number;
  pnl: number;
  asset?: {
    id: string;
    title?: string;
    name?: string;
    description?: string;
  };
  piece?: {
    id: string;
    title?: string;
    name?: string;
  };
}

interface EarningEvent {
  id: string;
  piece_type: PieceType;
  quantity: number;
  reason: string;
  source_type: string;
  created_at: string;
}

export function PiecePortfolio() {
  const { t } = useI18n();
  const { session } = useAuth();
  const { toast } = useToast();
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPnl, setTotalPnl] = useState(0);
  const [earningEvents, setEarningEvents] = useState<EarningEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'https://api.promorang.co').replace(/\/$/, '');
  const apiUrl = (path: string) => `${apiBaseUrl}${apiBaseUrl.endsWith('/api') ? '' : '/api'}${path}`;

  useEffect(() => {
    if (!session?.access_token) return;
    fetchPortfolio();
  }, [session?.access_token]);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl('/pieces/portfolio/me'), {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const earningsResponse = await fetch(apiUrl('/pieces/earnings/me'), {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load portfolio');

      setPositions(data.positions || []);
      setTotalValue(Number(data.total_value || 0));
      setTotalPnl(Number(data.total_pnl || 0));

      if (earningsResponse.ok) {
        const earnings = await earningsResponse.json();
        setEarningEvents(earnings.events || []);
      }
    } catch (error: any) {
      toast({
        title: 'Portfolio unavailable',
        description: error.message || 'Could not load your pieces right now.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const grouped = useMemo(() => {
    return positions.reduce<Record<PieceType, PortfolioPosition[]>>((acc, position) => {
      acc[position.piece_type].push(position);
      return acc;
    }, { content: [], moment: [], host: [], venue: [] });
  }, [positions]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <img src={cultureImages.streetArt} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/35" />
        <div className="relative mx-auto flex min-h-[350px] max-w-7xl flex-col justify-end gap-6 px-5 pb-10 pt-20 sm:px-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/35 bg-black/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400"><WalletCards className="h-3.5 w-3.5" /> {t("piecePortfolio.heroEyebrow")}</div>
            <h1 className="max-w-3xl text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">
              {t("piecePortfolio.heroTitle")}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/55">
              {t("piecePortfolio.heroSubtitle")}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline">
              <Link to="/marketplace">{t("piecePortfolio.exchangeCollectibles")}</Link>
            </Button>
            <Button asChild>
              <Link to="/liquidity">{t("piecePortfolio.growthPools")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="rounded-lg border-white/10 bg-[#111]">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{t("piecePortfolio.totalValue")}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{totalValue.toFixed(2)} Gems</CardContent>
          </Card>
          <Card className="rounded-lg border-white/10 bg-[#111]">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{t("piecePortfolio.totalPnl")}</CardTitle>
            </CardHeader>
            <CardContent className={`flex items-center gap-2 text-3xl font-bold ${totalPnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {totalPnl >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
              {totalPnl.toFixed(2)}
            </CardContent>
          </Card>
          <Card className="rounded-lg border-white/10 bg-[#111]">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{t("piecePortfolio.positions")}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{positions.length}</CardContent>
          </Card>
        </div>

        {positions.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <Gem className="mx-auto mb-5 h-8 w-8 text-orange-400" />
            <h2 className="text-2xl font-black">{t("piecePortfolio.emptyTitle")}</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              {t("piecePortfolio.emptyCopy")}
            </p>
            <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
              <Button asChild variant="outline"><Link to="/discover">{t("piecePortfolio.findMoment")}</Link></Button>
              <Button asChild><Link to="/marketplace">{t("piecePortfolio.openMarketplace")}</Link></Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {earningEvents.length > 0 && (
              <section>
                <h2 className="mb-3 text-xl font-semibold">Recent Piece Earnings</h2>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {earningEvents.slice(0, 6).map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <Badge className="capitalize">{event.piece_type}</Badge>
                          <span className="font-semibold">+{Number(event.quantity || 0).toFixed(2)}</span>
                        </div>
                        <p className="mt-2 text-sm font-medium">{event.reason.replace(/_/g, ' ')}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {event.source_type.replace(/_/g, ' ')} • {new Date(event.created_at).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {(Object.keys(grouped) as PieceType[]).map(type => grouped[type].length > 0 && (
              <section key={type}>
                <h2 className="mb-3 text-xl font-semibold capitalize">{type} Pieces</h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {grouped[type].map(position => {
                    const title = position.asset?.title || position.asset?.name || position.piece?.title || position.piece?.name || `${type} piece`;
                    return (
                      <Card key={position.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <CardTitle className="line-clamp-1 text-lg">{title}</CardTitle>
                              <Badge variant="secondary" className="mt-2 capitalize">{type}</Badge>
                            </div>
                            <Button asChild variant="ghost" size="icon">
                              <Link to={`/pieces/${type}/${position.asset_id}`} aria-label={`Open ${title}`}>
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">Owned</span><span>{Number(position.pieces_owned || 0).toFixed(2)}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Current</span><span>{Number(position.current_price || 0).toFixed(2)} Gems</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Value</span><span>{Number(position.market_value || 0).toFixed(2)} Gems</span></div>
                          <div className={`flex justify-between ${Number(position.pnl || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            <span>P/L</span><span>{Number(position.pnl || 0).toFixed(2)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default PiecePortfolio;

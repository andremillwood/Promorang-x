import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { WalletCards, Loader2, Gem, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

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
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b bg-card/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <WalletCards className="h-8 w-8 text-primary" />
              Piece Portfolio
            </h1>
            <p className="mt-1 text-muted-foreground">
              Track the pieces you hold across content, moments, hosts, and venues.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline">
              <Link to="/marketplace">Marketplace</Link>
            </Button>
            <Button asChild>
              <Link to="/liquidity">Liquidity</Link>
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Alert className="mb-6">
          <Gem className="h-4 w-4" />
          <AlertTitle>Portfolio connects the economy</AlertTitle>
          <AlertDescription>
            Join a moment to earn early participant pieces. Check in to earn verified attendance pieces. Invite people who show up or complete content-attributed proof to earn performance pieces.
          </AlertDescription>
        </Alert>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{totalValue.toFixed(2)} Gems</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total P/L</CardTitle>
            </CardHeader>
            <CardContent className={`flex items-center gap-2 text-3xl font-bold ${totalPnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {totalPnl >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
              {totalPnl.toFixed(2)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Positions</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{positions.length}</CardContent>
          </Card>
        </div>

        {positions.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <h2 className="text-xl font-semibold">No pieces yet</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Join moments, complete missions, trade active pools, or provide liquidity to start building a portfolio.
            </p>
            <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
              <Button asChild variant="outline"><Link to="/explore/moments">Explore Moments</Link></Button>
              <Button asChild><Link to="/marketplace">Open Marketplace</Link></Button>
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

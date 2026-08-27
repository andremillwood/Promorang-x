import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Activity, 
  ArrowLeft, 
  BadgeCheck, 
  Crown, 
  DollarSign, 
  Gem, 
  Info, 
  Loader2, 
  PlusCircle, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  Layers
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { GuidanceDisclosure } from '@/components/guidance/GuidanceDisclosure';
import { useToast } from '@/components/ui/use-toast';
import { PieceOrderBook } from '@/components/trading/PieceOrderBook';
import { TiltCard3D } from '@/components/ui/TiltCard3D';
import { useI18n } from '@/i18n/I18nContext';

type PieceType = 'content' | 'moment' | 'host' | 'venue';

interface PieceProfileData {
  piece_type: PieceType;
  asset_id: string;
  asset: {
    id: string;
    title?: string;
    name?: string;
    description?: string;
    media_url?: string;
    image_url?: string;
    platform?: string;
    status?: string;
  };
  stats?: {
    current_price?: number;
    volume_24h?: number;
    holder_count?: number;
    change_24h?: number;
    market_cap?: number;
  };
  pool?: {
    id: string;
    status: string;
    pieces_reserve: number;
    currency_reserve: number;
    last_price: number;
    volume_24h?: number;
  } | null;
  journey?: {
    summary: string;
    steps: Array<{ step: string; description: string }>;
  };
  forecast_lab?: {
    status: string;
    description: string;
    prompts: string[];
  };
}

export function PieceProfile() {
  const { t } = useI18n();
  const { pieceType = 'moment', assetId = 'asset_1' } = useParams<{ pieceType: PieceType; assetId: string }>();
  const { session } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<PieceProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingPool, setCreatingPool] = useState(false);
  const [initialPieces, setInitialPieces] = useState('1000');
  const [initialCurrency, setInitialCurrency] = useState('5000');

  // Quick swap widget state
  const [swapTab, setSwapTab] = useState<'buy' | 'sell'>('buy');
  const [swapPiecesCount, setSwapPiecesCount] = useState<string>('5');
  const [isSwapping, setIsSwapping] = useState(false);

  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'https://api.promorang.co').replace(/\/$/, '');
  const apiUrl = (path: string) => `${apiBaseUrl}${apiBaseUrl.endsWith('/api') ? '' : '/api'}${path}`;

  useEffect(() => {
    if (pieceType && assetId) fetchProfile();
  }, [pieceType, assetId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl(`/pieces/${pieceType}/${assetId}/profile`));
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load piece profile');
      setProfile(data);
    } catch {
      // Fallback demo mock profile if backend is empty
      setProfile({
        piece_type: pieceType as PieceType,
        asset_id: assetId,
        asset: {
          id: assetId,
          title: pieceType === 'moment' ? 'I Luv Hip Hop Kingston Syndicate' : 'Premier Cultural Equity Drop',
          description: 'Fractional co-producer equity in recurring cultural nightlife, ticket revenue distributions, and VIP experiential milestones.',
          image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
        },
        stats: {
          current_price: 12.50,
          volume_24h: 3450,
          holder_count: 24,
          change_24h: 8.5,
          market_cap: 12500,
        },
        pool: {
          id: 'pool_demo',
          status: 'active',
          pieces_reserve: 350,
          currency_reserve: 4375,
          last_price: 12.50,
          volume_24h: 3450,
        },
        journey: {
          summary: 'Verified ticket revenue share from event syndication settlements deposited directly to co-producers.',
          steps: [
            { step: 'Minting & Allocation', description: 'Fractional shares created to fund experiential production.' },
            { step: 'Event Execution', description: 'Recurring ticket sales and VIP packages generate gross revenues.' },
            { step: 'Automatic Dividend Settlement', description: 'Box office shares settle as instant Gem distributions.' },
          ]
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const createPool = async () => {
    if (!session?.access_token || !pieceType || !assetId) return;
    setCreatingPool(true);
    try {
      const response = await fetch(apiUrl(`/pieces/${pieceType}/${assetId}/pool/create`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          initial_pieces: Number(initialPieces),
          initial_currency: Number(initialCurrency),
          swap_fee_percent: 0.3,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.success === false) throw new Error(data.error || 'Pool creation failed');
      toast({ title: 'Pool created', description: 'This piece now has a liquidity pool.' });
      fetchProfile();
    } catch (error: any) {
      toast({
        title: 'Pool not created',
        description: error.message || 'Check that you have enough pieces and Gems.',
        variant: 'destructive',
      });
    } finally {
      setCreatingPool(false);
    }
  };

  const handleExecuteSwap = () => {
    const count = parseFloat(swapPiecesCount) || 0;
    if (count <= 0) return;

    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
      const totalCost = (count * currentPrice).toFixed(2);
      toast({
        title: swapTab === 'buy' ? "🎉 Pieces Purchased!" : "Pieces Sold!",
        description: swapTab === 'buy'
          ? `Successfully acquired ${count} ${title} pieces for ${totalCost} Gems.`
          : `Successfully sold ${count} ${title} pieces for ${totalCost} Gems.`,
      });
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <Button asChild variant="ghost"><Link to="/marketplace"><ArrowLeft className="mr-2 h-4 w-4" />Marketplace</Link></Button>
        <h1 className="mt-6 text-2xl font-bold">Piece not found</h1>
      </div>
    );
  }

  const title = profile.asset.title || profile.asset.name || `${profile.piece_type} piece`;
  const currentPrice = Number(profile.pool?.last_price || profile.stats?.current_price || 12.50);
  const swapCountNum = parseFloat(swapPiecesCount) || 0;
  const estimatedSwapCost = (swapCountNum * currentPrice).toFixed(2);

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* Hero Header */}
      <div className="relative border-b border-border/40 bg-gradient-to-b from-neutral-900/90 via-black to-background overflow-hidden">
        {profile.asset.image_url && (
          <div className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none filter blur-sm" style={{ backgroundImage: `url(${profile.asset.image_url})` }} />
        )}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <Button asChild variant="ghost" size="sm" className="px-0 text-muted-foreground hover:text-foreground">
              <Link to="/marketplace"><ArrowLeft className="mr-2 h-4 w-4" /> Marketplace</Link>
            </Button>

            {/* Creator / Owner Management Shortcut */}
            <Button asChild variant="outline" size="sm" className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-bold">
              <Link to={`/pieces/${profile.piece_type}/${profile.asset_id}/manage`} className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" /> Syndicate Creator Studio
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_380px] items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className="capitalize font-black text-[11px] bg-primary/20 text-primary border-primary/30">
                  {profile.piece_type} Piece
                </Badge>
                {profile.pool && (
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Live AMM Pool
                  </Badge>
                )}
                <Badge variant="outline" className="text-cyan-400 border-cyan-500/30 bg-cyan-500/10">
                  18.4% Est. APR
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">{title}</h1>
              <p className="mt-3 max-w-3xl text-sm sm:text-base text-muted-foreground leading-relaxed">
                {profile.asset.description || profile.journey?.summary}
              </p>
            </div>

            {/* Snapshot Card */}
            <TiltCard3D maxTilt={8} scaleOnHover={1.02} className="w-full">
              <Card className="overflow-hidden border-cyan-500/30 bg-gradient-to-br from-neutral-900/90 via-black to-neutral-950/90 shadow-2xl backdrop-blur-xl">
                <CardHeader className="border-b border-white/10 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Market Snapshot</CardTitle>
                    <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4 text-white">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Piece Price</span>
                    <span className="text-2xl font-black text-cyan-400">{currentPrice.toFixed(2)} Gems</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/10 pt-2">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider">24h Volume</span>
                    <span className="font-semibold text-white/90">{Number(profile.pool?.volume_24h || profile.stats?.volume_24h || 0).toFixed(0)} Gems</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/10 pt-2">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Co-Producers</span>
                    <span className="font-semibold text-emerald-400">{Number(profile.stats?.holder_count || 24)} Backers</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/10 pt-2">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Market Cap</span>
                    <span className="font-semibold text-white/90">{Number(profile.stats?.market_cap || 12500).toFixed(2)} Gems</span>
                  </div>
                </CardContent>
              </Card>
            </TiltCard3D>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            {/* Co-Producer Tier Perks Matrix */}
            <Card className="border-amber-500/30 bg-gradient-to-br from-amber-950/15 via-neutral-900/90 to-black/95 shadow-xl">
              <CardHeader className="border-b border-amber-500/20 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" /> Co-Producer Shareholder Perks
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Exclusive rewards and access unlocked by holding minimum share thresholds.
                    </CardDescription>
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                    Tiered Utility
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-3">
                {[
                  { shares: 5, title: 'Priority Access & Presale', desc: '15% ticket discount + guaranteed early-bird access to all syndicated events.' },
                  { shares: 15, title: 'VIP Backstage & Hospitality', desc: 'Complimentary VIP admission + backstage access badge + 2 drink tokens.' },
                  { shares: 25, title: 'Co-Producer Executive Vote', desc: 'Direct governance vote on artist lineups, dates, and sponsor selection.' },
                ].map((tier) => (
                  <div key={tier.shares} className="p-4 rounded-2xl border border-amber-500/20 bg-neutral-900/50 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs font-black">
                          Hold {tier.shares}+ Pieces
                        </Badge>
                        <h4 className="font-bold text-sm text-foreground">{tier.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">{tier.desc}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Guidance Disclosures */}
            <GuidanceDisclosure
              id={`piece-profile:${profile.piece_type}`}
              title={t("pieceProfile.understandTitle")}
              summary={t("pieceProfile.understandSummary")}
              className="mt-0"
            >
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border bg-muted/20 p-4">
                  <Gem className="h-5 w-5 text-primary" />
                  <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">{t("pieceProfile.connectedAsset")}</p>
                  <p className="mt-2 text-sm font-semibold capitalize">{profile.piece_type}: {title}</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">A Piece stays attached to this source; it is not a general Promorang share.</p>
                </div>
                <div className="rounded-xl border bg-muted/20 p-4">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                  <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">{t("pieceProfile.disclosedSource")}</p>
                  <p className="mt-2 text-sm font-semibold">{profile.journey?.summary || "No benefit source has been disclosed."}</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">Holding alone does not promise a financial return.</p>
                </div>
                <div className="rounded-xl border bg-muted/20 p-4">
                  <Users className="h-5 w-5 text-primary" />
                  <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">{t("pieceProfile.liquidityNow")}</p>
                  <p className="mt-2 text-sm font-semibold">{profile.pool ? `${Number(profile.stats?.holder_count || 24)} holders · active pool` : "No active pool"}</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">A pool enables exchange; it does not guarantee a buyer, stable price or easy exit.</p>
                </div>
              </div>
            </GuidanceDisclosure>

            {/* Syndicate Journey Roadmap */}
            <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-lg font-bold">{t("pieceProfile.journeyTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 grid gap-3 md:grid-cols-3">
                {(profile.journey?.steps || []).map((step, index) => (
                  <div key={step.step} className="rounded-xl border border-border/60 bg-neutral-900/40 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-black text-black">{index + 1}</span>
                      <h3 className="font-bold text-sm text-foreground">{step.step}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Quick AMM Trade & Order Book */}
          <aside className="space-y-6">
            {/* Quick Swap Console */}
            <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-neutral-900/90 to-black/95 shadow-xl">
              <CardHeader className="border-b border-cyan-500/20 pb-3">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span>Quick Trade Pieces</span>
                  <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400">
                    AMM Swap
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-900 rounded-xl border border-border/60">
                  <Button
                    size="sm"
                    variant={swapTab === 'buy' ? 'default' : 'ghost'}
                    className={`font-bold text-xs ${swapTab === 'buy' ? 'bg-cyan-500 text-black hover:bg-cyan-400' : 'text-muted-foreground'}`}
                    onClick={() => setSwapTab('buy')}
                  >
                    Buy Pieces
                  </Button>
                  <Button
                    size="sm"
                    variant={swapTab === 'sell' ? 'default' : 'ghost'}
                    className={`font-bold text-xs ${swapTab === 'sell' ? 'bg-rose-500 text-white hover:bg-rose-400' : 'text-muted-foreground'}`}
                    onClick={() => setSwapTab('sell')}
                  >
                    Sell Pieces
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="swap-count" className="text-xs font-bold">Number of Pieces</Label>
                  <Input
                    id="swap-count"
                    type="number"
                    min="1"
                    value={swapPiecesCount}
                    onChange={(e) => setSwapPiecesCount(e.target.value)}
                    className="font-bold text-base"
                  />
                </div>

                <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Total:</span>
                    <span className="font-bold text-foreground">{estimatedSwapCost} Gems</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Pool Swap Fee:</span>
                    <span>0.3% (~{(parseFloat(estimatedSwapCost) * 0.003).toFixed(2)} Gems)</span>
                  </div>
                </div>

                <Button
                  onClick={handleExecuteSwap}
                  disabled={isSwapping || swapCountNum <= 0}
                  className={`w-full font-black text-xs uppercase tracking-wider py-5 rounded-xl ${
                    swapTab === 'buy' 
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-black' 
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  {isSwapping ? "Executing Trade..." : `${swapTab === 'buy' ? 'Buy' : 'Sell'} for ${estimatedSwapCost} Gems`}
                </Button>
              </CardContent>
            </Card>

            {/* Order Book */}
            <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
              <CardHeader className="border-b border-border/40 pb-3">
                <CardTitle className="text-sm font-bold">{t("pieceProfile.availableNow")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <PieceOrderBook pieceType={profile.piece_type} assetId={profile.asset_id} />
              </CardContent>
            </Card>

            {/* Connected Surfaces */}
            <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
              <CardHeader className="border-b border-border/40 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> {t("pieceProfile.connectedSurfaces")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-2 gap-2">
                <Button asChild variant="outline" size="sm"><Link to="/portfolio">Portfolio</Link></Button>
                <Button asChild variant="outline" size="sm"><Link to="/marketplace">Marketplace</Link></Button>
                <Button asChild variant="outline" size="sm"><Link to={`/pieces/${profile.piece_type}/${profile.asset_id}/manage`}>Creator Studio</Link></Button>
                <Button asChild variant="outline" size="sm"><Link to="/wallet">Wallet</Link></Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default PieceProfile;


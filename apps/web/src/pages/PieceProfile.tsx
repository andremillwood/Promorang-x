import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Activity, ArrowLeft, BadgeCheck, Gem, Info, Loader2, PlusCircle, ShieldCheck, Sparkles, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { pieceType, assetId } = useParams<{ pieceType: PieceType; assetId: string }>();
  const { session } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<PieceProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingPool, setCreatingPool] = useState(false);
  const [initialPieces, setInitialPieces] = useState('1000');
  const [initialCurrency, setInitialCurrency] = useState('5000');

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
    } catch (error: any) {
      toast({
        title: 'Piece unavailable',
        description: error.message || 'Could not load this piece profile.',
        variant: 'destructive',
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Button asChild variant="ghost"><Link to="/marketplace"><ArrowLeft className="mr-2 h-4 w-4" />Marketplace</Link></Button>
        <h1 className="mt-6 text-2xl font-bold">Piece not found</h1>
      </div>
    );
  }

  const title = profile.asset.title || profile.asset.name || `${profile.piece_type} piece`;
  const currentPrice = Number(profile.pool?.last_price || profile.stats?.current_price || 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b bg-card/70">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <Button asChild variant="ghost" className="mb-4 px-0">
            <Link to="/marketplace"><ArrowLeft className="mr-2 h-4 w-4" />Marketplace</Link>
          </Button>
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="capitalize">{profile.piece_type}</Badge>
                {profile.pool && <Badge variant="secondary">{profile.pool.status}</Badge>}
              </div>
              <h1 className="mt-3 text-4xl font-bold">{title}</h1>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                {profile.asset.description || profile.journey?.summary}
              </p>
            </div>
            <TiltCard3D maxTilt={8} scaleOnHover={1.02} className="w-full">
              <Card className="overflow-hidden border-white/20 bg-gradient-to-br from-neutral-900/90 via-black to-neutral-950/90 shadow-2xl backdrop-blur-xl">
                <CardHeader className="border-b border-white/10 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-white">{t("pieceProfile.snapshot")}</CardTitle>
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4 text-white">
                  <div className="flex justify-between items-baseline"><span className="text-xs font-bold text-white/50 uppercase tracking-wider">{t("pieceProfile.price")}</span><span className="text-xl font-black text-primary">{currentPrice.toFixed(2)} Gems</span></div>
                  <div className="flex justify-between items-center border-t border-white/10 pt-2"><span className="text-xs font-bold text-white/50 uppercase tracking-wider">{t("pieceProfile.volume24h")}</span><span className="font-semibold text-white/90">{Number(profile.pool?.volume_24h || profile.stats?.volume_24h || 0).toFixed(0)} Gems</span></div>
                  <div className="flex justify-between items-center border-t border-white/10 pt-2"><span className="text-xs font-bold text-white/50 uppercase tracking-wider">{t("pieceProfile.holders")}</span><span className="font-semibold text-white/90">{Number(profile.stats?.holder_count || 0)}</span></div>
                  <div className="flex justify-between items-center border-t border-white/10 pt-2"><span className="text-xs font-bold text-white/50 uppercase tracking-wider">{t("pieceProfile.marketCap")}</span><span className="font-semibold text-white/90">{Number(profile.stats?.market_cap || 0).toFixed(2)} Gems</span></div>
                </CardContent>
              </Card>
            </TiltCard3D>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
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
                  <p className="mt-2 text-sm font-semibold">{profile.pool ? `${Number(profile.stats?.holder_count || 0)} holders · active pool` : "No active pool"}</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">A pool enables exchange; it does not guarantee a buyer, stable price or easy exit.</p>
                </div>
              </div>
            </GuidanceDisclosure>

            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Where this fits</AlertTitle>
              <AlertDescription>{profile.journey?.summary}</AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>{t("pieceProfile.journeyTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {(profile.journey?.steps || []).map((step, index) => (
                  <div key={step.step} className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{index + 1}</span>
                      <h3 className="font-semibold">{step.step}</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />{t("pieceProfile.forecastLab")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{profile.forecast_lab?.description}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {(profile.forecast_lab?.prompts || []).map(prompt => (
                    <div key={prompt} className="rounded-lg border bg-muted/30 p-4">
                      <p className="font-medium">{prompt}</p>
                      <Button disabled variant="outline" size="sm" className="mt-3">Concept only</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card><CardHeader><CardTitle>{t("pieceProfile.availableNow")}</CardTitle></CardHeader><CardContent><PieceOrderBook pieceType={profile.piece_type} assetId={profile.asset_id}/></CardContent></Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />{t("pieceProfile.pool")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.pool ? (
                  <>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("pieceProfile.piecesReserve")}</span><span>{Number(profile.pool.pieces_reserve || 0).toFixed(0)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("pieceProfile.gemsReserve")}</span><span>{Number(profile.pool.currency_reserve || 0).toFixed(0)}</span></div>
                    <Button asChild className="w-full"><Link to="/marketplace">{t("pieceProfile.tradeMarket")}</Link></Button>
                    <Button asChild variant="outline" className="w-full"><Link to="/liquidity">{t("pieceProfile.provideLiquidity")}</Link></Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">No pool is active for this piece yet. Eligible users can create one by depositing pieces and Gems.</p>
                    <div className="space-y-2">
                      <Label>Initial Pieces</Label>
                      <Input value={initialPieces} onChange={(event) => setInitialPieces(event.target.value)} type="number" min="1" />
                    </div>
                    <div className="space-y-2">
                      <Label>Initial Gems</Label>
                      <Input value={initialCurrency} onChange={(event) => setInitialCurrency(event.target.value)} type="number" min="1" />
                    </div>
                    <Button onClick={createPool} disabled={creatingPool || !session?.access_token} className="w-full">
                      {creatingPool ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                      {t("pieceProfile.createPool")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />{t("pieceProfile.connectedSurfaces")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button asChild variant="outline"><Link to="/portfolio">Portfolio</Link></Button>
                <Button asChild variant="outline"><Link to="/promoshare">PromoShare</Link></Button>
                <Button asChild variant="outline"><Link to="/explore/moments">Moments</Link></Button>
                <Button asChild variant="outline"><Link to="/vault">Vault</Link></Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default PieceProfile;

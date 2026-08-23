/**
 * Trading Marketplace Page
 * Browse and trade pieces with Gems
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { GemsBalance } from '@/components/trading/GemsBalance';
import { PieceCard } from '@/components/trading/PieceCard';
import { TradeModal } from '@/components/trading/TradeModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { GuidanceDisclosure } from '@/components/guidance/GuidanceDisclosure';
import { Search, Filter, TrendingUp, Gem, Loader2, TriangleAlert, Route, WalletCards } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cultureImages } from '@/data/culture-demo';
import { useI18n } from '@/i18n/I18nContext';

interface Piece {
  id: string;
  piece_type: 'content' | 'moment' | 'host' | 'venue';
  asset_id: string;
  title?: string;
  last_price: number;
  price_24h_ago?: number;
  volume_24h: number;
  status: string;
  pool_id: string;
  asset?: {
    id: string;
    title?: string;
    name?: string;
    image_url?: string;
  };
}

export function TradingMarketplace() {
  const { t } = useI18n();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [filteredPieces, setFilteredPieces] = useState<Piece[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [gemsBalance, setGemsBalance] = useState(0);
  const [userPieces, setUserPieces] = useState(0);
  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'https://api.promorang.co').replace(/\/$/, '');
  const apiUrl = (path: string) => `${apiBaseUrl}${apiBaseUrl.endsWith('/api') ? '' : '/api'}${path}`;

  useEffect(() => {
    if (user && session?.access_token) {
      fetchPools();
      fetchGemsBalance();
    }
  }, [user, session?.access_token]);

  useEffect(() => {
    filterPieces();
  }, [pieces, searchQuery, selectedType]);

  const fetchPools = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl('/pieces/pools?status=active'), {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPieces(data.pools || []);
      } else {
        throw new Error('Failed to fetch pools');
      }
    } catch (error) {
      console.error('Failed to fetch pools:', error);
      toast({
        title: 'Error',
        description: 'Failed to load marketplace. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGemsBalance = async () => {
    try {
      const response = await fetch(apiUrl('/pieces/gems/balance'), {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setGemsBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Failed to fetch Gems balance:', error);
    }
  };

  const filterPieces = () => {
    let filtered = pieces;
    
    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.piece_type === selectedType);
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        (p.asset?.title?.toLowerCase().includes(query) || false) ||
        (p.asset?.name?.toLowerCase().includes(query) || false) ||
        (p.title?.toLowerCase().includes(query) || false)
      );
    }
    
    setFilteredPieces(filtered);
  };

  const handleTrade = (piece: Piece, action: 'buy' | 'sell') => {
    setSelectedPiece(piece);
    setTradeAction(action);
    setIsTradeModalOpen(true);
  };

  const handleTradeSuccess = () => {
    fetchPools();
    fetchGemsBalance();
  };

  const typeCounts = {
    all: pieces.length,
    content: pieces.filter(p => p.piece_type === 'content').length,
    moment: pieces.filter(p => p.piece_type === 'moment').length,
    host: pieces.filter(p => p.piece_type === 'host').length,
    venue: pieces.filter(p => p.piece_type === 'venue').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/10">
        <img src={cultureImages.momentConcert} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/35" />
        <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-20 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/35 bg-black/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400"><Gem className="h-3.5 w-3.5" /> {t("tradingMarketplace.heroEyebrow")}</div>
              <h1 className="max-w-3xl text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">
                {t("tradingMarketplace.heroTitle")}
              </h1>
              <GuidanceDisclosure
                id="trading-marketplace:piece-market-context"
                eyebrow="Market guide"
                title="How to read active Piece markets"
                summary={t("tradingMarketplace.heroSubtitle")}
                className="mt-5 max-w-2xl"
              >
                <p className="text-base leading-7 text-white/55">
                  {t("tradingMarketplace.heroSubtitle")}
                </p>
              </GuidanceDisclosure>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Button asChild variant="outline" size="sm">
                  <Link to="/portfolio">Portfolio</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/kyc">Check KYC Status</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/liquidity">Provide Liquidity</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/vault">Back to Vault</Link>
                </Button>
              </div>
            </div>
            <div className="w-full md:w-auto">
              <GemsBalance />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#090909]/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("tradingMarketplace.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="all">
                  All <Badge variant="secondary" className="ml-1">{typeCounts.all}</Badge>
                </TabsTrigger>
                <TabsTrigger value="content">
                  Content <Badge variant="secondary" className="ml-1">{typeCounts.content}</Badge>
                </TabsTrigger>
                <TabsTrigger value="moment">
                  Moments <Badge variant="secondary" className="ml-1">{typeCounts.moment}</Badge>
                </TabsTrigger>
                <TabsTrigger value="host">
                  Hosts <Badge variant="secondary" className="ml-1">{typeCounts.host}</Badge>
                </TabsTrigger>
                <TabsTrigger value="venue">
                  Venues <Badge variant="secondary" className="ml-1">{typeCounts.venue}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Market Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <GuidanceDisclosure
          id="trading-marketplace:earning-pieces"
          eyebrow="Piece guide"
          title="How people earn and hold Pieces"
          summary="Proof, attendance, referrals, and content-attributed activity can create Piece positions."
          className="mb-8"
          tone="light"
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <Route className="mb-3 h-5 w-5 text-primary" />
              <h2 className="font-semibold">Earn through proof</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Join a moment for early participant pieces. Check in for verified attendance pieces. Invite people who show up to earn contributor pieces.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <WalletCards className="mb-3 h-5 w-5 text-primary" />
              <h2 className="font-semibold">Keep your positions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your portfolio shows piece holdings across content, moments, hosts, and venues with links to each profile.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <TrendingUp className="mb-3 h-5 w-5 text-primary" />
              <h2 className="font-semibold">Back active signal</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Content-attributed joins, check-ins, and verified proof can award pieces when distribution turns into real activity.
              </p>
            </div>
          </div>
        </GuidanceDisclosure>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="h-4 w-4" />
              {t("tradingMarketplace.activePools")}
            </div>
            <div className="text-2xl font-bold mt-1">{pieces.length}</div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Gem className="h-4 w-4" />
              {t("tradingMarketplace.volume24h")}
            </div>
            <div className="text-2xl font-bold mt-1">
              {pieces.reduce((sum, p) => sum + (p.volume_24h || 0), 0).toFixed(0)} Gems
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="h-4 w-4" />
              {t("tradingMarketplace.yourBalance")}
            </div>
            <div className="text-2xl font-bold mt-1">{gemsBalance.toFixed(2)} Gems</div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Filter className="h-4 w-4" />
              Filtered Results
            </div>
            <div className="text-2xl font-bold mt-1">{filteredPieces.length}</div>
          </div>
        </div>

        {/* Pieces Grid */}
        {filteredPieces.length === 0 ? (
          <div className="text-center py-12">
            <TriangleAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No active trading pools</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? `No results for "${searchQuery}"` 
                : 'Trading inventory is not currently available for this filter set.'}
            </p>
            <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <Button asChild variant="outline" size="sm">
                <Link to="/promoshare">Open PromoShare</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/vault">Return to Vault</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPieces.map((piece) => (
              <PieceCard 
                key={piece.id} 
                piece={piece} 
                onTrade={handleTrade}
              />
            ))}
          </div>
        )}
      </div>

      {/* Trade Modal */}
      <TradeModal
        piece={selectedPiece}
        action={tradeAction}
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        onSuccess={handleTradeSuccess}
        gemsBalance={gemsBalance}
        userPieces={userPieces}
      />
    </div>
  );
}

export default TradingMarketplace;

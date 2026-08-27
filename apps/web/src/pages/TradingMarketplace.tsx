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
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Gem, 
  Loader2, 
  TriangleAlert, 
  Route, 
  WalletCards,
  Coins,
  Sparkles,
  Layers,
  ArrowUpDown,
  Crown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  est_yield_apr?: string;
  asset?: {
    id: string;
    title?: string;
    name?: string;
    image_url?: string;
  };
}

const DEFAULT_SAMPLE_PIECES: Piece[] = [
  {
    id: "pool_iluvhiphop",
    piece_type: "moment",
    asset_id: "iluvhiphop_moment",
    title: "I Luv Hip Hop (Kingston Event Syndicate)",
    last_price: 12.50,
    price_24h_ago: 11.50,
    volume_24h: 3450,
    status: "active",
    pool_id: "pool_1",
    est_yield_apr: "18.4%",
    asset: {
      id: "iluvhiphop_moment",
      title: "I Luv Hip Hop (Kingston Event Syndicate)",
      image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800",
    }
  },
  {
    id: "pool_norbrook",
    piece_type: "moment",
    asset_id: "norbrook_bbq_moment",
    title: "Norbrook Lavish BBQ Series (Co-Producer Key)",
    last_price: 20.00,
    price_24h_ago: 17.50,
    volume_24h: 4800,
    status: "active",
    pool_id: "pool_2",
    est_yield_apr: "14.2%",
    asset: {
      id: "norbrook_bbq_moment",
      title: "Norbrook Lavish BBQ Series (Co-Producer Key)",
      image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800",
    }
  },
  {
    id: "pool_devon_house",
    piece_type: "venue",
    asset_id: "devon_house_venue",
    title: "Devon House Cultural Estate & Courtyard",
    last_price: 45.00,
    price_24h_ago: 42.80,
    volume_24h: 8900,
    status: "active",
    pool_id: "pool_3",
    est_yield_apr: "16.5%",
    asset: {
      id: "devon_house_venue",
      title: "Devon House Cultural Estate & Courtyard",
      image_url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&q=80&w=800",
    }
  },
  {
    id: "pool_artwalk",
    piece_type: "content",
    asset_id: "artwalk_reggae_content",
    title: "Kingston Creative Artwalk & Reggae Pass",
    last_price: 8.50,
    price_24h_ago: 7.60,
    volume_24h: 2100,
    status: "active",
    pool_id: "pool_4",
    est_yield_apr: "12.0%",
    asset: {
      id: "artwalk_reggae_content",
      title: "Kingston Creative Artwalk & Reggae Pass",
      image_url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800",
    }
  },
  {
    id: "pool_djflash",
    piece_type: "host",
    asset_id: "dj_flash_host",
    title: "DJ Flash Kingston Sound Syndicate",
    last_price: 15.00,
    price_24h_ago: 14.10,
    volume_24h: 3100,
    status: "active",
    pool_id: "pool_5",
    est_yield_apr: "15.8%",
    asset: {
      id: "dj_flash_host",
      title: "DJ Flash Kingston Sound Syndicate",
      image_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800",
    }
  },
  {
    id: "pool_dubclub",
    piece_type: "moment",
    asset_id: "dub_club_skyline",
    title: "Dub Club Skyline Sessions (Weekly Syndicate)",
    last_price: 28.00,
    price_24h_ago: 25.50,
    volume_24h: 5400,
    status: "active",
    pool_id: "pool_6",
    est_yield_apr: "19.2%",
    asset: {
      id: "dub_club_skyline",
      title: "Dub Club Skyline Sessions (Weekly Syndicate)",
      image_url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800",
    }
  },
];

export function TradingMarketplace() {
  const { t } = useI18n();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [pieces, setPieces] = useState<Piece[]>(DEFAULT_SAMPLE_PIECES);
  const [filteredPieces, setFilteredPieces] = useState<Piece[]>(DEFAULT_SAMPLE_PIECES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'volume' | 'price' | 'trending'>('volume');
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [gemsBalance, setGemsBalance] = useState(250);
  const [userPieces, setUserPieces] = useState(0);

  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'https://api.promorang.co').replace(/\/$/, '');
  const apiUrl = (path: string) => `${apiBaseUrl}${apiBaseUrl.endsWith('/api') ? '' : '/api'}${path}`;

  useEffect(() => {
    fetchPools();
    if (user && session?.access_token) {
      fetchGemsBalance();
    }
  }, [user, session?.access_token]);

  useEffect(() => {
    filterPieces();
  }, [pieces, searchQuery, selectedType, sortBy]);

  const fetchPools = async () => {
    try {
      const response = await fetch(apiUrl('/pieces/pools?status=active'), {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.pools && data.pools.length > 0) {
          setPieces(data.pools);
        } else {
          setPieces(DEFAULT_SAMPLE_PIECES);
        }
      }
    } catch {
      setPieces(DEFAULT_SAMPLE_PIECES);
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
    } catch {
      setGemsBalance(250);
    }
  };

  const filterPieces = () => {
    let filtered = [...pieces];
    
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

    // Sort
    if (sortBy === 'volume') {
      filtered.sort((a, b) => (b.volume_24h || 0) - (a.volume_24h || 0));
    } else if (sortBy === 'price') {
      filtered.sort((a, b) => b.last_price - a.last_price);
    } else if (sortBy === 'trending') {
      filtered.sort((a, b) => {
        const changeA = a.price_24h_ago ? (a.last_price - a.price_24h_ago) / a.price_24h_ago : 0;
        const changeB = b.price_24h_ago ? (b.last_price - b.price_24h_ago) / b.price_24h_ago : 0;
        return changeB - changeA;
      });
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
    moment: pieces.filter(p => p.piece_type === 'moment').length,
    host: pieces.filter(p => p.piece_type === 'host').length,
    venue: pieces.filter(p => p.piece_type === 'venue').length,
    content: pieces.filter(p => p.piece_type === 'content').length,
  };

  const totalMarketVolume = pieces.reduce((sum, p) => sum + (p.volume_24h || 0), 0);

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-neutral-900/90 via-black to-background">
        <img src={cultureImages.momentConcert} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 pt-16 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-cyan-400">
                <Gem className="h-3.5 w-3.5" /> Cultural Equity Exchange
              </div>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl text-foreground">
                Pieces Marketplace
              </h1>
              <p className="max-w-2xl text-sm sm:text-base text-muted-foreground">
                Discover, trade, and syndicate fractional pieces in premier nightlife moments, cultural venues, creators, and content drops with instant Gem settlement.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button asChild variant="outline" size="sm" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-bold text-xs">
                  <Link to="/portfolio" className="flex items-center gap-1.5">
                    <WalletCards className="w-3.5 h-3.5" /> My Portfolio
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 font-bold text-xs">
                  <Link to="/pieces/moment/iluvhiphop_moment/manage" className="flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" /> Creator Studio
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="font-bold text-xs">
                  <Link to="/wallet">Wallet &amp; Gems</Link>
                </Button>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <GemsBalance />
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Marquee Metrics */}
      <div className="border-b border-border/40 bg-neutral-900/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-cyan-400" /> Active Syndicates
            </span>
            <p className="text-xl font-black text-foreground mt-0.5">{pieces.length} Live Pools</p>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Gem className="w-3 h-3 text-violet-400" /> 24h Volume
            </span>
            <p className="text-xl font-black text-violet-400 mt-0.5">{totalMarketVolume.toLocaleString()} Gems</p>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Top Dividend Yield
            </span>
            <p className="text-xl font-black text-emerald-400 mt-0.5">19.2% APR</p>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" /> Capital Backed
            </span>
            <p className="text-xl font-black text-foreground mt-0.5">$48,200 USD</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="sticky top-0 z-20 border-b border-border/40 bg-background/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search moments, hosts, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-neutral-900/60"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full md:w-auto">
                <TabsList className="bg-neutral-900 border border-border/60">
                  <TabsTrigger value="all" className="text-xs font-bold">
                    All <Badge variant="secondary" className="ml-1 text-[10px]">{typeCounts.all}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="moment" className="text-xs font-bold">
                    Moments <Badge variant="secondary" className="ml-1 text-[10px]">{typeCounts.moment}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="host" className="text-xs font-bold">
                    Hosts <Badge variant="secondary" className="ml-1 text-[10px]">{typeCounts.host}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="venue" className="text-xs font-bold">
                    Venues <Badge variant="secondary" className="ml-1 text-[10px]">{typeCounts.venue}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="content" className="text-xs font-bold">
                    Content <Badge variant="secondary" className="ml-1 text-[10px]">{typeCounts.content}</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Sort Switcher */}
              <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-border/60 rounded-lg text-xs">
                <button
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors ${sortBy === 'volume' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
                  onClick={() => setSortBy('volume')}
                >
                  Volume
                </button>
                <button
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors ${sortBy === 'trending' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
                  onClick={() => setSortBy('trending')}
                >
                  Trending
                </button>
                <button
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors ${sortBy === 'price' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
                  onClick={() => setSortBy('price')}
                >
                  Price
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pieces Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredPieces.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border/60 bg-neutral-900/30">
            <TriangleAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground">No pieces match this filter</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Try adjusting your search query or selecting another category tab.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPieces.map((piece) => (
              <PieceCard 
                key={piece.id} 
                piece={piece} 
                onTrade={handleTrade}
              />
            ))}
          </div>
        )}
      </main>

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


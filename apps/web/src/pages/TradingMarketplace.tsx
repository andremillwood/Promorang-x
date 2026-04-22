/**
 * Trading Marketplace Page
 * Browse and trade pieces with Gems
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GemsBalance } from '@/components/trading/GemsBalance';
import { PieceCard } from '@/components/trading/PieceCard';
import { TradeModal } from '@/components/trading/TradeModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, TrendingUp, Gem, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
  const { user } = useAuth();
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

  useEffect(() => {
    if (user) {
      fetchPools();
      fetchGemsBalance();
    }
  }, [user]);

  useEffect(() => {
    filterPieces();
  }, [pieces, searchQuery, selectedType]);

  const fetchPools = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pieces/pools?status=active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
      const response = await fetch('/api/pieces/gems/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b bg-card/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Gem className="h-8 w-8 text-violet-500" />
                Piece Marketplace
              </h1>
              <p className="text-muted-foreground mt-1">
                Buy and sell pieces with Gems
              </p>
            </div>
            <div className="w-full md:w-auto">
              <GemsBalance />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pieces..."
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="h-4 w-4" />
              Active Pools
            </div>
            <div className="text-2xl font-bold mt-1">{pieces.length}</div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Gem className="h-4 w-4" />
              24h Volume
            </div>
            <div className="text-2xl font-bold mt-1">
              {pieces.reduce((sum, p) => sum + (p.volume_24h || 0), 0).toFixed(0)} Gems
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="h-4 w-4" />
              Your Balance
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
            <Gem className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No pieces found</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? `No results for "${searchQuery}"` 
                : 'No active trading pools available'}
            </p>
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

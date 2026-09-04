import { useEffect, useMemo, useState } from 'react';
import { Loader2, RotateCcw, ShoppingCart, Tag, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';

type Listing = {
  id: string;
  seller_id: string;
  quantity: number;
  price_per_piece: number;
  listing_type: 'sell' | 'buy';
  status: string;
  expires_at?: string | null;
};

type Position = {
  piece_type: string;
  asset_id: string;
  pieces_owned: number;
  avg_purchase_price?: number | null;
  current_price?: number | null;
  market_value?: number | null;
};

const money = (value: number) => `${Number(value || 0).toFixed(2)} Gems`;

export function PieceOrderBook({ pieceType, assetId }: { pieceType: string; assetId: string }) {
  const { session, user } = useAuth();
  const { toast } = useToast();
  const [sellListings, setSellListings] = useState<Listing[]>([]);
  const [buyListings, setBuyListings] = useState<Listing[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [quantity, setQuantity] = useState('1');
  const [sellQuantity, setSellQuantity] = useState('1');
  const [sellPrice, setSellPrice] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const ownedPosition = useMemo(
    () => positions.find((x) => x.piece_type === pieceType && x.asset_id === assetId),
    [positions, pieceType, assetId]
  );
  const ownListings = sellListings.filter((x) => x.seller_id === user?.id);
  const bestAsk = sellListings[0]?.price_per_piece;
  const bestBid = buyListings[0]?.price_per_piece;

  const authHeaders = async () => {
    if (!session?.access_token) throw new Error('Sign in to trade Pieces');
    return { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' };
  };

  const loadListings = async () => {
    const response = await fetch(`${API_BASE_URL}/pieces/${pieceType}/${assetId}/listings`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Listings unavailable');
    setSellListings(data.sell_listings || []);
    setBuyListings((data.buy_listings || []).sort((a: Listing, b: Listing) => Number(b.price_per_piece) - Number(a.price_per_piece)));
  };

  const loadPortfolio = async () => {
    if (!session?.access_token) {
      setPositions([]);
      return;
    }
    const response = await fetch(`${API_BASE_URL}/pieces/portfolio/me`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await response.json();
    if (response.ok) setPositions(data.positions || []);
  };

  const refresh = async () => {
    await Promise.all([loadListings(), loadPortfolio()]);
  };

  useEffect(() => {
    void refresh().catch((error) => toast({ title: 'Pieces market unavailable', description: error.message, variant: 'destructive' }));
  }, [pieceType, assetId, session?.access_token]);

  const buy = async (listing: Listing) => {
    setBusy(`buy:${listing.id}`);
    try {
      const q = Math.min(Number(quantity), Number(listing.quantity));
      if (!q || q <= 0) throw new Error('Enter a valid quantity');
      const response = await fetch(`${API_BASE_URL}/pieces/${pieceType}/${assetId}/buy`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ listing_id: listing.id, quantity: q, max_price: listing.price_per_piece }),
      });
      const data = await response.json();
      if (!response.ok || data.success === false) throw new Error(data.error || 'Trade failed');
      const trade = Array.isArray(data.trade) ? data.trade[0] : data.trade;
      if (!trade) throw new Error('Trade did not settle. Nothing moved.');
      toast({ title: 'Pieces added to your portfolio', description: `Bought ${q} at ${money(listing.price_per_piece)}` });
      await refresh();
    } catch (error: any) {
      toast({ title: 'Trade not completed', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const createListing = async () => {
    setBusy('sell');
    try {
      const q = Number(sellQuantity);
      const price = Number(sellPrice);
      if (!q || q <= 0) throw new Error('Enter a valid quantity');
      if (!price || price <= 0) throw new Error('Enter a valid price');
      if (ownedPosition && q > Number(ownedPosition.pieces_owned)) throw new Error('You do not own enough Pieces');
      const response = await fetch(`${API_BASE_URL}/pieces/${pieceType}/${assetId}/sell`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ quantity: q, min_price: price }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not create listing');
      toast({ title: 'Listing opened', description: `${q} Pieces listed at ${money(price)}` });
      setSellQuantity('1');
      setSellPrice('');
      await refresh();
    } catch (error: any) {
      toast({ title: 'Listing not created', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const cancel = async (listingId: string) => {
    setBusy(`cancel:${listingId}`);
    try {
      const response = await fetch(`${API_BASE_URL}/pieces/listings/${listingId}`, {
        method: 'DELETE',
        headers: await authHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not cancel listing');
      toast({ title: 'Listing cancelled', description: 'Those Pieces are back in your position.' });
      await refresh();
    } catch (error: any) {
      toast({ title: 'Cancel failed', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Tabs defaultValue="buy" className="space-y-4">
      <div className="grid gap-2 rounded-xl border bg-muted/30 p-3 text-xs sm:grid-cols-3">
        <div><p className="text-muted-foreground">Best ask</p><p className="font-bold">{bestAsk ? money(bestAsk) : 'No asks'}</p></div>
        <div><p className="text-muted-foreground">Best bid</p><p className="font-bold">{bestBid ? money(bestBid) : 'No bids'}</p></div>
        <div><p className="text-muted-foreground">Owned</p><p className="font-bold">{Number(ownedPosition?.pieces_owned || 0).toLocaleString()} Pieces</p></div>
      </div>

      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="buy">Buy</TabsTrigger>
        <TabsTrigger value="sell">Sell</TabsTrigger>
        <TabsTrigger value="manage">Manage</TabsTrigger>
      </TabsList>

      <TabsContent value="buy" className="space-y-3">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="piece-buy-quantity">Quantity</Label>
            <Input id="piece-buy-quantity" type="number" min="0.01" step="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <Button variant="outline" size="icon" onClick={() => void refresh()}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        {sellListings.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">No sell listings yet.</p>
        ) : sellListings.slice(0, 6).map((x) => (
          <div key={x.id} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <b>{money(x.price_per_piece)}</b>
              <p className="text-xs text-muted-foreground">{Number(x.quantity).toLocaleString()} available</p>
            </div>
            <Button size="sm" disabled={!!busy || x.seller_id === user?.id} onClick={() => buy(x)}>
              {busy === `buy:${x.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-1 h-4 w-4" />}
              {x.seller_id === user?.id ? 'Yours' : 'Buy'}
            </Button>
          </div>
        ))}
      </TabsContent>

      <TabsContent value="sell" className="space-y-3">
        <div className="rounded-lg border bg-muted/30 p-3 text-sm">
          You can list up to <b>{Number(ownedPosition?.pieces_owned || 0).toLocaleString()}</b> Pieces from this position.
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="piece-sell-quantity">Quantity</Label>
            <Input id="piece-sell-quantity" type="number" min="0.01" step="0.01" value={sellQuantity} onChange={(e) => setSellQuantity(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="piece-sell-price">Price per Piece</Label>
            <Input id="piece-sell-price" type="number" min="0.01" step="0.01" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} placeholder={bestAsk ? String(bestAsk) : '12.50'} />
          </div>
        </div>
        <Button className="w-full" disabled={busy === 'sell' || !ownedPosition} onClick={createListing}>
          {busy === 'sell' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Tag className="mr-2 h-4 w-4" />}
          List Pieces
        </Button>
      </TabsContent>

      <TabsContent value="manage" className="space-y-3">
        {ownListings.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">You have no active listings for this Piece.</p>
        ) : ownListings.map((x) => (
          <div key={x.id} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="flex items-center gap-2"><b>{money(x.price_per_piece)}</b><Badge variant="secondary">{x.status}</Badge></div>
              <p className="text-xs text-muted-foreground">{Number(x.quantity).toLocaleString()} listed</p>
            </div>
            <Button size="sm" variant="outline" disabled={!!busy} onClick={() => cancel(x.id)}>
              {busy === `cancel:${x.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="mr-1 h-4 w-4" />}
              Cancel
            </Button>
          </div>
        ))}
      </TabsContent>
    </Tabs>
  );
}

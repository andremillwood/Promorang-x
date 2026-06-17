/**
 * Piece Card Component
 * Shows a tradable piece with price and trading actions
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Info, ShoppingCart, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Piece {
  id: string;
  piece_type: 'content' | 'moment' | 'host' | 'venue';
  asset_id?: string;
  title: string;
  image_url?: string;
  last_price: number;
  price_24h_ago?: number;
  volume_24h?: number;
  pool_id?: string;
  asset?: {
    id: string;
    title?: string;
    name?: string;
    image_url?: string;
  };
}

interface PieceCardProps {
  piece: Piece;
  onTrade: (piece: Piece, action: 'buy' | 'sell') => void;
}

export function PieceCard({ piece, onTrade }: PieceCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const assetId = piece.asset?.id || piece.asset_id || piece.id;

  const priceChange = piece.price_24h_ago 
    ? ((piece.last_price - piece.price_24h_ago) / piece.price_24h_ago) * 100
    : 0;
  
  const isPriceUp = priceChange >= 0;
  
  const typeLabels = {
    content: 'Content',
    moment: 'Moment',
    host: 'Host',
    venue: 'Venue',
  };

  const typeColors = {
    content: 'bg-blue-100 text-blue-800',
    moment: 'bg-purple-100 text-purple-800',
    host: 'bg-green-100 text-green-800',
    venue: 'bg-orange-100 text-orange-800',
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-32 bg-gradient-to-br from-muted to-secondary">
        {piece.asset?.image_url ? (
          <img 
            src={piece.asset.image_url} 
            alt={piece.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Tag className="h-12 w-12" />
          </div>
        )}
        <Badge 
          className={`absolute top-2 left-2 ${typeColors[piece.piece_type]}`}
        >
          {typeLabels[piece.piece_type]}
        </Badge>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">
              {piece.asset?.title || piece.asset?.name || piece.title || 'Untitled'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {piece.piece_type === 'content' && 'Content Piece'}
              {piece.piece_type === 'moment' && 'Event Moment'}
              {piece.piece_type === 'host' && 'Host Reputation'}
              {piece.piece_type === 'venue' && 'Venue Value'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price Display */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold">
              {piece.last_price.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground ml-1">Gems</span>
          </div>
          <div className={`flex items-center text-sm ${isPriceUp ? 'text-green-600' : 'text-red-600'}`}>
            {isPriceUp ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            {Math.abs(priceChange).toFixed(2)}%
          </div>
        </div>

        {/* Volume */}
        {piece.volume_24h && (
          <div className="text-xs text-muted-foreground">
            Vol: {piece.volume_24h.toFixed(0)} Gems (24h)
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link to={`/pieces/${piece.piece_type}/${assetId}`}>Details</Link>
          </Button>
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => onTrade(piece, 'buy')}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Buy
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onTrade(piece, 'sell')}
          >
            Sell
          </Button>
          
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Piece Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <p className="text-sm text-muted-foreground capitalize">{piece.piece_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Current Price</label>
                  <p className="text-lg font-semibold">{piece.last_price.toFixed(2)} Gems</p>
                </div>
                <div>
                  <label className="text-sm font-medium">24h Volume</label>
                  <p className="text-sm text-muted-foreground">
                    {piece.volume_24h?.toFixed(0) || '0'} Gems
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Price Change (24h)</label>
                  <p className={`text-sm ${isPriceUp ? 'text-green-600' : 'text-red-600'}`}>
                    {isPriceUp ? '+' : ''}{priceChange.toFixed(2)}%
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

export default PieceCard;

/**
 * Piece Card Component
 * Shows a tradable piece with 3D perspective tilt, holographic foil sheen, and trading actions
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Info, ShoppingCart, Tag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TiltCard3D } from '@/components/ui/TiltCard3D';

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
    content: 'Content Piece',
    moment: 'Moment Piece',
    host: 'Host Piece',
    venue: 'Venue Piece',
  };

  const typeBorders = {
    content: 'border-blue-500/30 hover:border-blue-500/60',
    moment: 'border-purple-500/30 hover:border-purple-500/60',
    host: 'border-emerald-500/30 hover:border-emerald-500/60',
    venue: 'border-orange-500/30 hover:border-orange-500/60',
  };

  const typeBadges = {
    content: 'border-blue-400/40 bg-blue-500/15 text-blue-300',
    moment: 'border-purple-400/40 bg-purple-500/15 text-purple-300',
    host: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300',
    venue: 'border-orange-400/40 bg-orange-500/15 text-orange-300',
  };

  return (
    <TiltCard3D
      maxTilt={10}
      scaleOnHover={1.03}
      perspective={1000}
      className="w-full"
    >
      <div className={`group relative overflow-hidden rounded-2xl border ${typeBorders[piece.piece_type]} bg-gradient-to-b from-neutral-900/90 to-black/95 shadow-xl transition-all duration-300 backdrop-blur-xl`}>
        {/* Holographic Angle Foil Light Layer */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_top_right,rgba(255,106,0,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.12),transparent_50%)]"
        />

        {/* Media / Image Container */}
        <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-950">
          {piece.asset?.image_url ? (
            <img 
              src={piece.asset.image_url} 
              alt={piece.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Tag className="h-10 w-10 opacity-40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          <Badge 
            variant="outline"
            className={`absolute top-2.5 left-2.5 backdrop-blur-md text-[10px] font-black uppercase tracking-wider ${typeBadges[piece.piece_type]}`}
          >
            {typeLabels[piece.piece_type]}
          </Badge>

          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white/80 backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-amber-400" />
            Tradable
          </div>
        </div>
        
        {/* Card Content Area */}
        <div className="p-4 space-y-3.5">
          <div>
            <h3 className="font-black text-base line-clamp-1 text-white group-hover:text-primary transition-colors">
              {piece.asset?.title || piece.asset?.name || piece.title || 'Untitled'}
            </h3>
            <p className="text-xs text-white/50">
              {typeLabels[piece.piece_type]}
            </p>
          </div>

          {/* Price & Trend Metric */}
          <div className="flex items-baseline justify-between rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
            <div>
              <span className="text-xl font-black text-white">
                {piece.last_price.toFixed(2)}
              </span>
              <span className="ml-1 text-xs font-bold text-violet-400">Gems</span>
            </div>
            <div className={`flex items-center text-xs font-bold ${isPriceUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPriceUp ? (
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 mr-1" />
              )}
              {Math.abs(priceChange).toFixed(2)}%
            </div>
          </div>

          {/* Volume */}
          {piece.volume_24h ? (
            <div className="text-[11px] text-white/40 font-medium">
              24h Vol: {piece.volume_24h.toFixed(0)} Gems
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button asChild variant="outline" size="sm" className="flex-1 rounded-xl border-white/15 bg-white/5 text-xs font-bold text-white hover:bg-white/10 hover:text-white">
              <Link to={`/pieces/${piece.piece_type}/${assetId}`}>Details</Link>
            </Button>
            <Button 
              size="sm"
              className="flex-1 rounded-xl bg-emerald-600 font-bold hover:bg-emerald-500 text-xs shadow-lg shadow-emerald-900/30"
              onClick={() => onTrade(piece, 'buy')}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1" />
              Buy
            </Button>
            <Button 
              size="sm"
              variant="outline" 
              className="rounded-xl border-white/15 bg-white/5 text-xs font-bold text-white hover:bg-white/10 hover:text-white"
              onClick={() => onTrade(piece, 'sell')}
            >
              Sell
            </Button>
            
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10">
                  <Info className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="border-white/15 bg-neutral-950 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Piece Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Type</label>
                    <p className="font-semibold text-white capitalize">{piece.piece_type}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Current Price</label>
                    <p className="text-lg font-black text-white">{piece.last_price.toFixed(2)} Gems</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase tracking-wider">24h Volume</label>
                    <p className="text-white/80 font-medium">
                      {piece.volume_24h?.toFixed(0) || '0'} Gems
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Price Change (24h)</label>
                    <p className={`font-bold ${isPriceUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPriceUp ? '+' : ''}{priceChange.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </TiltCard3D>
  );
}

export default PieceCard;

/**
 * Trade Modal Component
 * Handles buying/selling pieces with Gems
 */

import { useState, useEffect } from 'react';
import { X, AlertTriangle, ArrowRight, Gem, TrendingDown, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Piece {
  id: string;
  piece_type: string;
  title: string;
  last_price: number;
  pool_id: string;
}

interface TradeModalProps {
  piece: Piece | null;
  action: 'buy' | 'sell';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gemsBalance: number;
  userPieces: number;
}

export function TradeModal({ 
  piece, 
  action, 
  isOpen, 
  onClose, 
  onSuccess,
  gemsBalance,
  userPieces 
}: TradeModalProps) {
  const [amount, setAmount] = useState(1);
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingQuote, setFetchingQuote] = useState(false);
  const [slippage, setSlippage] = useState(1); // 1% default
  const { toast } = useToast();
  const { session } = useAuth();
  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'https://api.promorang.co').replace(/\/$/, '');
  const apiUrl = (path: string) => `${apiBaseUrl}${apiBaseUrl.endsWith('/api') ? '' : '/api'}${path}`;

  useEffect(() => {
    if (isOpen && piece) {
      fetchQuote();
    }
  }, [isOpen, piece, amount, slippage]);

  const fetchQuote = async () => {
    if (!piece?.pool_id) return;
    
    setFetchingQuote(true);
    try {
      const type = action === 'buy' ? 'currency_to_pieces' : 'pieces_to_currency';
      const amountParam = action === 'buy' ? amount * piece.last_price : amount;
      
      const response = await fetch(
        apiUrl(`/pieces/pools/${piece.pool_id}/quote?type=${type}&amount=${amountParam}&slippage_tolerance=${slippage / 100}`),
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || ''}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setQuote(data);
      }
    } catch (error) {
      console.error('Failed to fetch quote:', error);
    } finally {
      setFetchingQuote(false);
    }
  };

  const handleTrade = async () => {
    if (!piece?.pool_id) return;
    
    setLoading(true);
    try {
      const endpoint = apiUrl(`/pieces/pools/${piece.pool_id}/trade/${action === 'buy' ? 'gems-to-pieces' : 'pieces-to-gems'}`);
      
      const body = action === 'buy' ? {
        gems_amount: amount * piece.last_price,
        min_pieces_out: amount * 0.95, // 5% slippage protection
        slippage_tolerance: slippage / 100,
      } : {
        pieces_amount: amount,
        min_gems_out: quote?.amount_out * 0.95 || amount * piece.last_price * 0.95,
        slippage_tolerance: slippage / 100,
      };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: action === 'buy' ? 'Purchase Successful!' : 'Sale Successful!',
          description: action === 'buy' 
            ? `You bought ${data.pieces_received?.toFixed(2) || amount} pieces for ${data.gems_spent || amount * piece.last_price} Gems`
            : `You sold ${amount} pieces for ${data.gems_received || quote?.amount_out} Gems`,
        });
        onSuccess();
        onClose();
      } else {
        throw new Error(data.error || 'Trade failed');
      }
    } catch (error: any) {
      toast({
        title: 'Trade Failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!piece) return null;

  const estimatedCost = action === 'buy' ? amount * piece.last_price : amount;
  const canAfford = action === 'buy' 
    ? gemsBalance >= estimatedCost 
    : userPieces >= amount;
  
  const priceImpact = quote?.price_impact_percent || 0;
  const highImpact = priceImpact > 2;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === 'buy' ? 'Buy' : 'Sell'} {piece.title || 'Piece'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label>Amount ({action === 'buy' ? 'Pieces' : 'Pieces to Sell'})</Label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min={0.01}
                step={0.01}
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="text-lg"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {action === 'buy' ? 'Pieces' : 'Pieces'}
              </span>
            </div>
            <Slider
              value={[amount]}
              onValueChange={(value) => setAmount(value[0])}
              max={action === 'buy' ? Math.floor(gemsBalance / piece.last_price) : userPieces}
              step={0.01}
              className="mt-2"
            />
          </div>

          {/* Quote Display */}
          {quote && (
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per Piece</span>
                <span>{piece.last_price.toFixed(2)} Gems</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{action === 'buy' ? 'You Pay' : 'You Receive'}</span>
                <span className="font-semibold">
                  {action === 'buy' ? (
                    <>{quote.amount_in?.toFixed(2) || estimatedCost.toFixed(2)} <Gem className="inline h-3 w-3" /></>
                  ) : (
                    <>{quote.amount_out?.toFixed(2)} <Gem className="inline h-3 w-3" /></>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price Impact</span>
                <span className={highImpact ? 'text-red-500 font-semibold' : ''}>
                  {priceImpact.toFixed(2)}%
                </span>
              </div>
              {highImpact && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    High price impact! Consider trading a smaller amount.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Slippage Tolerance */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              Slippage Tolerance
              <Info className="h-3 w-3 text-muted-foreground" />
            </Label>
            <div className="flex gap-2">
              {[0.5, 1, 2, 5].map((value) => (
                <Button
                  key={value}
                  variant={slippage === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSlippage(value)}
                >
                  {value}%
                </Button>
              ))}
            </div>
          </div>

          {/* Balance Warning */}
          {!canAfford && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {action === 'buy' 
                  ? `Insufficient Gems. You have ${gemsBalance.toFixed(2)} Gems.`
                  : `Insufficient pieces. You have ${userPieces.toFixed(2)} pieces.`
                }
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleTrade}
            disabled={!canAfford || loading || fetchingQuote || highImpact}
            className={action === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
          >
            {loading ? 'Processing...' : action === 'buy' ? 'Confirm Purchase' : 'Confirm Sale'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TradeModal;

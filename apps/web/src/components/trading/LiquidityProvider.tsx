/**
 * Liquidity Provider Component
 * Allow users to add/remove liquidity from pools and earn fees
 * Similar to Uniswap - users deposit Gems + Pieces, earn trading fees
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Minus, 
  TrendingUp, 
  Wallet, 
  Gem, 
  Tag,
  Info,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Percent
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Pool {
  id: string;
  piece_type: string;
  asset_id: string;
  title: string;
  pieces_reserve: number;
  currency_reserve: number;
  last_price: number;
  swap_fee_percent: number;
  volume_24h: number;
  lp_fee_percent: number;
  asset?: {
    title?: string;
    name?: string;
    image_url?: string;
  };
}

interface LPPosition {
  lp_tokens: number;
  pieces_deposited: number;
  currency_deposited: number;
  fees_earned_pieces: number;
  fees_earned_currency: number;
  pool_share_percent: number;
}

interface LiquidityProviderProps {
  pool: Pool;
  onClose: () => void;
  gemsBalance: number;
  userPieces: number;
}

export function LiquidityProvider({ pool, onClose, gemsBalance, userPieces }: LiquidityProviderProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('add');
  const [loading, setLoading] = useState(false);
  const [fetchingPosition, setFetchingPosition] = useState(true);
  
  // Position data
  const [position, setPosition] = useState<LPPosition | null>(null);
  const [totalLpTokens, setTotalLpTokens] = useState(0);
  
  // Input values
  const [piecesToAdd, setPiecesToAdd] = useState('');
  const [gemsToAdd, setGemsToAdd] = useState('');
  const [lpTokensToRemove, setLpTokensToRemove] = useState('');
  
  // Calculated values
  const [estimatedLpTokens, setEstimatedLpTokens] = useState(0);
  const [estimatedGemsRequired, setEstimatedGemsRequired] = useState(0);
  const [estimatedPiecesOut, setEstimatedPiecesOut] = useState(0);
  const [estimatedGemsOut, setEstimatedGemsOut] = useState(0);
  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'https://api.promorang.co').replace(/\/$/, '');
  const apiUrl = (path: string) => `${apiBaseUrl}${apiBaseUrl.endsWith('/api') ? '' : '/api'}${path}`;

  useEffect(() => {
    fetchPosition();
  }, [pool.id, session?.access_token]);

  useEffect(() => {
    if (piecesToAdd) {
      const pieces = parseFloat(piecesToAdd);
      const requiredGems = pieces * pool.last_price;
      setEstimatedGemsRequired(requiredGems);
      
      // Calculate LP tokens
      if (pool.pieces_reserve > 0 && pool.currency_reserve > 0) {
        const totalLp = totalLpTokens || Math.sqrt(pool.pieces_reserve * pool.currency_reserve);
        const piecesShare = pieces / pool.pieces_reserve;
        const currencyShare = requiredGems / pool.currency_reserve;
        const lpTokens = Math.min(piecesShare, currencyShare) * totalLp;
        setEstimatedLpTokens(lpTokens);
      }
    }
  }, [piecesToAdd, pool]);

  useEffect(() => {
    if (lpTokensToRemove && position) {
      const share = parseFloat(lpTokensToRemove) / position.lp_tokens;
      setEstimatedPiecesOut(position.pieces_deposited * share);
      setEstimatedGemsOut(position.currency_deposited * share);
    }
  }, [lpTokensToRemove, position]);

  const fetchPosition = async () => {
    if (!session?.access_token) {
      setFetchingPosition(false);
      return;
    }

    setFetchingPosition(true);
    try {
      const authHeaders = { 'Authorization': `Bearer ${session.access_token}` };
      const [positionRes, poolRes] = await Promise.all([
        fetch(apiUrl(`/pieces/pools/${pool.id}/lp-position`), {
          headers: authHeaders,
        }),
        fetch(apiUrl(`/pieces/pools/${pool.id}`), {
          headers: authHeaders,
        }),
      ]);

      if (positionRes.ok) {
        const posData = await positionRes.json();
        setPosition(posData.lp_tokens ? posData : null);
      }

      // Calculate total LP tokens from pool
      if (poolRes.ok) {
        const poolData = await poolRes.json();
        if (poolData.pool) {
          setTotalLpTokens(Math.sqrt(poolData.pool.pieces_reserve * poolData.pool.currency_reserve));
        }
      }
    } catch (error) {
      console.error('Failed to fetch position:', error);
    } finally {
      setFetchingPosition(false);
    }
  };

  const handleAddLiquidity = async () => {
    if (!piecesToAdd || !gemsToAdd) return;
    if (!session?.access_token) return;
    
    setLoading(true);
    try {
      const response = await fetch(apiUrl(`/pieces/pools/${pool.id}/add-liquidity`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          pieces_to_add: parseFloat(piecesToAdd),
          max_currency: parseFloat(gemsToAdd),
          slippage_tolerance: 0.01,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Liquidity Added!',
          description: `You added ${piecesToAdd} pieces and ${gemsToAdd} Gems. Received ${data.lp_tokens_received?.toFixed(2)} LP tokens.`,
        });
        fetchPosition();
        setPiecesToAdd('');
        setGemsToAdd('');
      } else {
        throw new Error(data.error || 'Failed to add liquidity');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!lpTokensToRemove || !position) return;
    if (!session?.access_token) return;
    
    setLoading(true);
    try {
      const response = await fetch(apiUrl(`/pieces/pools/${pool.id}/remove-liquidity`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          lp_tokens: parseFloat(lpTokensToRemove),
          min_pieces_out: estimatedPiecesOut * 0.95,
          min_currency_out: estimatedGemsOut * 0.95,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Liquidity Removed!',
          description: `You received ${data.pieces_out?.toFixed(2)} pieces and ${data.currency_out?.toFixed(2)} Gems.`,
        });
        fetchPosition();
        setLpTokensToRemove('');
      } else {
        throw new Error(data.error || 'Failed to remove liquidity');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate APR estimate
  const calculateAPR = () => {
    if (!pool.volume_24h || !pool.currency_reserve) return 0;
    
    const dailyVolume = pool.volume_24h;
    const lpFeeRate = pool.lp_fee_percent || 0.0025; // 0.25%
    const dailyFees = dailyVolume * lpFeeRate;
    const yearlyFees = dailyFees * 365;
    
    // Assuming LP provides proportional to pool size
    const poolValue = pool.currency_reserve * 2; // Both sides
    const apr = (yearlyFees / poolValue) * 100;
    
    return apr;
  };

  const apr = calculateAPR();

  if (fetchingPosition) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {pool.asset?.title || pool.asset?.name || 'Pool'} Liquidity
          </h3>
          <p className="text-sm text-muted-foreground">
            Earn {(pool.lp_fee_percent * 100).toFixed(2)}% of every trade
          </p>
        </div>
        <Badge variant="secondary" className="text-lg">
          <TrendingUp className="h-4 w-4 mr-1" />
          {apr.toFixed(0)}% APR
        </Badge>
      </div>

      {/* Current Position */}
      {position && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Your Position
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pool Share</span>
              <span className="font-semibold">{position.pool_share_percent?.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">LP Tokens</span>
              <span className="font-semibold">{position.lp_tokens?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Deposited</span>
              <span className="font-semibold">
                {position.pieces_deposited?.toFixed(2)} Pieces + {position.currency_deposited?.toFixed(2)} Gems
              </span>
            </div>
            {(position.fees_earned_pieces > 0 || position.fees_earned_currency > 0) && (
              <div className="flex justify-between text-green-600">
                <span className="text-sm">Fees Earned</span>
                <span className="font-semibold">
                  {position.fees_earned_pieces?.toFixed(4)} Pieces + {position.fees_earned_currency?.toFixed(4)} Gems
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Remove Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add">
            <Plus className="h-4 w-4 mr-1" />
            Add Liquidity
          </TabsTrigger>
          <TabsTrigger value="remove" disabled={!position}>
            <Minus className="h-4 w-4 mr-1" />
            Remove
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-4">
          {/* Add Liquidity Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Pieces to Deposit
              </Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={piecesToAdd}
                onChange={(e) => setPiecesToAdd(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Available: {userPieces.toFixed(2)} Pieces
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Gem className="h-4 w-4" />
                Gems to Deposit
              </Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={gemsToAdd}
                onChange={(e) => setGemsToAdd(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Available: {gemsBalance.toFixed(2)} Gems
                {estimatedGemsRequired > 0 && piecesToAdd && (
                  <span className="ml-2 text-violet-600">
                    (Suggested: {estimatedGemsRequired.toFixed(2)} Gems)
                  </span>
                )}
              </p>
            </div>

            {/* Estimates */}
            {piecesToAdd && gemsToAdd && (
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated LP Tokens</span>
                  <span className="font-semibold">{estimatedLpTokens.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pool Share After</span>
                  <span className="font-semibold">
                    {((estimatedLpTokens / (totalLpTokens + estimatedLpTokens)) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            )}

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-700">
                <strong>How it works:</strong> You deposit equal value of Pieces and Gems. 
                You earn {(pool.lp_fee_percent * 100).toFixed(2)}% of every trade proportional to your share.
              </AlertDescription>
            </Alert>

            <Button 
              className="w-full"
              disabled={!piecesToAdd || !gemsToAdd || loading}
              onClick={handleAddLiquidity}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              Add Liquidity
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="remove" className="space-y-4">
          {position ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>LP Tokens to Remove</Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={position.lp_tokens}
                  placeholder="0.00"
                  value={lpTokensToRemove}
                  onChange={(e) => setLpTokensToRemove(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Available: {position.lp_tokens.toFixed(2)} LP Tokens
                </p>
              </div>

              {lpTokensToRemove && (
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Pieces Out</span>
                    <span className="font-semibold">{estimatedPiecesOut.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Gems Out</span>
                    <span className="font-semibold">{estimatedGemsOut.toFixed(2)}</span>
                  </div>
                  {position.fees_earned_pieces > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>+ Fees Earned (Pieces)</span>
                      <span className="font-semibold">+{position.fees_earned_pieces.toFixed(4)}</span>
                    </div>
                  )}
                  {position.fees_earned_currency > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>+ Fees Earned (Gems)</span>
                      <span className="font-semibold">+{position.fees_earned_currency.toFixed(4)}</span>
                    </div>
                  )}
                </div>
              )}

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-sm text-yellow-700">
                  <strong>Important:</strong> You may receive different amounts than you deposited due to 
                  price changes and impermanent loss.
                </AlertDescription>
              </Alert>

              <Button 
                variant="outline" 
                className="w-full"
                disabled={!lpTokensToRemove || loading}
                onClick={handleRemoveLiquidity}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Minus className="h-4 w-4 mr-1" />
                )}
                Remove Liquidity
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-2" />
              <p>You don't have any liquidity in this pool yet.</p>
              <Button 
                variant="link" 
                onClick={() => setActiveTab('add')}
              >
                Add liquidity first
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pool Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-muted rounded-lg p-3">
          <div className="text-muted-foreground">Total Liquidity</div>
          <div className="font-semibold">{pool.pieces_reserve?.toFixed(0)} Pieces</div>
          <div className="font-semibold">{pool.currency_reserve?.toFixed(0)} Gems</div>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <div className="text-muted-foreground">24h Volume</div>
          <div className="font-semibold">{pool.volume_24h?.toFixed(0)} Gems</div>
          <div className="text-muted-foreground">
            <Percent className="h-3 w-3 inline" />
            {(pool.lp_fee_percent * 100).toFixed(2)}% fees to LPs
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiquidityProvider;

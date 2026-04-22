/**
 * Gems Balance Component
 * Shows user's Gems balance and quick actions
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Gem, Plus, ArrowDownLeft, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GemsBalanceData {
  balance: number;
  usd_value: number;
  exchange_rate: number;
}

export function GemsBalance() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<GemsBalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user]);

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/pieces/gems/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setBalance(data);
      }
    } catch (error) {
      console.error('Failed to fetch Gems balance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="h-12 w-12 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!balance) {
    return null;
  }

  return (
    <Card className="w-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gem className="h-5 w-5 text-violet-500" />
          Gems Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-violet-600">
            {balance.balance.toLocaleString()}
          </span>
          <span className="text-lg text-muted-foreground">Gems</span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          ≈ ${balance.usd_value.toFixed(2)} USD
          <span className="mx-2">•</span>
          <span className="text-xs">1 Gem = ${balance.exchange_rate.toFixed(2)}</span>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 bg-violet-600 hover:bg-violet-700"
            onClick={() => window.location.href = '/buy-gems'}
          >
            <Plus className="h-4 w-4 mr-1" />
            Buy Gems
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => window.location.href = '/portfolio'}
          >
            <Wallet className="h-4 w-4 mr-1" />
            Portfolio
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/withdraw'}
          >
            <ArrowDownLeft className="h-4 w-4 mr-1" />
            Withdraw
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default GemsBalance;

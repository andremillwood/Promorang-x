import { Coins, DollarSign, Key, Gift, Ticket, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCents } from '@/hooks/useValuePool';

interface RewardReceiptProps {
  points: number;
  moneyCents: number;
  tier: 'guest' | 'regular' | 'mover' | 'host';
  wasQualifiedForMoney: boolean;
  giveaway?: string;
  coupon?: string;
  keyEarned?: string;
  momentTitle: string;
}

export function RewardReceipt({
  points,
  moneyCents,
  tier,
  wasQualifiedForMoney,
  giveaway,
  coupon,
  keyEarned,
  momentTitle,
}: RewardReceiptProps) {
  const tierMultiplier = tier === 'mover' ? 2 : tier === 'regular' ? 1.5 : 1;
  
  return (
    <Card className="border-green-500/30 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-900">Your Mark is Captured!</h3>
          <p className="text-green-700">{momentTitle}</p>
        </div>

        <div className="space-y-3">
          {/* Points - Always shown */}
          <div className="flex items-center justify-between p-3 bg-background/70 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Coins className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Points Earned</p>
                <p className="text-sm text-muted-foreground">Always awarded</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-600">+{points}</span>
            </div>
          </div>

          {/* Money - Only if qualified */}
          {wasQualifiedForMoney ? (
            <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium">Money Earned</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">Qualified earnings</p>
                  {tierMultiplier > 1 && (
                    <Badge variant="outline" className="mt-1 text-xs bg-emerald-500/10">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {tier} {tierMultiplier}x
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-emerald-600">+{formatCents(moneyCents)}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg opacity-80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-background/70 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Money Locked</p>
                  <p className="text-sm text-muted-foreground">Become Regular to earn</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground">—</span>
              </div>
            </div>
          )}

          {/* Key - If earned */}
          {keyEarned && (
            <div className="flex items-center justify-between p-3 bg-purple-100/70 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Key className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Key Earned!</p>
                  <p className="text-sm text-purple-700">{keyEarned} Key</p>
                </div>
              </div>
              <Badge className="bg-purple-600">NEW</Badge>
            </div>
          )}

          {/* Giveaway - If won */}
          {giveaway && (
            <div className="flex items-center justify-between p-3 bg-amber-100/70 rounded-lg border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Giveaway Won!</p>
                  <p className="text-sm text-amber-700">{giveaway}</p>
                </div>
              </div>
              <Badge className="bg-amber-600">WINNER</Badge>
            </div>
          )}

          {/* Coupon - If issued */}
          {coupon && (
            <div className="flex items-center justify-between p-3 bg-pink-100/70 rounded-lg border border-pink-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="font-medium">Coupon Issued</p>
                  <p className="text-sm text-pink-700">Code: {coupon}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary footer */}
        <div className="mt-4 pt-4 border-t border-green-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-800 font-medium">Total Value Captured</span>
            <span className="text-green-900 font-bold">
              {points} pts {wasQualifiedForMoney && `+ ${formatCents(moneyCents)}`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

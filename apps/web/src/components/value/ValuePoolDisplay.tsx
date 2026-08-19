import { DollarSign, Users, TrendingUp, PieChart, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GuidanceDisclosure } from '@/components/guidance/GuidanceDisclosure';
import { Skeleton } from '@/components/ui/skeleton';
import { useValuePool, formatCents } from '@/hooks/useValuePool';

interface ValuePoolDisplayProps {
  momentId: string;
  isHost?: boolean;
}

export function ValuePoolDisplay({ momentId, isHost = false }: ValuePoolDisplayProps) {
  const { useMomentPool, useDistributionRules, distributePool } = useValuePool();
  
  const { data: pool, isLoading } = useMomentPool(momentId);
  const { data: rules } = useDistributionRules();

  if (isLoading) {
    return <Skeleton className="h-48" />;
  }

  if (!pool || !pool.is_funded) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <DollarSign className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            {isHost 
              ? "Fund this moment to reward your guests for their participation"
              : "This moment doesn't have a value pool yet"
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalPool = pool.total_pool_cents;
  const baseMarksAmount = Math.round(totalPool * (pool.base_marks_percentage / 100));
  const engagementAmount = Math.round(totalPool * (pool.engagement_percentage / 100));
  const qualityAmount = Math.round(totalPool * (pool.quality_bonus_percentage / 100));

  return (
    <Card className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Value Pool</CardTitle>
              <CardDescription>
                {pool.distribution_completed_at 
                  ? "Value has been distributed to stakeholders"
                  : "Available to be earned by participants"
                }
              </CardDescription>
            </div>
          </div>
          <Badge variant={pool.distribution_completed_at ? "secondary" : "default"}>
            {pool.distribution_completed_at ? "Distributed" : "Active"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Total Pool */}
        <div className="text-center">
          <div className="text-4xl font-bold text-amber-700">
            {formatCents(totalPool)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Total value to be shared
          </p>
        </div>

        {/* Distribution Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-background/60 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Attendance Marks</p>
                <p className="text-sm text-muted-foreground">
                  {pool.base_marks_percentage}% • Split among all who attend
                </p>
              </div>
            </div>
            <span className="font-bold">{formatCents(baseMarksAmount)}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-background/60 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Engagement</p>
                <p className="text-sm text-muted-foreground">
                  {pool.engagement_percentage}% • Reviews, photos, referrals
                </p>
              </div>
            </div>
            <span className="font-bold">{formatCents(engagementAmount)}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-background/60 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <PieChart className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium">Quality Bonus</p>
                <p className="text-sm text-muted-foreground">
                  {pool.quality_bonus_percentage}% • Featured testimonials
                </p>
              </div>
            </div>
            <span className="font-bold">{formatCents(qualityAmount)}</span>
          </div>
        </div>

        {/* Contribution Breakdown */}
        {(pool.host_contribution_cents > 0 || pool.venue_contribution_cents > 0 || pool.brand_sponsorship_cents > 0) && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">Funded by:</p>
            <div className="flex flex-wrap gap-2">
              {pool.host_contribution_cents > 0 && (
                <Badge variant="outline">
                  Host: {formatCents(pool.host_contribution_cents)}
                </Badge>
              )}
              {pool.venue_contribution_cents > 0 && (
                <Badge variant="outline">
                  Venue: {formatCents(pool.venue_contribution_cents)}
                </Badge>
              )}
              {pool.brand_sponsorship_cents > 0 && (
                <Badge variant="outline" className="bg-amber-100">
                  Brand Sponsor: {formatCents(pool.brand_sponsorship_cents)}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Host Actions */}
        {isHost && !pool.distribution_completed_at && (
          <div className="pt-4 border-t">
            <Button 
              className="w-full"
              onClick={() => distributePool.mutate(momentId)}
              disabled={distributePool.isPending}
            >
              {distributePool.isPending ? 'Distributing...' : 'Distribute Value to Stakeholders'}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              This will calculate and record earnings for all participants
            </p>
          </div>
        )}

        <GuidanceDisclosure
          id={`value-pool:${momentId}:distribution`}
          title="How value distribution works"
          summary="Value follows verified participation, engagement quality, and tier multipliers."
          className="mt-0"
        >
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Value is distributed based on verified participation (Marks), engagement quality,
              and tier multipliers. Tier multipliers: Guest 1.0x, Regular 1.5x, Mover 2.0x
            </p>
          </div>
        </GuidanceDisclosure>
      </CardContent>
    </Card>
  );
}

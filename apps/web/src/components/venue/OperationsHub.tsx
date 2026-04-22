import { useState } from 'react';
import { Clock, Users, AlertCircle, TrendingUp, MapPin, Building2, ArrowRight, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useStakeholderLeverage, VenueOperationsMetrics, VenueEcosystemConnection } from '@/hooks/useStakeholderLeverage';

interface OperationsHubProps {
  venueId: string;
}

export function OperationsHub({ venueId }: OperationsHubProps) {
  const [activeTab, setActiveTab] = useState('today');
  const { useVenueOperations, useVenueEcosystem } = useStakeholderLeverage();
  
  const today = new Date().toISOString().split('T')[0];
  const { data: operations, isLoading: opsLoading } = useVenueOperations(venueId, today);
  const { data: ecosystem, isLoading: ecoLoading } = useVenueEcosystem(venueId);

  if (opsLoading || ecoLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  const totalCheckIns = operations?.reduce((sum, op) => sum + op.check_ins_count, 0) || 0;
  const avgCapacity = operations?.length 
    ? operations.reduce((sum, op) => sum + (op.capacity_utilization_percent || 0), 0) / operations.length 
    : 0;
  const issuesToday = operations?.reduce((sum, op) => sum + op.issues_reported, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Venue Operations Hub
          </h2>
          <p className="text-muted-foreground">
            Real-time insights and optimization recommendations
          </p>
        </div>
        <Badge variant="outline">{today}</Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <VenueKpiCard
          title="Today's Check-ins"
          value={totalCheckIns}
          icon={<Users className="w-5 h-5" />}
          trend={totalCheckIns > 50 ? 'up' : 'neutral'}
        />
        <VenueKpiCard
          title="Capacity Utilization"
          value={`${Math.round(avgCapacity)}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={avgCapacity > 80 ? 'up' : avgCapacity < 50 ? 'down' : 'neutral'}
        />
        <VenueKpiCard
          title="Issues Reported"
          value={issuesToday}
          icon={<AlertCircle className="w-5 h-5" />}
          trend={issuesToday === 0 ? 'up' : 'down'}
          isNegative={issuesToday > 0}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today's Flow</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="ecosystem">Ecosystem</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {operations && <TodayFlowTab operations={operations} />}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {operations && <InsightsTab operations={operations} />}
        </TabsContent>

        <TabsContent value="ecosystem" className="space-y-4">
          {ecosystem && <EcosystemTab connections={ecosystem} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TodayFlowTab({ operations }: { operations: VenueOperationsMetrics[] }) {
  const maxCheckIns = Math.max(...operations.map(op => op.check_ins_count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hourly Check-in Flow</CardTitle>
        <CardDescription>
          Capacity and flow patterns throughout the day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {operations.map((op) => {
            const hour = op.hour_of_day;
            const isPeak = op.check_ins_count === maxCheckIns;
            
            return (
              <div key={hour} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-16">
                  {hour}:00
                </span>
                <div className="flex-1">
                  <div className="h-8 bg-secondary rounded-md overflow-hidden relative">
                    <div
                      className={cn(
                        "h-full transition-all",
                        isPeak ? "bg-primary" : "bg-primary/60",
                        op.queue_times_minutes && op.queue_times_minutes > 5 ? "bg-amber-500" : ""
                      )}
                      style={{ width: `${(op.check_ins_count / maxCheckIns) * 100}%` }}
                    />
                    {isPeak && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Badge variant="secondary" className="text-xs">Peak</Badge>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {op.check_ins_count}
                </span>
                {op.queue_times_minutes && op.queue_times_minutes > 5 && (
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function InsightsTab({ operations }: { operations: VenueOperationsMetrics[] }) {
  const avgDwell = operations.reduce((sum, op) => sum + (op.avg_dwell_time_minutes || 0), 0) / operations.length || 0;
  const avgQueue = operations.reduce((sum, op) => sum + (op.queue_times_minutes || 0), 0) / operations.length || 0;
  const issues = operations.flatMap(op => op.issue_types || []);
  const uniqueIssues = [...new Set(issues)];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Average Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Dwell Time</p>
            <p className="text-2xl font-bold">{Math.round(avgDwell)} min</p>
            <p className="text-xs text-muted-foreground">
              Time customers spend at venue
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Queue Time</p>
            <p className={cn(
              "text-2xl font-bold",
              avgQueue > 10 ? "text-rose-600" : avgQueue > 5 ? "text-amber-600" : "text-green-600"
            )}>
              {Math.round(avgQueue)} min
            </p>
            <p className="text-xs text-muted-foreground">
              Average wait before check-in
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Conversion</p>
            <p className="text-2xl font-bold">
              {Math.round(
                operations.reduce((sum, op) => sum + (op.conversion_to_next_action || 0), 0) / operations.length * 100
              )}%
            </p>
            <p className="text-xs text-muted-foreground">
              Complete the success action
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Operational Issues</CardTitle>
        </CardHeader>
        <CardContent>
          {uniqueIssues.length > 0 ? (
            <div className="space-y-2">
              {uniqueIssues.map((issue, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm capitalize">{issue.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No issues reported today—operations running smoothly!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EcosystemTab({ connections }: { connections: VenueEcosystemConnection[] }) {
  const partnerships = connections.filter(c => c.is_partnership_active);
  const recommendations = connections.filter(c => !c.is_partnership_active && c.recommendation_score && c.recommendation_score > 0.7);

  return (
    <div className="space-y-4">
      {partnerships.length > 0 && (
        <>
          <h3 className="font-medium">Active Partnerships</h3>
          {partnerships.map((conn) => (
            <EcosystemCard key={conn.id} connection={conn} isPartnership />
          ))}
        </>
      )}

      {recommendations.length > 0 && (
        <>
          <h3 className="font-medium mt-6">Recommended Partners</h3>
          <p className="text-sm text-muted-foreground">
            Venues with high customer overlap and complementary moments
          </p>
          {recommendations.slice(0, 5).map((conn) => (
            <EcosystemCard key={conn.id} connection={conn} />
          ))}
        </>
      )}
    </div>
  );
}

function EcosystemCard({ connection, isPartnership = false }: { connection: VenueEcosystemConnection; isPartnership?: boolean }) {
  return (
    <Card className={cn(isPartnership && "border-green-500/20")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isPartnership ? "bg-green-500/10" : "bg-primary/10"
            )}>
              {isPartnership ? <Link2 className="w-5 h-5 text-green-600" /> : <MapPin className="w-5 h-5 text-primary" />}
            </div>
            <div>
              <p className="font-medium">{connection.target_venue_name || 'Partner Venue'}</p>
              <p className="text-sm text-muted-foreground">
                {connection.target_venue_category || 'Venue'} • {connection.relationship_type}
              </p>
            </div>
          </div>
          <Badge variant={isPartnership ? "default" : "outline"}>
            {Math.round((connection.recommendation_score || 0) * 100)}% match
          </Badge>
        </div>

        <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="font-medium">{connection.shared_customers_count}</p>
            <p className="text-xs text-muted-foreground">Shared Customers</p>
          </div>
          <div>
            <p className="font-medium">{connection.customer_overlap_percent?.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Overlap</p>
          </div>
          <div>
            <p className="font-medium">
              {connection.avg_time_between_visits_hours 
                ? `${Math.round(connection.avg_time_between_visits_hours)}h` 
                : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">Avg. Between Visits</p>
          </div>
        </div>

        {connection.common_journey_pattern && (
          <div className="mt-2 text-sm">
            <span className="text-muted-foreground">Common journey: </span>
            <span className="font-medium">{connection.common_journey_pattern.replace(/_/g, ' ')}</span>
          </div>
        )}

        {!isPartnership && (
          <Button variant="outline" size="sm" className="w-full mt-3">
            Explore Partnership
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function VenueKpiCard({ 
  title, 
  value, 
  icon, 
  trend,
  isNegative = false 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  trend: 'up' | 'down' | 'neutral';
  isNegative?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={cn("p-2 rounded-full w-fit", isNegative ? "bg-rose-100" : "bg-primary/10")}>
          {icon}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

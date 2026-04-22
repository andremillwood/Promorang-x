import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Award, AlertTriangle, Target, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useStakeholderLeverage, CorporateMomentAnalytics, CustomerJourneyPrediction } from '@/hooks/useStakeholderLeverage';

interface IntelligenceDashboardProps {
  organizationId: string;
}

export function IntelligenceDashboard({ organizationId }: IntelligenceDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { useCorporateAnalytics, useCustomerPredictions } = useStakeholderLeverage();
  
  const { data: analytics, isLoading: analyticsLoading } = useCorporateAnalytics(organizationId, 'month');
  const { data: predictions, isLoading: predictionsLoading } = useCustomerPredictions(organizationId);

  if (analyticsLoading || predictionsLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  const latestAnalytics = analytics?.[0];
  const highRiskCustomers = predictions?.filter(p => p.churn_risk_category === 'high' || p.churn_risk_category === 'critical') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Moment Intelligence
          </h2>
          <p className="text-muted-foreground">
            AI-powered insights to optimize your moment performance
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Sparkles className="w-3 h-3" />
          AI-Powered
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {latestAnalytics && <OverviewTab analytics={latestAnalytics} highRiskCount={highRiskCustomers.length} />}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {latestAnalytics && <PerformanceTab analytics={latestAnalytics} />}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          {predictions && <PredictionsTab predictions={predictions} />}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {latestAnalytics && <InsightsTab analytics={latestAnalytics} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewTab({ analytics, highRiskCount }: { analytics: CorporateMomentAnalytics; highRiskCount: number }) {
  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="Total Participants"
          value={analytics.total_participants}
          change={`+${analytics.new_participants} new`}
          icon={<Users className="w-5 h-5" />}
          trend="up"
        />
        <KpiCard
          title="Sentiment Score"
          value={analytics.avg_sentiment_rating?.toFixed(1) || '0.0'}
          change={`${analytics.percentile_rank || 0}th percentile`}
          icon={<Award className="w-5 h-5" />}
          trend={analytics.avg_sentiment_rating && analytics.avg_sentiment_rating > 4 ? 'up' : 'neutral'}
        />
        <KpiCard
          title="Completion Rate"
          value={`${Math.round((analytics.proof_completion_rate || 0) * 100)}%`}
          change={`${Math.round((analytics.reward_claim_rate || 0) * 100)}% claim rewards`}
          icon={<Target className="w-5 h-5" />}
          trend={analytics.proof_completion_rate && analytics.proof_completion_rate > 0.8 ? 'up' : 'neutral'}
        />
        <KpiCard
          title="At-Risk Customers"
          value={highRiskCount}
          change="require attention"
          icon={<AlertTriangle className="w-5 h-5" />}
          trend={highRiskCount > 0 ? 'down' : 'up'}
          isNegative={highRiskCount > 0}
        />
      </div>

      {/* Benchmark */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Industry Benchmark</CardTitle>
          <CardDescription>
            How you compare to similar moments in your industry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all",
                    (analytics.industry_benchmark_index || 100) > 100 ? "bg-green-500" :
                    (analytics.industry_benchmark_index || 100) > 80 ? "bg-blue-500" :
                    "bg-amber-500"
                  )}
                  style={{ width: `${Math.min((analytics.industry_benchmark_index || 100), 150)}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{analytics.industry_benchmark_index || 100}</p>
              <p className="text-sm text-muted-foreground">Index (100 = avg)</p>
            </div>
          </div>
          <p className="mt-4 text-sm">
            {(analytics.industry_benchmark_index || 100) > 100 ? (
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Performing {Math.round((analytics.industry_benchmark_index || 100) - 100)}% above average
              </span>
            ) : (
              <span className="text-amber-600">
                Room to improve—see AI Insights for recommendations
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    </>
  );
}

function PerformanceTab({ analytics }: { analytics: CorporateMomentAnalytics }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Retention Cohorts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CohortRow label="30-Day Retention" value={analytics.cohort_30_day_retention} />
          <CohortRow label="60-Day Retention" value={analytics.cohort_60_day_retention} />
          <CohortRow label="90-Day Retention" value={analytics.cohort_90_day_retention} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sentiment Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = analytics.sentiment_distribution?.[star] || 0;
            const total = analytics.testimonial_count || 1;
            const pct = (count / total) * 100;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm w-12">{star} ★</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Testimonials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{analytics.testimonial_count}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.photo_testimonials}</p>
              <p className="text-xs text-muted-foreground">With Photos</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.video_testimonials}</p>
              <p className="text-xs text-muted-foreground">With Video</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {analytics.testimonial_count > 0 && (
              <>
                {Math.round((analytics.photo_testimonials + analytics.video_testimonials) / analytics.testimonial_count * 100)}%
                include rich media—great for marketing use
              </>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Value Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Estimated LTV</p>
            <p className="text-2xl font-bold">
              ${Math.round(analytics.cohort_ltv_estimate || 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Repeat Attendance</p>
            <p className="text-2xl font-bold">
              {Math.round((analytics.repeat_attendance_rate || 0) * 100)}%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PredictionsTab({ predictions }: { predictions: CustomerJourneyPrediction[] }) {
  const highRisk = predictions.filter(p => p.churn_risk_category === 'high' || p.churn_risk_category === 'critical');
  const opportunities = predictions.filter(p => (p.next_moment_probability || 0) > 0.7);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Churn Risk Alerts</h3>
        <Badge variant="destructive">{highRisk.length} at risk</Badge>
      </div>

      {highRisk.slice(0, 5).map((prediction) => (
        <Card key={prediction.id} className="border-rose-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Customer at Risk</p>
                <p className="text-sm text-muted-foreground">
                  Risk Score: {Math.round((prediction.churn_risk_score || 0) * 100)}%
                </p>
              </div>
              <div className="text-right">
                <Badge variant="destructive">{prediction.churn_risk_category}</Badge>
              </div>
            </div>
            {prediction.recommended_actions && prediction.recommended_actions.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-medium">Recommended Actions:</p>
                <ul className="mt-1 space-y-1">
                  {prediction.recommended_actions.slice(0, 2).map((action, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      {action.action} ({action.urgency})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {opportunities.length > 0 && (
        <>
          <div className="flex items-center justify-between mt-6">
            <h3 className="font-medium">Ready to Re-Engage</h3>
            <Badge className="bg-green-500/10 text-green-600">{opportunities.length} opportunities</Badge>
          </div>
          {opportunities.slice(0, 3).map((prediction) => (
            <Card key={prediction.id} className="border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">High Engagement Likely</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round((prediction.next_moment_probability || 0) * 100)}% chance of next moment
                    </p>
                  </div>
                  <div className="text-right">
                    {prediction.next_moment_category && (
                      <Badge variant="outline">{prediction.next_moment_category}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}

function InsightsTab({ analytics }: { analytics: CorporateMomentAnalytics }) {
  return (
    <div className="space-y-4">
      {analytics.ai_generated_insights?.map((insight, idx) => (
        <Card key={idx}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm leading-relaxed">{insight}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      {analytics.recommended_actions && analytics.recommended_actions.length > 0 && (
        <>
          <h3 className="font-medium mt-6">Recommended Actions</h3>
          {analytics.recommended_actions.map((action, idx) => (
            <Card key={idx} className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-primary" />
                  <span className="font-medium">{action}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}

function KpiCard({ 
  title, 
  value, 
  change, 
  icon, 
  trend,
  isNegative = false 
}: { 
  title: string; 
  value: string | number; 
  change: string; 
  icon: React.ReactNode; 
  trend: 'up' | 'down' | 'neutral';
  isNegative?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={cn("p-2 rounded-full", isNegative ? "bg-rose-100" : "bg-primary/10")}>
            {icon}
          </div>
          {trend !== 'neutral' && (
            <div className={cn(
              "flex items-center text-xs",
              trend === 'up' ? "text-green-600" : "text-rose-600"
            )}>
              {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
        <p className={cn("text-xs mt-1", isNegative ? "text-rose-600" : "text-muted-foreground")}>
          {change}
        </p>
      </CardContent>
    </Card>
  );
}

function CohortRow({ label, value }: { label: string; value: number | null }) {
  const percentage = Math.round((value || 0) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all",
            percentage > 50 ? "bg-green-500" : percentage > 30 ? "bg-blue-500" : "bg-amber-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

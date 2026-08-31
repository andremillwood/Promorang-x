import { useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  Hourglass, 
  BarChart3,
  PieChart,
  Calendar,
  ChevronRight,
  Settings,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  useCreatorEconomicProfile,
  useCreatorEarningsSummary,
  useEarningsBySource,
  useMonthlyEarnings,
  useRecentEarnings
} from "@/hooks/useCreatorEconomics";
import { formatCurrency } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const TIER_META = {
  starter: { color: "bg-slate-500", share: "10%", nameKey: "earnTab.tier.starter" as const },
  rising: { color: "bg-blue-500", share: "15%", nameKey: "earnTab.tier.rising" as const },
  signature: { color: "bg-purple-500", share: "25%", nameKey: "earnTab.tier.signature" as const },
  icon: { color: "bg-amber-500", share: "40%", nameKey: "earnTab.tier.icon" as const },
};

const SOURCE_KEYS: Record<string, TranslationKey> = {
  mission_join: "earnTab.src.join",
  mission_verification: "earnTab.src.verify",
  memory_issuance: "earnTab.src.memory",
  sponsored_boost: "earnTab.src.boost",
  catalyst_conversion: "earnTab.src.catalyst",
};

export function CreatorEarningsTab() {
  const { t, formatDate, formatNumber } = useI18n();
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: profile, isLoading: profileLoading } = useCreatorEconomicProfile();
  const { data: summary, isLoading: summaryLoading } = useCreatorEarningsSummary();
  const { data: bySource, isLoading: sourceLoading } = useEarningsBySource();
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyEarnings(6);
  const { data: recentEarnings, isLoading: recentLoading } = useRecentEarnings(10);

  const isLoading = profileLoading || summaryLoading || sourceLoading || monthlyLoading || recentLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  const tierInfo = profile && profile.tier in TIER_META
    ? TIER_META[profile.tier as keyof typeof TIER_META]
    : TIER_META.starter;

  const sourceLabel = (sourceType: string) =>
    SOURCE_KEYS[sourceType] ? t(SOURCE_KEYS[sourceType]) : sourceType;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">
            {t("earnTab.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("earnTab.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant="secondary" 
            className={`${tierInfo.color} text-white px-3 py-1.5`}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            {t("earnTab.tierShare", { name: t(tierInfo.nameKey), share: tierInfo.share })}
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            {t("earnTab.settings")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-emerald-600">{t("earnTab.available")}</CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-700">
              {formatCurrency(summary?.approvedAmount || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-emerald-600/80">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              {t("earnTab.approvedReady")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("earnTab.pending")}</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {formatCurrency(summary?.pendingAmount || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <Hourglass className="w-3.5 h-3.5 mr-1.5" />
              {t("earnTab.processing")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("earnTab.lifetime")}</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {formatCurrency(summary?.settledAmount || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <Wallet className="w-3.5 h-3.5 mr-1.5" />
              {t("earnTab.settled")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("earnTab.ytd")}</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {formatCurrency(summary?.ytdEarnings || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              {t("earnTab.ytdHint", { year: new Date().getFullYear() })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview">{t("earnTab.overview")}</TabsTrigger>
          <TabsTrigger value="history">{t("earnTab.history")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("earnTab.analytics")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                {t("earnTab.trend")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData && monthlyData.length > 0 ? (
                <div className="space-y-3">
                  {monthlyData.map((month) => {
                    const maxAmount = Math.max(...monthlyData.map(m => m.creator_share_amount), 1);
                    const percentage = (month.creator_share_amount / maxAmount) * 100;
                    const monthLabel = formatDate(`${month.month}-01`, {
                      month: "short",
                      year: "2-digit"
                    });
                    
                    return (
                      <div key={month.month} className="flex items-center gap-4">
                        <span className="w-12 text-sm text-muted-foreground">{monthLabel}</span>
                        <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-20 text-right font-medium">
                          {formatCurrency(month.creator_share_amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t("earnTab.noTrend")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                {t("earnTab.recent")}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("history")}>
                {t("earnTab.viewAll")}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentEarnings && recentEarnings.length > 0 ? (
                <div className="space-y-3">
                  {recentEarnings.slice(0, 5).map((earning) => (
                    <div 
                      key={earning.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          earning.status === "settled" ? "bg-emerald-500" :
                          earning.status === "approved" ? "bg-blue-500" : "bg-amber-500"
                        }`} />
                        <div>
                          <p className="font-medium text-sm">
                            {sourceLabel(earning.source_type)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(earning.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          +{formatCurrency(earning.creator_share_amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("earnTab.ofGross", {
                            pct: earning.creator_share_percent,
                            gross: formatCurrency(earning.gross_amount),
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t("earnTab.noRecent")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("earnTab.allTx")}</CardTitle>
              <CardDescription>{t("earnTab.allTxDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {recentEarnings && recentEarnings.length > 0 ? (
                <div className="space-y-2">
                  {recentEarnings.map((earning) => (
                    <div 
                      key={earning.id} 
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Badge variant={
                          earning.status === "settled" ? "default" :
                          earning.status === "approved" ? "secondary" : "outline"
                        }>
                          {earning.status}
                        </Badge>
                        <div>
                          <p className="font-medium">
                            {sourceLabel(earning.source_type)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t(earning.unit_count !== 1 ? "earnTab.units" : "earnTab.unitOne", {
                              count: earning.unit_count,
                              amount: formatCurrency(earning.unit_amount),
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          +{formatCurrency(earning.creator_share_amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(earning.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">{t("earnTab.noHistory")}</p>
                  <p>{t("earnTab.noHistoryHint")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                {t("earnTab.bySource")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bySource && bySource.length > 0 ? (
                <div className="space-y-4">
                  {bySource.map((source, index) => {
                    const total = bySource.reduce((sum, s) => sum + s.creator_share_amount, 0);
                    const percentage = total > 0 ? (source.creator_share_amount / total) * 100 : 0;
                    const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];
                    
                    return (
                      <div key={source.source_type} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">
                            {sourceLabel(source.source_type)}
                          </span>
                          <span className="text-muted-foreground">
                            {formatCurrency(source.creator_share_amount)} ({formatNumber(percentage, { maximumFractionDigits: 1 })}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${colors[index % colors.length]} rounded-full transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t(source.count !== 1 ? "earnTab.txs" : "earnTab.txOne", { count: source.count })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t("earnTab.noSource")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>{t("earnTab.unlocks")}</CardDescription>
                <CardTitle className="text-3xl font-bold">
                  {formatNumber(profile?.lifetime_verified_unlocks || 0)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>{t("earnTab.memories")}</CardDescription>
                <CardTitle className="text-3xl font-bold">
                  {formatNumber(profile?.lifetime_memories_issued || 0)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>{t("earnTab.catalyst")}</CardDescription>
                <CardTitle className="text-3xl font-bold">
                  {formatNumber(profile?.lifetime_catalyst_conversions || 0)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React, { useState } from "react";
import { 
  Users, 
  UserCheck, 
  Zap, 
  Gem, 
  Share2, 
  Copy, 
  CheckCircle2, 
  TrendingUp, 
  Award,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nContext";

export default function ActivatedReferralsDashboard() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/auth?ref=connector_882`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activatedTree = [
    {
      id: "u-1",
      name: "Tariq Miller",
      username: "tariq_kgn",
      joinedScene: "Kingston After Dark",
      qualifyingActions: 4,
      isActivated: true,
      activationScore: 100,
      gemsContributed: 15.00
    },
    {
      id: "u-2",
      name: "Shanice Thompson",
      username: "sthompson_food",
      joinedScene: "Kingston Foodies",
      qualifyingActions: 2,
      isActivated: true,
      activationScore: 50,
      gemsContributed: 7.50
    },
    {
      id: "u-3",
      name: "Dave Bennett",
      username: "dave_b",
      joinedScene: "Pending First Action",
      qualifyingActions: 0,
      isActivated: false,
      activationScore: 0,
      gemsContributed: 0.00
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8 pb-16">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-mono text-xs uppercase">
                {t("actRef.badge")}
              </Badge>
              <span className="text-xs text-slate-400 font-mono">{t("actRef.engine")}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white">{t("actRef.title")}</h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              {t("actRef.lede")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={handleCopy}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold gap-2"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t("actRef.copied") : t("actRef.copy")}
            </Button>
          </div>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">{t("actRef.activatedUsers")}</span>
                <UserCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white mt-2">2 / 3</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-1">{t("actRef.activationRate", { pct: 66 })}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">{t("actRef.score")}</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-400 mt-2">{t("actRef.scorePts", { count: 150 })}</div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">{t("actRef.scoreHint", { count: 25 })}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">{t("actRef.gemsEarned")}</span>
                <Gem className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white mt-2">$22.50</div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">{t("actRef.ledger")}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">{t("actRef.moat")}</span>
                <Award className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-white mt-2">{t("actRef.tier", { n: 2 })}</div>
              <div className="text-[10px] text-purple-400 font-mono mt-1">{t("actRef.connector")}</div>
            </CardContent>
          </Card>
        </div>

        {/* ACTIVATED REFERRALS TABLE */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white">{t("actRef.network")}</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              {t("actRef.networkDesc")}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-slate-800">
              {activatedTree.map((user) => (
                <div key={user.id} className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base">{user.name}</h4>
                      <span className="text-xs text-slate-500 font-mono">@{user.username}</span>
                      {user.isActivated ? (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-[10px]">
                          {t("actRef.activated")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-700 text-slate-500 text-[10px]">
                          {t("actRef.pending")}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{t("actRef.scene", { name: user.joinedScene })}</span>
                      <span>•</span>
                      <span>{t("actRef.actions", { count: user.qualifyingActions })}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-400 font-mono">
                      {t("actRef.gems", { amount: user.gemsContributed.toFixed(2) })}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {t("actRef.userScore", { count: user.activationScore })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { 
  Users, 
  Zap, 
  Gem, 
  Award, 
  Plus, 
  Share2, 
  QrCode, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles,
  BarChart3,
  Copy,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useI18n } from "@/i18n/I18nContext";
import { StewardScoutQueue } from "@/components/steward/StewardScoutQueue";

export default function StewardDashboard() {
  const { t, formatNumber } = useI18n();
  const [showCreateActionModal, setShowCreateActionModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form state for creating a new Action
  const [actionTitle, setActionTitle] = useState("");
  const [actionType, setActionType] = useState("visit_venue");
  const [gemReward, setGemReward] = useState("10.00");
  const [pointsReward, setPointsReward] = useState("250");
  const [ticketsReward, setTicketsReward] = useState("5");

  const [actions, setActions] = useState([
    {
      id: "act-1",
      title: "Check in at Skyline Dub Club",
      type: "visit_venue",
      verification: "QR Scan & Geo",
      gems: 10.0,
      points: 250,
      tickets: 5,
      completions: 64,
      status: "Active"
    },
    {
      id: "act-2",
      title: "Share your Kingston Street Party Moment",
      type: "create_content",
      verification: "Social Link",
      gems: 25.0,
      points: 500,
      tickets: 10,
      completions: 31,
      status: "Active"
    }
  ]);

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTitle) return;

    const newAct = {
      id: `act-${Date.now()}`,
      title: actionTitle,
      type: actionType,
      verification: "QR Scan",
      gems: parseFloat(gemReward) || 0,
      points: parseInt(pointsReward) || 0,
      tickets: parseInt(ticketsReward) || 0,
      completions: 0,
      status: "Active"
    };

    setActions([newAct, ...actions]);
    setShowCreateActionModal(false);
    setActionTitle("");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/scene/kingston-after-dark?steward_ref=steward_123`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* DASHBOARD HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-mono text-xs uppercase">
                {t("stewardDashboard.controlPlane")}
              </Badge>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Kingston After Dark
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white">{t("stewardDashboard.title")}</h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              {t("stewardDashboard.subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button 
              onClick={() => setShowQRModal(true)}
              variant="outline"
              className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 gap-2"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              {t("stewardDashboard.recruitmentKit")}
            </Button>
            <Button 
              onClick={() => setShowCreateActionModal(true)}
              className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-slate-950 font-bold gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("stewardDashboard.createAction")}
            </Button>
          </div>
        </div>

        <StewardScoutQueue hubId="kingston" />

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">{t("stewardDashboard.activatedMembers")}</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white mt-2">1,420</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
                <TrendingUp className="w-3 h-3" />
                {t("stewardDashboard.growthWeek")}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">{t("stewardDashboard.actionsCompleted")}</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-white mt-2">6,840</div>
              <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-1 font-mono">
                <Sparkles className="w-3 h-3" />
                {t("stewardDashboard.verifiedCompletions")}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">{t("stewardDashboard.gemShare")}</span>
                <Gem className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white mt-2">$340.00</div>
              <div className="text-[10px] text-slate-500 font-mono">{t("stewardDashboard.gemBalanceDesc")}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">{t("stewardDashboard.powerRank")}</span>
                <Award className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-white mt-2">#3 Kingston</div>
              <div className="text-[10px] text-purple-400 font-mono">{t("stewardDashboard.powerRankDesc")}</div>
            </CardContent>
          </Card>
        </div>

        {/* ACTIVE ACTIONS & MANAGEMENT */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-bold text-white">{t("stewardDashboard.actionsTitle", { count: actions.length.toString() })}</CardTitle>
              <CardDescription className="text-xs text-slate-400">{t("stewardDashboard.actionsDesc")}</CardDescription>
            </div>
            <Button 
              size="sm"
              onClick={() => setShowCreateActionModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("stewardDashboard.addAction")}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-800">
              {actions.map((act) => (
                <div key={act.id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-950/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base">{act.title}</h4>
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                        {act.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                      <span className="text-emerald-400 font-bold">${act.gems.toFixed(2)} Gems</span>
                      <span className="text-amber-400">+{act.points} Points</span>
                      <span className="text-purple-400">{act.tickets} PromoShare</span>
                      <span className="text-slate-500">Verification: {act.verification}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-black text-white">{act.completions}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{t("stewardDashboard.completions")}</div>
                    </div>
                    <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                      {t("stewardDashboard.edit")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CREATE ACTION MODAL */}
      <Dialog open={showCreateActionModal} onOpenChange={setShowCreateActionModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{t("stewardDashboard.modalCreateTitle")}</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              {t("stewardDashboard.modalCreateDesc")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAction} className="space-y-4 my-2">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">{t("stewardDashboard.labelActionTitle")}</label>
              <input 
                type="text" 
                value={actionTitle} 
                onChange={(e) => setActionTitle(e.target.value)}
                placeholder={t("stewardDashboard.placeholderActionTitle")}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">{t("stewardDashboard.labelActionType")}</label>
                <select 
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="visit_venue">{t("stewardDashboard.typeVisitVenue")}</option>
                  <option value="attend_event">{t("stewardDashboard.typeAttendEvent")}</option>
                  <option value="create_content">{t("stewardDashboard.typeCreateContent")}</option>
                  <option value="discover_location">{t("stewardDashboard.typeDiscoverLocation")}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">{t("stewardDashboard.labelGemReward")}</label>
                <input 
                  type="number" 
                  step="0.50"
                  value={gemReward} 
                  onChange={(e) => setGemReward(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">{t("stewardDashboard.labelPoints")}</label>
                <input 
                  type="number" 
                  value={pointsReward} 
                  onChange={(e) => setPointsReward(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">{t("stewardDashboard.labelEntries")}</label>
                <input 
                  type="number" 
                  value={ticketsReward} 
                  onChange={(e) => setTicketsReward(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 mt-2">
              {t("stewardDashboard.publishAction")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* RECRUITMENT KIT MODAL */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{t("stewardDashboard.kitTitle")}</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              {t("stewardDashboard.kitDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4 my-2 flex flex-col items-center">
            <div className="p-4 bg-white rounded-xl shadow-lg">
              <div className="w-36 h-36 bg-slate-900 rounded-lg flex items-center justify-center text-white font-mono text-xs text-center p-2">
                [Steward QR Code]
              </div>
            </div>
            <p className="text-xs font-mono text-amber-400">
              promorang.com/scene/kingston-after-dark?steward_ref=steward_123
            </p>
          </div>

          <Button 
            onClick={handleCopyLink}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold gap-2"
          >
            {copiedLink ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedLink ? t("stewardDashboard.copiedLink") : t("stewardDashboard.copyLink")}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState } from "react";
import { 
  Store, 
  QrCode, 
  Plus, 
  Zap, 
  Gem, 
  Award, 
  Receipt, 
  Share2, 
  CheckCircle2, 
  Copy, 
  Printer,
  Sparkles,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const VERIFY_KEYS: Record<string, TranslationKey> = {
  "QR Scan & Receipt": "actStudio.verifyQrReceipt",
  "Social Link": "actStudio.verifySocial",
  "QR Scan": "actStudio.verifyQr",
  "Code Entry": "actStudio.verifyCode",
};

export default function MerchantActionStudio() {
  const { t } = useI18n();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeQRAction, setActiveQRAction] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [type, setType] = useState("buy_product");
  const [verification, setVerification] = useState("qr_scan");
  const [gemsReward, setGemsReward] = useState("5.00");
  const [pointsReward, setPointsReward] = useState("150");
  const [ticketsReward, setTicketsReward] = useState("3");

  const [merchantActions, setMerchantActions] = useState([
    {
      id: "m-act-1",
      title: "Buy Jerk Chicken Special & Scan Receipt",
      type: "buy_product",
      verification: "QR Scan & Receipt",
      gems: 5.0,
      points: 150,
      tickets: 3,
      completions: 128,
      status: "Active"
    },
    {
      id: "m-act-2",
      title: "Leave a Google / Promorang Store Review",
      type: "review_business",
      verification: "Social Link",
      gems: 10.0,
      points: 300,
      tickets: 5,
      completions: 42,
      status: "Active"
    }
  ]);

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newAct = {
      id: `m-act-${Date.now()}`,
      title,
      type,
      verification: verification === "qr_scan" ? "QR Scan" : "Code Entry",
      gems: parseFloat(gemsReward) || 0,
      points: parseInt(pointsReward) || 0,
      tickets: parseInt(ticketsReward) || 0,
      completions: 0,
      status: "Active"
    };

    setMerchantActions([newAct, ...merchantActions]);
    setShowCreateModal(false);
    setTitle("");
  };

  const openQRModal = (action: any) => {
    setActiveQRAction(action);
    setShowQRModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-mono text-xs uppercase">
                {t("actStudio.badge")}
              </Badge>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-amber-400" />
                Sweetwood Jerk Joint — Kingston
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white">{t("actStudio.title")}</h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              {t("actStudio.lede")}
            </p>
          </div>

          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-slate-950 font-bold gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("actStudio.create")}
          </Button>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <span className="text-xs font-mono text-slate-400">{t("actStudio.visits")}</span>
              <div className="text-3xl font-black text-white mt-2">1,840</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-1">{t("actStudio.visitsSub")}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <span className="text-xs font-mono text-slate-400">{t("actStudio.gemsDist")}</span>
              <div className="text-3xl font-black text-emerald-400 mt-2">$920.00</div>
              <div className="text-[10px] text-slate-500 font-mono">{t("actStudio.gemsNote")}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <span className="text-xs font-mono text-slate-400">{t("actStudio.repeat")}</span>
              <div className="text-3xl font-black text-amber-400 mt-2">38.4%</div>
              <div className="text-[10px] text-amber-400 font-mono">{t("actStudio.repeatSub")}</div>
            </CardContent>
          </Card>
        </div>

        {/* ACTIONS TABLE */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-white">{t("actStudio.storeActions", { count: merchantActions.length })}</CardTitle>
              <CardDescription className="text-xs text-slate-400">{t("actStudio.storeActionsDesc")}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-800">
              {merchantActions.map((act) => (
                <div key={act.id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base">{act.title}</h4>
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                        {act.status === "Active" ? t("actStudio.statusActive") : act.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                      <span className="text-emerald-400 font-bold">{t("actStudio.gems", { amount: act.gems.toFixed(2) })}</span>
                      <span className="text-amber-400">{t("actStudio.points", { count: act.points })}</span>
                      <span className="text-purple-400">{t("actStudio.promoShare", { count: act.tickets })}</span>
                      <span className="text-slate-500">{t("actStudio.verification", { method: VERIFY_KEYS[act.verification] ? t(VERIFY_KEYS[act.verification]) : act.verification })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right mr-2">
                      <div className="text-sm font-black text-white">{act.completions}</div>
                      <div className="text-[10px] text-slate-500 font-mono font-normal">{t("actStudio.scans")}</div>
                    </div>
                    <Button 
                      onClick={() => openQRModal(act)}
                      variant="secondary"
                      className="bg-slate-800 hover:bg-slate-700 text-white gap-2 border border-slate-700"
                    >
                      <QrCode className="w-4 h-4 text-amber-400" />
                      {t("actStudio.getQr")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CREATE MODAL */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{t("actStudio.createTitle")}</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              {t("actStudio.createDesc")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAction} className="space-y-4 my-2">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">{t("actStudio.actionTitle")}</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("actStudio.titlePlaceholder")}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">{t("actStudio.actionType")}</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="buy_product">{t("actStudio.typeBuy")}</option>
                  <option value="visit_venue">{t("actStudio.typeVisit")}</option>
                  <option value="review_business">{t("actStudio.typeReview")}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">{t("actStudio.gemReward")}</label>
                <input 
                  type="number" 
                  step="0.50"
                  value={gemsReward} 
                  onChange={(e) => setGemsReward(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 mt-2">
              {t("actStudio.launch")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* CASHIER QR PRINT MODAL */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{t("actStudio.qrTitle")}</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              {t("actStudio.qrDesc")}
            </DialogDescription>
          </DialogHeader>

          {activeQRAction && (
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4 my-2 flex flex-col items-center">
              <h4 className="font-bold text-white text-sm">{activeQRAction.title}</h4>
              <div className="p-4 bg-white rounded-xl shadow-lg">
                <div className="w-40 h-40 bg-slate-900 rounded-lg flex items-center justify-center text-white font-mono text-xs text-center p-2">
                  {t("actStudio.qrPlaceholder", { id: activeQRAction.id })}
                </div>
              </div>
              <p className="text-xs font-mono text-emerald-400">
                {t("actStudio.rewardLine", { gems: activeQRAction.gems.toFixed(2), points: activeQRAction.points })}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={() => window.print()}
              variant="outline"
              className="w-full border-slate-700 bg-slate-800 text-white gap-2"
            >
              <Printer className="w-4 h-4" />
              {t("actStudio.print")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

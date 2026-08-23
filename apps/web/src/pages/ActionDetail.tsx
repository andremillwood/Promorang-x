import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Zap, 
  Gem, 
  Award, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2, 
  QrCode, 
  ArrowLeft,
  Share2,
  Lock,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nContext";

export default function ActionDetail() {
  const { t } = useI18n();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const action = {
    id: "act-1",
    slug: slug || "dub-club-checkin",
    title: "Check in at Skyline Dub Club",
    description: "Visit Skyline Dub Club during Sunday night sessions, scan the official venue QR code or check in via location verification to earn Gems, PromoPoints, and PromoShare lottery entries.",
    scene_title: "Kingston After Dark",
    scene_slug: "kingston-after-dark",
    points_reward: 250,
    gems_reward_amount: 10.0,
    promoshare_tickets: 5,
    required_key: "Nightlife Key",
    verification_type: "QR Scan & Geo",
    capacity: 100,
    completion_count: 64
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsCompleted(true);
      setVerificationResult({
        success: true,
        points_awarded: action.points_reward,
        gems_awarded: action.gems_reward_amount,
        promoshare_tickets: action.promoshare_tickets,
        activation_score_gained: 25
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 pt-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* BACK LINK */}
        <Link 
          to={`/scene/${action.scene_slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-amber-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("actionDetail.backToScene", { scene: action.scene_title })}
        </Link>

        {/* MAIN CARD */}
        <Card className="bg-slate-900 border-slate-800 shadow-2xl">
          <CardHeader className="p-6 md:p-8 border-b border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                {action.verification_type}
              </Badge>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 font-mono text-xs">
                {t("actionDetail.requiresKey", { key: action.required_key })}
              </Badge>
            </div>
            
            <CardTitle className="text-2xl md:text-4xl font-black text-white">{action.title}</CardTitle>
            <CardDescription className="text-slate-300 text-sm md:text-base mt-2">
              {action.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 md:p-8 space-y-8">
            {/* REWARD BREAKDOWN */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <div className="flex items-center justify-center text-emerald-400 font-bold mb-1">
                  <Gem className="w-5 h-5 mr-1" />
                  Gems
                </div>
                <div className="text-2xl font-black text-white">${action.gems_reward_amount.toFixed(2)}</div>
                <div className="text-[10px] text-slate-500 font-mono">1 Gem = $1 USD</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <div className="flex items-center justify-center text-amber-400 font-bold mb-1">
                  <Zap className="w-5 h-5 mr-1" />
                  PromoPoints
                </div>
                <div className="text-2xl font-black text-white">+{action.points_reward}</div>
                <div className="text-[10px] text-slate-500 font-mono">Participation</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <div className="flex items-center justify-center text-purple-400 font-bold mb-1">
                  <Award className="w-5 h-5 mr-1" />
                  PromoShare
                </div>
                <div className="text-2xl font-black text-white">{action.promoshare_tickets}</div>
                <div className="text-[10px] text-slate-500 font-mono">Draw Tickets</div>
              </div>
            </div>

            {/* VERIFICATION & COMPLETION STATUS */}
            {!isCompleted ? (
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-400 border border-amber-500/20">
                  <QrCode className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t("actionDetail.verifyAction")}</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    {t("actionDetail.verifyInstructions")}
                  </p>
                </div>

                <Button 
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full max-w-sm bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-slate-950 font-bold text-base py-6 shadow-lg shadow-amber-500/10"
                >
                  {isVerifying ? t("actionDetail.verifying") : t("actionDetail.verifyButton")}
                </Button>
              </div>
            ) : (
              <div className="bg-emerald-950/40 p-6 rounded-2xl border border-emerald-500/30 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-emerald-300">{t("actionDetail.verifiedTitle")}</h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
                    {t("actionDetail.verifiedDescription", {
                      gems: verificationResult?.gems_awarded?.toFixed(2) || "0.00",
                      points: (verificationResult?.points_awarded || 0).toString(),
                    })}
                  </p>
                </div>

                <div className="flex justify-center gap-4 pt-2">
                  <Button 
                    onClick={() => navigate(`/scene/${action.scene_slug}`)}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold"
                  >
                    {t("actionDetail.returnToScene")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

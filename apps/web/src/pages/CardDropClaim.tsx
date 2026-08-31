import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Gift,
  Sparkles,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PromoCardService } from "@/lib/promocard";
import SEO from "@/components/SEO";
import { useI18n } from "@/i18n/I18nContext";

export default function CardDropClaim() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const amount = Number(searchParams.get("amount")) || 15;
  const money = `$${amount}.00`;
  const sender = searchParams.get("from") || t("cardDrop.member");
  const code = searchParams.get("code") || "gift_welcome";

  const [claimed, setClaimed] = useState(false);

  const handleClaim = () => {
    PromoCardService.rechargeCard("user_current", "social_share", amount);
    setClaimed(true);
    toast({
      title: t("cardDrop.toastTitle", { amount: money }),
      description: t("cardDrop.toastCopy"),
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <SEO
        title={t("cardDrop.seoTitle", { amount: money })}
        description={t("cardDrop.seoCopy", { sender, amount: money })}
      />

      {/* Atmospheric Background Lights */}
      <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg z-10 space-y-6 text-center">
        {/* Gift Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Gift className="h-3.5 w-3.5" />
          <span>{t("cardDrop.badge")}</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            <span className="text-amber-400">{sender}</span> {t("cardDrop.sentYou")}
          </h1>
          <p className="text-5xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
            ${amount}.00 USD
          </p>
          <p className="text-xs text-zinc-400">{t("cardDrop.preloaded")}</p>
        </div>

        {/* Interactive 3D Card Visual */}
        <div className="relative mx-auto rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 sm:p-8 text-left border border-amber-500/40 shadow-2xl shadow-amber-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/40">
                <CreditCard className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                {t("cardDrop.card")}
              </span>
            </div>
            <Badge className="bg-amber-500 text-black font-bold text-[10px]">
              {claimed ? t("cardDrop.activated") : t("cardDrop.pending")}
            </Badge>
          </div>

          <div className="my-6">
            <p className="text-[11px] uppercase tracking-widest text-zinc-500">{t("cardDrop.spendable")}</p>
            <p className="text-3xl font-extrabold text-white">${amount}.00</p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("cardDrop.zeroCash")}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-zinc-400">
            <span>{t("cardDrop.giftCode")} <strong className="font-mono text-zinc-200">{code}</strong></span>
            <span>{t("cardDrop.accepted")}</span>
          </div>
        </div>

        {/* Action Button */}
        {!claimed ? (
          <div className="space-y-3">
            <Button
              onClick={handleClaim}
              className="w-full h-13 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold text-base shadow-xl shadow-amber-500/25 gap-2"
            >
              <Sparkles className="h-5 w-5 fill-black" />
              <span>{t("cardDrop.claimNow", { amount: money })}</span>
            </Button>
            <p className="text-[11px] text-zinc-500">
              {t("cardDrop.noCard")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{t("cardDrop.active")}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => navigate("/discover")}
                className="h-11 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs gap-1.5"
              >
                <Store className="h-4 w-4" />
                <span>{t("cardDrop.browse")}</span>
              </Button>
              <Button
                onClick={() => navigate("/wallet")}
                variant="outline"
                className="h-11 rounded-xl border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-white font-bold text-xs gap-1.5"
              >
                <CreditCard className="h-4 w-4 text-amber-400" />
                <span>{t("cardDrop.wallet")}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

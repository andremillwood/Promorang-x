import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  ExternalLink,
  Plus,
  QrCode,
  Sparkles,
  Share2,
  Copy,
  Check,
  Package,
  Clock,
  MapPin,
  Flame,
  Tag,
  Star,
  Image as ImageIcon,
  Zap,
  DollarSign,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import ProductCatalogManager from "@/components/merchant/ProductCatalogManager";

export function MerchantStorefrontConsole({
  onOpenProducts,
  onOpenScanner,
}: {
  onOpenProducts?: () => void;
  onOpenScanner?: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [activeDeal, setActiveDeal] = useState<string | null>("2-for-1 Artisan Pour-Over (3-6 PM)");
  const [dealDiscount, setDealDiscount] = useState("20");

  const storefrontUrl = typeof window !== "undefined"
    ? `${window.location.origin}/storefront/${user?.id || "demo"}`
    : `https://www.promorang.co/storefront/${user?.id || "demo"}`;

  const copyStorefrontLink = () => {
    navigator.clipboard.writeText(storefrontUrl);
    setCopied(true);
    toast({
      title: t("merchStore.copyToast"),
      description: t("merchStore.copyToastCopy"),
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchFlashDrop = () => {
    toast({
      title: t("merchStore.flashToast"),
      description: t("merchStore.flashToastCopy", { pct: dealDiscount }),
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Storefront Identity Banner */}
      <div className="p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-black font-black shadow-lg shadow-emerald-500/20 shrink-0">
            <Store className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black text-white">{t("merchStore.title")}</h2>
              <Badge className="bg-emerald-500 text-black font-extrabold uppercase text-[10px]">
                {t("merchStore.public")}
              </Badge>
            </div>
            <p className="text-xs text-white/60 mt-1">
              {t("merchStore.copy")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <Button
            asChild
            className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs"
          >
            <Link to={user?.id ? `/storefront/${user.id}` : "/shop"} target="_blank">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              {t("merchStore.viewShop")}
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={copyStorefrontLink}
            className="h-10 px-4 rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
          >
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            {copied ? t("merchStore.copied") : t("merchStore.copyLink")}
          </Button>
        </div>
      </div>

      {/* 2. Main Studio Grid: Mockup Showcase & Live Ops Control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Storefront Live Mockup (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                {t("merchStore.preview")}
              </span>
              <span className="text-[10px] text-white/40 font-mono">375px viewport</span>
            </div>

            {/* Mobile Mockup Shell */}
            <div className="rounded-2xl border border-white/10 bg-black overflow-hidden shadow-2xl">
              {/* Cover Banner */}
              <div className="relative h-32 bg-gradient-to-r from-emerald-900 via-teal-900 to-black p-4 flex flex-col justify-end">
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {t("merchStore.openNow")}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white drop-shadow-md">
                  {user?.user_metadata?.company_name || user?.user_metadata?.full_name || "Artisan Cafe & Lounge"}
                </h3>
                <p className="text-[11px] text-white/70 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-emerald-400" />
                  Kingston Cultural District
                </p>
              </div>

              {/* Active Deal Highlight */}
              <div className="p-4 bg-emerald-950/30 border-y border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-400" />
                  <div>
                    <p className="text-[11px] font-bold text-white">{t("merchStore.flashDrop")}</p>
                    <p className="text-[10px] text-emerald-300">{activeDeal}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black font-extrabold text-[10px]">
                  -{dealDiscount}%
                </span>
              </div>

              {/* Preview Products List */}
              <div className="p-4 space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                  {t("merchStore.featured")}
                </p>

                <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      ☕
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Single-Origin Blue Mountain</p>
                      <p className="text-[10px] text-white/50">800 Points or $4.50</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {t("merchStore.inStock")}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      🥐
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Guava Butter Croissant</p>
                      <p className="text-[10px] text-white/50">600 Points or $3.75</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {t("merchStore.inStock")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Flash Drop Launcher & Catalog Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Flash Perk & Happy Hour Generator */}
          <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">{t("merchStore.flashTitle")}</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold uppercase">
                {t("merchStore.demand")}
              </span>
            </div>

            <p className="text-xs text-white/60">
              {t("merchStore.flashCopy")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl border border-white/5 bg-white/[0.02] space-y-1">
                <label className="text-[10px] uppercase font-bold text-white/50">{t("merchStore.discount")}</label>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    value={dealDiscount}
                    onChange={(e) => setDealDiscount(e.target.value)}
                    className="h-9 rounded-xl border-white/10 bg-white/5 text-white font-bold text-sm"
                  />
                  <span className="text-sm font-bold text-white">%</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl border border-white/5 bg-white/[0.02] space-y-1 sm:col-span-2">
                <label className="text-[10px] uppercase font-bold text-white/50">{t("merchStore.dropDesc")}</label>
                <Input
                  value={activeDeal || ""}
                  onChange={(e) => setActiveDeal(e.target.value)}
                  placeholder={t("merchStore.dropPh")}
                  className="h-9 rounded-xl border-white/10 bg-white/5 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                {t("merchStore.estArrivals")}
              </span>
              <Button
                onClick={handleLaunchFlashDrop}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20"
              >
                <Flame className="h-4 w-4 mr-1.5" />
                {t("merchStore.broadcast")}
              </Button>
            </div>
          </div>

          {/* Catalog & Inventory Direct Embed */}
          <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">{t("merchStore.catalogTitle")}</h3>
                <p className="text-xs text-white/50 mt-0.5">
                  {t("merchStore.catalogCopy")}
                </p>
              </div>
            </div>

            <ProductCatalogManager />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MerchantStorefrontConsole;

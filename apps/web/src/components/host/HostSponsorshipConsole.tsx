import React, { useState } from "react";
import {
  Handshake,
  DollarSign,
  Lock,
  Building2,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { HostSponsorshipRequests } from "@/components/host/SponsorshipRequests";

export function HostSponsorshipConsole() {
  const { toast } = useToast();
  const [offers, setOffers] = useState([
    {
      id: "sp-1",
      brandName: "Midas Kingston",
      momentTarget: "Sunset Acoustic Stage",
      amount: 850,
      perkDesc: "Exclusive Welcome Drink & 500 PromoKeys distribution",
      status: "pending",
      escrowLocked: true,
    },
    {
      id: "sp-2",
      brandName: "Blue Mountain Artisan Coffee",
      momentTarget: "Downtown Art Walk",
      amount: 600,
      perkDesc: "Branded Pour-over bar pop-up & VIP tasting passes",
      status: "approved",
      escrowLocked: true,
    },
  ]);

  const handleAccept = (id: string, brand: string, amt: number) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "approved" } : o))
    );
    toast({
      title: "Sponsorship Agreement Confirmed! 🤝",
      description: `Accepted $${amt} sponsorship from ${brand}. Budget is held until the Moment is verified.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/20 shrink-0">
            <Handshake className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">Brand sponsorships</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase">
                Held until verified
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Review inbound brand funding, stage takeovers, and milestone payout releases.
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-center">
          <p className="text-[10px] uppercase font-bold text-white/50">Host Sponsor Earnings</p>
          <p className="text-base font-black text-amber-400">$3,400 Total</p>
        </div>
      </div>

      {/* 2. Offers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((offer) => {
          const isPending = offer.status === "pending";

          return (
            <div
              key={offer.id}
              className={`rounded-3xl border p-5 flex flex-col justify-between space-y-4 transition-all duration-300 shadow-xl ${
                isPending
                  ? "border-amber-500/40 bg-[#161208]"
                  : "border-emerald-500/40 bg-[#08160f]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase">
                    {offer.brandName}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ${offer.amount}.00 held
                  </span>
                </div>
                <h3 className="font-bold text-base text-white">{offer.momentTarget}</h3>
                <p className="text-xs text-white/70 mt-1">{offer.perkDesc}</p>
              </div>

              <div className="pt-2 border-t border-white/5">
                {isPending ? (
                  <Button
                    onClick={() => handleAccept(offer.id, offer.brandName, offer.amount)}
                    className="w-full h-10 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-extrabold text-xs shadow-md"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Accept Offer & Lock Stage Sponsor
                  </Button>
                ) : (
                  <div className="text-center py-1">
                    <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                      <Lock className="h-4 w-4" />
                      Budget held until the night is verified
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Sponsorship Table */}
      <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-6 space-y-4 shadow-xl">
        <HostSponsorshipRequests />
      </div>
    </div>
  );
}

export default HostSponsorshipConsole;

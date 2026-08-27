import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Users,
  Sparkles,
  Camera,
  MapPin,
  Clock,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { HostProofReviewPanel } from "@/components/host/HostProofReviewPanel";

export function HostProofReviewConsole() {
  const { toast } = useToast();
  const [proofs, setProofs] = useState([
    {
      id: "proof-1",
      guestName: "Marcus Chen",
      tier: "Scout L1",
      momentTitle: "Sunset Acoustic Stage",
      evidencePhoto: "/assets/moments/sunset-photo.jpg",
      pointsReward: 150,
      timestamp: "12 mins ago",
      status: "pending",
    },
    {
      id: "proof-2",
      guestName: "Camille Watson",
      tier: "Explorer",
      momentTitle: "Artisan Coffee Tasting",
      evidencePhoto: "/assets/moments/coffee-code.jpg",
      pointsReward: 100,
      timestamp: "28 mins ago",
      status: "pending",
    },
  ]);

  const handleApprove = (id: string, name: string, pts: number) => {
    setProofs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "approved" } : p))
    );
    toast({
      title: "Proof Verified! 🏆",
      description: `Credited ${pts} points and verified arrival proof for ${name}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/20 shrink-0">
            <ShieldCheck className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">Attendee Proof & Check-In Verification</h2>
              <Badge className="bg-amber-400 text-black font-extrabold uppercase text-[10px]">
                {proofs.filter((p) => p.status === "pending").length} Needs Review
              </Badge>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Verify guest check-in selfies, on-site receipts, and release attendance reward points.
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-center">
          <p className="text-[10px] uppercase font-bold text-white/50">Verification Trust</p>
          <p className="text-base font-black text-emerald-400">100% Verified</p>
        </div>
      </div>

      {/* 2. Proof Inspection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {proofs.map((proof) => {
          const isPending = proof.status === "pending";

          return (
            <div
              key={proof.id}
              className={`rounded-3xl border p-5 flex flex-col justify-between space-y-4 transition-all duration-300 shadow-xl ${
                isPending
                  ? "border-amber-500/40 bg-[#161208]"
                  : "border-emerald-500/40 bg-[#08160f]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-white">{proof.guestName}</span>
                  <span className="text-[10px] text-white/50">{proof.timestamp}</span>
                </div>
                <p className="text-xs text-amber-300 font-semibold">{proof.momentTitle}</p>
              </div>

              {/* Photo Evidence Preview */}
              <div className="relative rounded-2xl overflow-hidden h-48 bg-black border border-white/5">
                <img
                  src={proof.evidencePhoto}
                  alt="Guest Proof"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px]">
                    {proof.tier}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    +{proof.pointsReward} Points
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-white/5">
                {isPending ? (
                  <Button
                    onClick={() => handleApprove(proof.id, proof.guestName, proof.pointsReward)}
                    className="w-full h-10 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs shadow-md"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Approve Check-In (+{proof.pointsReward} Pts)
                  </Button>
                ) : (
                  <div className="text-center py-1">
                    <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Proof Approved & Credited
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Review Panel */}
      <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-6 space-y-4 shadow-xl">
        <HostProofReviewPanel />
      </div>
    </div>
  );
}

export default HostProofReviewConsole;

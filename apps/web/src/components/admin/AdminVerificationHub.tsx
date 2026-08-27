import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock3,
  MapPin,
  Sparkles,
  Users,
  Camera,
  Gem,
  Award,
  Filter,
  Eye,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface VerificationItem {
  id: string;
  type: "scout_proof" | "host_application" | "pioneer_checkin" | "media_bounty";
  title: string;
  applicant: string;
  tier: string;
  location: string;
  timestamp: string;
  reward: { points: number; gems?: number };
  evidenceUrl: string;
  notes: string;
  status: "pending" | "approved" | "rejected";
}

export function AdminVerificationHub() {
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<string>("all");

  const [items, setItems] = useState<VerificationItem[]>([
    {
      id: "ver-1",
      type: "scout_proof",
      title: "Kingston Creative Mural Check-In Proof",
      applicant: "Andre M.",
      tier: "Scout L2",
      location: "Water Lane, Downtown Kingston",
      timestamp: "5 mins ago",
      reward: { points: 150, gems: 5 },
      evidenceUrl: "/assets/moments/street-art.jpg",
      notes: "GPS verified on site + clear photo of stage QR badge.",
      status: "pending",
    },
    {
      id: "ver-2",
      type: "host_application",
      title: "Dub Club Kingston Venue Application",
      applicant: "Ras Marcus",
      tier: "Prospective Host",
      location: "Skyline Drive, Kingston",
      timestamp: "18 mins ago",
      reward: { points: 500, gems: 50 },
      evidenceUrl: "/assets/moments/sunset-photo.jpg",
      notes: "Submitted liquor license, venue photo, and 150 capacity certification.",
      status: "pending",
    },
    {
      id: "ver-3",
      type: "media_bounty",
      title: "Artisan Coffee Tasting Reel Deliverable",
      applicant: "Sherise Bell",
      tier: "Creator L3",
      location: "Hope Road, Kingston 6",
      timestamp: "35 mins ago",
      reward: { points: 300, gems: 20 },
      evidenceUrl: "/assets/moments/coffee-code.jpg",
      notes: "Reel achieved 14.2k views with #Promorang tag and door link.",
      status: "pending",
    },
  ]);

  const handleDecision = (id: string, decision: "approved" | "rejected", title: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: decision } : item))
    );
    if (decision === "approved") {
      toast({
        title: "Evidence Approved! 🛡️",
        description: `Verified '${title}'. Escrow disbursed points & gems to user.`,
      });
    } else {
      toast({
        title: "Submission Rejected",
        description: `Marked '${title}' as insufficient evidence.`,
        variant: "destructive",
      });
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });

  const pendingCount = items.filter((i) => i.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Telemetry Banner */}
      <div className="p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-black shadow-lg shadow-cyan-500/20 shrink-0">
            <ShieldCheck className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">Unified Verification & Proof Triage Hub</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-extrabold uppercase">
                {pendingCount} Pending Triage
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Side-by-side evidence inspection, GPS location validation, host applications, and automated point disbursal.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-center">
            <p className="text-[10px] uppercase font-bold text-white/50">Avg Review Time</p>
            <p className="text-base font-black text-cyan-400">1.8 mins</p>
          </div>
          <div className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-center">
            <p className="text-[10px] uppercase font-bold text-white/50">Approval Rate</p>
            <p className="text-base font-black text-white">96.2%</p>
          </div>
        </div>
      </div>

      {/* 2. Filter Navigation Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All Evidence Types" },
          { id: "scout_proof", label: "Scout Proofs & Check-Ins" },
          { id: "host_application", label: "Host & Venue Applications" },
          { id: "media_bounty", label: "Creator Media Bounties" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 ${
              filterType === tab.id
                ? "bg-cyan-400 text-black shadow-md shadow-cyan-500/20"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Verification Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const isPending = item.status === "pending";
          const isApproved = item.status === "approved";

          return (
            <div
              key={item.id}
              className={`rounded-3xl border p-5 flex flex-col justify-between space-y-4 transition-all duration-300 shadow-xl ${
                isPending
                  ? "border-cyan-500/40 bg-[#071318]"
                  : isApproved
                  ? "border-emerald-500/40 bg-[#08160f]"
                  : "border-red-500/40 bg-[#160808]"
              }`}
            >
              {/* Card Top & Status */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-mono text-white/80 uppercase">
                    {item.type.replace("_", " ")}
                  </span>
                  <span className="text-[10px] text-white/50">{item.timestamp}</span>
                </div>

                <h3 className="text-lg font-black text-white leading-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-white/70 mt-1">
                  Applicant: <span className="font-bold text-white">{item.applicant}</span>{" "}
                  <span className="text-cyan-300">({item.tier})</span>
                </p>
              </div>

              {/* Photo Evidence Thumbnail Preview */}
              <div className="relative rounded-2xl overflow-hidden h-44 bg-black border border-white/5">
                <img
                  src={item.evidenceUrl}
                  alt="Evidence Preview"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-white">
                  <span className="flex items-center gap-1 text-[11px] text-white/80 truncate">
                    <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-bold text-[10px]">
                    +{item.reward.points} Pts
                  </span>
                </div>
              </div>

              {/* Audit Notes */}
              <p className="text-xs text-white/60 bg-black/40 p-2.5 rounded-xl border border-white/5">
                {item.notes}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/5">
                {isPending ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleDecision(item.id, "approved", item.title)}
                      className="h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs flex-1 shadow-md"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Approve & Credit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDecision(item.id, "rejected", item.title)}
                      className="h-10 px-3 rounded-xl border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-1">
                    <span className={`text-xs font-bold flex items-center justify-center gap-1.5 ${
                      isApproved ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {isApproved ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      {isApproved ? "Approved & Disbursed" : "Rejected"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminVerificationHub;

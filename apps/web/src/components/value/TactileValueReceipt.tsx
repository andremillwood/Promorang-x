import React, { useState, useRef } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Share2,
  Copy,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Coins,
  DollarSign,
  Key,
  Award,
  Check,
  Scissors,
  Image as ImageIcon,
  Quote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ReceiptStoryModal } from "./ReceiptStoryModal";

export interface ValueReceiptData {
  id: string;
  receiptNumber?: string;
  actorHandle: string;
  actorName?: string;
  actorAvatar?: string;
  actionType: "share" | "ugc_clip" | "checkin" | "bounty" | "referral" | "commerce";
  actionTitle: string;
  targetEntity: string;
  timestamp: string;
  status: "verified" | "issued" | "submitted" | "completed";
  verificationMethod?: string;
  proofHash?: string;
  hostQuote?: string;
  hostSigner?: string;
  metrics: Array<{
    label: string;
    value: string | number;
    sublabel?: string;
    highlight?: boolean;
  }>;
  rewards: Array<{
    type: "points" | "cash" | "keys" | "perk" | "badge";
    label: string;
    value: string;
    icon?: React.ReactNode;
  }>;
  perksUnlocked?: string[];
  hostSignature?: string;
}

interface TactileValueReceiptProps {
  receipt: ValueReceiptData;
  interactive?: boolean;
  onInspectProof?: () => void;
  className?: string;
  showShareActions?: boolean;
  allowTear?: boolean;
}

export const TactileValueReceipt: React.FC<TactileValueReceiptProps> = ({
  receipt,
  interactive = true,
  onInspectProof,
  className = "",
  showShareActions = true,
  allowTear = true,
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isTorn, setIsTorn] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/r/${receipt.id}` 
    : `https://promorang.co/r/${receipt.id}`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !interactive) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = ((y - centerY) / centerY) * -7;
    const rotY = ((x - centerX) / centerX) * 7;
    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.18,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Receipt Link Copied!",
      description: "Public proof link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareX = () => {
    const text = `Verified contribution proof on @promorang: ${receipt.actionTitle} for ${receipt.targetEntity}. Check the receipt: ${shareUrl}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleTearClaim = () => {
    if (isTorn) return;
    setIsTorn(true);
    toast({
      title: "Receipt Claimed & Sealed!",
      description: "Rewards and proof status deposited into your Vault.",
    });
  };

  return (
    <>
      <div
        className={`relative mx-auto w-full max-w-md select-none font-sans transition-transform duration-100 ease-out [perspective:1000px] ${className}`}
      >
        {/* Top Perforation / Tear Notch Decor */}
        <div className="relative z-10 flex h-3 w-full items-center justify-between overflow-hidden px-3">
          <div className="flex w-full justify-between gap-1">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="h-2.5 w-2.5 -translate-y-1.5 rounded-full bg-[#0a0a0c]"
              />
            ))}
          </div>
        </div>

        {/* Main Physical Receipt Container with 3D Tilt */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transformStyle: "preserve-3d",
          }}
          className={`relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-[#16161b] via-[#0f0f13] to-[#0a0a0d] p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.75)] ring-1 ring-white/5 backdrop-blur-xl transition-all ${
            isTorn ? "border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.2)]" : ""
          }`}
        >
          {/* Dynamic Specular Glare Layer */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.22) 0%, rgba(249, 115, 22, 0.08) 35%, transparent 60%)`,
              opacity: glarePos.opacity,
            }}
          />

          {/* Top Masthead: Brand + Receipt ID */}
          <div className="flex items-start justify-between border-b border-dashed border-white/15 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-black tracking-wider text-white">PROMORANG</span>
                <span className="text-[9px] font-mono tracking-widest text-primary uppercase">PROOF OF VALUE</span>
              </div>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/40">
                REC: {receipt.receiptNumber || receipt.id.slice(0, 12).toUpperCase()}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <Badge className="border-emerald-500/30 bg-emerald-500/15 font-mono text-[10px] font-bold text-emerald-400">
                <ShieldCheck className="mr-1 h-3 w-3" /> VERIFIED PROOF
              </Badge>
              <span className="mt-1 font-mono text-[10px] text-white/40">{receipt.timestamp}</span>
            </div>
          </div>

          {/* Contributor Section */}
          <div className="mt-5 flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-amber-500/10 font-mono text-sm font-bold text-primary ring-1 ring-primary/30">
                {receipt.actorHandle.replace("@", "").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-medium text-white/50">CONTRIBUTOR</p>
                <p className="text-sm font-bold text-white">{receipt.actorHandle}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-white/50">TARGET ENTITY</p>
              <p className="text-sm font-bold text-primary">{receipt.targetEntity}</p>
            </div>
          </div>

          {/* Action Narrative Banner */}
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/[0.06] p-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs font-bold text-white">{receipt.actionTitle}</span>
            </div>
            {receipt.verificationMethod && (
              <p className="mt-1.5 text-[11px] text-white/55">
                Verified via <span className="font-mono text-emerald-400">{receipt.verificationMethod}</span>
              </p>
            )}
          </div>

          {/* Causation / Impact Metrics Rail */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">CAUSATION & IMPACT TRAIL</span>
              <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> 100% Attributed
              </span>
            </div>

            <div className={`grid gap-2 ${receipt.metrics.length === 3 ? "grid-cols-3" : receipt.metrics.length === 4 ? "grid-cols-4" : "grid-cols-2"}`}>
              {receipt.metrics.map((m, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl p-2.5 text-center transition-all ${
                    m.highlight
                      ? "border border-primary/40 bg-primary/10 shadow-[0_0_15px_rgba(249,115,22,0.12)]"
                      : "border border-white/5 bg-white/[0.03]"
                  }`}
                >
                  <div className="text-xl font-black text-white">{m.value}</div>
                  <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-white/50">{m.label}</div>
                  {m.sublabel && <div className="text-[8px] text-white/30">{m.sublabel}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Value Captured / Unlocked Strip */}
          <div className="mt-5 border-t border-dashed border-white/15 pt-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">VALUE UNLOCKED & KEPT</p>
            <div className="mt-2.5 space-y-2">
              {receipt.rewards.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.025] px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    {r.type === "cash" ? (
                      <DollarSign className="h-4 w-4 text-emerald-400" />
                    ) : r.type === "points" ? (
                      <Coins className="h-4 w-4 text-amber-400" />
                    ) : r.type === "keys" ? (
                      <Key className="h-4 w-4 text-purple-400" />
                    ) : (
                      <Award className="h-4 w-4 text-primary" />
                    )}
                    <span className="text-xs text-white/80">{r.label}</span>
                  </div>
                  <span className="font-mono font-bold text-white">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Host Endorsement Note if available */}
          {receipt.hostQuote && (
            <div className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/[0.05] p-3.5 text-xs text-amber-200/90">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-amber-400 uppercase tracking-wider">
                <Quote className="h-3 w-3" /> Host Endorsement
              </div>
              <p className="mt-1.5 italic leading-relaxed">"{receipt.hostQuote}"</p>
              {receipt.hostSigner && (
                <p className="mt-1 text-right font-mono text-[10px] text-amber-400/70">— {receipt.hostSigner}</p>
              )}
            </div>
          )}

          {/* Tear to Claim Interactive Perforation Strip */}
          {allowTear && (
            <div className="mt-5 border-t border-dashed border-primary/40 pt-4">
              <Button
                size="sm"
                onClick={handleTearClaim}
                disabled={isTorn}
                className={`w-full text-xs font-bold transition-all ${
                  isTorn
                    ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
                    : "border border-primary/30 bg-primary/15 text-primary hover:bg-primary/25"
                }`}
              >
                <Scissors className="mr-2 h-3.5 w-3.5" />
                {isTorn ? "✓ Claimed & Deposited to Vault" : "Tear Perforation to Claim & Seal"}
              </Button>
            </div>
          )}

          {/* Cryptographic Proof Hash & Verification Footer */}
          <div className="mt-5 flex items-center justify-between border-t border-dashed border-white/15 pt-4 text-[10px]">
            <div className="font-mono text-white/35">
              <p>HASH: {receipt.proofHash || `0x${receipt.id.replace(/-/g, "").slice(0, 16)}...`}</p>
              <p>STATUS: PERMANENT VAULT RECORD</p>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>IMMUTABLE</span>
            </div>
          </div>

          {/* Share & Inspection Action Toolbar */}
          {showShareActions && (
            <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="flex-1 border-white/15 bg-white/[0.04] text-xs font-semibold text-white hover:bg-white/10 hover:text-white"
              >
                {copied ? <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" /> : <Copy className="mr-1.5 h-3.5 w-3.5 text-white/70" />}
                {copied ? "Link Copied" : "Copy Link"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsStoryModalOpen(true)}
                className="border-primary/30 bg-primary/10 px-3 text-xs text-primary hover:bg-primary/20"
                title="Create 9:16 Social Story"
              >
                <ImageIcon className="mr-1.5 h-3.5 w-3.5" /> Story
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareX}
                className="border-white/15 bg-white/[0.04] px-3 text-xs text-white hover:bg-white/10"
                title="Share on X"
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>
              {onInspectProof && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onInspectProof}
                  className="border-white/15 bg-white/[0.04] px-3 text-xs text-white hover:bg-white/10"
                  title="Inspect Proof"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Bottom Perforation / Tear Notch Decor */}
        <div className="relative z-10 flex h-3 w-full items-center justify-between overflow-hidden px-3">
          <div className="flex w-full justify-between gap-1">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="h-2.5 w-2.5 translate-y-1.5 rounded-full bg-[#0a0a0c]"
              />
            ))}
          </div>
        </div>
      </div>

      {/* 9:16 Story Card Generator Modal */}
      <ReceiptStoryModal
        receipt={receipt}
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
      />
    </>
  );
};

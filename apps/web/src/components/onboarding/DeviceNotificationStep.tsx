import { useState, useEffect } from "react";
import {
  Bell,
  Ticket,
  MapPin,
  Sparkles,
  Gem,
  QrCode,
  Smartphone,
  CheckCircle2,
  Share,
  PlusSquare,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { triggerHaptic } from "@/lib/nativeWebApis";
import { useToast } from "@/hooks/use-toast";

interface DeviceNotificationStepProps {
  onComplete: () => void;
  personaChoice?: string;
}

export function DeviceNotificationStep({ onComplete, personaChoice }: DeviceNotificationStepProps) {
  const { isSubscribed, subscribe, loading } = usePushNotifications();
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = window.navigator.userAgent.toLowerCase();
    const mobileDetected = /mobile|android|iphone|ipad|ipod/i.test(ua) || window.innerWidth < 768;
    setIsMobile(mobileDetected);
    setIsIOS(/iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua));
  }, []);

  const mobileUrl = typeof window !== "undefined" ? `${window.location.origin}/discover?source=qr_bridge` : "https://www.promorang.co/discover";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mobileUrl)}&bgcolor=0e0e11&color=ffffff&margin=10`;

  const handleEnableNotifications = async () => {
    triggerHaptic("medium");
    const success = await subscribe();
    if (success) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    toast({
      title: "Mobile Link Copied!",
      description: "Send this link to your phone to open Promorang on mobile.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const notificationBenefits = [
    {
      icon: Ticket,
      title: "Door Passes & Start Countdowns",
      desc: "1-hour countdowns before your live Moments start and instant QR passes at the door.",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      icon: MapPin,
      title: "Nearby Member Perks",
      desc: "Geofenced alerts when walking near partner restaurants, clubs, and cultural venues.",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: Sparkles,
      title: "Creator Drops & VIP Passes",
      desc: "Instant notice when favorite tastemakers release unreleased tracks, videos, or tickets.",
      color: "text-primary bg-primary/10 border-primary/20",
    },
    {
      icon: Gem,
      title: "Real-Time Earnings & Commissions",
      desc: "Instant cash and Gem payout notifications whenever friends RSVP through your PromoShare.",
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6 text-white animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/30 to-amber-500/20 border border-primary/30 text-primary mb-1 shadow-lg">
          {isMobile ? <Bell className="h-7 w-7 animate-pulse" /> : <Smartphone className="h-7 w-7 text-primary" />}
        </div>
        <h2 className="text-2xl sm:text-3xl font-black">
          {isMobile ? "Never Miss a Moment or Perk" : "Connect Promorang to Your Phone"}
        </h2>
        <p className="text-sm text-white/60 max-w-md mx-auto">
          {isMobile
            ? "Enable real-time phone alerts for door access, nearby perks, and PromoShare payouts."
            : "Scan this code with your phone camera to take your door passes and live alerts on the go."}
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        {notificationBenefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div
              key={benefit.title}
              className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.03] flex items-start gap-3 transition hover:border-white/20"
            >
              <div className={`p-2 rounded-xl border shrink-0 ${benefit.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">{benefit.title}</p>
                <p className="text-[11px] text-white/50 leading-relaxed">{benefit.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Device-Specific Action Section */}
      {isMobile ? (
        <div className="space-y-3 pt-2">
          {isIOS && (
            <div className="p-3 rounded-2xl border border-primary/30 bg-primary/10 text-xs text-white/80 flex items-center gap-2">
              <span className="shrink-0 font-bold text-primary">Tip for iPhone:</span>
              <span>
                Tap <Share className="h-3.5 w-3.5 inline text-primary mx-0.5" /> then{" "}
                <strong className="text-white">Add to Home Screen</strong>{" "}
                <PlusSquare className="h-3.5 w-3.5 inline text-primary mx-0.5" /> for full lock-screen alerts.
              </span>
            </div>
          )}

          <Button
            size="lg"
            onClick={handleEnableNotifications}
            disabled={loading || isSubscribed}
            className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-sm shadow-[0_0_25px_rgba(255,106,0,0.4)]"
          >
            {isSubscribed ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400" />
                Alerts Active on This Device
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                {loading ? "Enabling..." : "Enable Real-Time Alerts"}
              </>
            )}
          </Button>

          <button
            onClick={onComplete}
            className="w-full py-2.5 text-xs text-white/40 hover:text-white transition font-medium text-center"
          >
            Maybe Later &rarr; Enter Platform
          </button>
        </div>
      ) : (
        /* Desktop QR Code Bridge */
        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-3xl border border-white/10 bg-black/40 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="p-2 rounded-2xl bg-[#0e0e11] border border-white/15 shrink-0 shadow-lg">
              <img
                src={qrCodeUrl}
                alt="Scan with phone"
                className="h-32 w-32 rounded-xl object-contain"
              />
            </div>
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                <QrCode className="h-3 w-3" /> Scan with Camera
              </div>
              <h4 className="text-sm font-bold text-white">Instant Mobile Sync</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                Open your phone camera, point it at this QR code, and tap the link to enable your mobile passes & alerts.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="h-8 rounded-xl text-xs font-bold border-white/15 hover:bg-white/10 text-white gap-1.5"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied Link" : "Copy Mobile Link"}
              </Button>
            </div>
          </div>

          <Button
            size="lg"
            onClick={onComplete}
            className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-sm shadow-[0_0_20px_rgba(255,106,0,0.3)]"
          >
            <span>Continue to Platform</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}

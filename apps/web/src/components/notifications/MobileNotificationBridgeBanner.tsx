import { useState, useEffect } from "react";
import { Smartphone, QrCode, X, Sparkles, Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { triggerHaptic } from "@/lib/nativeWebApis";

export function MobileNotificationBridgeBanner() {
  const { isSubscribed } = usePushNotifications();
  const [showBanner, setShowBanner] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only display on desktop viewports
    const isDesktop = window.innerWidth >= 1024 && !/mobile|android|iphone|ipad|ipod/i.test(navigator.userAgent);
    if (!isDesktop) return;

    // If notifications already active or dismissed recently, don't show
    const dismissedAt = localStorage.getItem("promorang:desktop_qr_bridge_dismissed");
    if (dismissedAt) {
      const daysSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    if (!isSubscribed) {
      setShowBanner(true);
    }
  }, [isSubscribed]);

  const handleDismiss = () => {
    triggerHaptic("light");
    setShowBanner(false);
    localStorage.setItem("promorang:desktop_qr_bridge_dismissed", String(Date.now()));
  };

  const mobileUrl = typeof window !== "undefined" ? `${window.location.origin}/discover?source=desktop_banner_bridge` : "https://www.promorang.co/discover";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mobileUrl)}&bgcolor=0e0e11&color=ffffff&margin=10`;

  if (!showBanner || isSubscribed) return null;

  return (
    <>
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/15 via-[#161311] to-black p-4 text-white shadow-lg flex items-center justify-between gap-4 animate-in fade-in-50 duration-300">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-black uppercase tracking-wider text-white">Connect Promorang to Your Phone</p>
              <span className="text-[9px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                Lock-Screen Alerts
              </span>
            </div>
            <p className="text-xs text-white/70 mt-0.5">
              Get real-time door passes, nearby member deals, and Gem payout alerts on your phone.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() => {
              triggerHaptic("medium");
              setOpenModal(true);
            }}
            className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs gap-1.5 shadow-[0_0_15px_rgba(255,106,0,0.3)]"
          >
            <QrCode className="h-3.5 w-3.5" />
            Scan Phone QR
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* QR Code Bridge Dialog */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-md p-6 bg-[#0e0e11] border-white/15 text-white rounded-3xl shadow-2xl">
          <DialogHeader className="text-center pb-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-2">
              <QrCode className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-black text-white">Scan with Your Phone</DialogTitle>
            <p className="text-xs text-white/60">
              Open your phone camera to take your passes, live moments & Gem rewards on the go.
            </p>
          </DialogHeader>

          <div className="flex flex-col items-center py-3 space-y-4">
            <div className="p-3 bg-black rounded-2xl border border-white/15 shadow-inner">
              <img src={qrCodeUrl} alt="Scan QR" className="h-44 w-44 rounded-xl object-contain" />
            </div>

            <div className="w-full space-y-2 text-xs text-white/70 bg-white/[0.03] p-3 rounded-2xl border border-white/10">
              <p className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                <span>Open your iPhone or Android camera app</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                <span>Point at the QR code and tap the link</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                <span>Tap <strong>"Allow Alerts"</strong> when prompted</span>
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenModal(false)}
              className="w-full rounded-xl border-white/15 hover:bg-white/10 text-white font-bold text-xs"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

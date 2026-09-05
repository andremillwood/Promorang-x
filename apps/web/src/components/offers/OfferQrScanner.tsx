import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { decodeOfferRedeemPayload } from "@promorang/shared";
import { requestCameraStream } from "@/lib/nativeWebApis";

type BarcodeDetectorLike = {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>>;
};

function createDetector(): BarcodeDetectorLike | null {
  const Detector = (window as Window & { BarcodeDetector?: new (options?: { formats?: string[] }) => BarcodeDetectorLike }).BarcodeDetector;
  if (!Detector) return null;
  try {
    return new Detector({ formats: ["qr_code"] });
  } catch {
    return null;
  }
}

export function OfferQrScanner({
  onCode,
  disabled,
}: {
  onCode: (code: string) => void;
  disabled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!active) return;
    let stream: MediaStream | null = null;
    let frame = 0;
    let cancelled = false;

    const start = async () => {
      setError("");
      stream = await requestCameraStream();
      if (!stream) {
        setError("This browser cannot open the camera. Type or paste the code instead.");
        setActive(false);
        return;
      }
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      const detector = createDetector();
      if (!detector) {
        setError("Live QR scan is not available here. Type or paste the code from the pass.");
        return;
      }
      const tick = async () => {
        if (cancelled || !videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          const raw = codes.find((item) => item.rawValue)?.rawValue;
          if (raw) {
            const code = decodeOfferRedeemPayload(raw);
            if (code) {
              onCodeRef.current(code);
              setActive(false);
              return;
            }
          }
        } catch {
          // keep scanning
        }
        frame = window.requestAnimationFrame(() => { void tick(); });
      };
      void tick();
    };

    void start();
    return () => {
      cancelled = true;
      if (frame) window.cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [active]);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
        {active ? (
          <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline autoPlay />
        ) : (
          <div className="flex aspect-square items-center justify-center p-6 text-center text-sm text-white/50">
            Point the camera at the customer’s pass.
          </div>
        )}
      </div>
      <Button type="button" variant="outline" disabled={disabled} onClick={() => setActive((value) => !value)} className="w-full">
        {active ? <CameraOff className="mr-2 h-4 w-4" /> : <Camera className="mr-2 h-4 w-4" />}
        {active ? "Close camera" : "Scan customer QR"}
      </Button>
      {error ? <p className="text-xs text-amber-200">{error}</p> : null}
    </div>
  );
}

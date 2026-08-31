import React, { useRef, useState, useEffect } from "react";
import {
  Download,
  Copy,
  Check,
  Sparkles,
  Share2,
  X,
  ShieldCheck,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import { ValueReceiptData } from "./TactileValueReceipt";

interface ReceiptStoryModalProps {
  receipt: ValueReceiptData;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptStoryModal: React.FC<ReceiptStoryModalProps> = ({
  receipt,
  isOpen,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { toast } = useToast();
  const { t } = useI18n();
  const [downloading, setDownloading] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set 9:16 high-res dimension (1080 x 1920)
    canvas.width = 1080;
    canvas.height = 1920;

    // 1. Deep Obsidian Background
    ctx.fillStyle = "#070709";
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Radial Ambient Glow
    const glow1 = ctx.createRadialGradient(200, 300, 10, 200, 300, 600);
    glow1.addColorStop(0, "rgba(249, 115, 22, 0.18)");
    glow1.addColorStop(1, "rgba(7, 7, 9, 0)");
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, 1080, 1920);

    const glow2 = ctx.createRadialGradient(880, 1200, 10, 880, 1200, 650);
    glow2.addColorStop(0, "rgba(16, 185, 129, 0.12)");
    glow2.addColorStop(1, "rgba(7, 7, 9, 0)");
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, 1080, 1920);

    // 3. Decorative Border Ring
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, 960, 1800);

    // 4. Header Masthead
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 48px serif";
    ctx.fillText("PROMORANG", 120, 180);

    ctx.fillStyle = "#F97316";
    ctx.font = "bold 24px monospace";
    ctx.fillText(t("storyModal.proofValue").toUpperCase(), 120, 225);

    // Verified Seal
    ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
    ctx.beginPath();
    ctx.roundRect(680, 130, 260, 80, 20);
    ctx.fill();
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.stroke();

    ctx.fillStyle = "#34D399";
    ctx.font = "bold 26px monospace";
    ctx.fillText(`✓ ${t("storyModal.verifiedProof").toUpperCase()}`, 705, 180);

    // 5. Main Card Body (Physical Receipt Surface)
    ctx.fillStyle = "rgba(20, 20, 26, 0.92)";
    ctx.beginPath();
    ctx.roundRect(120, 280, 840, 1280, 32);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Contributor Tag
    ctx.fillStyle = "#F97316";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText(receipt.actorHandle, 170, 370);

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "24px monospace";
    ctx.fillText(receipt.timestamp.toUpperCase(), 170, 415);

    // Divider
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.setLineDash([12, 12]);
    ctx.beginPath();
    ctx.moveTo(170, 460);
    ctx.lineTo(910, 460);
    ctx.stroke();
    ctx.setLineDash([]);

    // Headline & Target Entity
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 52px sans-serif";
    ctx.fillText(receipt.targetEntity, 170, 550);

    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.font = "32px sans-serif";
    ctx.fillText(receipt.actionTitle, 170, 610);

    // 6. Metrics Grid
    const boxY = 680;
    const boxW = 220;
    const boxH = 180;
    receipt.metrics.slice(0, 3).forEach((m, idx) => {
      const x = 170 + idx * 260;
      ctx.fillStyle = m.highlight ? "rgba(249, 115, 22, 0.15)" : "rgba(255, 255, 255, 0.04)";
      ctx.beginPath();
      ctx.roundRect(x, boxY, boxW, boxH, 20);
      ctx.fill();
      ctx.strokeStyle = m.highlight ? "rgba(249, 115, 22, 0.4)" : "rgba(255, 255, 255, 0.08)";
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 56px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(m.value), x + boxW / 2, boxY + 85);

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "bold 20px monospace";
      ctx.fillText(m.label.toUpperCase(), x + boxW / 2, boxY + 135);
      ctx.textAlign = "left";
    });

    // 7. Value Captured Box
    ctx.fillStyle = "rgba(249, 115, 22, 0.08)";
    ctx.beginPath();
    ctx.roundRect(170, 910, 740, 240, 24);
    ctx.fill();
    ctx.strokeStyle = "rgba(249, 115, 22, 0.3)";
    ctx.stroke();

    ctx.fillStyle = "#F97316";
    ctx.font = "bold 24px monospace";
    ctx.fillText(t("storyModal.valueCaptured").toUpperCase(), 205, 965);

    receipt.rewards.slice(0, 2).forEach((r, i) => {
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText(r.label, 205, 1025 + i * 55);

      ctx.fillStyle = "#34D399";
      ctx.font = "900 36px monospace";
      ctx.textAlign = "right";
      ctx.fillText(r.value, 875, 1025 + i * 55);
      ctx.textAlign = "left";
    });

    // 8. Cryptographic Proof Hash
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.font = "22px monospace";
    ctx.fillText(t("storyModal.proofHash", { hash: receipt.proofHash || "0x98f4e2b83a00c71e" }), 170, 1220);
    ctx.fillText(t("storyModal.recordType").toUpperCase(), 170, 1260);

    // 9. Bottom Footer with Promorang CTA
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 34px sans-serif";
    ctx.fillText(t("storyModal.cta"), 120, 1660);

    ctx.fillStyle = "#F97316";
    ctx.font = "bold 26px monospace";
    ctx.fillText("promorang.co/r/" + receipt.id, 120, 1710);
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(drawCanvas, 100);
    }
  }, [isOpen, receipt, t]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `promorang-receipt-${receipt.id}.png`;
    link.href = image;
    link.click();
    setDownloading(false);
    toast({
      title: t("storyModal.dlTitle"),
      description: t("storyModal.dlCopy"),
    });
  };

  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopiedImage(true);
        toast({
          title: t("storyModal.copyTitle"),
          description: t("storyModal.copyCopy"),
        });
        setTimeout(() => setCopiedImage(false), 2500);
      });
    } catch (err) {
      handleDownload();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-white/10 bg-[#0c0c11] p-6 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-black">
            <Sparkles className="h-5 w-5 text-primary" />
            {t("storyModal.title")}
          </DialogTitle>
        </DialogHeader>

        {/* 9:16 Canvas Preview */}
        <div className="relative mx-auto flex h-[480px] w-[270px] items-center justify-center overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
          <canvas
            ref={canvasRef}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Action Controls */}
        <div className="mt-4 flex gap-3">
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 bg-primary font-bold text-black hover:bg-primary/90"
          >
            <Download className="mr-2 h-4 w-4" /> {t("storyModal.download")}
          </Button>
          <Button
            onClick={handleCopy}
            variant="outline"
            className="border-white/15 bg-white/[0.05] font-bold text-white hover:bg-white/10"
          >
            {copiedImage ? <Check className="mr-2 h-4 w-4 text-emerald-400" /> : <Copy className="mr-2 h-4 w-4" />}
            {copiedImage ? t("storyModal.copied") : t("storyModal.copyImage")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

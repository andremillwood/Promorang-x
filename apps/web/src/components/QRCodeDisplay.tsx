import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Copy, Check } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeDisplayProps {
  momentId: string;
  momentTitle: string;
  checkInCode: string;
}

export function QRCodeDisplay({ momentId, momentTitle, checkInCode }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);

  // Create the check-in URL
  const checkInUrl = `${window.location.origin}/moments/${momentId}/checkin?code=${checkInCode}`;

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(checkInCode);
    setCopied(true);
    toast({
      title: "Code copied!",
      description: "Check-in code copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const link = document.createElement("a");
      link.download = `checkin-${checkInCode}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="w-4 h-4 mr-2" />
          Check-in QR
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Check-in QR Code</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Display this QR code at your venue for participants to scan and check in.
          </p>
          
          <div 
            ref={qrRef}
            className="bg-white p-4 rounded-xl shadow-card"
          >
            <QRCodeSVG
              value={checkInUrl}
              size={200}
              level="H"
              includeMargin
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Manual Code</p>
            <div className="flex items-center gap-2">
              <code className="px-4 py-2 bg-secondary rounded-lg text-xl font-mono font-bold tracking-wider">
                {checkInCode}
              </code>
              <Button variant="ghost" size="icon" onClick={handleCopyCode}>
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Participants can scan this code or enter the manual code to verify their attendance at "{momentTitle}"
          </p>

          <Button variant="outline" onClick={handleDownload} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { EvidenceItem } from "./EvidenceFeed";
import { Download, Users, DollarSign, Image as ImageIcon } from "lucide-react";
import { formatCurrency, formatCompactNumber } from "./utils";
import { Badge } from "@/components/ui/badge";

interface AutomatedRecapProps {
  isOpen: boolean;
  onClose: () => void;
  campaignName: string;
  totalSpent: number;
  totalParticipants: number;
  roi: number;
  evidenceItems: EvidenceItem[];
}

/**
 * Legacy recap renderer.
 *
 * It only renders values/evidence supplied by its caller. It does not add
 * benchmark comparisons, projected outcomes, invented white-label clients, or
 * "verified" language beyond the supplied evidence status.
 */
export function AutomatedRecap({
  isOpen,
  onClose,
  campaignName,
  totalSpent,
  totalParticipants,
  roi,
  evidenceItems,
}: AutomatedRecapProps) {
  const handlePrint = () => window.print();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl overflow-hidden border-border/50 bg-background p-0 shadow-2xl">
        <div className="absolute right-4 top-4 z-50 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint} className="bg-background/80 backdrop-blur-sm">
            <Download className="mr-2 h-4 w-4" />
            Print / Save PDF
          </Button>
        </div>

        <div className="max-h-[85vh] overflow-y-auto p-8 md:p-12" id="recap-print-area">
          <DialogHeader className="border-b border-border pb-8 pt-4 text-left">
            <Badge variant="outline" className="mb-3 w-fit">Campaign summary</Badge>
            <DialogTitle className="font-serif text-4xl font-bold tracking-tight">{campaignName}</DialogTitle>
            <DialogDescription>
              This recap shows the campaign totals available right now. It does not estimate lift or future performance.
            </DialogDescription>
          </DialogHeader>

          <div className="my-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-border/50 bg-secondary/30 p-6 text-center">
              <Users className="mx-auto h-6 w-6 text-primary" />
              <h3 className="mt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Participants</h3>
              <p className="mt-2 text-4xl font-black text-foreground">{formatCompactNumber(totalParticipants)}</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-secondary/30 p-6 text-center">
              <DollarSign className="mx-auto h-6 w-6 text-primary" />
              <h3 className="mt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Total spend</h3>
              <p className="mt-2 text-4xl font-black text-foreground">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-secondary/30 p-6 text-center">
              <DollarSign className="mx-auto h-6 w-6 text-primary" />
              <h3 className="mt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Spend / participant</h3>
              <p className="mt-2 text-4xl font-black text-foreground">{formatCurrency(roi)}</p>
            </div>
          </div>

          <section>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Attached evidence</h2>
            </div>
            {evidenceItems.length > 0 ? (
              <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {evidenceItems.filter((item) => item.media_url).map((item) => (
                  <div key={item.id} className="overflow-hidden rounded-2xl border border-border/50">
                    <img src={item.media_url} alt="" className="aspect-square w-full object-cover" />
                    <div className="p-3">
                      <p className="truncate text-sm font-bold">{item.user_name}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{item.location || "Location unavailable"}</p>
                      <Badge variant="outline" className="mt-2 text-[9px] uppercase">
                        {item.verification_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No visual evidence was supplied to this recap.
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

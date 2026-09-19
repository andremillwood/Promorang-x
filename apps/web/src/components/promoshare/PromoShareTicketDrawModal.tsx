import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ticket, Trophy } from "lucide-react";

interface PromoShareTicketDrawModalProps {
  jackpotAmount?: number;
  userTickets?: number;
  poolTitle?: string;
  trigger?: React.ReactNode;
  onTicketEntered?: (ticketsUsed: number) => void;
}

export function PromoShareTicketDrawModal({
  jackpotAmount = 0,
  userTickets = 0,
  poolTitle = "PromoShare Draw",
  trigger,
}: PromoShareTicketDrawModalProps) {
  const recordedJackpot = Math.max(0, Number(jackpotAmount || 0));
  const recordedEntries = Math.max(0, Number(userTickets || 0));

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-gradient-to-r from-[#FF6A00] to-amber-500 font-black text-black hover:opacity-90">
            <Ticket className="h-4 w-4" />
            View draw
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg rounded-3xl border border-amber-500/30 bg-[#0c0c0c] text-white backdrop-blur-2xl">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-400">
            <Trophy className="h-7 w-7" />
          </div>
          <DialogTitle className="text-2xl font-black">{poolTitle}</DialogTitle>
          <DialogDescription className="text-white/60">
            This view shows recorded draw state only. PromoShare entries are created by verified platform actions; this browser does not spend entries, select winners, or issue prizes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Recorded pool</p>
              <p className="mt-1 text-3xl font-black text-white">{recordedJackpot.toLocaleString()} Gems</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">Your recorded entries</p>
              <p className="mt-1 text-3xl font-black text-orange-400">{recordedEntries}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">State boundary</p>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Entry does not guarantee selection. Selection does not mean a reward has been claimed or settled. Any winner, claim, issuance, or settlement must come from the authoritative PromoShare records.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

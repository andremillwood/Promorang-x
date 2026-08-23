import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Ticket, Sparkles, Gift, Zap, CheckCircle2, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/I18nContext";

interface PromoShareTicketDrawModalProps {
  jackpotAmount?: number;
  userTickets?: number;
  poolTitle?: string;
  trigger?: React.ReactNode;
  onTicketEntered?: (ticketsUsed: number) => void;
}

const potentialPrizes = [
  { title: "$500 Gem Jackpot", type: "gems", val: "500 Gems", color: "from-amber-500 to-orange-600" },
  { title: "VIP Festival Pass", type: "access", val: "VIP Pass", color: "from-purple-500 to-pink-600" },
  { title: "50 Bonus PromoKeys", type: "keys", val: "50 Keys", color: "from-[#FF6A00] to-yellow-500" },
  { title: "100 Bonus Tickets", type: "tickets", val: "100 Tickets", color: "from-emerald-500 to-teal-600" },
  { title: "Rooftop Dining Pass", type: "perk", val: "Dining Pass", color: "from-blue-500 to-cyan-600" },
];

export function PromoShareTicketDrawModal({
  jackpotAmount = 1250,
  userTickets = 15,
  poolTitle = "Weekly Sponsor Prize Pool",
  trigger,
  onTicketEntered,
}: PromoShareTicketDrawModalProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [ticketsToUse, setTicketsToUse] = useState(1);
  const [availableTickets, setAvailableTickets] = useState(userTickets);
  const [winningPrize, setWinningPrize] = useState<typeof potentialPrizes[0] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setAvailableTickets(userTickets);
  }, [userTickets]);

  const handleStartDraw = () => {
    if (availableTickets < ticketsToUse) {
      toast.error("Not enough tickets for this draw entry.");
      return;
    }

    setIsSpinning(true);
    setWinningPrize(null);
    setAvailableTickets((prev) => prev - ticketsToUse);

    let counter = 0;
    const totalSpins = 25;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % potentialPrizes.length);
      counter++;

      if (counter >= totalSpins) {
        clearInterval(interval);
        const randomWin = potentialPrizes[Math.floor(Math.random() * potentialPrizes.length)];
        setWinningPrize(randomWin);
        setIsSpinning(false);
        toast.success(`🎉 DRAW RESULT: You won ${randomWin.title}!`);
        if (onTicketEntered) onTicketEntered(ticketsToUse);
      }
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-gradient-to-r from-[#FF6A00] to-amber-500 font-black text-black hover:opacity-90">
            <Ticket className="h-4 w-4" />
            {t("promoshare.enterTicketDraw")}
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
            Spin the PromoShare Jackpot Wheel with action tickets! 1 Ticket = 1 Entry.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Active Jackpot Stats */}
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Current Pool Jackpot</p>
              <p className="mt-1 text-3xl font-black text-white">{jackpotAmount.toLocaleString()} Gems</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">Your Action Tickets</p>
              <p className="mt-1 text-3xl font-black text-orange-400">{availableTickets} Tickets</p>
            </div>
          </div>

          {/* Wheel / Slot Animation Display */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-black p-8 text-center shadow-[0_0_40px_rgba(249,115,22,0.15)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black to-transparent" />

            <div className="space-y-2">
              <Badge className="bg-amber-500/20 text-amber-300">
                {isSpinning ? "SPINNING PRIZE WHEEL..." : winningPrize ? "WINNER REVEALED!" : "READY TO ENTER"}
              </Badge>

              <div className="py-6">
                {winningPrize ? (
                  <div className="animate-bounce">
                    <div className={`mx-auto inline-block rounded-2xl bg-gradient-to-r ${winningPrize.color} px-6 py-4 text-2xl font-black text-white shadow-xl`}>
                      🎁 {winningPrize.title}
                    </div>
                    <p className="mt-3 text-sm font-bold text-amber-300">Added to your Vault & Ticket Receipt!</p>
                  </div>
                ) : (
                  <div className={`mx-auto inline-block rounded-2xl bg-gradient-to-r ${potentialPrizes[currentIndex].color} px-6 py-4 text-2xl font-black text-white transition-all duration-100 ${isSpinning ? "scale-110 blur-[0.5px]" : ""}`}>
                    {potentialPrizes[currentIndex].title}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ticket Selection & Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/70">Select Tickets to Enter:</span>
              <div className="flex gap-2">
                {[1, 5, 10].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setTicketsToUse(count)}
                    className={`rounded-lg border px-3 py-1 text-xs font-black transition ${
                      ticketsToUse === count
                        ? "border-amber-400 bg-amber-500 text-black"
                        : "border-white/10 bg-white/5 text-white hover:border-amber-400/50"
                    }`}
                  >
                    {count} Ticket{count > 1 ? "s" : ""}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleStartDraw}
              disabled={isSpinning || availableTickets < ticketsToUse}
              className="h-14 w-full rounded-2xl bg-gradient-to-r from-[#FF6A00] via-amber-500 to-orange-500 text-lg font-black text-black shadow-lg hover:opacity-90 disabled:opacity-50"
            >
              {isSpinning ? (
                <span className="flex items-center gap-2">
                  <RotateCw className="h-5 w-5 animate-spin" /> Spinning Draw...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> Spin Draw with {ticketsToUse} Ticket{ticketsToUse > 1 ? "s" : ""}
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

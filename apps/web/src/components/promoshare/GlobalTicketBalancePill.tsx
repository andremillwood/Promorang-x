import React, { useState } from 'react';
import { usePromoShareRail } from '@/hooks/usePromoShareRail';
import { Link } from 'react-router-dom';
import { Ticket, Gift, Sparkles, Gem, ArrowRight, Zap, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const GlobalTicketBalancePill: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { balances } = usePromoShareRail();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted hover:bg-accent border border-border hover:border-primary/50 text-xs text-foreground transition-all ${className}`}
        title="View Vault balances & PromoShare Tickets"
      >
        <span className="flex items-center gap-1 font-mono font-bold text-orange-700 dark:text-orange-400">
          <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-amber-500" />
          <span>{balances.promoPoints} Pts</span>
        </span>

        <span className="text-muted-foreground">·</span>

        <span className="hidden sm:flex items-center gap-1 text-muted-foreground font-medium">
          <Gift className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{balances.claimedPerksCount} Perks</span>
        </span>

        <span className="hidden sm:inline text-muted-foreground">·</span>

        <span className="flex items-center gap-1 font-mono font-black text-purple-800 dark:text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/30">
          <Ticket className="w-3 h-3 text-purple-700 dark:text-purple-400" />
          <span>{balances.promoShareTickets} Tickets</span>
        </span>

        <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
      </button>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md bg-popover text-popover-foreground border-border p-6 rounded-3xl">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Promorang Economic & Reward Stack</span>
            </div>
            <DialogTitle className="text-xl font-black text-foreground">Your Live Value Balances</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              How participation, offers, sharing, and proof translate into tangible rewards.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 space-y-3">
            <div className="p-3.5 rounded-2xl bg-muted border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/15 text-orange-700 dark:text-orange-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">PromoPoints</h4>
                  <p className="text-[11px] text-muted-foreground">Progress & Rank Acceleration</p>
                </div>
              </div>
              <span className="text-lg font-mono font-black text-orange-700 dark:text-orange-400">{balances.promoPoints}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Active Perks</h4>
                  <p className="text-[11px] text-muted-foreground">Real-world Utility & Discounts</p>
                </div>
              </div>
              <span className="text-lg font-mono font-black text-emerald-700 dark:text-emerald-400">{balances.claimedPerksCount}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-800 dark:text-purple-300">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">PromoShare Tickets</h4>
                  <p className="text-[11px] text-purple-800 dark:text-purple-300">Draw Possibility & Weekly Jackpot</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-mono font-black text-purple-800 dark:text-purple-300">{balances.promoShareTickets}</span>
                <span className="block text-[10px] text-muted-foreground">Draw: {balances.nextDrawDate}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-700 dark:text-blue-400">
                  <Gem className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Platform Gems</h4>
                  <p className="text-[11px] text-muted-foreground">1 Gem = US$1 Platform Economic Value</p>
                </div>
              </div>
              <span className="text-lg font-mono font-black text-blue-700 dark:text-blue-400">{balances.gems} Gems</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Button
              asChild
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-black font-black text-xs py-3 rounded-xl shadow-lg"
            >
              <Link to="/vault" onClick={() => setModalOpen(false)}>
                <span>Open Full Vault</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-border bg-muted hover:bg-accent text-foreground text-xs py-3 rounded-xl"
            >
              <Link to="/promoshare" onClick={() => setModalOpen(false)}>
                <span>PromoShare Draw</span>
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

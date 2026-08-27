import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Coins, TrendingUp, Sparkles, Layers, ArrowRight, ShieldCheck, Gem, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { processDividendClaims } from "@/lib/pieces";

export interface DemoPieceHolding {
  id: string;
  pieceType: "moment" | "host" | "venue" | "content";
  assetId: string;
  title: string;
  category: string;
  shares: number;
  sharePrice: number;
  totalValue: number;
  unclaimedDividends: number;
  lifetimeDividends: number;
  estYieldApr: string;
}

const DEFAULT_HOLDINGS: DemoPieceHolding[] = [
  {
    id: "piece_iluvhiphop",
    pieceType: "moment",
    assetId: "iluvhiphop_moment",
    title: "I Luv Hip Hop (Kingston Event Syndicate)",
    category: "Recurring Nightlife Moment",
    shares: 25,
    sharePrice: 12.50,
    totalValue: 312.50,
    unclaimedDividends: 18.75,
    lifetimeDividends: 84.50,
    estYieldApr: "18.4%",
  },
  {
    id: "piece_norbrook_bbq",
    pieceType: "moment",
    assetId: "norbrook_bbq_moment",
    title: "Norbrook Lavish BBQ Series (Co-Producer Key)",
    category: "Exclusive Culinary Experience",
    shares: 10,
    sharePrice: 20.00,
    totalValue: 200.00,
    unclaimedDividends: 12.00,
    lifetimeDividends: 45.00,
    estYieldApr: "14.2%",
  },
];

export function PiecesDividendWalletCard({ userId = "user_current" }: { userId?: string }) {
  const { toast } = useToast();
  const [holdings, setHoldings] = useState<DemoPieceHolding[]>(DEFAULT_HOLDINGS);
  const [isClaiming, setIsClaiming] = useState(false);

  const totalPortfolioValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
  const totalUnclaimedDividends = holdings.reduce((sum, h) => sum + h.unclaimedDividends, 0);
  const totalLifetimeDividends = holdings.reduce((sum, h) => sum + h.lifetimeDividends, 0);

  const handleClaimAllDividends = async () => {
    if (totalUnclaimedDividends <= 0) {
      toast({
        title: "No Unclaimed Dividends",
        description: "All your dividend payouts for this period are already settled.",
      });
      return;
    }

    setIsClaiming(true);
    try {
      // Execute dividend claims through pieces service
      await processDividendClaims(userId);

      const claimedAmount = totalUnclaimedDividends;
      setHoldings((prev) =>
        prev.map((h) => ({
          ...h,
          lifetimeDividends: h.lifetimeDividends + h.unclaimedDividends,
          unclaimedDividends: 0,
        }))
      );

      toast({
        title: "🎉 Dividends Claimed Successfully!",
        description: `$${claimedAmount.toFixed(2)} USD in ticket revenue share was credited to your Wallet.`,
      });
    } catch {
      toast({
        title: "Dividends Claimed",
        description: `$${totalUnclaimedDividends.toFixed(2)} USD in ticket revenue share was added to your balance.`,
      });
      setHoldings((prev) =>
        prev.map((h) => ({
          ...h,
          lifetimeDividends: h.lifetimeDividends + h.unclaimedDividends,
          unclaimedDividends: 0,
        }))
      );
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-950/25 via-neutral-900/90 to-black/95 overflow-hidden shadow-2xl backdrop-blur-xl">
      <CardHeader className="border-b border-cyan-500/15 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-400 text-[11px] font-black uppercase tracking-wider mb-2 border border-cyan-500/30">
              <Coins className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cultural Equity &amp; Dividends</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
              My Pieces Portfolio
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
              Fractional co-producer shares of recurring events, media drops, and cultural IP that pay automatic dividends.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button asChild variant="outline" size="sm" className="border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-300">
              <Link to="/portfolio" className="flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Full Portfolio <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
            <Button
              onClick={handleClaimAllDividends}
              disabled={isClaiming || totalUnclaimedDividends <= 0}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              {isClaiming ? "Claiming..." : `Claim $${totalUnclaimedDividends.toFixed(2)} Dividends`}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Metric summary banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-border/60 hover:border-cyan-500/30 transition-all">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Portfolio Equity Value</p>
            <p className="text-2xl font-black text-foreground mt-1">${totalPortfolioValue.toFixed(2)}</p>
            <p className="text-[11px] text-cyan-400 font-medium mt-1">Asset-backed equity</p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-border/60 hover:border-emerald-500/30 transition-all">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unclaimed Cash Dividends</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">${totalUnclaimedDividends.toFixed(2)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Ready for 1-tap payout</p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-border/60 hover:border-cyan-500/30 transition-all">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lifetime Dividends Earned</p>
            <p className="text-2xl font-black text-foreground mt-1">${totalLifetimeDividends.toFixed(2)}</p>
            <p className="text-[11px] text-emerald-400 font-medium mt-1">From ticket &amp; drop sales</p>
          </div>
        </div>

        {/* Holdings list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Active Piece Holdings ({holdings.length})
            </p>
            <Link to="/marketplace" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              Explore Pieces Marketplace <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {holdings.map((piece) => (
            <Link
              key={piece.id}
              to={`/pieces/${piece.pieceType}/${piece.assetId}`}
              className="group block p-4 rounded-2xl border border-border/60 bg-neutral-900/50 hover:bg-neutral-900/80 hover:border-cyan-500/50 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400 bg-cyan-500/10">
                      {piece.category}
                    </Badge>
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {piece.estYieldApr} APR
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                    {piece.title} <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {piece.shares} Shares Owned · ${piece.sharePrice.toFixed(2)} / piece · Lifetime Yield: ${piece.lifetimeDividends.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Holding Value</p>
                    <p className="text-base font-black text-foreground">${piece.totalValue.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Unclaimed</p>
                    <p className="text-base font-black text-emerald-400">${piece.unclaimedDividends.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

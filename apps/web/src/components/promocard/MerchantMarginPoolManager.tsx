import React, { useState } from "react";
import {
  Store,
  DollarSign,
  Users,
  ShieldCheck,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MarginPoolService, MerchantMarginPool } from "@/lib/promocard";

interface MerchantMarginPoolManagerProps {
  merchantId?: string;
  merchantName?: string;
}

export const MerchantMarginPoolManager: React.FC<MerchantMarginPoolManagerProps> = ({
  merchantId = "merchant_demo_1",
  merchantName = "Kinfolk Coffee & Roasters",
}) => {
  const { toast } = useToast();
  const [pool, setPool] = useState<MerchantMarginPool>(
    MarginPoolService.getPoolByMerchantId(merchantId) || {
      merchantId,
      merchantName,
      category: "Food & Beverage",
      allowancePerUser: 10.0,
      minBasketSize: 25.0,
      monthlyCustomerCap: 50,
      currentRedemptionsCount: 28,
      totalCashEarned: 840.0,
      totalMarginCommitted: 500.0,
      isActive: true,
      termsNote: "Valid on all qualifying orders over minimum spend.",
    }
  );

  const [allowance, setAllowance] = useState<number>(pool.allowancePerUser);
  const [minBasket, setMinBasket] = useState<number>(pool.minBasketSize);
  const [cap, setCap] = useState<number>(pool.monthlyCustomerCap);

  const handleSavePool = () => {
    const updated = MarginPoolService.updateMarginPool(merchantId, {
      allowancePerUser: Number(allowance),
      minBasketSize: Number(minBasket),
      monthlyCustomerCap: Number(cap),
    });
    setPool(updated);
    toast({
      title: "Margin Pool Updated!",
      description: `Authorized $${(allowance * cap).toFixed(2)} in zero-cash customer acquisition margin.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-zinc-950 border-zinc-800 text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-400 text-xs flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              Net Cash Earned from Promorang
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-400">
              ${pool.totalCashEarned.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-zinc-500">
            Real cash received directly at POS/checkout
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800 text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-400 text-xs flex items-center gap-1.5">
              <Users className="h-4 w-4 text-amber-400" />
              New Customers Acquired
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-white">
              {pool.currentRedemptionsCount} <span className="text-xs text-zinc-500 font-normal">/ {pool.monthlyCustomerCap}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-zinc-500">
            {pool.monthlyCustomerCap - pool.currentRedemptionsCount} promo slots remaining this cycle
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800 text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-400 text-xs flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              Upfront Cash Cost to Merchant
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-indigo-400">
              $0.00
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-zinc-500">
            100% performance-based margin clearing
          </CardContent>
        </Card>
      </div>

      {/* Margin Configuration Form */}
      <Card className="bg-zinc-950 border-zinc-800 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sliders className="h-5 w-5 text-amber-400" />
                Customer Acquisition Margin Settings
              </CardTitle>
              <CardDescription className="text-zinc-400 text-xs mt-1">
                Authorize how much promotional margin Promorang can drop onto local user cards.
              </CardDescription>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
              Active on PromoCard Network
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-zinc-300">Customer Card Perk ($ Discount)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-400 text-sm">$</span>
                <Input
                  type="number"
                  value={allowance}
                  onChange={(e) => setAllowance(Number(e.target.value))}
                  className="bg-zinc-900 border-zinc-800 pl-7 text-white"
                />
              </div>
              <p className="text-[11px] text-zinc-500">Amount deducted from customer's bill</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-300">Minimum Order Size ($ Minimum)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-400 text-sm">$</span>
                <Input
                  type="number"
                  value={minBasket}
                  onChange={(e) => setMinBasket(Number(e.target.value))}
                  className="bg-zinc-900 border-zinc-800 pl-7 text-white"
                />
              </div>
              <p className="text-[11px] text-zinc-500">Protects your profit margin per customer</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-300">Monthly Customer Cap</Label>
              <Input
                type="number"
                value={cap}
                onChange={(e) => setCap(Number(e.target.value))}
                className="bg-zinc-900 border-zinc-800 text-white"
              />
              <p className="text-[11px] text-zinc-500">Max redemptions authorized per month</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs space-y-1.5 text-zinc-300">
            <div className="flex items-center gap-1.5 font-semibold text-amber-400">
              <Sparkles className="h-4 w-4" />
              Campaign Impact Preview
            </div>
            <p>
              By authorizing a <strong>${allowance} perk</strong> on orders over <strong>${minBasket}</strong> with a <strong>{cap} customer cap</strong>:
            </p>
            <p className="text-emerald-400 font-medium">
              → You generate a minimum of <strong>${(minBasket * cap).toFixed(2)} in Gross Sales</strong> and <strong>${((minBasket - allowance) * cap).toFixed(2)} in Net Cash Flow</strong> with <strong>$0 upfront ad spend</strong>.
            </p>
          </div>

          <Button
            onClick={handleSavePool}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs px-6 rounded-xl"
          >
            Save Margin Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

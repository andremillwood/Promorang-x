import React from "react";
import { CreditCard, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PromoAcceptanceBadgeProps {
  allowanceAmount?: number;
  minSpend?: number;
  className?: string;
}

export const PromoAcceptanceBadge: React.FC<PromoAcceptanceBadgeProps> = ({
  allowanceAmount = 15.0,
  minSpend = 35.0,
  className = "",
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/5 border border-amber-500/30 text-amber-300 text-xs font-semibold backdrop-blur-sm shadow-sm ${className}`}
    >
      <CreditCard className="h-3.5 w-3.5 text-amber-400" />
      <span>PromoCard: <strong>${allowanceAmount.toFixed(0)} Off</strong> on ${minSpend.toFixed(0)}+</span>
    </div>
  );
};

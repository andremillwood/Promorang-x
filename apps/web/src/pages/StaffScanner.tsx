import { Link } from "react-router-dom";
import { ArrowLeft, Store } from "lucide-react";
import SEO from "@/components/SEO";
import MerchantScannerStation from "@/components/merchant/MerchantScannerStation";

export default function StaffScanner() {
  return (
    <main className="min-h-screen bg-zinc-950 p-4 text-white sm:p-8">
      <SEO title="Merchant Perk Redemption — Promorang" description="Validate and redeem a customer’s PromoCard perk." />
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
          <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500"><Store className="h-4 w-4" /> Merchant tool</span>
        </header>
        <MerchantScannerStation />
      </div>
    </main>
  );
}

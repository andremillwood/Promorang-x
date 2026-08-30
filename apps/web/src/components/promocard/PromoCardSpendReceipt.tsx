import { Receipt } from "lucide-react";
import type { PromoCardSpendReceipt as SpendReceipt } from "@promorang/shared";

export function PromoCardSpendReceipt({ receipt }: { receipt: SpendReceipt }) {
  return (
    <article className="relative overflow-hidden rounded-[1.4rem] border border-amber-200/20 bg-[#11110f] text-left text-white shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/50 to-transparent" />
      <div className="flex items-center justify-between border-b border-dashed border-white/10 px-5 py-4">
        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">
          <Receipt className="h-3.5 w-3.5" />
          {receipt.eyebrow}
        </p>
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{receipt.placeName}</span>
      </div>
      <div className="space-y-3 px-5 py-5">
        <h3 className="font-serif text-2xl font-black tracking-[-0.03em]">{receipt.headline}</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-black/40 px-3 py-2.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-white/40">Bill</p>
            <p className="mt-1 font-black">${receipt.basket.toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-emerald-400/10 px-3 py-2.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300">PromoCard</p>
            <p className="mt-1 font-black text-emerald-200">-${receipt.promoApplied.toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-black/40 px-3 py-2.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-white/40">You paid</p>
            <p className="mt-1 font-black">${receipt.cashRemainder.toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-amber-400/10 px-3 py-2.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-200">Saved</p>
            <p className="mt-1 font-black text-amber-100">${receipt.youSaved.toFixed(2)}</p>
          </div>
        </div>
        <p className="text-xs leading-5 text-white/55">{receipt.nextHint}</p>
      </div>
    </article>
  );
}

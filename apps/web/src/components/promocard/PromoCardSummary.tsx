import { canPresentPerk, type CardPerk } from "@/lib/promocard/benefits";

export function PromoCardSummary({ holder, perks }: { holder: string; perks: CardPerk[] }) {
  const ready = perks.filter((perk) => canPresentPerk(perk));
  return (
    <article className="pr-plastic-card w-full max-w-md p-5 text-white sm:p-6" aria-label="PromoCard">
      <div className="relative z-10 flex min-h-52 flex-col justify-between gap-5">
        <div>
          <p className="text-[10px] font-bold tracking-[0.22em] text-amber-200/80">PROMORANG</p>
          <h2 className="mt-1 font-serif text-2xl font-bold">PromoCard</h2>
        </div>
        <div>
          <p className="text-xs text-white/60">{ready.length ? "Ready to use" : "Your next benefit"}</p>
          <p className="mt-1 font-serif text-3xl font-bold text-amber-100">
            {ready[0]?.title || "Find something worth going for"}
          </p>
          <p className="mt-2 text-sm text-white/60">
            {ready.length ? `${ready.length} benefit${ready.length === 1 ? "" : "s"} ready · Check each offer’s terms` : "Claim a real offer and keep it here."}
          </p>
        </div>
        <p className="text-xs text-white/60">{holder}</p>
      </div>
    </article>
  );
}

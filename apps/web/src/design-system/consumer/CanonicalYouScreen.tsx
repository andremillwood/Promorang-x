import { Compass, CreditCard, Home, LockKeyhole, Settings, UserRound } from "lucide-react";
import { PaperReceipt } from "@/components/promorang/SignatureObjects";

const navItems = [
  [Home, "Today"],
  [Compass, "Discover"],
  [CreditCard, "Card"],
  [LockKeyhole, "Vault"],
  [UserRound, "You"],
] as const;

function ConsumerNav() {
  return (
    <nav className="grid grid-cols-5 border-t border-white/10 bg-black/95 px-2 pb-2 pt-3" aria-label="Consumer navigation specimen">
      {navItems.map(([Icon, label]) => {
        const selected = label === "You";
        return (
          <button
            key={label}
            type="button"
            aria-current={selected ? "page" : undefined}
            className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] font-bold ${selected ? "text-primary" : "text-white/40"}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

export function CanonicalYouScreen() {
  return (
    <div className="mx-auto max-w-[520px]">
      <p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/35">You</p>
      <div className="mx-auto flex min-h-[830px] w-full max-w-[414px] flex-col overflow-hidden rounded-[2.65rem] border border-white/15 bg-black shadow-[0_32px_90px_rgba(0,0,0,.58)]">
        <div className="flex-1 px-5 pb-8 pt-7">
          <header className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-full border border-primary/35 bg-[radial-gradient(circle_at_60%_20%,rgba(255,85,0,.35),transparent_45%),#151516] font-serif text-xl font-black text-[#f6d48a]">
                AM
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Your place in the world</p>
                <h3 className="mt-1 font-serif text-3xl font-bold leading-none text-white">Andre</h3>
              </div>
            </div>
            <button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/45">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </button>
          </header>

          <section className="mt-7 rounded-[1.6rem] border border-white/10 bg-white/[0.035] p-5">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">How you move</p>
            <p className="mt-3 font-serif text-3xl font-bold leading-[0.95] tracking-[-0.035em] text-white">Moves early. Returns with people.</p>
            <p className="mt-3 text-xs leading-5 text-white/42">Identity is inferred from verified participation, not chosen from a gamified personality menu.</p>
          </section>

          <section className="mt-7 border-t border-white/10 pt-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Where you belong</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Kingston After Dark", "Barbican Crew", "Food & Taste"].map((item, index) => (
                <span key={item} className={`rounded-full border px-3 py-2 text-xs font-bold ${index === 0 ? "border-[#f6d48a]/30 bg-[#f6d48a]/[0.07] text-[#f6d48a]" : "border-white/10 bg-white/[0.025] text-white/55"}`}>
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-7 border-t border-white/10 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Latest proof</p>
              <button type="button" className="text-xs font-bold text-primary">Open Vault</button>
            </div>
            <PaperReceipt
              heading="YOU CAME BACK"
              lines={[
                { label: "Scene", value: "Kingston After Dark" },
                { label: "Place", value: "Sea Deck" },
                { label: "Return", value: "2nd verified visit", strong: true },
              ]}
              footer="What happened becomes part of your story only when it can be verified."
            />
          </section>

          <section className="mt-7 border-t border-white/10 pt-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Quiet utility</p>
            <div className="mt-3 divide-y divide-white/10 rounded-[1.4rem] border border-white/10 bg-white/[0.02] px-4">
              {["Saved", "Following", "Activity", "Account & privacy"].map((item) => (
                <button key={item} type="button" className="flex min-h-12 w-full items-center justify-between text-left text-sm font-semibold text-white/60">
                  <span>{item}</span>
                  <span className="text-white/20">→</span>
                </button>
              ))}
            </div>
          </section>
        </div>
        <ConsumerNav />
      </div>
    </div>
  );
}

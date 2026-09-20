import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCreateUserPreferences,
  useUpdateUserPreferences,
  useUserPreferences,
} from "@/hooks/useUserPreferences";
import {
  readStoredTasteCategories,
  TASTE_CATEGORIES,
  writeStoredTasteCategories,
} from "@/lib/taste-profile";

type TasteCalibrationProps = {
  marketLabel?: string;
  compact?: boolean;
};

export function TasteCalibration({ marketLabel = "your market", compact = false }: TasteCalibrationProps) {
  const { user } = useAuth();
  const { data: preferences } = useUserPreferences();
  const createPreferences = useCreateUserPreferences();
  const updatePreferences = useUpdateUserPreferences();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>(() => readStoredTasteCategories());
  const current = TASTE_CATEGORIES[index];
  const complete = index >= TASTE_CATEGORIES.length;
  const saving = createPreferences.isPending || updatePreferences.isPending;

  useEffect(() => {
    if (!preferences?.preferred_categories?.length) return;
    setSelected((existing) => Array.from(new Set([...preferences.preferred_categories, ...existing])));
  }, [preferences?.preferred_categories]);

  const picked = useMemo(
    () => TASTE_CATEGORIES.filter((category) => selected.includes(category.value)),
    [selected],
  );

  function remember(next: string[]) {
    const unique = Array.from(new Set(next));
    setSelected(unique);
    writeStoredTasteCategories(unique);
  }

  function chooseMore() {
    if (!current) return;
    remember([...selected, current.value]);
    setIndex((value) => value + 1);
  }

  function choosePass() {
    setIndex((value) => value + 1);
  }

  function undo() {
    setIndex((value) => Math.max(0, value - 1));
  }

  function reset() {
    setIndex(0);
  }

  async function saveTaste() {
    const payload = { preferred_categories: selected };
    if (preferences) {
      await updatePreferences.mutateAsync(payload);
      return;
    }
    await createPreferences.mutateAsync(payload);
  }

  return (
    <section className={compact ? "" : "border-b border-white/10 bg-[#080808] px-5 py-14 sm:px-6 md:py-20"}>
      <div className={compact ? "" : "mx-auto max-w-[1440px]"}>
        <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-center">
          <div>
            <p className="marketing-kicker">Your taste · not a public vote</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black sm:text-5xl">
              Teach PROMORANG what you want more of.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">
              Quick choices help shape what PROMORANG shows you across {marketLabel}. This is personal preference data. It does not add a voice to a public Want unless you explicitly tap “I want this too” on that Want.
            </p>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-white/30">
              Think taste training, not a one-time onboarding form.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[#111] p-5 sm:p-7">
            {!complete && current ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
                    {index + 1} / {TASTE_CATEGORIES.length}
                  </p>
                  {index > 0 ? (
                    <button type="button" onClick={undo} className="inline-flex min-h-9 items-center gap-1.5 text-xs font-bold text-white/45 hover:text-white">
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                  ) : null}
                </div>

                <div className="mt-8 grid gap-8 sm:grid-cols-[150px_1fr] sm:items-center">
                  <div className="grid aspect-square place-items-center rounded-[1.6rem] border border-white/10 bg-white/[0.04] text-7xl">
                    {current.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.12em] text-white/35">{current.label}</p>
                    <h3 className="mt-3 font-serif text-3xl font-bold leading-tight sm:text-4xl">{current.prompt}</h3>
                    <div className="mt-7 flex flex-wrap gap-3">
                      <button type="button" onClick={choosePass} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-black text-white/70 transition hover:bg-white/[0.06]">
                        <X className="h-4 w-4" /> Not for me
                      </button>
                      <button type="button" onClick={chooseMore} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black transition hover:bg-orange-400">
                        More like this <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Taste pass complete</p>
                  <button type="button" onClick={reset} className="inline-flex min-h-9 items-center gap-1.5 text-xs font-bold text-white/45 hover:text-white">
                    <RotateCcw className="h-3.5 w-3.5" /> Run again
                  </button>
                </div>
                <h3 className="mt-4 font-serif text-4xl font-bold">PROMORANG has a better starting point.</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                  You can keep refining this naturally as you browse. Polls, Moments, Offers and Discoveries should keep asking for small, meaningful signals instead of forcing you through one giant preference form.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {picked.length ? picked.map((category) => (
                    <span key={category.value} className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.045] px-3 py-2 text-xs font-bold text-white/65">
                      <span>{category.emoji}</span>{category.label}
                    </span>
                  )) : <span className="text-sm text-white/40">No categories selected yet. Run the deck again whenever you want.</span>}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {user ? (
                    <button type="button" disabled={saving} onClick={() => void saveTaste()} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black disabled:opacity-50">
                      <Check className="h-4 w-4" /> {saving ? "Saving…" : "Save this to my taste"}
                    </button>
                  ) : (
                    <Link to="/auth?mode=signup&role=participant&next=/card" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black">
                      Keep this on my PromoCard <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  <Link to="/discover" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-black text-white/70">
                    Use my taste to explore
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TasteCalibration;

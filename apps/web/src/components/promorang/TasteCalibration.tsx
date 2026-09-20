import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCreateUserPreferences,
  useUpdateUserPreferences,
  useUserPreferences,
} from "@/hooks/useUserPreferences";
import { useRecordPreferenceSignal } from "@/hooks/usePreferenceSignals";
import {
  MOTIVATION_TRIGGERS,
  readStoredMotivations,
  readStoredTasteCategories,
  TASTE_CATEGORIES,
  writeStoredMotivations,
  writeStoredTasteCategories,
} from "@/lib/taste-profile";
import cookingClass from "@/assets/moments/cooking-class.jpg";
import concert from "@/assets/moment-concert.jpg";
import hiking from "@/assets/moments/hiking.jpg";
import streetArt from "@/assets/moments/street-art.jpg";
import boardGames from "@/assets/moments/board-games.jpg";
import coffeeCode from "@/assets/moments/coffee-code.jpg";
import openMic from "@/assets/moments/open-mic.jpg";
import heroMoments from "@/assets/hero-moments.jpg";

type TasteCalibrationProps = {
  marketLabel?: string;
  compact?: boolean;
  variant?: "default" | "hero";
  mode?: "full" | "taste" | "motivation";
};

const CATEGORY_IMAGES: Record<string, string> = {
  food: cookingClass,
  music: concert,
  outdoor: hiking,
  fitness: hiking,
  arts: streetArt,
  social: boardGames,
  networking: coffeeCode,
  workshop: openMic,
};

const MOTIVATION_IMAGES: Record<string, string> = {
  complimentary: cookingClass,
  exclusive_access: heroMoments,
  early_access: concert,
  bring_friend: boardGames,
  meaningful_savings: coffeeCode,
  points_keys: streetArt,
  paid_gig: openMic,
  special_experience: hiking,
};

export function TasteCalibration({ marketLabel = "your market", compact = false, variant = "default", mode = "full" }: TasteCalibrationProps) {
  const { user } = useAuth();
  const { data: preferences } = useUserPreferences();
  const createPreferences = useCreateUserPreferences();
  const updatePreferences = useUpdateUserPreferences();
  const recordSignal = useRecordPreferenceSignal();
  const [stage, setStage] = useState<"taste" | "motivation" | "done">(() => mode === "motivation" ? "motivation" : "taste");
  const [tasteIndex, setTasteIndex] = useState(0);
  const [motivationIndex, setMotivationIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>(() => readStoredTasteCategories());
  const [motivations, setMotivations] = useState<string[]>(() => readStoredMotivations());

  const currentTaste = TASTE_CATEGORIES[tasteIndex];
  const currentMotivation = MOTIVATION_TRIGGERS[motivationIndex];
  const isHero = variant === "hero";

  useEffect(() => {
    if (!preferences?.preferred_categories?.length) return;
    setSelected((existing) => Array.from(new Set([...preferences.preferred_categories, ...existing])));
  }, [preferences?.preferred_categories]);

  const pickedTaste = useMemo(
    () => TASTE_CATEGORIES.filter((category) => selected.includes(category.value)),
    [selected],
  );
  const pickedMotivations = useMemo(
    () => MOTIVATION_TRIGGERS.filter((item) => motivations.includes(item.value)),
    [motivations],
  );

  async function recordPrivateSignal(input: {
    objectType: string;
    objectKey: string;
    label: string;
    signalType: "more_like_this" | "not_for_me" | "motivation";
    sourceSurface: string;
  }) {
    if (!user) return;
    await recordSignal.mutateAsync(input).catch(() => undefined);
  }

  function rememberTaste(next: string[]) {
    const unique = Array.from(new Set(next));
    setSelected(unique);
    writeStoredTasteCategories(unique);
  }

  function rememberMotivation(next: string[]) {
    const unique = Array.from(new Set(next));
    setMotivations(unique);
    writeStoredMotivations(unique);
  }

  function chooseTaste(like: boolean) {
    if (!currentTaste) return;
    const next = like
      ? Array.from(new Set([...selected, currentTaste.value]))
      : selected.filter((value) => value !== currentTaste.value);
    rememberTaste(next);
    void recordPrivateSignal({
      objectType: "category",
      objectKey: currentTaste.value,
      label: currentTaste.label,
      signalType: like ? "more_like_this" : "not_for_me",
      sourceSurface: isHero ? "homepage_hero_taste" : "taste_calibration",
    });
    if (tasteIndex >= TASTE_CATEGORIES.length - 1) {
      setStage(mode === "taste" ? "done" : "motivation");
    } else {
      setTasteIndex((value) => value + 1);
    }
  }

  function chooseMotivation(like: boolean) {
    if (!currentMotivation) return;
    const next = like
      ? Array.from(new Set([...motivations, currentMotivation.value]))
      : motivations.filter((value) => value !== currentMotivation.value);
    rememberMotivation(next);
    if (like) {
      void recordPrivateSignal({
        objectType: "motivation",
        objectKey: currentMotivation.value,
        label: currentMotivation.label,
        signalType: "motivation",
        sourceSurface: isHero ? "homepage_hero_motivation" : "taste_calibration",
      });
    }
    if (motivationIndex >= MOTIVATION_TRIGGERS.length - 1) setStage("done");
    else setMotivationIndex((value) => value + 1);
  }

  function back() {
    if (stage === "motivation" && motivationIndex === 0) {
      if (mode === "full") {
        setStage("taste");
        setTasteIndex(TASTE_CATEGORIES.length - 1);
      }
      return;
    }
    if (stage === "motivation") setMotivationIndex((value) => Math.max(0, value - 1));
    else if (stage === "taste") setTasteIndex((value) => Math.max(0, value - 1));
  }

  function reset() {
    setStage(mode === "motivation" ? "motivation" : "taste");
    setTasteIndex(0);
    setMotivationIndex(0);
  }

  async function saveTaste() {
    const payload = { preferred_categories: selected };
    if (preferences) await updatePreferences.mutateAsync(payload);
    else await createPreferences.mutateAsync(payload);
  }

  if (isHero) {
    const done = stage === "done";
    const activeItems = stage === "motivation" ? MOTIVATION_TRIGGERS : TASTE_CATEGORIES;
    const activeIndex = stage === "motivation" ? motivationIndex : tasteIndex;
    const activeItem = stage === "motivation" ? currentMotivation : currentTaste;
    const activeImage = activeItem
      ? (stage === "motivation" ? MOTIVATION_IMAGES[activeItem.value] : CATEGORY_IMAGES[activeItem.value])
      : heroMoments;

    if (done) {
      return (
        <section className="relative z-20">
          <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-black/75 p-6 shadow-[0_28px_90px_rgba(0,0,0,.46)] backdrop-blur-xl sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <p className="marketing-kicker">Your taste is taking shape</p>
              <button type="button" onClick={reset} className="inline-flex min-h-9 items-center gap-1.5 text-xs font-bold text-white/45 hover:text-white">
                <RotateCcw className="h-3.5 w-3.5" /> Run again
              </button>
            </div>
            <h2 className="mt-4 max-w-xl text-3xl font-black leading-[.95] sm:text-4xl">Now tell PROMORANG what deserves to come back to you.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">Your choices shape personalization. Public Wants are still separate, so liking something does not pretend the market has demand that was never expressed.</p>
            <div className="mt-5 flex max-h-24 flex-wrap gap-2 overflow-hidden">
              {[...pickedTaste.map((item) => ({ key: "taste:" + item.value, label: item.emoji + " " + item.label })), ...pickedMotivations.map((item) => ({ key: "motivation:" + item.value, label: item.emoji + " " + item.label }))].map((item) => (
                <span key={item.key} className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 text-xs font-bold text-white/70">{item.label}</span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {user ? (
                <button type="button" onClick={() => void saveTaste()} disabled={createPreferences.isPending || updatePreferences.isPending} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-orange-500 px-5 text-xs font-black text-black disabled:opacity-50">
                  <Check className="h-4 w-4" /> Save to my PromoCard
                </button>
              ) : (
                <Link to="/auth?mode=signup&role=participant&next=/card" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-orange-500 px-5 text-xs font-black text-black">
                  Keep this on my PromoCard <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link to="/discover" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-black text-white/75">
                Explore with my taste
              </Link>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="relative z-20">
        <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-black/78 shadow-[0_28px_90px_rgba(0,0,0,.46)] backdrop-blur-xl">
          <div className="grid md:grid-cols-[.96fr_1.04fr]">
            <div className="relative min-h-[270px] overflow-hidden md:min-h-[430px]">
              <img src={activeImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-85" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/10" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/25" />
              <div className="relative flex min-h-[270px] flex-col justify-between p-5 md:min-h-[430px] md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="inline-flex items-center rounded-full border border-white/18 bg-black/45 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                    {stage === "motivation" ? "02 · Motivation" : "01 · Desire"}
                  </p>
                  <p className="rounded-full bg-black/45 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-orange-200 backdrop-blur">
                    {activeIndex + 1} / {activeItems.length}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
                    {stage === "motivation" ? "What would move you?" : "What are you into?"}
                  </p>
                  <h2 className="mt-3 max-w-[12ch] text-4xl font-black leading-[.9] tracking-[-.04em] text-white">
                    {stage === "motivation" ? currentMotivation?.label : currentTaste?.label}
                  </h2>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/72">
                    {stage === "motivation"
                      ? currentMotivation?.detail
                      : currentTaste?.prompt}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between p-5 sm:p-6">
              <div>
                <p className="marketing-kicker">{stage === "motivation" ? "What could change the decision?" : "Teach PROMORANG your taste"}</p>
                <h3 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">
                  {stage === "motivation"
                    ? "Would this make you more likely to act?"
                    : "More like this—or not for me?"}
                </h3>
                <p className="mt-3 text-xs leading-5 text-white/48">
                  {stage === "motivation"
                    ? "This is private motivation data. It helps PROMORANG understand what kind of value turns interest into action."
                    : "This is private personalization. It trains what you see without adding a vote to the public market."}
                </p>

                <div className="mt-5 grid grid-cols-4 gap-2">
                  {activeItems.map((item, index) => {
                    const image = stage === "motivation" ? MOTIVATION_IMAGES[item.value] : CATEGORY_IMAGES[item.value];
                    const chosen = stage === "motivation" ? motivations.includes(item.value) : selected.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => stage === "motivation" ? setMotivationIndex(index) : setTasteIndex(index)}
                        aria-label={item.label}
                        className={"group relative aspect-square overflow-hidden rounded-xl border transition " + (index === activeIndex ? "border-orange-400 ring-2 ring-orange-400/20" : chosen ? "border-white/30" : "border-white/10 hover:border-white/30")}
                      >
                        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                        {chosen ? <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-orange-500 text-black"><Check className="h-3 w-3" /></span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-5">
                <div className="flex flex-wrap gap-2">
                  {((stage === "motivation" && motivationIndex > 0) || (stage === "taste" && tasteIndex > 0)) ? (
                    <button type="button" onClick={back} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 px-4 text-xs font-bold text-white/50">
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => stage === "motivation" ? chooseMotivation(false) : chooseTaste(false)}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-white/15 px-4 text-xs font-black text-white/72"
                  >
                    <X className="h-4 w-4" /> {stage === "motivation" ? "Not really" : "Not for me"}
                  </button>
                  <button
                    type="button"
                    onClick={() => stage === "motivation" ? chooseMotivation(true) : chooseTaste(true)}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-orange-500 px-4 text-xs font-black text-black"
                  >
                    {stage === "motivation" ? <Check className="h-4 w-4" /> : <span>♥</span>}
                    {stage === "motivation" ? "Yes, that moves me" : "More like this"}
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4 text-[9px] font-black uppercase tracking-[0.14em] text-white/30">
                  <span>Taste trains your feed</span>
                  <span>Wants move the market</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const shellClass = compact
    ? ""
    : "border-b border-white/10 bg-[#080808] px-5 py-14 sm:px-6 md:py-20";
  const innerClass = compact || isHero ? "" : "mx-auto max-w-[1440px]";

  return (
    <section className={shellClass}>
      <div className={innerClass}>
        <div className={isHero ? "grid gap-6 xl:grid-cols-[.64fr_1.36fr] xl:items-end" : "grid gap-8 lg:grid-cols-[.68fr_1.32fr] lg:items-center"}>
          <div>
            <p className="marketing-kicker">{stage === "motivation" ? "What would move you?" : "Make it personal"}</p>
            <h2 className={isHero ? "mt-3 max-w-3xl text-3xl font-black sm:text-4xl" : "mt-3 max-w-3xl text-4xl font-black sm:text-5xl"}>
              {stage === "taste" ? "What are you in the mood for?" : stage === "motivation" ? "What could move you?" : "PROMORANG has a better starting point."}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">
              {stage === "taste"
                ? "Quick choices teach PROMORANG your taste across " + marketLabel + ". This is private personalization—not a public vote."
                : stage === "motivation"
                  ? "If the right Offer is not already there, tell PROMORANG what would make the move worthwhile: access, a complimentary extra, meaningful savings, Points, a Key, a paid Gig or a memorable experience."
                  : "Your taste and motivation profile helps PROMORANG decide what deserves to come back to you. Public Wants are still counted separately."}
            </p>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-white/30">
              Taste trains the feed · Wants move the market
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[#0e0e0e]/95 p-4 shadow-[0_24px_80px_rgba(0,0,0,.36)] sm:p-6">
            {stage === "taste" && currentTaste ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {TASTE_CATEGORIES.map((category, index) => {
                    const active = index === tasteIndex;
                    const chosen = selected.includes(category.value);
                    return (
                      <button
                        type="button"
                        key={category.value}
                        onClick={() => setTasteIndex(index)}
                        className={"group relative min-h-[138px] overflow-hidden rounded-[1.35rem] border text-left transition " + (active ? "border-orange-400/80 ring-2 ring-orange-400/20" : chosen ? "border-white/25" : "border-white/10 hover:border-white/25")}
                      >
                        <img src={CATEGORY_IMAGES[category.value]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-72 transition duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />
                        <div className="relative flex min-h-[138px] flex-col justify-end p-4">
                          <p className="text-sm font-black text-white">{category.label}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/55">{chosen ? "More like this" : "Tap to answer"}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">{tasteIndex + 1} / {TASTE_CATEGORIES.length} · {currentTaste.label}</p>
                    <p className="mt-2 font-serif text-2xl font-bold sm:text-3xl">{currentTaste.prompt}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tasteIndex > 0 ? <button type="button" onClick={back} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 px-4 text-xs font-bold text-white/50"><ArrowLeft className="h-3.5 w-3.5" /> Back</button> : null}
                    <button type="button" onClick={() => chooseTaste(false)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-xs font-black text-white/70"><X className="h-4 w-4" /> Not for me</button>
                    <button type="button" onClick={() => chooseTaste(true)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-orange-500 px-5 text-xs font-black text-black"><span>♥</span> More like this</button>
                  </div>
                </div>
              </>
            ) : stage === "motivation" && currentMotivation ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {MOTIVATION_TRIGGERS.map((item, index) => {
                    const active = index === motivationIndex;
                    const chosen = motivations.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setMotivationIndex(index)}
                        className={"group relative min-h-[138px] overflow-hidden rounded-[1.35rem] border text-left transition " + (active ? "border-orange-400/80 ring-2 ring-orange-400/20" : chosen ? "border-white/25" : "border-white/10 hover:border-white/25")}
                      >
                        <img src={MOTIVATION_IMAGES[item.value]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-62 transition duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/15" />
                        <div className="relative flex min-h-[138px] flex-col justify-end p-4">
                          <p className="text-sm font-black text-white">{item.emoji} {item.label}</p>
                          <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-white/55">{item.detail}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">{motivationIndex + 1} / {MOTIVATION_TRIGGERS.length} · Motivation</p>
                    <p className="mt-2 font-serif text-2xl font-bold sm:text-3xl">Would {currentMotivation.label.toLowerCase()} make you more likely to act?</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {motivationIndex > 0 ? <button type="button" onClick={back} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 px-4 text-xs font-bold text-white/50"><ArrowLeft className="h-3.5 w-3.5" /> Back</button> : null}
                    <button type="button" onClick={() => chooseMotivation(false)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-xs font-black text-white/70"><X className="h-4 w-4" /> Not really</button>
                    <button type="button" onClick={() => chooseMotivation(true)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-orange-500 px-5 text-xs font-black text-black"><Check className="h-4 w-4" /> Yes, that moves me</button>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Taste + motivation pass complete</p>
                  <button type="button" onClick={reset} className="inline-flex min-h-9 items-center gap-1.5 text-xs font-bold text-white/45 hover:text-white"><RotateCcw className="h-3.5 w-3.5" /> Run again</button>
                </div>
                <h3 className="mt-4 font-serif text-4xl font-bold">Now PROMORANG knows more than what you like.</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">It also knows the kinds of value that can turn interest into action. Keep refining this naturally as you browse.</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[...pickedTaste.map((item) => ({ key: "taste:" + item.value, label: item.emoji + " " + item.label })), ...pickedMotivations.map((item) => ({ key: "motivation:" + item.value, label: item.emoji + " " + item.label }))].map((item) => (
                    <span key={item.key} className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.045] px-3 py-2 text-xs font-bold text-white/65">{item.label}</span>
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  {user ? (
                    <button type="button" onClick={() => void saveTaste()} disabled={createPreferences.isPending || updatePreferences.isPending} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black disabled:opacity-50"><Check className="h-4 w-4" /> Save to my taste</button>
                  ) : (
                    <Link to="/auth?mode=signup&role=participant&next=/card" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black">Keep this on my PromoCard <ArrowRight className="h-4 w-4" /></Link>
                  )}
                  <Link to="/discover" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-black text-white/70">Use my taste to explore</Link>
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

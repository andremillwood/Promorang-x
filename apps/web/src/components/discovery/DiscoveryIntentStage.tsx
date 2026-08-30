import { PenLine, X } from "lucide-react";
import { TactileButton } from "@/components/ui/TactileButton";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";
import { intentWords, type DiscoverLensId } from "@/lib/discovery-path";
import { cn } from "@/lib/utils";
import cookingClass from "@/assets/moments/cooking-class.jpg";
import jazzNight from "@/assets/moments/jazz-night.jpg";
import coffeeMeetup from "@/assets/moment-coffee-meetup.jpg";
import streetArt from "@/assets/moments/street-art.jpg";

const STILLS: Record<
  DiscoverLensId,
  { image: string; stamp: string; tilt: string; focus: string }
> = {
  eat: { image: cookingClass, stamp: "01", tilt: "-rotate-[1.6deg]", focus: "object-[50%_60%]" },
  go_out: { image: jazzNight, stamp: "02", tilt: "rotate-[1.2deg]", focus: "object-[50%_28%]" },
  hang: { image: coffeeMeetup, stamp: "03", tilt: "-rotate-[0.8deg]", focus: "object-center" },
  try: { image: streetArt, stamp: "04", tilt: "rotate-[1.8deg]", focus: "object-[40%_40%]" },
};

export const INTENT_LENSES: Array<{
  id: DiscoverLensId;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}> = [
  { id: "eat", titleKey: "discover.pathLensEat", descKey: "discover.pathLensEatDesc" },
  { id: "go_out", titleKey: "discover.pathLensGoOut", descKey: "discover.pathLensGoOutDesc" },
  { id: "hang", titleKey: "discover.pathLensHang", descKey: "discover.pathLensHangDesc" },
  { id: "try", titleKey: "discover.pathLensTry", descKey: "discover.pathLensTryDesc" },
];

type DiscoveryIntentStageProps = {
  cityName: string;
  surface: "page" | "home";
  lens: DiscoverLensId | null;
  namedIntent: boolean;
  otherActive: boolean;
  inferred: DiscoverLensId[];
  intentFieldId: string;
  draftQuery: string;
  query: string;
  onDraftQuery: (value: string) => void;
  onChooseLens: (id: DiscoverLensId) => void;
  onChooseQuery: (value: string) => void;
  onClearQuery: () => void;
};

export function DiscoveryIntentStage({
  cityName,
  surface,
  lens,
  namedIntent,
  otherActive,
  inferred,
  intentFieldId,
  draftQuery,
  query,
  onDraftQuery,
  onChooseLens,
  onChooseQuery,
  onClearQuery,
}: DiscoveryIntentStageProps) {
  const { t } = useI18n();
  const showTasteHint = inferred.length > 0 && inferred.length < INTENT_LENSES.length;

  return (
    <header className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#0a0807] shadow-[0_30px_80px_-32px_rgba(0,0,0,.85)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,85,0,.22),transparent_36%),radial-gradient(circle_at_92%_100%,rgba(255,180,40,.1),transparent_38%)]" />
      <div className="pr-night-grain pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative px-5 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-orange-300/25 bg-black/40 px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-orange-200">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(255,85,0,.9)]" />
              {t(surface === "home" ? "discover.pathHomeEyebrow" : "discover.pathEyebrow", { city: cityName })}
            </p>
            <h2 className="mt-3 max-w-xl font-serif text-[clamp(2.1rem,5vw,3.6rem)] font-bold leading-[0.92] tracking-tight text-white">
              {t(surface === "home" ? "discover.pathHomeTitle" : "discover.pathTitle")}
            </h2>
          </div>
          {surface === "home" ? (
            <p className="hidden max-w-[16rem] text-right text-xs leading-5 text-white/45 sm:block">
              {t("discover.pathHomeCopy")}
            </p>
          ) : (
            <p className="max-w-sm text-sm leading-6 text-white/55">
              {t("discover.pathCopy")}
            </p>
          )}
        </div>

        <div
          className={cn(
            "mt-6 grid gap-3",
            namedIntent ? "grid-cols-4" : "grid-cols-2 lg:grid-cols-4",
          )}
        >
          {INTENT_LENSES.map((item) => {
            const still = STILLS[item.id];
            const active = lens === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChooseLens(item.id)}
                aria-pressed={active}
                className={cn(
                  "group relative text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                  namedIntent ? "" : "motion-safe:odd:-translate-y-1 motion-safe:even:translate-y-1",
                )}
              >
                <span
                  className={cn(
                    "relative block overflow-hidden rounded-[1.15rem] border bg-[#16110d] shadow-[0_18px_40px_-22px_rgba(0,0,0,.9)] transition duration-300",
                    namedIntent ? "h-[4.6rem] sm:h-[5.4rem]" : "h-[11.5rem] sm:h-[15.5rem]",
                    still.tilt,
                    active
                      ? "border-orange-300 ring-2 ring-orange-400/70 motion-safe:scale-[1.03]"
                      : "border-white/10 group-hover:border-white/30 motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:scale-[1.02]",
                  )}
                >
                  <img
                    src={still.image}
                    alt=""
                    className={cn(
                      "absolute inset-0 h-full w-full object-cover transition duration-500",
                      still.focus,
                      active ? "scale-105 saturate-110" : "group-hover:scale-110",
                    )}
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/10" />
                  <span className="absolute left-2.5 top-2.5 font-mono text-[10px] font-black tracking-[0.2em] text-white/80">
                    {still.stamp}
                  </span>
                  {showTasteHint && inferred.includes(item.id) ? (
                    <span className="absolute right-2.5 top-2.5 rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-black">
                      {t("discover.pathFromTaste")}
                    </span>
                  ) : null}
                  <span className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
                    <span className={cn("block font-serif font-bold text-white", namedIntent ? "text-sm" : "text-xl sm:text-2xl")}>
                      {t(item.titleKey)}
                    </span>
                    {namedIntent ? null : (
                      <span className="mt-0.5 hidden text-[11px] leading-4 text-white/70 sm:block">
                        {t(item.descKey)}
                      </span>
                    )}
                  </span>
                  {active ? (
                    <span className="absolute bottom-2.5 right-2.5 rounded-sm bg-orange-400 px-1.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-[0.16em] text-black">
                      {t("discover.pathTicketLive")}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>

        <form
          className={cn(
            "pr-night-stub mt-4 overflow-hidden rounded-[1.2rem] border",
            otherActive ? "border-orange-400 bg-orange-500/10" : "border-white/12 bg-black/45",
          )}
          onSubmit={(event) => {
            event.preventDefault();
            onChooseQuery(draftQuery);
          }}
        >
          <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
            <label htmlFor={intentFieldId} className="min-w-[7.5rem] font-mono text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
              <span className="inline-flex items-center gap-1.5">
                <PenLine className="h-3.5 w-3.5" />
                {t("discover.pathWriteStub")}
              </span>
            </label>
            <input
              id={intentFieldId}
              value={draftQuery}
              onChange={(event) => onDraftQuery(event.target.value)}
              placeholder={t("discover.pathOtherPlaceholder")}
              className="min-h-11 flex-1 rounded-xl border border-white/10 bg-black/50 px-3 text-sm text-white placeholder:text-white/35 focus:border-orange-400 focus:outline-none"
            />
            <TactileButton type="submit" variant="primary" disabled={!intentWords(draftQuery).length}>
              {t("discover.pathOtherCta")}
            </TactileButton>
          </div>
          {otherActive ? (
            <p className="flex items-center justify-between gap-3 border-t border-dashed border-orange-300/30 px-4 py-2 text-xs text-orange-100">
              <span>{t("discover.pathUsing", { query })}</span>
              <button
                type="button"
                onClick={onClearQuery}
                className="inline-flex items-center gap-1 font-bold text-white/70 hover:text-white"
              >
                <X className="h-3 w-3" />
                {t("discover.pathClearAsk")}
              </button>
            </p>
          ) : null}
        </form>
      </div>
    </header>
  );
}

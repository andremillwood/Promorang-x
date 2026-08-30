import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Compass, PenLine, SkipForward, Utensils, MoonStar, Users, Sparkles, X } from "lucide-react";
import { NightTrail, PaperReceipt } from "@/components/promorang/SignatureObjects";
import { TactileButton } from "@/components/ui/TactileButton";
import { DiscoveryWidget } from "@/components/radar/DiscoveryWidget";
import { AskQuestionModal } from "@/components/discovery/AskQuestionModal";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";
import type { DiscoveryPoll } from "@/data/discoveriesData";
import {
  buildDiscoveryPath,
  DISCOVER_LENS_STORAGE_KEY,
  DISCOVER_QUERY_STORAGE_KEY,
  DISCOVER_SKIPPED_STORAGE_KEY,
  DISCOVER_VOTED_STORAGE_KEY,
  discoveryHref,
  inferLensesFromPreferences,
  intentMatchCount,
  intentWords,
  isDiscoverLensId,
  readStoredIdList,
  writeStoredDiscoverQuery,
  writeStoredIdList,
  type DiscoverLensId,
  type PathWhy,
} from "@/lib/discovery-path";
import { recordDiscoveryNamedIntent } from "@/hooks/useDiscoveryDemand";
import { cn } from "@/lib/utils";

const LENSES: Array<{
  id: DiscoverLensId;
  icon: typeof Utensils;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}> = [
  { id: "eat", icon: Utensils, titleKey: "discover.pathLensEat", descKey: "discover.pathLensEatDesc" },
  { id: "go_out", icon: MoonStar, titleKey: "discover.pathLensGoOut", descKey: "discover.pathLensGoOutDesc" },
  { id: "hang", icon: Users, titleKey: "discover.pathLensHang", descKey: "discover.pathLensHangDesc" },
  { id: "try", icon: Sparkles, titleKey: "discover.pathLensTry", descKey: "discover.pathLensTryDesc" },
];

function whyCopy(
  why: PathWhy,
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string,
): string {
  const lensLabel = why.lens
    ? t(LENSES.find((lens) => lens.id === why.lens)?.titleKey || "discover.pathLensTry")
    : t("discover.pathLensTry");
  const perk = why.perk || t("discover.pathFallbackPerk");
  if (why.kind === "close") {
    return t("discover.pathWhyClose", {
      lens: lensLabel,
      city: why.city,
      votes: why.votesRemaining,
      perk,
    });
  }
  if (why.kind === "taste") {
    return t("discover.pathWhyTaste", { lens: lensLabel, city: why.city });
  }
  if (why.kind === "query") {
    return t("discover.pathWhyQuery", { query: why.query, city: why.city });
  }
  return t("discover.pathWhyCity", { city: why.city, perk });
}

type DiscoveryPathProps = {
  polls: DiscoveryPoll[];
  cityName: string;
  preferredCategories?: string[];
  initialLens?: string | null;
  initialQuery?: string | null;
  onQuestionCreated?: (poll: DiscoveryPoll) => void;
  onVoted?: (pollId: string) => void;
  onCastVote?: (poll: DiscoveryPoll, optionId: string) => void | Promise<void>;
  syncUrl?: boolean;
  surface?: "page" | "home";
};

export function DiscoveryPath({
  polls,
  cityName,
  preferredCategories = [],
  initialLens = null,
  initialQuery = null,
  onQuestionCreated,
  onVoted,
  onCastVote,
  syncUrl = true,
  surface = "page",
}: DiscoveryPathProps) {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentRef = useRef<HTMLElement | null>(null);
  const inferred = inferLensesFromPreferences(preferredCategories);
  const intentFieldId = surface === "home" ? "home-discover-intent" : "discover-intent";
  const [lens, setLens] = useState<DiscoverLensId | null>(() => {
    if (intentWords(initialQuery).length) return null;
    if (isDiscoverLensId(initialLens)) return initialLens;
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(DISCOVER_LENS_STORAGE_KEY);
      if (isDiscoverLensId(stored)) return stored;
    }
    return null;
  });
  const [query, setQuery] = useState(() => {
    if (intentWords(initialQuery).length) return (initialQuery || "").trim();
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(DISCOVER_QUERY_STORAGE_KEY) || "";
  });
  const [draftQuery, setDraftQuery] = useState(query);
  const [votedIds, setVotedIds] = useState<string[]>(() => readStoredIdList(DISCOVER_VOTED_STORAGE_KEY));
  const [skippedIds, setSkippedIds] = useState<string[]>(() => readStoredIdList(DISCOVER_SKIPPED_STORAGE_KEY));
  const [justVotedId, setJustVotedId] = useState<string | null>(null);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [intentTick, setIntentTick] = useState(0);

  const syncQueryParam = (nextQuery: string, nextLens: DiscoverLensId | null) => {
    if (!syncUrl) return;
    const next = new URLSearchParams(searchParams);
    next.set("tab", "discoveries");
    if (intentWords(nextQuery).length) {
      next.set("q", nextQuery.trim());
      next.delete("lens");
    } else {
      next.delete("q");
      if (nextLens) next.set("lens", nextLens);
      else next.delete("lens");
    }
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if (intentWords(initialQuery).length) {
      const next = (initialQuery || "").trim();
      setLens(null);
      setQuery(next);
      setDraftQuery(next);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (isDiscoverLensId(initialLens) && !intentWords(initialQuery).length) {
      setLens(initialLens);
      setQuery("");
    }
  }, [initialLens, initialQuery]);

  useEffect(() => {
    if (lens) {
      window.localStorage.setItem(DISCOVER_LENS_STORAGE_KEY, lens);
      writeStoredDiscoverQuery("");
    }
  }, [lens]);

  useEffect(() => {
    if (!intentTick) return;
    currentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [intentTick]);

  const namedIntent = Boolean(lens || intentWords(query).length);
  const otherActive = !lens && intentWords(query).length > 0;
  const showTasteHint = inferred.length > 0 && inferred.length < LENSES.length;

  const path = useMemo(
    () =>
      buildDiscoveryPath({
        polls,
        lenses: lens ? [lens] : [],
        query,
        votedIds: votedIds.filter((id) => id !== justVotedId),
        skippedIds,
        cityName,
        limit: 4,
      }),
    [polls, lens, query, votedIds, skippedIds, cityName, justVotedId],
  );

  const hasLiveMatch = polls.some(
    (poll) => intentMatchCount(poll, lens ? [lens] : [], query) > 0,
  );

  const current = path[0] || null;
  const upcoming = path.slice(1);
  const rest = polls.filter(
    (poll) => !path.some((item) => item.poll.id === poll.id) && !votedIds.includes(poll.id),
  );

  const chooseLens = (next: DiscoverLensId) => {
    setLens(next);
    setQuery("");
    setDraftQuery("");
    setJustVotedId(null);
    setSkippedIds([]);
    writeStoredIdList(DISCOVER_SKIPPED_STORAGE_KEY, []);
    writeStoredDiscoverQuery("");
    syncQueryParam("", next);
    setIntentTick((tick) => tick + 1);
  };

  const chooseQuery = (value: string) => {
    const next = value.trim();
    if (!intentWords(next).length) return;
    setLens(null);
    setQuery(next);
    setDraftQuery(next);
    setJustVotedId(null);
    setSkippedIds([]);
    writeStoredIdList(DISCOVER_SKIPPED_STORAGE_KEY, []);
    window.localStorage.removeItem(DISCOVER_LENS_STORAGE_KEY);
    writeStoredDiscoverQuery(next);
    syncQueryParam(next, null);
    setIntentTick((tick) => tick + 1);
    void recordDiscoveryNamedIntent(cityName, next);
  };

  const clearQuery = () => {
    setQuery("");
    setDraftQuery("");
    setJustVotedId(null);
    writeStoredDiscoverQuery("");
    syncQueryParam("", null);
  };

  const markVoted = (pollId: string) => {
    setJustVotedId(pollId);
    setVotedIds((prev) => {
      if (prev.includes(pollId)) return prev;
      const next = [...prev, pollId];
      writeStoredIdList(DISCOVER_VOTED_STORAGE_KEY, next);
      onVoted?.(pollId);
      return next;
    });
  };

  const skipCurrent = () => {
    if (!current) return;
    setJustVotedId(null);
    setSkippedIds((prev) => {
      if (prev.includes(current.poll.id)) return prev;
      const next = [...prev, current.poll.id];
      writeStoredIdList(DISCOVER_SKIPPED_STORAGE_KEY, next);
      return next;
    });
  };

  const continuePath = () => setJustVotedId(null);

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(255,85,0,.16),transparent_42%),linear-gradient(180deg,#141210,#0a0a0b)] px-5 py-6 sm:px-8 sm:py-8">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-300">
          {t(surface === "home" ? "discover.pathHomeEyebrow" : "discover.pathEyebrow", { city: cityName })}
        </p>
        <h2 className="mt-2 max-w-2xl font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {t(surface === "home" ? "discover.pathHomeTitle" : "discover.pathTitle")}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
          {t(surface === "home" ? "discover.pathHomeCopy" : "discover.pathCopy")}
        </p>

        <div className={cn("mt-6 grid gap-3", namedIntent ? "grid-cols-2 sm:grid-cols-4" : "sm:grid-cols-2")}>
          {LENSES.map((item) => {
            const Icon = item.icon;
            const active = lens === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseLens(item.id)}
                aria-pressed={active}
                className={cn(
                  "flex items-start gap-3 rounded-[1.3rem] border text-left transition",
                  namedIntent ? "min-h-[3.4rem] px-3 py-2.5" : "min-h-[5.5rem] px-4 py-3.5",
                  active
                    ? "border-orange-400 bg-orange-500 text-black shadow-[0_0_28px_rgba(255,85,0,.28)]"
                    : "border-white/10 bg-black/40 text-white hover:border-white/25 hover:bg-white/[0.05]",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex shrink-0 items-center justify-center rounded-full",
                    namedIntent ? "h-7 w-7" : "h-9 w-9",
                    active ? "bg-black text-orange-300" : "bg-white/10 text-orange-300",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className={cn("block font-serif font-bold", namedIntent ? "text-sm" : "text-lg")}>
                    {t(item.titleKey)}
                  </span>
                  {namedIntent ? null : (
                    <span className={cn("mt-0.5 block text-xs leading-5", active ? "text-black/70" : "text-white/50")}>
                      {t(item.descKey)}
                      {showTasteHint && inferred.includes(item.id) ? ` · ${t("discover.pathFromTaste")}` : ""}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <form
          className={cn(
            "mt-3 rounded-[1.3rem] border px-4 py-3",
            otherActive ? "border-orange-400 bg-orange-500/10" : "border-white/10 bg-black/30",
          )}
          onSubmit={(event) => {
            event.preventDefault();
            chooseQuery(draftQuery);
          }}
        >
          <label htmlFor={intentFieldId} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">
            <PenLine className="h-3.5 w-3.5" />
            {t("discover.pathOtherTitle")}
          </label>
          <p className="mt-1 text-xs leading-5 text-white/50">{t("discover.pathOtherCopy")}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              id={intentFieldId}
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder={t("discover.pathOtherPlaceholder")}
              className="min-h-11 flex-1 rounded-xl border border-white/15 bg-black/60 px-3 text-sm text-white placeholder:text-white/30 focus:border-orange-400 focus:outline-none"
            />
            <TactileButton type="submit" variant="primary" disabled={!intentWords(draftQuery).length}>
              {t("discover.pathOtherCta")}
            </TactileButton>
          </div>
          {otherActive ? (
            <p className="mt-3 inline-flex items-center gap-2 text-xs text-orange-200">
              <span>{t("discover.pathUsing", { query })}</span>
              <button
                type="button"
                onClick={clearQuery}
                className="inline-flex items-center gap-1 font-bold text-white/60 hover:text-white"
              >
                <X className="h-3 w-3" />
                {t("discover.pathClearAsk")}
              </button>
            </p>
          ) : null}
        </form>
      </header>

      {!namedIntent && surface === "page" ? (
        <NightTrail
          eyebrow={t("discover.pathHowEyebrow")}
          title={t("discover.pathHowTitle")}
          steps={[
            { label: "01", title: t("discover.pathStep1Title"), text: t("discover.pathStep1Copy") },
            { label: "02", title: t("discover.pathStep2Title"), text: t("discover.pathStep2Copy") },
            { label: "03", title: t("discover.pathStep3Title"), text: t("discover.pathStep3Copy") },
            { label: "04", title: t("discover.pathStep4Title"), text: t("discover.pathStep4Copy") },
          ]}
        />
      ) : namedIntent && current ? (
        <section ref={currentRef} className="space-y-5 scroll-mt-24" aria-labelledby="discover-current-move">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200/80">
                {otherActive
                  ? t(votedIds.includes(current.poll.id) ? "discover.pathUsedEyebrow" : "discover.pathHitEyebrow")
                  : t("discover.pathPosition", { current: 1, total: path.length })}
              </p>
              <h3 id="discover-current-move" className="mt-1 font-serif text-2xl font-bold text-white">
                {otherActive
                  ? t(votedIds.includes(current.poll.id) ? "discover.pathUsedTitle" : "discover.pathHitTitle")
                  : t("discover.pathCurrent")}
              </h3>
              <p className="mt-1 max-w-xl text-sm leading-6 text-white/55">
                {otherActive && votedIds.includes(current.poll.id)
                  ? t("discover.pathUsedCopy", {
                      query,
                      perk: current.poll.targetUnlockPerk || t("discover.pathFallbackPerk"),
                    })
                  : whyCopy(current.why, t)}
              </p>
            </div>
            <button
              type="button"
              onClick={skipCurrent}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white"
            >
              <SkipForward className="h-3.5 w-3.5" />
              {t("discover.pathSkip")}
            </button>
          </div>

          <DiscoveryWidget
            key={current.poll.id}
            {...current.poll}
            onVote={(pollId, optionId) => {
              void onCastVote?.(current.poll, optionId);
              markVoted(pollId);
            }}
          />

          {votedIds.includes(current.poll.id) ? (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_1fr] lg:items-center">
              <PaperReceipt
                heading={t("discover.pathReceiptHeading")}
                lines={[
                  { label: t("discover.pathReceiptChose"), value: current.poll.question, strong: true },
                  {
                    label: t("discover.pathReceiptUnlock"),
                    value: current.poll.targetUnlockPerk || t("discover.pathFallbackPerk"),
                    strong: true,
                  },
                  {
                    label: t("discover.pathReceiptNext"),
                    value: upcoming[0]?.poll.question || t("discover.pathReceiptBrowse"),
                  },
                ]}
                footer={t("discover.pathReceiptFooter", { city: cityName })}
              />
              <div className="space-y-3">
                <p className="text-sm leading-6 text-white/60">
                  {otherActive ? t("discover.pathUsedNext") : t("discover.pathAfterVote")}
                </p>
                <div className="flex flex-wrap gap-3">
                  <TactileButton variant="primary" asChild>
                    <Link to={discoveryHref(current.poll)}>
                      {t("discover.pathOpenMatch")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </TactileButton>
                  {upcoming[0] ? (
                    <TactileButton variant="obsidian" onClick={continuePath}>
                      {t("discover.pathContinue")}
                    </TactileButton>
                  ) : current.poll.connectedScene?.slug ? (
                    <TactileButton variant="obsidian" asChild>
                      <Link to={`/scenes/${current.poll.connectedScene.slug}`}>
                        {t("discover.pathOpenScene", { scene: current.poll.connectedScene.title })}
                      </Link>
                    </TactileButton>
                  ) : (
                    <TactileButton variant="obsidian" asChild>
                      <Link to="/discover?tab=perks">{t("discover.pathDonePerks")}</Link>
                    </TactileButton>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {upcoming.length > 0 ? (
            <ol className="space-y-0 border-t border-white/10 pt-5">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                {t("discover.pathComing")}
              </p>
              {upcoming.map((item, index) => (
                <li key={item.poll.id} className="border-l border-white/10 py-3 pl-4">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-amber-200/70">
                    {t("discover.pathUpNext", { n: index + 2 })}
                  </p>
                  <p className="mt-1 font-serif text-lg font-bold text-white">{item.poll.question}</p>
                  <p className="mt-1 text-xs leading-5 text-white/45">{whyCopy(item.why, t)}</p>
                </li>
              ))}
            </ol>
          ) : null}
        </section>
      ) : namedIntent ? (
        <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          {hasLiveMatch ? (
            <>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
                {t("discover.pathDoneEyebrow")}
              </p>
              <h3 className="mt-2 font-serif text-2xl font-bold text-white">{t("discover.pathDoneTitle")}</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
                {t("discover.pathDoneCopy", { city: cityName })}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <TactileButton variant="primary" asChild>
                  <Link to="/discover?tab=perks">
                    {t("discover.pathDonePerks")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </TactileButton>
                <TactileButton variant="obsidian" onClick={() => setBrowseOpen(true)}>
                  {t("discover.pathBrowseRest")}
                </TactileButton>
              </div>
            </>
          ) : (
            <>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
                {t("discover.pathMissEyebrow")}
              </p>
              <h3 className="mt-2 font-serif text-2xl font-bold text-white">{t("discover.pathMissTitle")}</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
                {t("discover.pathMissCopy", {
                  city: cityName,
                  want: query || (lens ? t(LENSES.find((item) => item.id === lens)?.titleKey || "discover.pathLensTry") : t("discover.pathOtherTitle")),
                })}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <AskQuestionModal
                  trigger={
                    <TactileButton variant="primary">
                      {t("discover.pathMissAsk")}
                      <ArrowRight className="h-4 w-4" />
                    </TactileButton>
                  }
                  onQuestionCreated={onQuestionCreated}
                />
                <TactileButton variant="obsidian" onClick={() => setBrowseOpen(true)}>
                  {t("discover.pathMissBrowse")}
                </TactileButton>
              </div>
            </>
          )}
        </section>
      ) : null}

      <section className={surface === "home" && !namedIntent ? "pt-1" : "border-t border-white/10 pt-6"}>
        {surface === "page" || namedIntent ? (
          <>
            <button
              type="button"
              onClick={() => setBrowseOpen((open) => !open)}
              className="flex w-full items-center justify-between gap-3 text-left"
              aria-expanded={browseOpen}
            >
              <span>
                <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                  {t("discover.pathBrowseEyebrow")}
                </span>
                <span className="mt-1 block font-serif text-xl font-bold text-white">{t("discover.pathBrowseRest")}</span>
                <span className="mt-1 block text-xs text-white/45">{t("discover.pathBrowseCopy")}</span>
              </span>
              <span className="text-xs font-bold text-orange-300">{browseOpen ? t("discover.pathHide") : t("discover.pathShow")}</span>
            </button>

            {browseOpen ? (
              <ul className="mt-4 space-y-2">
                {rest.map((poll) => (
                  <li key={poll.id}>
                    <Link
                      to={`/discoveries/${poll.slug || poll.id}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 hover:border-orange-400/40"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-white">{poll.question}</span>
                        <span className="mt-0.5 block truncate text-[11px] text-white/40">
                          {poll.targetUnlockPerk}
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-orange-300" />
                    </Link>
                  </li>
                ))}
                {rest.length === 0 ? (
                  <li className="text-sm text-white/45">{t("discover.pathBrowseEmpty")}</li>
                ) : null}
              </ul>
            ) : null}
          </>
        ) : null}

        <div className={surface === "home" && !namedIntent ? "flex flex-wrap items-center gap-3" : "mt-5 flex flex-wrap items-center gap-3"}>
          <AskQuestionModal
            trigger={
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white/55 hover:text-white"
              >
                <Compass className="h-3.5 w-3.5 text-orange-300" />
                {t("discover.pathAskOwn")}
              </button>
            }
            onQuestionCreated={onQuestionCreated}
          />
        </div>
      </section>
    </div>
  );
}

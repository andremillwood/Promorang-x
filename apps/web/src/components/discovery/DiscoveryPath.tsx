import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Compass, SkipForward } from "lucide-react";
import { NightTrail, PaperReceipt } from "@/components/promorang/SignatureObjects";
import { TactileButton } from "@/components/ui/TactileButton";
import { DiscoveryWidget } from "@/components/radar/DiscoveryWidget";
import { AskQuestionModal } from "@/components/discovery/AskQuestionModal";
import { DiscoveryIntentStage, INTENT_LENSES } from "@/components/discovery/DiscoveryIntentStage";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";
import type { DiscoveryPoll } from "@/data/discoveriesData";
import {
  buildDiscoveryPath,
  DISCOVER_LENS_STORAGE_KEY,
  DISCOVER_QUERY_STORAGE_KEY,
  DISCOVER_SKIPPED_STORAGE_KEY,
  DISCOVER_VOTED_STORAGE_KEY,
  discoverPathHref,
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
import { unlockDiscoveryOntoCard } from "@/hooks/useDiscoveryCard";
import { useDiscoveryFound } from "@/hooks/useDiscoveryFound";
import { PutUpFoundModal } from "@/components/discovery/PutUpFoundModal";
import { FoundListingCard } from "@/components/discovery/FoundListingCard";
import { foundListingHits } from "@/lib/discovery-found";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { useAuth } from "@/contexts/AuthContext";
import { matchPollForAim, writePromoCardAim } from "@/lib/promocard-aim";
import { promoCardAimPath, promoCardUnlockHref, type PromoCardAim } from "@promorang/shared";
import { FillCardMoves } from "@/components/promocard/FillCardMoves";
import { readLocalCardUnlocks, type DiscoveryCardUnlock } from "@/lib/discovery-card";

function whyCopy(
  why: PathWhy,
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string,
): string {
  const lensLabel = why.lens
    ? t(INTENT_LENSES.find((lens) => lens.id === why.lens)?.titleKey || "discover.pathLensTry")
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
  aim?: PromoCardAim | null;
  onQuestionCreated?: (poll: DiscoveryPoll) => void;
  onVoted?: (pollId: string) => void;
  onCastVote?: (poll: DiscoveryPoll, optionId: string) => void | Promise<void>;
  syncUrl?: boolean;
  surface?: "page" | "home" | "invite";
};

export function DiscoveryPath({
  polls,
  cityName,
  preferredCategories = [],
  initialLens = null,
  initialQuery = null,
  aim = null,
  onQuestionCreated,
  onVoted,
  onCastVote,
  syncUrl = true,
  surface = "page",
}: DiscoveryPathProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const to = useExperiencePath();
  const [searchParams, setSearchParams] = useSearchParams();
  const handoffToDiscover = surface === "invite";
  const currentRef = useRef<HTMLElement | null>(null);
  const inferred = inferLensesFromPreferences(preferredCategories);
  const intentFieldId = surface === "page" ? "discover-intent" : "home-discover-intent";
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
  const [lastUnlock, setLastUnlock] = useState<DiscoveryCardUnlock | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const found = useDiscoveryFound(cityName);
  const fillRequest = searchParams.get("fill") === "request";

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
    if (aim) next.set("aim", aim.id);
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
    if (aim) writePromoCardAim(aim);
  }, [aim]);

  useEffect(() => {
    if (fillRequest) setRequestOpen(true);
  }, [fillRequest]);

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

  const preferredPoll = aim ? matchPollForAim(aim, polls) : null;
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
        preferPollId: preferredPoll?.id,
      }),
    [polls, lens, query, votedIds, skippedIds, cityName, justVotedId, preferredPoll?.id],
  );
  const cardHref = user
    ? to(promoCardAimPath(aim))
    : promoCardUnlockHref({ aim });

  const hasLiveMatch = polls.some(
    (poll) => intentMatchCount(poll, lens ? [lens] : [], query) > 0,
  );
  const matchingFinds = useMemo(
    () => (query ? found.waiting.filter((listing) => foundListingHits(listing, query) > 0) : found.waiting),
    [found.waiting, query],
  );
  const namedWant =
    query ||
    (lens ? t(INTENT_LENSES.find((item) => item.id === lens)?.titleKey || "discover.pathLensTry") : t("discover.pathOtherTitle"));

  const current = path[0] || null;
  const upcoming = path.slice(1);
  const rest = polls.filter(
    (poll) => !path.some((item) => item.poll.id === poll.id) && !votedIds.includes(poll.id),
  );

  useEffect(() => {
    if (!current) return;
    const existing = readLocalCardUnlocks().find((row) => row.pollId === current.poll.id);
    if (existing) setLastUnlock(existing);
  }, [current?.poll.id]);

  const chooseLens = (next: DiscoverLensId) => {
    setLens(next);
    setQuery("");
    setDraftQuery("");
    setJustVotedId(null);
    setSkippedIds([]);
    writeStoredIdList(DISCOVER_SKIPPED_STORAGE_KEY, []);
    writeStoredDiscoverQuery("");
    if (handoffToDiscover) {
      navigate(discoverPathHref(null, next, aim?.id));
      return;
    }
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
    void recordDiscoveryNamedIntent(cityName, next);
    if (handoffToDiscover) {
      navigate(discoverPathHref(next, null, aim?.id));
      return;
    }
    syncQueryParam(next, null);
    setIntentTick((tick) => tick + 1);
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

  const putUpFound = async (input: Parameters<typeof found.putUp>[0]) => {
    await recordDiscoveryNamedIntent(cityName, input.title);
    await found.putUp(input);
  };

  const handleRequestOpenChange = (open: boolean) => {
    setRequestOpen(open);
    if (open || !syncUrl || !fillRequest) return;
    const next = new URLSearchParams(searchParams);
    next.delete("fill");
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-8">
      <DiscoveryIntentStage
        cityName={cityName}
        surface={surface}
        lens={lens}
        namedIntent={namedIntent}
        otherActive={otherActive}
        inferred={inferred}
        intentFieldId={intentFieldId}
        draftQuery={draftQuery}
        query={query}
        onDraftQuery={setDraftQuery}
        onChooseLens={chooseLens}
        onChooseQuery={chooseQuery}
        onClearQuery={clearQuery}
      />

      {fillRequest && !handoffToDiscover ? (
        <section className="rounded-[1.6rem] border border-amber-200/20 bg-amber-200/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">
            Fill the card
          </p>
          <h3 className="mt-1 font-serif text-2xl font-bold text-white">
            {aim ? `Ask for ${aim.label}` : "Ask for a perk"}
          </h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-white/60">
            Put the place or night on the table. A house can claim it. That is how something lands when nothing is live.
          </p>
          <div className="mt-4">
            <PutUpFoundModal
              cityName={cityName}
              defaultTitle={query || aim?.discoverQuery || ""}
              open={requestOpen}
              onOpenChange={handleRequestOpenChange}
              onPutUp={putUpFound}
              trigger={
                <TactileButton variant="primary">
                  {t("found.putUp")}
                  <ArrowRight className="h-4 w-4" />
                </TactileButton>
              }
            />
          </div>
        </section>
      ) : null}

      {handoffToDiscover ? null : !namedIntent && surface === "page" ? (
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
                {aim
                  ? `On your card · ${aim.label}`
                  : otherActive
                    ? t(votedIds.includes(current.poll.id) ? "discover.pathUsedEyebrow" : "discover.pathHitEyebrow")
                    : t("discover.pathPosition", { current: 1, total: path.length })}
              </p>
              <h3 id="discover-current-move" className="mt-1 font-serif text-2xl font-bold text-white">
                {aim
                  ? "This one goes on your card"
                  : otherActive
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
            landOnCard
            onVote={(pollId, optionId) => {
              void onCastVote?.(current.poll, optionId);
              markVoted(pollId);
              void unlockDiscoveryOntoCard({
                city: cityName,
                poll: current.poll,
                query,
                aim: aim?.id,
              }).then(setLastUnlock);
            }}
          />

          {votedIds.includes(current.poll.id) ? (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_1fr] lg:items-center">
              <PaperReceipt
                heading={aim ? "On your card" : t("discover.pathReceiptHeading")}
                lines={[
                  { label: t("discover.pathReceiptChose"), value: current.poll.question, strong: true },
                  {
                    label: t("discover.pathReceiptCard"),
                    value: lastUnlock?.perkTitle || current.poll.targetUnlockPerk || t("discover.pathFallbackPerk"),
                    strong: true,
                  },
                  {
                    label: t("discover.pathReceiptCode"),
                    value: lastUnlock?.redemptionCode || t("discover.pathOnCard"),
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
                  {aim
                    ? "It's on your card now. Show it where it works."
                    : t("discover.pathOnCardCopy")}
                </p>
                <div className="flex flex-wrap gap-3">
                  <TactileButton variant="primary" asChild>
                    <Link to={cardHref}>
                      {aim ? (user ? "Show this on your card" : "Unlock this") : t("discover.pathOpenCard")}
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
          {matchingFinds.length ? (
            <>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
                {t("found.waitingEyebrow")}
              </p>
              <h3 className="mt-2 font-serif text-2xl font-bold text-white">{t("found.waitingTitle")}</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
                {t("found.waitingLead", { city: cityName, want: namedWant })}
              </p>
              <div className="mt-5 grid gap-3">
                {matchingFinds.map((listing) => (
                  <FoundListingCard
                    key={listing.id}
                    listing={listing}
                    role="host"
                    claiming={found.claiming}
                    onClaim={found.claim}
                  />
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <PutUpFoundModal
                  cityName={cityName}
                  defaultTitle={query}
                  onPutUp={putUpFound}
                  trigger={
                    <TactileButton variant="obsidian">
                      {t("found.putUp")}
                      <ArrowRight className="h-4 w-4" />
                    </TactileButton>
                  }
                />
                <TactileButton variant="obsidian" onClick={() => setBrowseOpen(true)}>
                  {t("discover.pathMissBrowse")}
                </TactileButton>
              </div>
            </>
          ) : hasLiveMatch ? (
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
                {t("found.missPutUpCopy", { city: cityName, want: namedWant })}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <PutUpFoundModal
                  cityName={cityName}
                  defaultTitle={query}
                  onPutUp={putUpFound}
                  trigger={
                    <TactileButton variant="primary">
                      {t("found.putUp")}
                      <ArrowRight className="h-4 w-4" />
                    </TactileButton>
                  }
                />
                <AskQuestionModal
                  trigger={
                    <TactileButton variant="obsidian">
                      {t("discover.pathMissAsk")}
                    </TactileButton>
                  }
                  onQuestionCreated={onQuestionCreated}
                />
                <TactileButton variant="obsidian" onClick={() => setBrowseOpen(true)}>
                  {t("discover.pathMissBrowse")}
                </TactileButton>
              </div>
              {aim ? <FillCardMoves aim={aim} authenticated={Boolean(user)} /> : null}
            </>
          )}
        </section>
      ) : null}

      {handoffToDiscover ? null : (
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
      )}
    </div>
  );
}

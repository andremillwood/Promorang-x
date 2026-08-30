import { useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { TactileButton } from "@/components/ui/TactileButton";
import { PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";
import { GuidanceDisclosure } from "@/components/guidance/GuidanceDisclosure";
import { useI18n } from "@/i18n/I18nContext";
import {
  usePromoShareBrief,
  type OperatorRole,
  type PromoShareLastAction,
} from "@/hooks/usePromoShareBrief";

export type OperatorVariant = "pageHero" | "handoff" | "rail" | "compact";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const GHOST_MOMENT_KEYS = new Set(["m-kingston-tasting", "m-harbour-set"]);

function safeMomentHref(href?: string) {
  if (!href) return undefined;
  const match = href.match(/^\/moments\/([^/]+)(\/.*)?$/);
  if (!match) return href;
  const key = match[1];
  if (GHOST_MOMENT_KEYS.has(key) || (!UUID_PATTERN.test(key) && /^m[-_]/.test(key))) {
    return "/discover";
  }
  return href;
}

function shareUrl(href?: string) {
  const safeHref = safeMomentHref(href) || href;
  if (typeof window === "undefined") return safeHref || "/discover";
  if (!safeHref) return window.location.origin;
  if (safeHref.startsWith("http")) return safeHref;
  return `${window.location.origin}${safeHref}`;
}

function resolveVariant({
  variant,
  asPageHero,
  compact,
}: {
  variant?: OperatorVariant;
  asPageHero?: boolean;
  compact?: boolean;
}): OperatorVariant {
  if (variant) return variant;
  if (asPageHero) return "pageHero";
  if (compact) return "compact";
  return "pageHero";
}

export function PromoShareOperator({
  defaultRole,
  compact = false,
  asPageHero = false,
  variant,
  lastAction,
  momentId,
  momentName,
}: {
  defaultRole?: OperatorRole;
  compact?: boolean;
  asPageHero?: boolean;
  variant?: OperatorVariant;
  lastAction?: PromoShareLastAction | string;
  momentId?: string;
  momentName?: string;
}) {
  const { t } = useI18n();
  const resolved = resolveVariant({ variant, asPageHero, compact });
  const {
    role,
    brief,
    loading,
    ask,
    setAsk,
    budgetGems,
    setBudgetGems,
    canAskOutcome,
    loadBrief,
    session,
  } = usePromoShareBrief({
    defaultRole,
    lastAction,
    momentId,
    momentName,
  });

  const TitleTag = resolved === "pageHero" ? "h1" : "h2";

  const copyShare = async () => {
    if (!brief?.share?.message) return;
    try {
      await navigator.clipboard.writeText(`${brief.share.message} ${shareUrl(brief.share.href)}`);
      toast.success(t("promoshare.operatorShareCopied"));
    } catch {
      toast.error(t("promoshare.operatorShareCopyError"));
    }
  };

  const sendWhatsApp = () => {
    if (!brief?.share?.message) return;
    const text = encodeURIComponent(`${brief.share.message} ${shareUrl(brief.share.href)}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const eyebrow = useMemo(() => {
    if (resolved === "handoff") return t("promoshare.operatorEyebrowHandoff");
    if (resolved === "rail") return t("promoshare.operatorEyebrowRail");
    if (role === "sponsor") return t("promoshare.operatorEyebrowSponsor");
    if (role === "host") return t("promoshare.operatorEyebrowHost");
    if (role === "creator") return t("promoshare.operatorEyebrowCreator");
    if (role === "steward") return t("promoshare.operatorEyebrowSteward");
    if (role === "admin") return t("promoshare.operatorEyebrowAdmin");
    return t("promoshare.operatorEyebrow");
  }, [resolved, role, t]);

  if (!session?.access_token) return null;

  const cta = brief?.nextMove.ctaLabel || brief?.nextMove.title || t("promoshare.operatorDoThis");
  const nextHref = safeMomentHref(brief?.nextMove.href);
  const stub = brief?.cycle?.tickets != null
    ? String(brief.cycle.tickets)
    : brief?.nextMove.kind || "GO";

  const actions = brief ? (
    <div className={`flex flex-col gap-3 ${resolved === "rail" ? "sm:flex-row sm:shrink-0" : "sm:flex-row sm:flex-wrap"}`}>
      {nextHref ? (
        <TactileButton variant="primary" size={resolved === "rail" ? "default" : "lg"} asChild>
          <Link to={nextHref}>{cta}</Link>
        </TactileButton>
      ) : (
        <TactileButton variant="primary" size={resolved === "rail" ? "default" : "lg"} disabled={loading} onClick={() => loadBrief(ask || undefined)}>
          {cta}
        </TactileButton>
      )}
      {brief.share?.message && resolved !== "rail" ? (
        <TactileButton type="button" variant="success" size="lg" onClick={sendWhatsApp}>
          {t("promoshare.operatorSendWhatsApp")}
        </TactileButton>
      ) : null}
    </div>
  ) : null;

  if (resolved === "rail") {
    return (
      <section
        className="mb-4 overflow-hidden rounded-2xl border border-orange-500/25 bg-zinc-950/90 px-4 py-3 sm:px-5"
        aria-labelledby="promoshare-rail-heading"
        aria-busy={loading}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.18em] text-orange-300">{eyebrow}</p>
            <h2 id="promoshare-rail-heading" className="mt-1 truncate font-serif text-lg font-bold text-white">
              {brief?.headline || t("promoshare.operatorIdleTitle")}
            </h2>
            <p className="mt-0.5 line-clamp-2 text-xs text-white/55">
              {brief?.theyGet || brief?.unlock || t("promoshare.operatorIdleCopy")}
            </p>
          </div>
          {loading && !brief ? (
            <p className="text-xs text-white/45">{t("promoshare.operatorWorking")}</p>
          ) : (
            actions
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative mb-8 overflow-hidden rounded-[2rem] border border-orange-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 shadow-[0_0_40px_rgba(255,85,0,0.18)] sm:p-10"
      aria-labelledby="promoshare-operator-heading"
      aria-busy={loading}
    >
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />

      <div className="relative z-10 space-y-6">
        <div className="max-w-3xl">
          <p className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-orange-300">
            {eyebrow}
          </p>
          <TitleTag
            id="promoshare-operator-heading"
            className="mt-4 font-serif text-4xl font-bold leading-[1.05] text-white sm:text-5xl"
          >
            {brief?.headline || (resolved === "handoff" ? t("promoshare.operatorHandoffIdle") : t("promoshare.operatorIdleTitle"))}
          </TitleTag>
          <p className="mt-4 max-w-2xl text-base leading-7 text-amber-100/90 sm:text-lg">
            {brief?.unlock || brief?.summary || t("promoshare.operatorIdleCopy")}
          </p>
          {brief?.proof ? (
            <p className="mt-2 text-sm text-white/55">{brief.proof}</p>
          ) : null}
        </div>

        {resolved === "handoff" && (brief?.theyGet || brief?.promorangGets) ? (
          <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
            {brief?.theyGet ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <p className="text-[10px] font-bold tracking-[0.16em] text-orange-300">{t("promoshare.operatorTheyGet")}</p>
                <p className="mt-1.5 text-sm leading-6 text-white/85">{brief.theyGet}</p>
              </div>
            ) : null}
            {brief?.promorangGets ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <p className="text-[10px] font-bold tracking-[0.16em] text-amber-200/80">{t("promoshare.operatorPromorangGets")}</p>
                <p className="mt-1.5 text-sm leading-6 text-white/85">{brief.promorangGets}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {canAskOutcome && resolved !== "handoff" ? (
          <form
            className="max-w-2xl rounded-[1.4rem] border border-white/10 bg-black/30 p-4 sm:p-5"
            onSubmit={(event) => {
              event.preventDefault();
              if (ask.trim().length < 5) {
                toast.error(t("promoshare.operatorAskShort"));
                return;
              }
              loadBrief(ask.trim());
            }}
          >
            <label htmlFor="promoshare-outcome" className="text-xs font-bold tracking-[0.16em] text-white/55">
              {t("promoshare.operatorOutcomeLabel")}
            </label>
            <textarea
              id="promoshare-outcome"
              value={ask}
              onChange={(event) => setAsk(event.target.value)}
              rows={3}
              placeholder={t("promoshare.operatorOutcomePlaceholder")}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div>
                <label htmlFor="promoshare-budget" className="text-[11px] font-bold tracking-[0.14em] text-white/45">
                  {t("promoshare.operatorGemCap")}
                </label>
                <input
                  id="promoshare-budget"
                  type="number"
                  min={50}
                  value={budgetGems}
                  onChange={(event) => setBudgetGems(event.target.value)}
                  className="mt-1 w-32 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                />
              </div>
              <TactileButton type="submit" variant="primary" disabled={loading}>
                {loading ? t("promoshare.operatorWorking") : t("promoshare.operatorCompile")}
              </TactileButton>
            </div>
          </form>
        ) : null}

        {loading && !brief ? (
          <p className="text-sm text-white/55" aria-live="polite">
            {t("promoshare.operatorWorking")}
          </p>
        ) : null}

        {brief ? (
          <div className="max-w-xl space-y-4">
            <TicketPass
              kicker={t("promoshare.operatorNextMove")}
              title={brief.nextMove.title}
              detail={brief.nextMove.why}
              stub={stub}
              stubLabel={t("promoshare.operatorKeep")}
            />

            {actions}

            {brief.share && resolved !== "compact" ? (
              <blockquote className="rounded-2xl border border-dashed border-white/15 bg-black/30 px-4 py-4 text-sm leading-6 text-zinc-200">
                <p>{brief.share.message}</p>
                <button
                  type="button"
                  onClick={copyShare}
                  className="mt-3 text-xs font-bold tracking-wide text-orange-300 underline-offset-4 hover:underline"
                >
                  {t("promoshare.operatorCopyShare")}
                </button>
              </blockquote>
            ) : null}

            {brief.poolDraft ? (
              <p className="text-sm leading-6 text-zinc-300">
                {brief.poolDraft.funding.requested_gems} Gems capped · {brief.poolDraft.funding.prize_pool_gems} in the pot ·{" "}
                {brief.poolDraft.caps.max_winners} winner cap. Nothing is live until you confirm.
              </p>
            ) : null}
            {brief.alerts?.length ? <p className="text-sm text-amber-200">{brief.alerts[0]}</p> : null}
          </div>
        ) : null}

        {brief && resolved !== "compact" ? (
          <GuidanceDisclosure
            id={`promoshare-operator:${role}:${resolved}`}
            title={t("promoshare.operatorWhyCounts")}
            summary={brief.proof || brief.summary}
            className="mt-2"
          >
            <PaperReceipt
              heading={t("promoshare.operatorReceipt")}
              lines={brief.receiptLines}
              footer={brief.boundaries[0]}
            />
          </GuidanceDisclosure>
        ) : null}
      </div>
    </section>
  );
}

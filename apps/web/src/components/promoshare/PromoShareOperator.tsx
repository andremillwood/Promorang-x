import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import { TactileButton } from "@/components/ui/TactileButton";
import { PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";
import { GuidanceDisclosure } from "@/components/guidance/GuidanceDisclosure";
import { useI18n } from "@/i18n/I18nContext";

type OperatorRole = "participant" | "host" | "creator" | "sponsor" | "steward" | "admin";

type NextMove = {
  kind: string;
  title: string;
  why: string;
  href?: string;
  ctaLabel?: string;
  momentId?: string | null;
  momentName?: string | null;
};

type ShareDraft = {
  status: string;
  posted: boolean;
  href: string;
  message: string;
  caption?: string;
  warning?: string;
};

type PoolDraft = {
  status: string;
  funded: boolean;
  published: boolean;
  outcome: { statement: string; targetCount: number; timeframe?: string };
  funding: {
    requested_gems: number;
    prize_pool_gems: number;
    platform_fee_percent: number;
  };
  caps: { max_winners: number; liability_cap_gems: number };
  message: string;
};

type OperatorBrief = {
  role: OperatorRole;
  headline: string;
  summary: string;
  unlock?: string;
  proof?: string;
  nextMove: NextMove;
  share?: ShareDraft;
  poolDraft?: PoolDraft;
  cycle?: { tickets?: number; name?: string; eligible?: boolean } | null;
  receiptLines: Array<{ label: string; value: string; strong?: boolean }>;
  boundaries: string[];
  alerts?: string[];
};

const ROLE_MAP: Record<string, OperatorRole> = {
  participant: "participant",
  creator: "creator",
  host: "host",
  brand: "sponsor",
  merchant: "sponsor",
  agency: "sponsor",
  promoter: "participant",
  marketing: "participant",
  admin: "admin",
};

function mapRole(activeRole?: string | null, fallback?: OperatorRole): OperatorRole {
  if (activeRole && ROLE_MAP[activeRole]) return ROLE_MAP[activeRole];
  return fallback || "participant";
}

function shareUrl(href?: string) {
  if (typeof window === "undefined") return href || "/discover";
  if (!href) return window.location.origin;
  if (href.startsWith("http")) return href;
  return `${window.location.origin}${href}`;
}

export function PromoShareOperator({
  defaultRole,
  compact = false,
  asPageHero = false,
}: {
  defaultRole?: OperatorRole;
  compact?: boolean;
  asPageHero?: boolean;
}) {
  const { t } = useI18n();
  const { session, activeRole, profile } = useAuth();
  const role = mapRole(activeRole, defaultRole);
  const [brief, setBrief] = useState<OperatorBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [ask, setAsk] = useState("");
  const [budgetGems, setBudgetGems] = useState("800");

  const canAskOutcome = role === "sponsor" || role === "steward" || role === "admin";
  const TitleTag = asPageHero ? "h1" : "h2";

  const loadBrief = async (objective?: string) => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/agent/promoshare/brief`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          objective: objective || undefined,
          location: profile?.city || profile?.location || undefined,
          budgetGems: canAskOutcome && budgetGems ? Number(budgetGems) : undefined,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "PromoShare operator could not compile a brief");
      }
      setBrief(result.data.brief);
    } catch (error) {
      console.error(error);
      toast.error(t("promoshare.operatorLoadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.access_token) return;
    loadBrief();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token, role]);

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
    if (role === "sponsor") return t("promoshare.operatorEyebrowSponsor");
    if (role === "host") return t("promoshare.operatorEyebrowHost");
    if (role === "creator") return t("promoshare.operatorEyebrowCreator");
    if (role === "steward") return t("promoshare.operatorEyebrowSteward");
    if (role === "admin") return t("promoshare.operatorEyebrowAdmin");
    return t("promoshare.operatorEyebrow");
  }, [role, t]);

  if (!session?.access_token) return null;

  const cta = brief?.nextMove.ctaLabel || brief?.nextMove.title || t("promoshare.operatorDoThis");
  const stub = brief?.cycle?.tickets != null
    ? String(brief.cycle.tickets)
    : brief?.nextMove.kind || "GO";

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
            {brief?.headline || t("promoshare.operatorIdleTitle")}
          </TitleTag>
          <p className="mt-4 max-w-2xl text-base leading-7 text-amber-100/90 sm:text-lg">
            {brief?.unlock || brief?.summary || t("promoshare.operatorIdleCopy")}
          </p>
          {brief?.proof ? (
            <p className="mt-2 text-sm text-white/55">{brief.proof}</p>
          ) : null}
        </div>

        {canAskOutcome ? (
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

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {brief.nextMove.href ? (
                <TactileButton variant="primary" size="lg" asChild>
                  <Link to={brief.nextMove.href}>{cta}</Link>
                </TactileButton>
              ) : (
                <TactileButton variant="primary" size="lg" disabled={loading} onClick={() => loadBrief(ask || undefined)}>
                  {cta}
                </TactileButton>
              )}
              {brief.share?.message ? (
                <TactileButton type="button" variant="success" size="lg" onClick={sendWhatsApp}>
                  {t("promoshare.operatorSendWhatsApp")}
                </TactileButton>
              ) : null}
            </div>

            {brief.share ? (
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

        {brief && !compact ? (
          <GuidanceDisclosure
            id={`promoshare-operator:${role}`}
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

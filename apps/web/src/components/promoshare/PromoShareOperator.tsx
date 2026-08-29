import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import { TactileButton } from "@/components/ui/TactileButton";
import { NightTrail, PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";
import { useI18n } from "@/i18n/I18nContext";

type OperatorRole = "participant" | "host" | "creator" | "sponsor" | "steward" | "admin";

type NextMove = {
  kind: string;
  title: string;
  why: string;
  href?: string;
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
  nextMove: NextMove;
  share?: ShareDraft;
  checkIn?: { needed: boolean; copy: string };
  poolDraft?: PoolDraft;
  cycle?: { tickets?: number; name?: string; eligible?: boolean } | null;
  receiptLines: Array<{ label: string; value: string; strong?: boolean }>;
  trail?: Array<{ label: string; title: string; text: string }>;
  boundaries: string[];
  operatorNote?: string;
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

export function PromoShareOperator({
  defaultRole,
  compact = false,
}: {
  defaultRole?: OperatorRole;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const { session, activeRole, profile } = useAuth();
  const role = mapRole(activeRole, defaultRole);
  const [brief, setBrief] = useState<OperatorBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [ask, setAsk] = useState("");
  const [budgetGems, setBudgetGems] = useState("800");

  const canAskOutcome = role === "sponsor" || role === "steward" || role === "admin";

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
    // Role is the only thing that should re-run the operator.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token, role]);

  const copyShare = async () => {
    if (!brief?.share?.message) return;
    try {
      await navigator.clipboard.writeText(brief.share.message);
      toast.success(t("promoshare.operatorShareCopied"));
    } catch {
      toast.error(t("promoshare.operatorShareCopyError"));
    }
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

  return (
    <section className="space-y-6" aria-labelledby="promoshare-operator-heading">
      <div>
        <p className="text-[10px] font-bold tracking-[0.2em] text-amber-200/80">{eyebrow}</p>
        <h2 id="promoshare-operator-heading" className="mt-2 font-serif text-3xl font-bold text-white md:text-4xl">
          {brief?.headline || t("promoshare.operatorIdleTitle")}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
          {brief?.summary || t("promoshare.operatorIdleCopy")}
        </p>
      </div>

      {canAskOutcome ? (
        <form
          className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5"
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
        <p className="text-sm text-white/55">{t("promoshare.operatorWorking")}</p>
      ) : null}

      {brief ? (
        <div className={`grid gap-6 ${compact ? "" : "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"}`}>
          <div className="space-y-4">
            <TicketPass
              kicker={t("promoshare.operatorNextMove")}
              title={brief.nextMove.title}
              detail={brief.nextMove.why}
              stub={brief.cycle?.tickets != null ? `${brief.cycle.tickets}` : brief.nextMove.kind}
              stubLabel={t("promoshare.operatorKeep")}
            />
            <div className="flex flex-wrap gap-3">
              {brief.nextMove.href ? (
                <TactileButton variant="primary" asChild>
                  <Link to={brief.nextMove.href}>{t("promoshare.operatorDoThis")}</Link>
                </TactileButton>
              ) : null}
              {brief.share?.message ? (
                <TactileButton type="button" variant="obsidian" onClick={copyShare}>
                  {t("promoshare.operatorCopyShare")}
                </TactileButton>
              ) : null}
              <TactileButton type="button" variant="outline" disabled={loading} onClick={() => loadBrief(ask || undefined)}>
                {t("promoshare.operatorRefresh")}
              </TactileButton>
            </div>
            {brief.share ? (
              <blockquote className="rounded-2xl border border-dashed border-white/15 bg-black/30 px-4 py-4 text-sm leading-6 text-zinc-200">
                <p>{brief.share.message}</p>
                <p className="mt-3 text-xs text-white/45">{brief.share.warning}</p>
              </blockquote>
            ) : null}
            {brief.poolDraft ? (
              <p className="text-sm leading-6 text-zinc-300">
                {brief.poolDraft.message} {brief.poolDraft.funding.requested_gems} Gems capped ·{" "}
                {brief.poolDraft.funding.prize_pool_gems} in the pot · {brief.poolDraft.caps.max_winners} winner cap.
              </p>
            ) : null}
            {brief.alerts?.length ? (
              <p className="text-sm text-amber-200">{brief.alerts[0]}</p>
            ) : null}
          </div>

          <PaperReceipt
            heading={t("promoshare.operatorReceipt")}
            lines={brief.receiptLines}
            footer={brief.boundaries[0]}
          />
        </div>
      ) : null}

      {brief?.trail && !compact ? (
        <NightTrail
          eyebrow={t("promoshare.operatorTrail")}
          title={t("promoshare.operatorHowItRuns")}
          steps={brief.trail}
        />
      ) : null}
    </section>
  );
}

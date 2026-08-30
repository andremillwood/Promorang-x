import { Link } from "react-router-dom";
import { ArrowRight, Compass, Megaphone, Plus, Share2, Store, Vote } from "lucide-react";
import { TactileButton } from "@/components/ui/TactileButton";
import { AskQuestionModal } from "@/components/discovery/AskQuestionModal";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";
import { discoveryHref } from "@/lib/discovery-path";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { useMarket } from "@/contexts/MarketContext";
import type { DemandAsk, DemandQuestion, DemandRole } from "@/lib/discovery-demand";
import { cn } from "@/lib/utils";

const TONE: Record<DemandRole, { ring: string; chip: string; bar: string }> = {
  host: { ring: "border-amber-500/30 from-amber-950/40", chip: "text-amber-300 border-amber-400/30 bg-amber-500/10", bar: "bg-amber-400" },
  creator: { ring: "border-purple-500/30 from-purple-950/40", chip: "text-purple-300 border-purple-400/30 bg-purple-500/10", bar: "bg-purple-400" },
  brand: { ring: "border-orange-500/30 from-orange-950/40", chip: "text-orange-300 border-orange-400/30 bg-orange-500/10", bar: "bg-orange-400" },
  merchant: { ring: "border-emerald-500/30 from-emerald-950/40", chip: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10", bar: "bg-emerald-400" },
};

const TITLE_KEY: Record<DemandRole, TranslationKey> = {
  host: "demand.titleHost",
  creator: "demand.titleCreator",
  brand: "demand.titleBrand",
  merchant: "demand.titleMerchant",
};

const COPY_KEY: Record<DemandRole, TranslationKey> = {
  host: "demand.copyHost",
  creator: "demand.copyCreator",
  brand: "demand.copyBrand",
  merchant: "demand.copyMerchant",
};

function questionAction(role: DemandRole, question: DemandQuestion): { href: string; label: TranslationKey } {
  if (role === "host") return { href: "/create/moment", label: "demand.stageNight" };
  if (role === "creator") return { href: `/discover?tab=distribute`, label: "demand.shareQuestion" };
  if (role === "brand") return { href: "/dashboard?tab=campaigns", label: "demand.fundUnlock" };
  return { href: "/discover?tab=perks", label: "demand.postPerk" };
}

function AskRow({ ask, tone }: { ask: DemandAsk; tone: string }) {
  const { t } = useI18n();
  return (
    <li className={cn("flex items-center justify-between gap-3 rounded-2xl border px-4 py-3", tone)}>
      <span className="min-w-0">
        <span className="block truncate font-serif text-lg font-bold text-white">“{ask.query}”</span>
        <span className="mt-0.5 block text-[11px] text-white/45">
          {t("demand.askCount", { count: ask.count })}
          {ask.status === "live" ? ` · ${t("demand.matchedLive")}` : ` · ${t("demand.notLive")}`}
        </span>
      </span>
      <span className="shrink-0 text-sm font-black text-white">{ask.count}</span>
    </li>
  );
}

function QuestionCard({
  question,
  role,
  barClass,
}: {
  question: DemandQuestion;
  role: DemandRole;
  barClass: string;
}) {
  const { t } = useI18n();
  const action = questionAction(role, question);
  const closenessKey =
    question.closeness === "unlocking"
      ? "demand.unlocking"
      : question.closeness === "warming"
        ? "demand.warming"
        : "demand.early";

  return (
    <article className="rounded-[1.4rem] border border-white/10 bg-black/30 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">{t(closenessKey)}</p>
        <p className="text-[11px] font-bold text-white/50">
          {t("demand.votes", { count: question.poll.totalVotes || 0 })}
          {question.votesRemaining > 0
            ? ` · ${t("demand.closesIn", { votes: question.votesRemaining })}`
            : ` · ${t("demand.unlocked")}`}
        </p>
      </div>
      <h4 className="mt-2 font-serif text-xl font-bold text-white">{question.poll.question}</h4>
      {question.matchedAsks.length ? (
        <p className="mt-1 text-xs text-white/50">{t("demand.matchedAsk", { query: question.matchedAsks[0] })}</p>
      ) : null}
      <ul className="mt-4 space-y-2">
        {question.options.slice(0, 4).map((option) => (
          <li key={option.text}>
            <div className="mb-1 flex justify-between gap-3 text-xs font-bold text-white/80">
              <span className="truncate">{option.text}</span>
              <span className="shrink-0 font-mono text-white/50">
                {option.votes} · {option.share}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className={cn("h-full rounded-full", barClass)} style={{ width: `${option.share}%` }} />
            </div>
          </li>
        ))}
      </ul>
      {question.poll.targetUnlockPerk ? (
        <p className="mt-3 text-xs leading-5 text-white/50">
          {t("demand.opens")} {question.poll.targetUnlockPerk}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <TactileButton variant="primary" asChild>
          <Link to={discoveryHref(question.poll)}>
            {t("demand.openQuestion")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </TactileButton>
        <TactileButton variant="obsidian" asChild>
          <Link to={action.href}>{t(action.label)}</Link>
        </TactileButton>
      </div>
    </article>
  );
}

export function DiscoveryDemandInbox({ role }: { role: DemandRole }) {
  const { t } = useI18n();
  const { city, country } = useMarket();
  const { inbox, isLoading } = useDiscoveryDemand(
    city.name,
    country.slug || "jamaica",
    city.id === "all-jamaica" ? undefined : city.id,
  );
  const tone = TONE[role];

  return (
    <div className="space-y-6">
      <header className={cn("rounded-[1.6rem] border bg-gradient-to-r via-black to-black p-5 sm:p-6", tone.ring)}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{t("demand.eyebrow", { city: inbox.city })}</p>
        <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">{t(TITLE_KEY[role])}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">{t(COPY_KEY[role])}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={cn("rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider", tone.chip)}>
            {t("demand.namedCount", { count: inbox.namedAskCount })}
          </span>
          <span className={cn("rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider", tone.chip)}>
            {t("demand.voteCount", { count: inbox.liveVoteCount })}
          </span>
        </div>
        <p className="mt-3 text-[11px] leading-5 text-white/40">{t("demand.privacy")}</p>
      </header>

      {isLoading ? <p className="text-sm text-white/45">{t("demand.loading")}</p> : null}

      <section className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{t("demand.namedEyebrow")}</p>
        <h3 className="font-serif text-xl font-bold text-white">{t("demand.namedTitle")}</h3>
        {inbox.asks.length ? (
          <ul className="space-y-2">
            {inbox.asks.map((ask) => (
              <AskRow key={ask.query} ask={ask} tone={tone.chip} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/50">{t("demand.namedEmpty")}</p>
        )}
      </section>

      {inbox.misses.length ? (
        <section className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{t("demand.missEyebrow")}</p>
          <h3 className="font-serif text-xl font-bold text-white">{t("demand.missTitle")}</h3>
          <ul className="space-y-2">
            {inbox.misses.map((ask) => (
              <li key={ask.query} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span>
                  <span className="block font-serif text-lg font-bold text-white">“{ask.query}”</span>
                  <span className="text-[11px] text-white/45">{t("demand.askCount", { count: ask.count })}</span>
                </span>
                <AskQuestionModal
                  defaultCity={inbox.city}
                  trigger={
                    <TactileButton variant="obsidian">
                      {t("demand.askIt")}
                      <Plus className="h-4 w-4" />
                    </TactileButton>
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{t("demand.questionsEyebrow")}</p>
        <h3 className="font-serif text-xl font-bold text-white">{t("demand.questionsTitle")}</h3>
        {inbox.questions.length ? (
          <div className="grid gap-4">
            {inbox.questions.map((question) => (
              <QuestionCard key={question.poll.id} question={question} role={role} barClass={tone.bar} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/50">{t("demand.noQuestions")}</p>
        )}
      </section>
    </div>
  );
}

export function DemandArenaIcon({ role }: { role: DemandRole }) {
  if (role === "creator") return <Share2 className="h-4 w-4" />;
  if (role === "brand") return <Megaphone className="h-4 w-4" />;
  if (role === "merchant") return <Store className="h-4 w-4" />;
  return <Vote className="h-4 w-4" />;
}

export function DemandCompassIcon() {
  return <Compass className="h-4 w-4" />;
}

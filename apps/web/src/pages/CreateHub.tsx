import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { useI18n } from "@/i18n/I18nContext";
import { TicketPass } from "@/components/promorang/SignatureObjects";
import { NextMoveStrip } from "@/components/journey/NextMoveStrip";
import { getMemberNextMove } from "@/lib/member-next-move";
import { useAuth } from "@/contexts/AuthContext";

const STEPS = [
  { label: "createHub.step1Label", title: "createHub.step1Title", text: "createHub.step1Text" },
  { label: "createHub.step2Label", title: "createHub.step2Title", text: "createHub.step2Text" },
  { label: "createHub.step3Label", title: "createHub.step3Title", text: "createHub.step3Text" },
  { label: "createHub.step4Label", title: "createHub.step4Title", text: "createHub.step4Text" },
  { label: "createHub.step5Label", title: "createHub.step5Title", text: "createHub.step5Text" },
  { label: "createHub.step6Label", title: "createHub.step6Title", text: "createHub.step6Text" },
  { label: "createHub.step7Label", title: "createHub.step7Title", text: "createHub.step7Text" },
] as const;

const PATHS = [
  { href: "/create/campaign", title: "createHub.fundTitle", detail: "createHub.fundDetail", stub: "FUND" },
  { href: "/create/bounty", title: "createHub.planTitle", detail: "createHub.planDetail", stub: "TASK" },
  { href: "/propose", title: "createHub.proposeTitle", detail: "createHub.proposeDetail", stub: "ASK" },
  { href: "/create/moment", title: "createHub.hostTitle", detail: "createHub.hostDetail", stub: "HOST" },
] as const;

export default function CreateHub() {
  const { t } = useI18n();
  const { user } = useAuth();
  const nextMove = getMemberNextMove({ signedIn: Boolean(user), canCreate: Boolean(user) });

  return (
    <main className="min-h-screen bg-[#0D0D0E] pb-24 text-white">
      <SEO title={t("createHub.title")} description={t("createHub.copy")} />
      <section className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#FF5500]">{t("createHub.eyebrow")}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black uppercase leading-[0.88] tracking-[-0.06em] sm:text-6xl">
          {t("createHub.title")}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">{t("createHub.copy")}</p>

        <div className="mt-6">
          <NextMoveStrip move={user ? { ...nextMove, href: "/create/moment" } : nextMove} />
        </div>

        <ol className="mt-10 grid gap-0 sm:grid-cols-2 lg:grid-cols-7">
          {STEPS.map((step, index) => (
            <li key={step.label} className="relative border-l border-white/10 px-4 py-4 lg:border-l-0 lg:border-t">
              <span className="absolute -left-2 top-4 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-black lg:-top-2 lg:left-4">
                {index + 1}
              </span>
              <p className="text-[10px] font-bold tracking-[0.16em] text-amber-200/80">{t(step.label)}</p>
              <h2 className="mt-2 font-serif text-lg font-bold">{t(step.title)}</h2>
              <p className="mt-1.5 text-xs leading-5 text-white/55">{t(step.text)}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.15fr_.85fr] lg:items-stretch">
          <Link to="/create/moment" className="group block">
            <TicketPass
              kicker={t("createHub.eyebrow")}
              title={t("createHub.startTitle")}
              detail={t("createHub.startDetail")}
              stub={t("createHub.startCta")}
              stubLabel={t("createHub.startCta")}
              className="h-full transition group-hover:-translate-y-0.5"
            />
          </Link>
          <div className="grid gap-3 sm:grid-cols-2">
            {PATHS.map((path) => (
              <Link
                key={path.href}
                to={path.href}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-primary/40"
              >
                <p className="font-mono text-[10px] tracking-[0.18em] text-amber-200/70">{path.stub}</p>
                <h3 className="mt-2 font-serif text-xl font-bold">{t(path.title)}</h3>
                <p className="mt-1.5 text-sm leading-5 text-white/55">{t(path.detail)}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
                  {t("createHub.startCta")} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

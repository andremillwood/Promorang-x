import { Link } from "react-router-dom";
import { TicketPass, PaperReceipt } from "@/components/promorang/SignatureObjects";
import { useWeeklyMomentDrop } from "@/hooks/useWeeklyMomentDrop";
import { buildMomentPath } from "@/lib/discovery";
import { useI18n } from "@/i18n/I18nContext";

function jamaicaDate(value: string) {
  return new Intl.DateTimeFormat("en-JM", {
    timeZone: "America/Jamaica",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function WeeklyMomentDrop() {
  const { t } = useI18n();
  const { data, isLoading } = useWeeklyMomentDrop();
  const items = data?.items || [];
  const fresh = items.filter((item) => item.role === "new_this_week");
  const horizon = items.filter((item) => item.role === "horizon");

  if (isLoading || !data?.drop) return null;

  return (
    <section className="mb-8 overflow-hidden rounded-[1.75rem] border border-amber-300/20 bg-[#0b0b0b] p-5 text-white sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <PaperReceipt
          heading={data.drop.title || t("exploreMoments.thisWeek")}
          lines={[
            { label: t("exploreMoments.weekOf"), value: jamaicaDate(data.drop.week_start), strong: true },
            { label: t("exploreMoments.newThisWeek"), value: String(fresh.length), strong: true },
            { label: t("exploreMoments.ninetyDayHorizon"), value: String(horizon.length + fresh.length) },
          ]}
          footer={t("exploreMoments.thisWeekCopy")}
        />
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-200/80">
            {t("exploreMoments.thisWeekBadge")}
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight">
            {t("exploreMoments.thisWeekTitle")}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
            {t("exploreMoments.thisWeekSubtitle")}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {(fresh.length > 0 ? fresh : horizon).slice(0, 4).map((item) => (
              <Link key={item.id} to={buildMomentPath({ id: item.moment_id, slug: item.slug })}>
                <TicketPass
                  kicker={item.role === "new_this_week" ? t("exploreMoments.newStub") : t("exploreMoments.horizonStub")}
                  title={item.title}
                  detail={`${jamaicaDate(item.starts_at)} · ${item.venue_name || item.city || item.location || "Jamaica"}`}
                  stub={jamaicaDate(item.starts_at)}
                  stubLabel={t("exploreMoments.holdDate")}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WeeklyMomentDrop;

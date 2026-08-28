import { Link } from "react-router-dom";
import { TicketPass, PaperReceipt } from "@/components/promorang/SignatureObjects";
import { useWeeklyMomentDrop } from "@/hooks/useWeeklyMomentDrop";
import { buildMomentPath } from "@/lib/discovery";
import { matchesWeeklyDropItem } from "@/lib/city-hubs";
import { useMarket } from "@/contexts/MarketContext";
import { useI18n } from "@/i18n/I18nContext";

export function WeeklyMomentDrop() {
  const { t } = useI18n();
  const { city, formatLocalDate } = useMarket();
  const { data, isLoading } = useWeeklyMomentDrop();
  const items = (data?.items || []).filter((item) => matchesWeeklyDropItem(item, city));
  const fresh = items.filter((item) => item.role === "new_this_week");
  const horizon = items.filter((item) => item.role === "horizon");
  const shown = (fresh.length > 0 ? fresh : horizon).slice(0, 4);

  if (isLoading || !data?.drop) return null;

  const dateLabel = (value: string) =>
    formatLocalDate(value, { weekday: "short", month: "short", day: "numeric" });

  return (
    <section className="mb-8 overflow-hidden rounded-[1.75rem] border border-amber-300/20 bg-[#0b0b0b] p-5 text-white sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <PaperReceipt
          heading={data.drop.title || t("exploreMoments.thisWeek")}
          lines={[
            { label: t("exploreMoments.weekOf"), value: dateLabel(data.drop.week_start), strong: true },
            { label: t("exploreMoments.hubLabel"), value: city.name, strong: true },
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
          {shown.length > 0 ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {shown.map((item) => (
                <Link key={item.id} to={buildMomentPath({ id: item.moment_id, slug: item.slug })}>
                  <TicketPass
                    kicker={item.role === "new_this_week" ? t("exploreMoments.newStub") : t("exploreMoments.horizonStub")}
                    title={item.title}
                    detail={`${dateLabel(item.starts_at)} · ${item.venue_name || item.city || item.location || city.name}`}
                    stub={dateLabel(item.starts_at)}
                    stubLabel={t("exploreMoments.holdDate")}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-white/55">
              {t("exploreMoments.hubEmpty", { hub: city.name })}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default WeeklyMomentDrop;

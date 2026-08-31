import { Link } from "react-router-dom";
import { Bookmark, CalendarDays, MapPin, Users } from "lucide-react";
import type { ConsumerObject, MomentObject, SceneObject } from "@/lib/consumer-canonical";
import { useI18n } from "@/i18n/I18nContext";

interface ConsumerObjectCardProps {
  item: ConsumerObject;
  emphasis?: "default" | "feature";
}

const ConsumerObjectCard = ({ item, emphasis = "default" }: ConsumerObjectCardProps) => {
  const { t, formatNumber } = useI18n();
  const isMoment = item.kind === "moment";
  const isScene = item.kind === "scene";
  const moment = isMoment ? (item as MomentObject) : null;
  const scene = isScene ? (item as SceneObject) : null;
  const isConsumerPreview = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "consumer";
  const href = isConsumerPreview && isMoment ? `/?preview=consumer&moment=${encodeURIComponent(item.id)}` : (item.href || "#");

  return (
    <article className={`group overflow-hidden border-border bg-card ${emphasis === "feature" ? "border-y md:border" : "border-t"}`}>
      {item.imageUrl ? (
        <Link to={href} className="block overflow-hidden bg-muted">
          <img
            src={item.imageUrl}
            alt=""
            className={`w-full object-cover transition duration-500 group-hover:scale-[1.02] ${
              emphasis === "feature" ? "aspect-[16/10] md:aspect-[16/9]" : "aspect-[4/3]"
            }`}
          />
        </Link>
      ) : null}

      <div className={emphasis === "feature" ? "py-5 md:p-6" : "py-4"}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {item.eyebrow ? (
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary">{item.eyebrow}</p>
            ) : null}
            <Link to={href}>
              <h3
                className={`font-serif font-semibold leading-[1.02] tracking-[-0.035em] ${
                  emphasis === "feature" ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"
                }`}
              >
                {item.title}
              </h3>
            </Link>
            {item.subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{item.subtitle}</p> : null}
          </div>
          <button
            type="button"
            aria-label={t("consPrev.saveAria", { title: item.title })}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground transition hover:border-primary/40 hover:text-primary"
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>

        {moment ? (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
            {moment.startsAt ? <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{moment.startsAt}</span> : null}
            {moment.venueName || moment.location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{moment.venueName || moment.location}</span> : null}
            {typeof moment.participantCount === "number" ? <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{t("consPrev.interested", { count: formatNumber(moment.participantCount) })}</span> : null}
          </div>
        ) : null}

        {scene ? (
          <div className="mt-4 flex gap-5 text-xs text-muted-foreground">
            {typeof scene.signalCount === "number" ? <span>{t("consPrev.newSignals", { count: formatNumber(scene.signalCount) })}</span> : null}
            {typeof scene.trendingCount === "number" ? <span>{t("consPrev.trending", { count: formatNumber(scene.trendingCount) })}</span> : null}
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default ConsumerObjectCard;

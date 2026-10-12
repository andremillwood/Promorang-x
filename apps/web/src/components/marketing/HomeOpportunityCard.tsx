import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, ImageOff, MapPin } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import type { HomeOpportunity } from "./home-opportunities";
import "./HomeOpportunityCard.css";

const actionKeys = {
  moments: "homeOpportunity.viewEvent",
  offers: "homeOpportunity.viewOffer",
  missions: "homeOpportunity.exploreMission",
} as const;

/** A public preview; claim, RSVP and mission participation stay on their detail routes. */
export function HomeOpportunityCard({ item }: { item: HomeOpportunity }) {
  const { t, locale } = useI18n();
  const [failedImage, setFailedImage] = useState<string>();
  const date = item.date && Number.isFinite(Date.parse(item.date)) ? new Date(item.date) : null;
  const formattedDate = date ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date) : null;

  return <article className="home-discovery-card">
    <div className="home-discovery-media">
      {item.image && failedImage !== item.image ? <img
        src={item.image}
        alt=""
        draggable={false}
        onError={() => setFailedImage(item.image)}
      /> : <div className="home-discovery-placeholder"><ImageOff size={26} aria-hidden="true" /><span>{t("homeOpportunity.noArtwork")}</span></div>}
    </div>
    <div className="home-discovery-body">
      <p className="home-discovery-category">{t(`homeOpportunity.${item.kind}`)}{item.category ? ` · ${item.category}` : ""}</p>
      <h2>{item.title}</h2>
      {date && formattedDate ? <p className="home-discovery-meta"><CalendarDays size={14} aria-hidden="true" /><time dateTime={date.toISOString()}>{item.kind === "offers" ? t("homeValue.ends", { date: formattedDate }) : formattedDate}</time></p> : null}
      {item.location ? <p className="home-discovery-meta"><MapPin size={14} aria-hidden="true" /><span>{item.location}</span></p> : null}
      {item.description ? <p className="home-discovery-description">{item.description}</p> : null}
      <Link className="home-discovery-action" to={item.href}>{t(actionKeys[item.kind])}<ArrowRight size={16} aria-hidden="true" /></Link>
    </div>
  </article>;
}

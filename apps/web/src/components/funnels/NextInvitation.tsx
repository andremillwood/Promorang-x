import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { funnelRequest, type FunnelInvitation } from "@/lib/platform-funnels";

export function NextInvitation({ momentId, offerId }: { momentId?: string; offerId?: string }) {
  const sourceId = offerId || momentId;
  const kind = offerId ? "offer" : "moment";
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["next-invitations", kind, sourceId, user?.id],
    queryFn: () => funnelRequest<FunnelInvitation[]>(`/funnels/invitations/${encodeURIComponent(sourceId!)}?kind=${kind}`),
    enabled: Boolean(sourceId), staleTime: 60000,
  });
  return <section className="mt-8 border-y border-white/15 py-6 text-white">
    <h2 className="font-serif text-2xl font-bold">{t("funnel.nextInvite")}</h2>
    <p className="mt-2 text-sm leading-6 text-white/60">{t("funnel.nextInviteCopy")}</p>
    {query.isLoading ? <p className="mt-4 text-sm" role="status">{t("funnel.loading")}</p> : query.isError ? <p className="mt-4 text-sm" role="alert">{t("funnel.unavailable")} <button type="button" onClick={() => void query.refetch()} className="min-h-11 underline">{t("funnel.retry")}</button></p> : query.data?.length ? <div className="mt-5 grid gap-3 sm:grid-cols-3">{query.data.map(invitation => <Link key={invitation.id} to={invitation.href} className="group min-h-32 rounded-xl border border-white/20 p-4 transition hover:border-orange-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300"><p className="text-xs text-orange-300">{invitation.startsAt ? new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "America/Jamaica" }).format(new Date(invitation.startsAt)) : t("funnel.availablePerk")}</p><h3 className="mt-2 font-bold">{invitation.title}</h3><p className="mt-2 text-xs text-white/65">{invitation.location || invitation.city}</p><ArrowRight className="mt-3 h-4 w-4 text-orange-300" /></Link>)}</div> : <p className="mt-4 text-sm leading-6 text-white/60">{t("funnel.noInvites")}</p>}
    <Link to="/discover" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-orange-300">{t("funnel.explore")}<ArrowRight className="h-4 w-4" /></Link>
  </section>;
}

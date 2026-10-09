import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { usePlatformFunnels } from "@/hooks/usePlatformFunnels";
import { FunnelProgressCard } from "@/components/funnels/FunnelProgressCard";
import { NextInvitation } from "@/components/funnels/NextInvitation";
import type { FunnelKind } from "@/lib/platform-funnels";

export default function FunnelJourney() {
  const { activeRole } = useAuth();
  const { t } = useI18n();
  const [params] = useSearchParams();
  const query = usePlatformFunnels();
  const funnel: FunnelKind = ["brand", "agency"].includes(activeRole || "") ? "brand" : ["merchant", "host"].includes(activeRole || "") ? "operator" : "participant";
  const source = query.data?.participant.stages.find(stage => stage.stage === "verified")?.evidence;
  const momentId = params.get("moment") || (source?.entity_type === "moment" ? source.entity_id : "");
  const offerId = params.get("offer") || (source?.entity_type === "offer" ? source.entity_id : "");
  return <main className="min-h-screen bg-[#0b0b0a] px-5 py-16 text-white"><div className="mx-auto max-w-5xl"><h1 className="font-serif text-4xl font-bold">{t("funnel.progressTitle")}</h1><p className="mt-4 text-white/60">{t("funnel.progressCopy")}</p><FunnelProgressCard funnel={funnel} />{funnel === "participant" && (momentId || offerId) && <NextInvitation momentId={momentId} offerId={offerId} />}</div></main>;
}

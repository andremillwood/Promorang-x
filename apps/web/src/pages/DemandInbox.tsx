import { useAuth } from "@/contexts/AuthContext";
import { ExperienceShell } from "@/components/people/ExperienceShell";
import { DiscoveryDemandInbox } from "@/components/discovery/DiscoveryDemandInbox";
import { resolveDemandRole } from "@/lib/discovery-demand";
import { useI18n } from "@/i18n/I18nContext";

export default function DemandInbox() {
  const { t } = useI18n();
  const { activeRole } = useAuth();
  const role = resolveDemandRole(activeRole);

  return (
    <ExperienceShell
      eyebrow={t("demand.pageEyebrow")}
      title={t("demand.pageTitle")}
      description={t("demand.pageCopy")}
      backTo="/dashboard"
    >
      <DiscoveryDemandInbox role={role} />
    </ExperienceShell>
  );
}

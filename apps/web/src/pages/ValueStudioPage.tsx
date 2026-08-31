import React from "react";
import { useSearchParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { StakeholderValueHub, StakeholderRole } from "@/components/value/StakeholderValueHub";
import { useI18n } from "@/i18n/I18nContext";

const ValueStudioPage: React.FC = () => {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role") as StakeholderRole | null;
  const initialRole: StakeholderRole =
    roleParam && ["guest", "merchant", "creator", "host", "brand"].includes(roleParam)
      ? roleParam
      : "guest";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SEO
        title={t("valueStudio.seoTitle")}
        description={t("valueStudio.seoDescription")}
      />
      <div className="pt-20 pb-16">
        <StakeholderValueHub initialRole={initialRole} showHeroBanner={true} />
      </div>
    </div>
  );
};

export default ValueStudioPage;

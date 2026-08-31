import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { PromorangNodeHub } from "@/components/nodes/PromorangNodeHub";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";

export default function NodesPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const userTier = (user?.user_tier as "free" | "premium" | "super") || "premium";
  const streakDays = user?.points_streak_days || 34;

  return (
    <div className="min-h-screen bg-[#090909] pb-20 pt-24">
      <SEO
        title={t("nodesHub.seoTitle")}
        description={t("nodesHub.seoDescription")}
      />
      <PromorangNodeHub
        userTier={userTier}
        streakDays={streakDays}
        stakedBalance={1000}
        onUpgradeTier={() => navigate("/pricing")}
        onStake={(vaultId, amount) => {
          console.log(`Saving ${amount} USD into vault ${vaultId}`);
        }}
      />
    </div>
  );
}

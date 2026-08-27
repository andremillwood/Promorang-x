import React from "react";
import { useSearchParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { StakeholderValueHub, StakeholderRole } from "@/components/value/StakeholderValueHub";

const ValueStudioPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role") as StakeholderRole | null;
  const initialRole: StakeholderRole =
    roleParam && ["guest", "merchant", "creator", "host", "brand"].includes(roleParam)
      ? roleParam
      : "guest";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SEO
        title="Interactive Value Studio & ROI Simulator | Promorang"
        description="Experience real-world earnings, VIP perks, merchant foot-traffic lift, and syndicate de-risking before signing up."
      />
      <div className="pt-20 pb-16">
        <StakeholderValueHub initialRole={initialRole} showHeroBanner={true} />
      </div>
    </div>
  );
};

export default ValueStudioPage;

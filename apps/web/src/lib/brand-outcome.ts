import type { Campaign } from "@/hooks/useCampaigns";

export type BrandOutcomeFacts = {
  campaigns: Campaign[];
};

export type BrandDecisionSignal = {
  id: "define" | "fund" | "launch" | "attribute" | "value" | "decide";
  label: string;
  state: "verified" | "current" | "unknown" | "upcoming";
  detail: string;
};

export function resolveBrandOutcome(facts: BrandOutcomeFacts) {
  const campaigns = facts.campaigns || [];
  const activeCampaigns = campaigns.filter((campaign) => campaign.is_active);
  const totalRedemptions = campaigns.reduce((sum, campaign) => sum + Number(campaign.redemptions || 0), 0);
  const totalImpressions = campaigns.reduce((sum, campaign) => sum + Number(campaign.impressions || 0), 0);
  const hasDefinedObjective = campaigns.some((campaign) => Boolean(campaign.objective_type || campaign.title));
  const hasBudgetAllocation = campaigns.some((campaign) => Number(campaign.budget || 0) > 0);

  const nextMove = campaigns.length === 0
    ? {
        title: "Define one customer outcome worth proving.",
        description: "Start with a behavior such as visit, try, buy, review, refer, sign up, or attend. Do not start with channels or impressions.",
        label: "Create first activation",
        href: "/create/campaign",
      }
    : activeCampaigns.length === 0
      ? {
          title: "Get one activation ready to launch.",
          description: "Confirm the customer promise, fulfilment, funding responsibility, distribution window, and proof requirement before making it live.",
          label: "Review activations",
          href: "/dashboard?tab=campaigns",
        }
      : totalRedemptions === 0
        ? {
            title: "Get the first attributable customer action.",
            description: "An activation is live. The next useful proof is not another impression—it is a customer action PROMORANG can attribute to the activation.",
            label: "Review live activation",
            href: "/dashboard?tab=campaigns",
          }
        : {
            title: "Decide what the verified customer actions actually mean.",
            description: "PROMORANG has attributable actions. Review who acted, what was verified, and whether transaction or incremental-value evidence exists before deciding to scale.",
            label: "Review proof",
            href: "/dashboard?tab=correlation",
          };

  const signals: BrandDecisionSignal[] = [
    {
      id: "define",
      label: "Customer outcome",
      state: hasDefinedObjective ? "verified" : "current",
      detail: hasDefinedObjective ? "An activation objective exists." : "Define the customer behavior this activation should cause.",
    },
    {
      id: "fund",
      label: "Funded / fulfillable supply",
      state: hasBudgetAllocation ? "unknown" : campaigns.length ? "current" : "upcoming",
      detail: hasBudgetAllocation
        ? "A budget value is recorded, but this alone does not prove funds or inventory are secured."
        : "PROMORANG does not yet have authoritative funding or fulfilment proof here.",
    },
    {
      id: "launch",
      label: "Activation live",
      state: activeCampaigns.length > 0 ? "verified" : campaigns.length ? "current" : "upcoming",
      detail: activeCampaigns.length > 0 ? `${activeCampaigns.length} activation${activeCampaigns.length === 1 ? " is" : "s are"} live.` : "No activation is currently live.",
    },
    {
      id: "attribute",
      label: "Attributed action",
      state: totalRedemptions > 0 ? "verified" : activeCampaigns.length ? "current" : "upcoming",
      detail: totalRedemptions > 0 ? `${totalRedemptions.toLocaleString()} recorded redemption${totalRedemptions === 1 ? "" : "s"}.` : "Waiting for the first attributable customer action.",
    },
    {
      id: "value",
      label: "Incremental value",
      state: totalRedemptions > 0 ? "unknown" : "upcoming",
      detail: "Not inferred from redemptions or impressions. Requires transaction or other approved incremental-value evidence.",
    },
    {
      id: "decide",
      label: "Scale / modify / stop",
      state: totalRedemptions > 0 ? "current" : "upcoming",
      detail: totalRedemptions > 0 ? "A decision can be informed by proof, but value evidence may still be incomplete." : "Decision follows attributable evidence.",
    },
  ];

  return {
    activeCampaigns,
    totalRedemptions,
    totalImpressions,
    hasDefinedObjective,
    hasBudgetAllocation,
    nextMove,
    signals,
  };
}

import { FileCheck2 } from "lucide-react";

export interface EvidenceItem {
  id: string;
  type: "photo" | "video" | "check_in" | "referral";
  user_name: string;
  action_description: string;
  verification_status: "verified" | "pending";
  timestamp: string;
  media_url?: string;
  location?: string;
  reward_issued: string;
}

interface EvidenceFeedProps {
  brandId: string;
  campaignId?: string;
  maxItems?: number;
}

/**
 * Legacy compatibility component.
 *
 * PROMORANG does not currently expose one canonical cross-user visual-evidence
 * feed for this Brand analytics surface. The previous implementation filled
 * that gap with fabricated users, GPS verification and rewards. Preserve an
 * honest boundary until a source with appropriate access/provenance exists.
 */
export function EvidenceFeed(_props: EvidenceFeedProps) {
  return (
    <section className="rounded-xl border border-dashed border-border bg-card p-6">
      <FileCheck2 className="h-5 w-5 text-primary" />
      <h3 className="mt-3 text-base font-bold text-foreground">Visual evidence feed not available here.</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Use the Brand Evidence Pack for recorded attribution and campaign evidence. PROMORANG will not substitute sample people, verification, locations, or rewards for a missing evidence source.
      </p>
    </section>
  );
}

import { CreatorO2OSummaryPanel } from "@/components/host/CreatorO2OSummaryPanel";
import { O2OLinkManager } from "@/components/host/O2OLinkManager";

export function CreatorAttributionMap() {
  return (
    <div className="min-w-0 space-y-6">
      <O2OLinkManager />
      <CreatorO2OSummaryPanel />
    </div>
  );
}

export default CreatorAttributionMap;

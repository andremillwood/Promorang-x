import { AgencyManagedResultPack } from "@/components/agency/AgencyManagedResultPack";

/**
 * Compatibility wrapper for the Agency dashboard's legacy Impact mount.
 *
 * Agency impact is now expressed through connected-client records rather than
 * hard-coded ROI, reach, growth projections, or synthetic check-in metrics.
 */
export function BrandImpactDashboard() {
  return <AgencyManagedResultPack />;
}

export default BrandImpactDashboard;

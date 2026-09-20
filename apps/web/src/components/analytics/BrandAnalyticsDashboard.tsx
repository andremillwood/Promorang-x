import BrandEvidencePack from "@/components/brand/BrandEvidencePack";

interface BrandAnalyticsDashboardProps {
  userId: string;
}

/**
 * Compatibility surface for the historical /analytics Brand route.
 *
 * The previous dashboard mixed real aggregate campaign rows with fabricated
 * evidence, hard-coded verification labels, unsupported benchmark claims and
 * a mock recap. Brand evidence now converges on the canonical source-backed
 * BrandEvidencePack instead of maintaining a second analytics truth model.
 */
export function BrandAnalyticsDashboard(_props: BrandAnalyticsDashboardProps) {
  return <BrandEvidencePack />;
}

export default BrandAnalyticsDashboard;

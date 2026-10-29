import { O2OAnalyticsPanel } from "@/components/analytics/O2OAnalyticsPanel";
import BrandIntelligenceConsole from "@/components/brand/BrandIntelligenceConsole";

export default function BrandEvidencePack() {
  return (
    <div className="min-w-0 space-y-8">
      <header>
        <h2 className="font-sans text-2xl font-semibold tracking-tight">Campaign evidence</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Review linked activity alongside campaign redemptions. Attribution, verification and payment each have their own records.</p>
      </header>
      <O2OAnalyticsPanel audience="brand" />
      <BrandIntelligenceConsole compact />
    </div>
  );
}

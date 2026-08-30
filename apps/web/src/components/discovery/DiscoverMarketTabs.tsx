import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DISCOVER_TABS, isDiscoverTab, type DiscoverTab } from "./discover-tabs";

type DiscoverMarketTabsProps = {
  value: DiscoverTab;
  onValueChange: (tab: DiscoverTab) => void;
  perkCount?: number;
  momentCount?: number;
};

export function DiscoverMarketTabs({
  value,
  onValueChange,
  perkCount,
  momentCount,
}: DiscoverMarketTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => {
        if (isDiscoverTab(next)) onValueChange(next);
      }}
      className="w-full border-b border-white/10 pb-4"
    >
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 overflow-x-visible rounded-lg border border-white/10 bg-white/[0.04] p-1">
        {DISCOVER_TABS.map((tab) => {
          const count = tab.id === "perks" ? perkCount : tab.id === "moments" ? momentCount : undefined;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="min-w-[calc(50%-0.125rem)] flex-1 gap-1.5 rounded-md px-3 text-xs font-semibold text-white/70 data-[state=active]:bg-primary data-[state=active]:text-white sm:min-w-0 sm:flex-none sm:text-sm"
            >
              <tab.icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{tab.label}</span>
              {count != null && (
                <Badge
                  variant="secondary"
                  className="h-5 min-w-5 border-none bg-black/30 px-1.5 text-[10px] font-bold text-current"
                >
                  {count}
                </Badge>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

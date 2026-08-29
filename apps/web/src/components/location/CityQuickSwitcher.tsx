import { useState, useMemo } from "react";
import { MapPin, ChevronDown, Check, Search, Globe } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMarket } from "@/contexts/MarketContext";
import { useI18n } from "@/i18n/I18nContext";
import { ALL_CITY_HUBS, type CityOption, type RegionCategory } from "@/lib/city-hubs";
import { themeChipClass, themeMutedClass, themeOverlayClass } from "@/components/nav/theme-surfaces";
import { cn } from "@/lib/utils";

export type { CityOption, RegionCategory } from "@/lib/city-hubs";
export { ALL_CITY_HUBS, POPULAR_CITIES } from "@/lib/city-hubs";

export function CityQuickSwitcher({
  className = "",
  tone = "app",
}: {
  className?: string;
  tone?: "marketing" | "app";
}) {
  const { t } = useI18n();
  const { city, setCity } = useMarket();
  const [filterText, setFilterText] = useState("");
  const [activeTab, setActiveTab] = useState<RegionCategory>("all");

  const handleSelectCity = (next: CityOption) => {
    setCity(next);
    toast.success(`Now browsing ${next.name}`, {
      description: next.badge === "Live Pulse"
        ? "Discover, Pulse, and the map will show this hub."
        : next.badge === "Island-Wide"
          ? "Showing Moments and places across Jamaica."
          : "Discover and Pulse will switch to this hub. Live coverage is still growing here.",
    });
  };

  const filteredCities = useMemo(() => {
    let list = ALL_CITY_HUBS;
    if (activeTab !== "all") {
      list = list.filter((item) => item.category === activeTab);
    }
    if (filterText.trim()) {
      const query = filterText.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          (item.region && item.region.toLowerCase().includes(query)) ||
          item.countryName.toLowerCase().includes(query)
      );
    }
    return list;
  }, [activeTab, filterText]);

  const regionCounts = useMemo(() => {
    return {
      all: ALL_CITY_HUBS.length,
      jamaica: ALL_CITY_HUBS.filter((item) => item.category === "jamaica").length,
      caribbean: ALL_CITY_HUBS.filter((item) => item.category === "caribbean").length,
      latam: ALL_CITY_HUBS.filter((item) => item.category === "latam").length,
      africa: ALL_CITY_HUBS.filter((item) => item.category === "africa").length,
      diaspora: ALL_CITY_HUBS.filter((item) => item.category === "diaspora").length,
    };
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all outline-none cursor-pointer shadow-sm shrink-0",
          themeChipClass,
          className,
        )}
      >
        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="max-w-[125px] truncate">{city.name}</span>
        <ChevronDown className={cn("w-3 h-3 shrink-0", themeMutedClass)} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn("w-80 p-2.5 space-y-2", themeOverlayClass)}
      >
        <div className="px-1 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-foreground">
            <Globe className="w-3.5 h-3.5 text-primary" /> Active City Hubs
          </span>
          <span className="text-primary text-[10px] font-bold bg-primary/10 px-2 py-0.5 rounded-full">
            {ALL_CITY_HUBS.length} Global Hubs
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search country, city or parish..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-muted border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all" as const, label: "All", count: regionCounts.all },
            { id: "jamaica" as const, label: "🇯🇲 JA", count: regionCounts.jamaica },
            { id: "caribbean" as const, label: "🌴 Caribbean", count: regionCounts.caribbean },
            { id: "latam" as const, label: "🌎 LatAm", count: regionCounts.latam },
            { id: "africa" as const, label: "🌍 Africa", count: regionCounts.africa },
            { id: "diaspora" as const, label: "✈️ Diaspora", count: regionCounts.diaspora },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab(tab.id);
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition shrink-0 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {tab.label}
              <span className="ml-1 opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="max-h-[320px] overflow-y-auto space-y-0.5 pr-0.5">
          {filteredCities.map((item) => {
            const isSelected = city.id === item.id;
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => handleSelectCity(item)}
                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-accent transition ${
                  isSelected ? "bg-primary/15 text-primary font-bold shadow-sm" : "text-foreground"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs truncate">{item.name}</span>
                    <span className="text-[9px] text-muted-foreground truncate">
                      {item.region ? `${item.region} • ` : ""}{item.countryName}
                    </span>
                  </div>
                </div>
                {item.badge && (
                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ml-1.5 ${
                    item.badge === "Live Pulse" || item.badge === "Island-Wide"
                      ? "bg-primary/20 text-primary"
                      : item.badge === "Pilot"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {item.badge === "Live Pulse" ? t("citySwitcher.livePulse") : item.badge}
                  </span>
                )}
                {isSelected && !item.badge && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-1.5" />}
              </DropdownMenuItem>
            );
          })}

          {filteredCities.length === 0 && (
            <div className="p-6 text-center text-xs text-muted-foreground space-y-1">
              <p>No matching city hub found.</p>
              <p className="text-[10px] text-muted-foreground">Try clearing your search or switching region tabs.</p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

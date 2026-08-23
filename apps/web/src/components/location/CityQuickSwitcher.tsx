import { useState } from "react";
import { MapPin, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMarket } from "@/contexts/MarketContext";
import { useI18n } from "@/i18n/I18nContext";

export interface CityOption {
  id: string;
  name: string;
  countryCode: string;
  countryName: string;
  badge?: string;
}

export const POPULAR_CITIES: CityOption[] = [
  { id: "kingston", name: "Kingston", countryCode: "JM", countryName: "Jamaica", badge: "Live Pulse" },
  { id: "montego-bay", name: "Montego Bay", countryCode: "JM", countryName: "Jamaica" },
  { id: "ocho-rios", name: "Ocho Rios", countryCode: "JM", countryName: "Jamaica" },
  { id: "portmore", name: "Portmore", countryCode: "JM", countryName: "Jamaica" },
  { id: "negril", name: "Negril", countryCode: "JM", countryName: "Jamaica" },
  { id: "miami", name: "Miami", countryCode: "US", countryName: "United States", badge: "Beta" },
  { id: "new-york", name: "New York", countryCode: "US", countryName: "United States", badge: "Beta" },
  { id: "london", name: "London", countryCode: "GB", countryName: "United Kingdom", badge: "Beta" },
];

export function CityQuickSwitcher({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const { country, setCountry } = useMarket();
  const [selectedCity, setSelectedCity] = useState<CityOption>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("promorang:selected_city");
      if (saved) {
        const found = POPULAR_CITIES.find((c) => c.id === saved);
        if (found) return found;
      }
    }
    return POPULAR_CITIES[0];
  });

  const handleSelectCity = (city: CityOption) => {
    setSelectedCity(city);
    if (typeof window !== "undefined") {
      localStorage.setItem("promorang:selected_city", city.id);
    }
    if (city.countryCode !== country.code) {
      setCountry(city.countryCode);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white text-xs font-semibold transition-all outline-none cursor-pointer shadow-sm shrink-0 ${className}`}
      >
        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="max-w-[110px] truncate">{selectedCity.name}</span>
        <ChevronDown className="w-3 h-3 text-white/40 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56 p-1.5 rounded-2xl shadow-2xl border-white/10 bg-[#0e0e11]/95 backdrop-blur-xl text-white space-y-0.5 animate-in fade-in-50 zoom-in-95 duration-150"
      >
        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10 mb-1 flex items-center justify-between">
          <span>{t("citySwitcher.title")}</span>
          <span className="text-primary text-[10px] font-normal">{t("citySwitcher.switch")}</span>
        </div>
        {POPULAR_CITIES.map((city) => {
          const isSelected = selectedCity.id === city.id;
          return (
            <DropdownMenuItem
              key={city.id}
              onClick={() => handleSelectCity(city)}
              className={`flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-white/[0.08] transition ${
                isSelected ? "bg-primary/15 text-primary font-bold" : "text-white/80"
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? "text-primary" : "text-white/40"}`} />
                <div className="flex flex-col">
                  <span className="text-xs">{city.name}</span>
                  <span className="text-[9px] text-white/40">{city.countryName}</span>
                </div>
              </div>
              {city.badge && (
                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                  {city.badge === "Live Pulse" ? t("citySwitcher.livePulse") : city.badge}
                </span>
              )}
              {isSelected && !city.badge && <Check className="w-3.5 h-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

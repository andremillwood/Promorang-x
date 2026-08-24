import { useState, useMemo } from "react";
import { MapPin, ChevronDown, Check, Search, Globe, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMarket } from "@/contexts/MarketContext";
import { useI18n } from "@/i18n/I18nContext";

export type RegionCategory = "all" | "jamaica" | "caribbean" | "latam" | "africa" | "diaspora";

export interface CityOption {
  id: string;
  name: string;
  region?: string;
  countryCode: string;
  countryName: string;
  category: "jamaica" | "caribbean" | "latam" | "africa" | "diaspora";
  badge?: string;
}

export const ALL_CITY_HUBS: CityOption[] = [
  // ==========================================
  // 🇯🇲 JAMAICA (DOMESTIC HUBS & PARISHES)
  // ==========================================
  { id: "all-jamaica", name: "All Jamaica", region: "Island-Wide", countryCode: "JM", countryName: "Jamaica", category: "jamaica", badge: "Island-Wide" },
  { id: "kingston", name: "Kingston & St. Andrew", region: "Corporate Area", countryCode: "JM", countryName: "Jamaica", category: "jamaica", badge: "Live Pulse" },
  { id: "montego-bay", name: "Montego Bay", region: "St. James", countryCode: "JM", countryName: "Jamaica", category: "jamaica" },
  { id: "ocho-rios", name: "Ocho Rios", region: "St. Ann", countryCode: "JM", countryName: "Jamaica", category: "jamaica" },
  { id: "negril", name: "Negril", region: "Westmoreland & Hanover", countryCode: "JM", countryName: "Jamaica", category: "jamaica" },
  { id: "port-antonio", name: "Port Antonio & Boston", region: "Portland", countryCode: "JM", countryName: "Jamaica", category: "jamaica" },
  { id: "treasure-beach", name: "South Coast & Treasure Beach", region: "St. Elizabeth", countryCode: "JM", countryName: "Jamaica", category: "jamaica" },
  { id: "portmore", name: "Portmore & Hellshire", region: "St. Catherine", countryCode: "JM", countryName: "Jamaica", category: "jamaica" },
  { id: "mandeville", name: "Mandeville", region: "Manchester", countryCode: "JM", countryName: "Jamaica", category: "jamaica" },
  { id: "falmouth", name: "Falmouth", region: "Trelawny", countryCode: "JM", countryName: "Jamaica", category: "jamaica" },
  { id: "blue-mountains", name: "Blue Mountains & Holywell", region: "St. Andrew / Portland", countryCode: "JM", countryName: "Jamaica", category: "jamaica" },

  // ==========================================
  // 🌴 CARIBBEAN REGION
  // ==========================================
  { id: "trinidad", name: "Port of Spain", region: "Trinidad & Tobago", countryCode: "TT", countryName: "Trinidad & Tobago", category: "caribbean", badge: "Pilot" },
  { id: "barbados", name: "Bridgetown", region: "Barbados", countryCode: "BB", countryName: "Barbados", category: "caribbean", badge: "Pilot" },
  { id: "bahamas", name: "Nassau", region: "The Bahamas", countryCode: "BS", countryName: "The Bahamas", category: "caribbean", badge: "Pilot" },
  { id: "guyana", name: "Georgetown", region: "Guyana", countryCode: "GY", countryName: "Guyana", category: "caribbean", badge: "Pilot" },
  { id: "dominican-republic", name: "Santo Domingo", region: "Dominican Republic", countryCode: "DO", countryName: "Dominican Republic", category: "caribbean", badge: "Pilot" },
  { id: "puerto-rico", name: "San Juan", region: "Puerto Rico", countryCode: "PR", countryName: "Puerto Rico", category: "caribbean", badge: "Beta" },
  { id: "cuba", name: "Havana", region: "Cuba", countryCode: "CU", countryName: "Cuba", category: "caribbean", badge: "Beta" },
  { id: "haiti", name: "Port-au-Prince", region: "Haiti", countryCode: "HT", countryName: "Haiti", category: "caribbean", badge: "Beta" },
  { id: "curacao", name: "Willemstad", region: "Curaçao", countryCode: "CW", countryName: "Curaçao", category: "caribbean", badge: "Beta" },
  { id: "antigua", name: "St. John's", region: "Antigua & Barbuda", countryCode: "AG", countryName: "Antigua & Barbuda", category: "caribbean", badge: "Beta" },
  { id: "st-lucia", name: "Castries", region: "Saint Lucia", countryCode: "LC", countryName: "Saint Lucia", category: "caribbean", badge: "Beta" },
  { id: "cayman", name: "George Town", region: "Cayman Islands", countryCode: "KY", countryName: "Cayman Islands", category: "caribbean", badge: "Beta" },
  { id: "belize", name: "Belize City", region: "Belize", countryCode: "BZ", countryName: "Belize", category: "caribbean", badge: "Beta" },
  { id: "grenada", name: "St. George's", region: "Grenada", countryCode: "GD", countryName: "Grenada", category: "caribbean", badge: "Beta" },
  { id: "bermuda", name: "Hamilton", region: "Bermuda", countryCode: "BM", countryName: "Bermuda", category: "caribbean", badge: "Beta" },

  // ==========================================
  // 🌎 LATIN AMERICA
  // ==========================================
  { id: "medellin", name: "Medellín", region: "Antioquia", countryCode: "CO", countryName: "Colombia", category: "latam", badge: "Pilot" },
  { id: "bogota", name: "Bogotá", region: "Distrito Capital", countryCode: "CO", countryName: "Colombia", category: "latam", badge: "Pilot" },
  { id: "panama-city", name: "Panama City", region: "Panamá", countryCode: "PA", countryName: "Panama", category: "latam", badge: "Pilot" },
  { id: "mexico-city", name: "Mexico City (CDMX)", region: "Distrito Federal", countryCode: "MX", countryName: "Mexico", category: "latam", badge: "Beta" },
  { id: "sao-paulo", name: "São Paulo", region: "Estado de São Paulo", countryCode: "BR", countryName: "Brazil", category: "latam", badge: "Beta" },
  { id: "rio", name: "Rio de Janeiro", region: "Estado do Rio", countryCode: "BR", countryName: "Brazil", category: "latam", badge: "Beta" },
  { id: "buenos-aires", name: "Buenos Aires", region: "Capital Federal", countryCode: "AR", countryName: "Argentina", category: "latam", badge: "Beta" },
  { id: "lima", name: "Lima", region: "Provincia de Lima", countryCode: "PE", countryName: "Peru", category: "latam", badge: "Beta" },
  { id: "santiago", name: "Santiago", region: "Región Metropolitana", countryCode: "CL", countryName: "Chile", category: "latam", badge: "Beta" },
  { id: "san-jose", name: "San José", region: "San José", countryCode: "CR", countryName: "Costa Rica", category: "latam", badge: "Beta" },
  { id: "quito", name: "Quito", region: "Pichincha", countryCode: "EC", countryName: "Ecuador", category: "latam", badge: "Beta" },
  { id: "guatemala-city", name: "Guatemala City", region: "Guatemala", countryCode: "GT", countryName: "Guatemala", category: "latam", badge: "Beta" },
  { id: "montevideo", name: "Montevideo", region: "Montevideo", countryCode: "UY", countryName: "Uruguay", category: "latam", badge: "Beta" },
  { id: "caracas", name: "Caracas", region: "Distrito Capital", countryCode: "VE", countryName: "Venezuela", category: "latam", badge: "Beta" },

  // ==========================================
  // 🌍 AFRICA
  // ==========================================
  { id: "accra", name: "Accra", region: "Greater Accra", countryCode: "GH", countryName: "Ghana", category: "africa", badge: "Pilot" },
  { id: "lagos", name: "Lagos", region: "Lagos State", countryCode: "NG", countryName: "Nigeria", category: "africa", badge: "Pilot" },
  { id: "nairobi", name: "Nairobi", region: "Nairobi County", countryCode: "KE", countryName: "Kenya", category: "africa", badge: "Beta" },
  { id: "johannesburg", name: "Johannesburg", region: "Gauteng", countryCode: "ZA", countryName: "South Africa", category: "africa", badge: "Beta" },
  { id: "cape-town", name: "Cape Town", region: "Western Cape", countryCode: "ZA", countryName: "South Africa", category: "africa", badge: "Beta" },
  { id: "dakar", name: "Dakar", region: "Dakar", countryCode: "SN", countryName: "Senegal", category: "africa", badge: "Beta" },
  { id: "kigali", name: "Kigali", region: "Kigali Province", countryCode: "RW", countryName: "Rwanda", category: "africa", badge: "Beta" },

  // ==========================================
  // ✈️ GLOBAL DIASPORA HUBS
  // ==========================================
  { id: "miami", name: "Miami & South Florida", region: "Florida", countryCode: "US", countryName: "United States", category: "diaspora", badge: "Beta" },
  { id: "new-york", name: "New York (NYC)", region: "New York", countryCode: "US", countryName: "United States", category: "diaspora", badge: "Beta" },
  { id: "atlanta", name: "Atlanta", region: "Georgia", countryCode: "US", countryName: "United States", category: "diaspora", badge: "Beta" },
  { id: "toronto", name: "Toronto", region: "Ontario", countryCode: "CA", countryName: "Canada", category: "diaspora", badge: "Beta" },
  { id: "london", name: "London", region: "Greater London", countryCode: "GB", countryName: "United Kingdom", category: "diaspora", badge: "Beta" },
];

export const POPULAR_CITIES = ALL_CITY_HUBS;

export function CityQuickSwitcher({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const { country, setCountry } = useMarket();
  const [filterText, setFilterText] = useState("");
  const [activeTab, setActiveTab] = useState<RegionCategory>("all");
  const [selectedCity, setSelectedCity] = useState<CityOption>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("promorang:selected_city");
      if (saved) {
        const found = ALL_CITY_HUBS.find((c) => c.id === saved);
        if (found) return found;
      }
    }
    return ALL_CITY_HUBS[1] || ALL_CITY_HUBS[0]; // Default to Kingston
  });

  const handleSelectCity = (city: CityOption) => {
    setSelectedCity(city);
    if (typeof window !== "undefined") {
      localStorage.setItem("promorang:selected_city", city.id);
    }
    setCountry(city.countryCode);
  };

  const filteredCities = useMemo(() => {
    let list = ALL_CITY_HUBS;
    if (activeTab !== "all") {
      list = list.filter((c) => c.category === activeTab);
    }
    if (filterText.trim()) {
      const query = filterText.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          (c.region && c.region.toLowerCase().includes(query)) ||
          c.countryName.toLowerCase().includes(query)
      );
    }
    return list;
  }, [activeTab, filterText]);

  const regionCounts = useMemo(() => {
    return {
      all: ALL_CITY_HUBS.length,
      jamaica: ALL_CITY_HUBS.filter((c) => c.category === "jamaica").length,
      caribbean: ALL_CITY_HUBS.filter((c) => c.category === "caribbean").length,
      latam: ALL_CITY_HUBS.filter((c) => c.category === "latam").length,
      africa: ALL_CITY_HUBS.filter((c) => c.category === "africa").length,
      diaspora: ALL_CITY_HUBS.filter((c) => c.category === "diaspora").length,
    };
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white text-xs font-semibold transition-all outline-none cursor-pointer shadow-sm shrink-0 ${className}`}
      >
        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="max-w-[125px] truncate">{selectedCity.name}</span>
        <ChevronDown className="w-3 h-3 text-white/40 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-80 p-2.5 rounded-2xl shadow-2xl border-white/10 bg-[#0e0e11]/98 backdrop-blur-2xl text-white space-y-2 animate-in fade-in-50 zoom-in-95 duration-150"
      >
        {/* Header with Title & Total Hubs */}
        <div className="px-1 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10 pb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-white/70">
            <Globe className="w-3.5 h-3.5 text-primary" /> Active City Hubs
          </span>
          <span className="text-primary text-[10px] font-bold bg-primary/10 px-2 py-0.5 rounded-full">
            {ALL_CITY_HUBS.length} Global Hubs
          </span>
        </div>

        {/* Live Search Filter */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search country, city or parish..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-primary/60 transition"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>

        {/* Region Pills Filter */}
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
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.label}
              <span className="ml-1 opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Scrollable list of Hubs */}
        <div className="max-h-[320px] overflow-y-auto space-y-0.5 pr-0.5 scrollbar-thin scrollbar-thumb-white/10">
          {filteredCities.map((city) => {
            const isSelected = selectedCity.id === city.id;
            return (
              <DropdownMenuItem
                key={city.id}
                onClick={() => handleSelectCity(city)}
                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-white/[0.08] transition ${
                  isSelected ? "bg-primary/20 text-primary font-bold shadow-sm" : "text-white/80"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-primary" : "text-white/40"}`} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs truncate">{city.name}</span>
                    <span className="text-[9px] text-white/40 truncate">
                      {city.region ? `${city.region} • ` : ""}{city.countryName}
                    </span>
                  </div>
                </div>
                {city.badge && (
                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ml-1.5 ${
                    city.badge === "Live Pulse" || city.badge === "Island-Wide"
                      ? "bg-primary/20 text-primary"
                      : city.badge === "Pilot"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/10 text-white/60"
                  }`}>
                    {city.badge === "Live Pulse" ? t("citySwitcher.livePulse") : city.badge}
                  </span>
                )}
                {isSelected && !city.badge && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-1.5" />}
              </DropdownMenuItem>
            );
          })}

          {filteredCities.length === 0 && (
            <div className="p-6 text-center text-xs text-white/40 space-y-1">
              <p>No matching city hub found.</p>
              <p className="text-[10px] text-white/30">Try clearing your search or switching region tabs.</p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

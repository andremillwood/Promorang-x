import { useState, useMemo } from "react";
import { MapPin, ChevronDown, Check, Search, Globe } from "lucide-react";
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
  region?: string;
  countryCode: string;
  countryName: string;
  category: "jamaica" | "caribbean" | "diaspora";
  badge?: string;
}

export const POPULAR_CITIES: CityOption[] = [
  // --- JAMAICA (DOMESTIC HUBS & PARISHES) ---
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

  // --- CARIBBEAN REGIONAL HUBS ---
  { id: "bridgetown", name: "Bridgetown", region: "St. Michael", countryCode: "BB", countryName: "Barbados", category: "caribbean", badge: "Beta" },
  { id: "port-of-spain", name: "Port of Spain", region: "Trinidad", countryCode: "TT", countryName: "Trinidad & Tobago", category: "caribbean", badge: "Beta" },
  { id: "nassau", name: "Nassau", region: "New Providence", countryCode: "BS", countryName: "Bahamas", category: "caribbean", badge: "Beta" },
  { id: "san-juan", name: "San Juan", region: "Puerto Rico", countryCode: "PR", countryName: "Puerto Rico", category: "caribbean", badge: "Beta" },

  // --- GLOBAL DIASPORA HUBS ---
  { id: "miami", name: "Miami & South Florida", region: "Florida", countryCode: "US", countryName: "United States", category: "diaspora", badge: "Beta" },
  { id: "new-york", name: "New York (NYC)", region: "New York", countryCode: "US", countryName: "United States", category: "diaspora", badge: "Beta" },
  { id: "atlanta", name: "Atlanta", region: "Georgia", countryCode: "US", countryName: "United States", category: "diaspora", badge: "Beta" },
  { id: "toronto", name: "Toronto", region: "Ontario", countryCode: "CA", countryName: "Canada", category: "diaspora", badge: "Beta" },
  { id: "london", name: "London", region: "Greater London", countryCode: "GB", countryName: "United Kingdom", category: "diaspora", badge: "Beta" },
];

export function CityQuickSwitcher({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const { country, setCountry } = useMarket();
  const [filterText, setFilterText] = useState("");
  const [selectedCity, setSelectedCity] = useState<CityOption>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("promorang:selected_city");
      if (saved) {
        const found = POPULAR_CITIES.find((c) => c.id === saved);
        if (found) return found;
      }
    }
    return POPULAR_CITIES[1] || POPULAR_CITIES[0]; // Default to Kingston
  });

  const handleSelectCity = (city: CityOption) => {
    setSelectedCity(city);
    if (typeof window !== "undefined") {
      localStorage.setItem("promorang:selected_city", city.id);
    }
    if (city.countryCode !== country.code && (city.countryCode === "JM" || city.countryCode === "US" || city.countryCode === "GB" || city.countryCode === "CA")) {
      setCountry(city.countryCode);
    }
  };

  const filteredCities = useMemo(() => {
    if (!filterText.trim()) return POPULAR_CITIES;
    const query = filterText.toLowerCase().trim();
    return POPULAR_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.region && c.region.toLowerCase().includes(query)) ||
        c.countryName.toLowerCase().includes(query)
    );
  }, [filterText]);

  const jamaicaList = filteredCities.filter((c) => c.category === "jamaica");
  const caribbeanList = filteredCities.filter((c) => c.category === "caribbean");
  const diasporaList = filteredCities.filter((c) => c.category === "diaspora");

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
        className="w-72 p-2 rounded-2xl shadow-2xl border-white/10 bg-[#0e0e11]/98 backdrop-blur-2xl text-white space-y-1 animate-in fade-in-50 zoom-in-95 duration-150"
      >
        {/* Header with Title & Switch Label */}
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-primary" /> Active City Hubs
          </span>
          <span className="text-primary text-[10px] font-medium">{POPULAR_CITIES.length} Hubs</span>
        </div>

        {/* Live Search Filter */}
        <div className="px-1 py-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search parish or city hub..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-primary/60 transition"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        {/* Scrollable list with Sections */}
        <div className="max-h-[340px] overflow-y-auto space-y-1 pr-0.5 scrollbar-thin scrollbar-thumb-white/10">
          {jamaicaList.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[9px] font-extrabold uppercase tracking-widest text-primary/80">
                🇯🇲 Jamaica Parishes &amp; Hubs
              </div>
              {jamaicaList.map((city) => {
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
                        {city.region && <span className="text-[9px] text-white/40 truncate">{city.region}</span>}
                      </div>
                    </div>
                    {city.badge && (
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-primary/20 text-primary shrink-0 ml-1.5">
                        {city.badge === "Live Pulse" ? t("citySwitcher.livePulse") : city.badge}
                      </span>
                    )}
                    {isSelected && !city.badge && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-1.5" />}
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}

          {caribbeanList.length > 0 && (
            <div className="pt-1.5 border-t border-white/5">
              <div className="px-2 py-1 text-[9px] font-extrabold uppercase tracking-widest text-amber-400/80">
                🌴 Caribbean Regional Hubs
              </div>
              {caribbeanList.map((city) => {
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
                        <span className="text-[9px] text-white/40 truncate">{city.countryName}</span>
                      </div>
                    </div>
                    {city.badge && (
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 shrink-0 ml-1.5">
                        {city.badge}
                      </span>
                    )}
                    {isSelected && !city.badge && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-1.5" />}
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}

          {diasporaList.length > 0 && (
            <div className="pt-1.5 border-t border-white/5">
              <div className="px-2 py-1 text-[9px] font-extrabold uppercase tracking-widest text-blue-400/80">
                ✈️ Global Diaspora Corridors
              </div>
              {diasporaList.map((city) => {
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
                        <span className="text-[9px] text-white/40 truncate">{city.region} • {city.countryName}</span>
                      </div>
                    </div>
                    {city.badge && (
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 shrink-0 ml-1.5">
                        {city.badge}
                      </span>
                    )}
                    {isSelected && !city.badge && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-1.5" />}
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}

          {filteredCities.length === 0 && (
            <div className="p-4 text-center text-xs text-white/40">
              No matching city hub found.
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { useMemo } from "react";
import { PROMOCARD_TYPICAL_VISIT_ALLOWANCE, pickPromoCardTonightPlace } from "@promorang/shared";
import { useMarket } from "@/contexts/MarketContext";
import { VERIFIED_VENUES } from "@/data/venuesData";

export function useTonightPartner() {
  const { city } = useMarket();

  return useMemo(
    () =>
      pickPromoCardTonightPlace(
        VERIFIED_VENUES.map((venue) => ({
          name: venue.name,
          href: `/discover?place=${encodeURIComponent(venue.id)}`,
          allowance: PROMOCARD_TYPICAL_VISIT_ALLOWANCE,
          city: venue.city,
        })),
        city?.name,
      ),
    [city?.name],
  );
}

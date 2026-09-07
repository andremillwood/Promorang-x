import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { TactileButton } from "@/components/ui/TactileButton";
import { useI18n } from "@/i18n/I18nContext";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import type { DemandRole } from "@/lib/discovery-demand";
import { foundWorkspacePath, youFoundListing, type FoundClaimResult, type FoundListing } from "@/lib/discovery-found";
import { readDiscoverAnonId } from "@/hooks/useDiscoveryDemand";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export function FoundListingCard({
  listing,
  role,
  onClaim,
  claiming,
  compact = false,
}: {
  listing: FoundListing;
  role: DemandRole;
  onClaim: (listing: FoundListing) => Promise<FoundClaimResult>;
  claiming?: boolean;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const to = useExperiencePath();
  const youFound = youFoundListing(listing, { anonId: readDiscoverAnonId(), userId: user?.id });
  const workspace = to(foundWorkspacePath(listing, role));
  const openLabel = listing.kind === "place" || role === "merchant" || role === "brand"
    ? t("found.openPerk")
    : t("found.openNight");

  return (
    <article className={cn("rounded-[1.4rem] border border-white/10 bg-black/30 p-5", compact && "p-4")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
          {listing.status === "claimed" ? t("found.claimed") : t("found.unclaimed")}
        </p>
        <p className="text-[11px] font-bold text-white/50">
          {t(listing.kind === "place" ? "found.kindPlace" : "found.kindMoment")}
          {listing.namedCount ? ` · ${t("found.namedCount", { count: listing.namedCount })}` : ""}
        </p>
      </div>
      <h4 className="mt-2 font-serif text-xl font-bold text-white">{listing.title}</h4>
      {listing.whereHint ? <p className="mt-1 text-xs text-white/50">{listing.whereHint}</p> : null}
      <p className="mt-3 text-xs leading-5 text-white/55">
        {listing.status === "claimed"
          ? t("found.finderKeeps", { perk: listing.perkToFinder })
          : youFound
            ? t("found.youFound", { perk: listing.perkToFinder })
            : t("found.waitingCopy")}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {listing.status === "claimed" ? (
          <TactileButton variant="primary" asChild>
            <Link to={workspace}>
              {openLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </TactileButton>
        ) : (
          <TactileButton
            variant="primary"
            disabled={claiming}
            onClick={async () => {
              const result = await onClaim(listing);
              if (result.listing.status === "claimed") {
                navigate(to(foundWorkspacePath(result.listing, role)));
              }
            }}
          >
            {t("found.thisIsMine")}
            <ArrowRight className="h-4 w-4" />
          </TactileButton>
        )}
      </div>
    </article>
  );
}

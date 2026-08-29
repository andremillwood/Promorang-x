import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useOpenBounties, useClaimBounty, MomentBounty } from "@/hooks/useBounties";
import {
  DollarSign,
  MapPin,
  Users,
  Briefcase,
  ArrowRight,
  Clock,
  Filter
} from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { SwipeRail } from "@/components/ui/SwipeRail";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "social", label: "Social" },
  { value: "food", label: "Food & Drink" },
  { value: "fitness", label: "Fitness" },
  { value: "music", label: "Music" },
  { value: "arts", label: "Arts" },
  { value: "outdoor", label: "Outdoor" },
  { value: "networking", label: "Networking" },
  { value: "workshop", label: "Workshop" },
];

const BountyCard = ({ bounty, onClaim }: { bounty: MomentBounty; onClaim: () => void }) => {
  const { t } = useI18n();
  const daysLeft = bounty.expires_at
    ? Math.ceil((new Date(bounty.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] hover:shadow-elevated sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <Badge variant="secondary" className="capitalize">
          {bounty.target_category}
        </Badge>
        {daysLeft !== null && daysLeft <= 7 && (
          <Badge variant="outline" className="text-orange-600 border-orange-300">
            <Clock className="w-3 h-3 mr-1" />
            {t("bountyBoard.daysLeft", { days: daysLeft.toString() })}
          </Badge>
        )}
      </div>

      {/* Title & Description */}
      <h3 className="font-serif text-xl font-semibold mb-2">{bounty.title}</h3>
      {bounty.description && (
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {bounty.description}
        </p>
      )}

      {/* Requirements */}
      <div className="bg-muted rounded-xl p-4 mb-4">
        <p className="text-sm font-medium mb-1">{t("bountyBoard.requirements")}</p>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {bounty.requirements}
        </p>
      </div>

      {/* Meta */}
      <div className="space-y-2 mb-6">
        {bounty.target_location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{bounty.target_location}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4 text-primary" />
          <span>{t("bountyBoard.minParticipants", { count: bounty.target_min_participants.toString() })}</span>
        </div>
      </div>

      {/* Payout & CTA */}
      <div className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{t("bountyBoard.payout")}</p>
          <p className="text-2xl font-bold text-primary">
            ${bounty.payout_amount.toLocaleString()}
          </p>
        </div>
        <Button variant="hero" onClick={onClaim} className="w-full sm:w-auto">
          {t("bountyBoard.claimBounty")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const BountyBoard = () => {
  const { t } = useI18n();
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: bounties, isLoading } = useOpenBounties();
  const claimBounty = useClaimBounty();

  const isHost = roles.includes("host");

  const filteredBounties = bounties?.filter(
    (b) => categoryFilter === "all" || b.target_category === categoryFilter
  );

  const handleClaim = async (bountyId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!isHost) {
      navigate("/auth?role=host");
      return;
    }
    await claimBounty.mutateAsync(bountyId);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 py-12 pb-24">
        <div className="container px-4 sm:px-6">
          {/* Hero */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Briefcase className="w-4 h-4" />
              <span className="text-sm font-medium">{t("bountyBoard.badge")}</span>
            </div>
            <h1 className="mb-4 font-serif text-3xl font-bold md:text-5xl">
              {t("bountyBoard.title")}
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              {t("bountyBoard.subtitle")}
            </p>
          </div>

          {/* Stats */}
          <div className="mx-auto mb-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center p-4 bg-card rounded-xl border border-border">
              <p className="text-2xl font-bold text-primary">{bounties?.length || 0}</p>
              <p className="text-xs text-muted-foreground">{t("bountyBoard.openBounties")}</p>
            </div>
            <div className="text-center p-4 bg-card rounded-xl border border-border">
              <p className="text-2xl font-bold text-primary">
                ${bounties?.reduce((sum, b) => sum + b.payout_amount, 0).toLocaleString() || 0}
              </p>
              <p className="text-xs text-muted-foreground">{t("bountyBoard.totalAvailable")}</p>
            </div>
            <div className="text-center p-4 bg-card rounded-xl border border-border">
              <p className="text-2xl font-bold text-primary">20%</p>
              <p className="text-xs text-muted-foreground">{t("bountyBoard.platformFee")}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8 flex items-start gap-2">
            <Filter className="mt-2 w-4 h-4 shrink-0 text-muted-foreground" />
            <SwipeRail compact fadeFrom="from-background" showDots={false} className="min-w-0 flex-1" scrollerClassName="items-center gap-2 pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                aria-selected={categoryFilter === cat.value}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap snap-start transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] ${categoryFilter === cat.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary"
                  }`}
              >
                {cat.label}
              </button>
            ))}
            </SwipeRail>
          </div>

          {/* Bounties Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                  <div className="h-6 w-20 bg-muted rounded mb-4" />
                  <div className="h-8 w-3/4 bg-muted rounded mb-2" />
                  <div className="h-4 w-full bg-muted rounded mb-4" />
                  <div className="h-24 bg-muted rounded mb-4" />
                  <div className="h-10 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : filteredBounties && filteredBounties.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBounties.map((bounty) => (
                <BountyCard
                  key={bounty.id}
                  bounty={bounty}
                  onClaim={() => handleClaim(bounty.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-serif text-xl font-semibold mb-2">{t("bountyBoard.noBountiesTitle")}</h3>
              <p className="text-muted-foreground">
                {t("bountyBoard.noBountiesSubtitle")}
              </p>
            </div>
          )}

          {/* CTA for brands */}
          <div className="mt-16 text-center p-8 bg-gradient-warm rounded-2xl border border-border">
            <h3 className="font-serif text-2xl font-bold mb-2">{t("bountyBoard.brandCtaTitle")}</h3>
            <p className="text-muted-foreground mb-6">
              {t("bountyBoard.brandCtaCopy")}
            </p>
            <Button variant="hero" onClick={() => navigate("/dashboard/bounties/create")}>
              {t("bountyBoard.postBounty")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BountyBoard;

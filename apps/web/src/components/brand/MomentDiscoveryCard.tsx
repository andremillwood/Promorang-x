import { format } from "date-fns";
import { Calendar, MapPin, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DiscoverableMoment } from "@/hooks/useDiscoverMoments";

interface MomentDiscoveryCardProps {
  moment: DiscoverableMoment;
  onSponsor: (moment: DiscoverableMoment) => void;
}

export function MomentDiscoveryCard({ moment, onSponsor }: MomentDiscoveryCardProps) {
  const isUpcoming = new Date(moment.starts_at) > new Date();

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-40 bg-muted">
        {moment.image_url ? (
          <img
            src={moment.image_url}
            alt={moment.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <Sparkles className="w-8 h-8 text-primary/40" />
          </div>
        )}
        <Badge
          className="absolute top-3 left-3"
          variant={isUpcoming ? "default" : "secondary"}
        >
          {moment.category}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground line-clamp-1">{moment.title}</h3>
          {moment.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {moment.description}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {format(new Date(moment.starts_at), "MMM d")}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {moment.location.split(",")[0]}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {moment.participant_count || 0}
          </span>
        </div>

        {/* Host Info */}
        {moment.host_profile?.full_name && (
          <p className="text-xs text-muted-foreground">
            by {moment.host_profile.full_name}
          </p>
        )}

        {/* Sponsor Button */}
        <Button
          variant="hero"
          size="sm"
          className="w-full"
          onClick={() => onSponsor(moment)}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Sponsor This Moment
        </Button>
      </div>
    </div>
  );
}

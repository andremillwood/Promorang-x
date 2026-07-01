import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, PlayCircle } from "lucide-react";

export interface PublicContentItem {
  id: string;
  slug: string | null;
  title: string | null;
  description: string | null;
  media_url: string | null;
  platform: string | null;
  venue_name: string | null;
  location: string | null;
  linked_moment_slug: string | null;
  linked_moment_id: string | null;
  linked_moment_title: string | null;
}

interface PublicContentCardProps {
  item: PublicContentItem;
}

export function PublicContentCard({ item }: PublicContentCardProps) {
  const linkedMomentPath = item.linked_moment_slug || item.linked_moment_id
    ? `/moments/${item.linked_moment_slug || item.linked_moment_id}`
    : null;

  return (
    <Card className="overflow-hidden border-border/70 bg-card shadow-soft">
      <div className="relative h-44 overflow-hidden bg-muted">
        {item.media_url ? (
          <img
            src={item.media_url}
            alt={item.title || "Content preview"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <PlayCircle className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        {item.platform && (
          <Badge className="absolute left-3 top-3 bg-black/60 text-white backdrop-blur">
            {item.platform}
          </Badge>
        )}
      </div>
      <CardContent className="space-y-4 p-4">
        <div>
          <h3 className="line-clamp-2 font-serif text-xl font-bold text-foreground">
            {item.title || "Untitled content"}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
            {item.description || "Creator content connected to moments, venues, brands, and offers."}
          </p>
        </div>

        {(item.venue_name || item.location) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{item.venue_name || item.location}</span>
          </div>
        )}

        {linkedMomentPath && (
          <Button asChild variant="outline" className="w-full">
            <Link to={linkedMomentPath}>
              Open linked moment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

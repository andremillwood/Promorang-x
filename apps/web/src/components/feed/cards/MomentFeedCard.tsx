import { Calendar, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { FeedItem } from "@/services/feed";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function MomentFeedCard({ item }: { item: FeedItem }) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card/95 shadow-soft">
      <CardContent className="p-0">
        {item.image_url ? (
          <div className="h-52 w-full overflow-hidden bg-muted">
            <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
          </div>
        ) : null}
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap gap-2">
            {item.reason_labels.map((label) => (
              <Badge key={label} variant="secondary" className="rounded-full">
                {label}
              </Badge>
            ))}
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground">{item.title}</h3>
            {item.description ? (
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {item.context.starts_at ? (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(item.context.starts_at).toLocaleString()}
              </span>
            ) : null}
            {item.context.location_name ? (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {item.context.location_name}
              </span>
            ) : null}
            {item.context.participants_count ? (
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {item.context.participants_count} interested
              </span>
            ) : null}
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to={item.primary_cta.href || `/moments/${item.entity_id}`}>{item.primary_cta.label}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard/saved">Save</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

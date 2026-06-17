import { FeedItem } from "@/services/feed";
import { Skeleton } from "@/components/ui/skeleton";
import { MomentFeedCard } from "@/components/feed/cards/MomentFeedCard";
import { DropFeedCard } from "@/components/feed/cards/DropFeedCard";
import { OfferFeedCard } from "@/components/feed/cards/OfferFeedCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

function GenericFeedCard({ item }: { item: FeedItem }) {
  return (
    <Card className="shadow-soft">
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap gap-2">
          {item.reason_labels.map((label) => (
            <span key={label} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              {label}
            </span>
          ))}
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold">{item.title}</h3>
          {item.description ? <p className="mt-2 text-sm text-muted-foreground">{item.description}</p> : null}
        </div>
        <Button asChild>
          <Link to={item.primary_cta.href || "/explore/moments"}>{item.primary_cta.label}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function FeedStream({
  items,
  isLoading,
}: {
  items: FeedItem[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-64 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="space-y-3 p-10 text-center">
          <h3 className="font-serif text-2xl font-bold">Nothing ranked yet</h3>
          <p className="text-sm text-muted-foreground">
            Try a different intent chip or jump into Explore to browse what is live right now.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild>
              <Link to="/explore/moments">Explore Moments</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/watch-unlock">Browse Missions</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {items.map((item) => {
        switch (item.object_type) {
          case "moment":
            return <MomentFeedCard key={item.id} item={item} />;
          case "drop":
            return <DropFeedCard key={item.id} item={item} />;
          case "offer":
            return <OfferFeedCard key={item.id} item={item} />;
          default:
            return <GenericFeedCard key={item.id} item={item} />;
        }
      })}
    </div>
  );
}

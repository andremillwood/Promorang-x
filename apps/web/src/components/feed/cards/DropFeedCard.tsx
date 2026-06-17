import { Link } from "react-router-dom";
import { Gem, ShieldCheck } from "lucide-react";
import { FeedItem } from "@/services/feed";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DropFeedCard({ item }: { item: FeedItem }) {
  return (
    <Card className="border-primary/15 bg-gradient-to-br from-primary/5 via-card to-accent/5 shadow-soft">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Gem className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/80">Proof Opportunity</p>
            <h3 className="font-serif text-lg font-bold">{item.title}</h3>
          </div>
        </div>
        {item.description ? <p className="text-sm text-muted-foreground">{item.description}</p> : null}
        <div className="flex flex-wrap gap-2">
          {item.reason_labels.map((label) => (
            <Badge key={label} variant="secondary" className="rounded-full">
              {label}
            </Badge>
          ))}
          {item.context.reward_label ? <Badge className="rounded-full">{item.context.reward_label}</Badge> : null}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Submit proof to unlock value and attribution.
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link to={item.primary_cta.href || "/watch-unlock"}>{item.primary_cta.label}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/watch-unlock">Browse Missions</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

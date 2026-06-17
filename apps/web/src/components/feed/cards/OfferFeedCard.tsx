import { Link } from "react-router-dom";
import { Gift, Clock3 } from "lucide-react";
import { FeedItem } from "@/services/feed";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function OfferFeedCard({ item }: { item: FeedItem }) {
  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/10 via-card to-primary/5 shadow-soft">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/20 text-accent-foreground">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Reward Offer</p>
              <h3 className="font-serif text-lg font-bold">{item.title}</h3>
            </div>
          </div>
          {item.context.reward_label ? <Badge>{item.context.reward_label}</Badge> : null}
        </div>
        {item.description ? <p className="text-sm text-muted-foreground">{item.description}</p> : null}
        <div className="flex flex-wrap gap-2">
          {item.reason_labels.map((label) => (
            <Badge key={label} variant="secondary" className="rounded-full">
              {label}
            </Badge>
          ))}
        </div>
        {item.context.expires_soon ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3 className="h-4 w-4" />
            Available now. Claim before it disappears.
          </div>
        ) : null}
        <div className="flex gap-3">
          <Button asChild>
            <Link to={item.primary_cta.href || "/dashboard/rewards"}>{item.primary_cta.label}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard/rewards">See Rewards</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

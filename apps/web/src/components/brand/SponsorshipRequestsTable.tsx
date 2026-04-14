import { format } from "date-fns";
import { Calendar, MapPin, Clock, ExternalLink, CreditCard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrandSponsorshipRequests, type SponsorshipStatus } from "@/hooks/useSponsorships";

const statusConfig: Record<SponsorshipStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "outline" },
  viewed: { label: "Viewed", variant: "secondary" },
  negotiating: { label: "Negotiating", variant: "default" },
  accepted: { label: "Accepted", variant: "default" },
  declined: { label: "Declined", variant: "destructive" },
  funded: { label: "Funded", variant: "default" },
  active: { label: "Active", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

export function SponsorshipRequestsTable() {
  const { data: requests, isLoading } = useBrandSponsorshipRequests();

  if (isLoading) {
    return <Skeleton className="h-64 rounded-xl" />;
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-card rounded-xl p-8 border border-border text-center">
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No sponsorship requests yet. Browse moments above to submit your first offer!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Moment</th>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Bid</th>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Sent</th>
            <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => {
            const status = statusConfig[request.status];
            return (
              <tr key={request.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="p-4">
                  <div>
                    <p className="font-medium text-foreground">
                      {request.moment?.title || "Unknown Moment"}
                    </p>
                    {request.moment?.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {request.moment.location.split(",")[0]}
                      </p>
                    )}
                  </div>
                </td>
                <td className="p-4 text-foreground">
                  {request.moment?.starts_at && (
                    <span className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      {format(new Date(request.moment.starts_at), "MMM d, yyyy")}
                    </span>
                  )}
                </td>
                <td className="p-4 text-foreground font-medium">
                  ${request.bid_amount.toLocaleString()}
                </td>
                <td className="p-4">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {format(new Date(request.created_at), "MMM d")}
                </td>
                <td className="p-4 text-right flex items-center justify-end gap-2">
                  {request.status === 'accepted' && (
                    <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 text-[10px] font-black uppercase tracking-widest">
                      <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                      Activate & Fund
                    </Button>
                  )}
                  {request.status === 'funded' && (
                    <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] uppercase tracking-widest mr-4">
                       <CheckCircle2 className="w-4 h-4" />
                       Active
                    </div>
                  )}
                  <Button variant="ghost" size="sm" className="h-8">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

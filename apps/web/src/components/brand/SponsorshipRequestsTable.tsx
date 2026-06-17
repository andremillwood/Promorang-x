import { format } from "date-fns";
import { Calendar, MapPin, Clock, ExternalLink, CreditCard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>Moment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Bid</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => {
            const status = statusConfig[request.status];
            return (
              <TableRow key={request.id} className="hover:bg-muted/20">
                <TableCell>
                  <div className="min-w-[12rem]">
                    <p className="font-medium text-foreground line-clamp-2">
                      {request.moment?.title || "Unknown Moment"}
                    </p>
                    {request.moment?.location && (
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {request.moment.location.split(",")[0]}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-foreground">
                  {request.moment?.starts_at && (
                    <span className="flex min-w-[8rem] items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      {format(new Date(request.moment.starts_at), "MMM d, yyyy")}
                    </span>
                  )}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  ${request.bid_amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(request.created_at), "MMM d")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex min-w-[11rem] flex-wrap items-center justify-end gap-2">
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
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

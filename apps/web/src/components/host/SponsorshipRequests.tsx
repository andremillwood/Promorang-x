import { DollarSign, Check, X, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHostSponsorshipRequests, useRespondToSponsorship } from "@/hooks/useSponsorships";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-500",
  viewed: "bg-blue-500/20 text-blue-500",
  negotiating: "bg-purple-500/20 text-purple-500",
  accepted: "bg-emerald-500/20 text-emerald-500",
  declined: "bg-red-500/20 text-red-500",
  active: "bg-emerald-500/20 text-emerald-500",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-red-500/20 text-red-500",
};

export function HostSponsorshipRequests() {
  const { data: requests, isLoading } = useHostSponsorshipRequests();
  const respond = useRespondToSponsorship();
  const [responseMessage, setResponseMessage] = useState("");
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  const pendingRequests = requests?.filter(r => 
    r.status === "pending" || r.status === "viewed" || r.status === "negotiating"
  ) || [];

  const handleRespond = (requestId: string, status: "accepted" | "declined", message?: string) => {
    respond.mutate({ requestId, status, response: message });
    setActiveRequestId(null);
    setResponseMessage("");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-card rounded-xl p-8 border border-border text-center">
        <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">No Sponsorship Requests</h3>
        <p className="text-muted-foreground">
          Brands will send sponsorship offers here when they're interested in your moments
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-4">
            Pending Requests ({pendingRequests.length})
          </h3>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="bg-card rounded-xl p-5 border border-yellow-500/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-foreground">
                      Brand: {request.brand_id.slice(0, 8)}...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      For moment: {request.moment_id.slice(0, 8)}...
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-500">
                      ${request.bid_amount}
                    </p>
                    <Badge className={statusColors[request.status || "pending"]}>
                      {request.status}
                    </Badge>
                  </div>
                </div>

                {request.message && (
                  <div className="bg-muted/30 rounded-lg p-3 mb-3">
                    <p className="text-sm text-muted-foreground italic">
                      "{request.message}"
                    </p>
                  </div>
                )}

                {request.requirements && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Requirements:</p>
                    <p className="text-sm text-foreground">{request.requirements}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>Received {format(new Date(request.created_at), "MMM d, yyyy")}</span>
                  {request.expires_at && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expires {format(new Date(request.expires_at), "MMM d")}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleRespond(request.id, "accepted")}
                    disabled={respond.isPending}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Accept
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveRequestId(request.id)}
                        className="flex-1"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Negotiate
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Respond to Sponsorship</DialogTitle>
                        <DialogDescription>
                          Send a message to negotiate terms or provide feedback
                        </DialogDescription>
                      </DialogHeader>
                      <Textarea
                        placeholder="Enter your response..."
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setActiveRequestId(null);
                            setResponseMessage("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleRespond(request.id, "accepted", responseMessage)}
                          disabled={respond.isPending}
                        >
                          Accept with Message
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRespond(request.id, "declined")}
                    disabled={respond.isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Requests History */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Request History</h3>
        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-card rounded-xl p-4 border border-border flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-foreground">
                  ${request.bid_amount} offer
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(request.created_at), "MMM d, yyyy")}
                </p>
              </div>
              <Badge className={statusColors[request.status || "pending"]}>
                {request.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

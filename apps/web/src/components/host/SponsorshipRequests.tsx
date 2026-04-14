import { DollarSign, Check, X, Clock, MessageSquare, ShieldCheck } from "lucide-react";
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
  funded: "bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 shadow-glow-emerald",
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
      <div className="space-y-6">
        <div className="bg-card rounded-xl p-8 border border-border text-center">
          <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No Active Sponsorships</h3>
          <p className="text-muted-foreground">
            Brands will send sponsorship offers here when they're interested in your moments.
          </p>
        </div>

        {/* Blueprint/Demo Feature */}
        <div>
           <div className="flex items-center gap-2 mb-4">
               <h3 className="font-semibold text-foreground">Matchmaker Opportunities</h3>
               <Badge variant="outline" className="text-[10px] text-muted-foreground uppercase tracking-widest bg-muted/50">Coming Soon</Badge>
           </div>
           
           <div className="bg-gradient-warm rounded-xl p-6 border border-border/50 opacity-80 pointer-events-none filter sepia-[0.2]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center p-1">
                          <span className="text-white font-bold text-xs">NIKE</span>
                      </div>
                      <div>
                        <p className="font-bold text-foreground">
                          Nike Running Club Sponsorship
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Looking for running communities in your area.
                        </p>
                      </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-emerald-600">
                      $500
                    </p>
                    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Open Bounty</Badge>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Requirements:</p>
                  <p className="text-sm text-foreground">Host a 5k run with at least 50 verified attendees. Mention Nike Run Club in the event description and require photo check-ins.</p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 opacity-50">
                    <Check className="w-4 h-4 mr-1" />
                    Accept Offer
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 opacity-50">
                    View Details
                  </Button>
                </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Active Funded Partnerships */}
      {requests.filter(r => r.status === "funded").length > 0 && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h3 className="font-serif text-xl font-bold text-foreground">Active Partnerships</h3>
          </div>
          <div className="grid gap-4">
            {requests.filter(r => r.status === "funded").map(request => (
               <div key={request.id} className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <DollarSign className="w-20 h-20 text-emerald-500" />
                  </div>
                  <div className="flex items-start justify-between relative z-10">
                     <div className="space-y-4">
                        <div>
                           <Badge className="bg-emerald-500 text-white mb-2 shadow-glow-emerald">USD Funded & Locked</Badge>
                           <h4 className="text-2xl font-black italic font-serif">
                              {request.moment?.title || "Community Moment"}
                           </h4>
                           <p className="text-sm text-foreground/60 font-medium">Sponsored by Brand Partner</p>
                        </div>
                        <div className="flex items-center gap-6">
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Moment Budget</p>
                              <p className="text-xl font-black text-emerald-600">${request.bid_amount}</p>
                           </div>
                           <div className="h-8 w-px bg-emerald-500/20" />
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Host Liquidity</p>
                              <p className="text-[10px] font-bold text-foreground uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">Verified Payouts</p>
                           </div>
                        </div>
                     </div>
                     <Button variant="outline" className="border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-600">
                        Manage Niche
                     </Button>
                  </div>
               </div>
            ))}
          </div>
        </section>
      )}

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

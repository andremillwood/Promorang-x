import { useI18n as useWebI18n } from "@/i18n/I18nContext";
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
  const { t: webT } = useWebI18n();
  const { data: requests, isLoading, isError, isFetching, refetch } = useHostSponsorshipRequests();
  const respond = useRespondToSponsorship();
  const [responseMessage, setResponseMessage] = useState("");
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  const pendingRequests = requests?.filter(r =>
    r.status === "pending" || r.status === "viewed" || r.status === "negotiating"
  ) || [];

  const handleRespond = (requestId: string, status: "accepted" | "declined", message?: string) => {
    respond.mutate({ requestId, status, response: message }, { onSuccess: () => { setActiveRequestId(null); setResponseMessage(""); } });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-sm" />
        ))}
      </div>
    );
  }

  if (isError) return <div role="alert" className="rounded-sm border border-destructive/30 p-5"><p>Sponsorship requests could not be loaded.</p><Button variant="outline" className="mt-3" disabled={isFetching} onClick={() => void refetch()}>Try again</Button></div>;

  if (!requests || requests.length === 0) {
    return (
      <div className="rounded-sm  bg-white/[.02] p-8 text-center">
        <DollarSign className="mx-auto h-10 w-10 text-white/25" />
        <h3 className="mt-4 text-lg font-black text-white">No sponsorship requests yet.</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/45">
          Brand offers for your events will appear here with their review and funding status.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Active Funded Partnerships */}
      {requests.filter(r => r.status === "funded").length > 0 && (
        <section className="min-w-0">
          <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h3 className="font-sans text-xl font-bold text-foreground">Funded requests</h3>
          </div>
          <div className="grid gap-4">
            {requests.filter(r => r.status === "funded").map(request => (
               <div key={request.id} className="bg-emerald-500/5 border border-emerald-500/20 rounded-sm p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <DollarSign className="w-20 h-20 text-emerald-500" />
                  </div>
                  <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                     <div className="min-w-0 space-y-4">
                        <div>
                           <Badge className="bg-emerald-500 text-white mb-2 shadow-glow-emerald">Funded request</Badge>
                           <h4 className="break-words font-sans text-xl font-semibold">
                              {request.moment?.title || "Event details unavailable"}
                           </h4>
                           <p className="text-sm text-foreground/60 font-medium">{request.brand_profile?.full_name || `Brand ${request.brand_id.slice(0, 8)}`}</p>
                        </div>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recorded request amount</p>
                              <p className="text-xl font-black text-emerald-600">${request.bid_amount}</p>
                           </div>
                           <div className="hidden h-8 w-px bg-emerald-500/20 sm:block" />
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Funding state</p>
                              <p className="text-[10px] font-bold text-foreground uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">Funded · payout not implied</p>
                           </div>
                        </div>
                     </div>

                  </div>
               </div>
            ))}
          </div>
        </section>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="font-sans font-semibold text-foreground mb-4">
            Pending requests ({pendingRequests.length})
          </h3>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="bg-card rounded-sm p-5 border border-yellow-500/50"
              >
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words font-medium text-foreground">
                      {request.brand_profile?.full_name || `${webT("rewards.brand")} ${request.brand_id.slice(0, 8)}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {request.moment?.title || `Event ${request.moment_id.slice(0, 8)}`}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-2xl font-bold text-emerald-500">
                      ${request.bid_amount}
                    </p>
                    <Badge className={statusColors[request.status || "pending"]}>
                      {request.status}
                    </Badge>
                  </div>
                </div>

                {request.message && (
                  <div className="bg-muted/30 rounded-sm p-3 mb-3">
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

                <div className="mb-4 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                  <span>Received {format(new Date(request.created_at), "MMM d, yyyy")}</span>
                  {request.expires_at && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {webT("card.expires")} {format(new Date(request.expires_at), "MMM d")}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    size="sm"
                    onClick={() => handleRespond(request.id, "accepted")}
                    disabled={respond.isPending}
                    className="h-auto min-h-11 flex-1 whitespace-normal"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {respond.isPending ? "Saving…" : "Accept"}
                  </Button>

                  <Dialog open={activeRequestId === request.id} onOpenChange={(open) => { setActiveRequestId(open ? request.id : null); if (!open) setResponseMessage(""); }}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveRequestId(request.id)}
                        className="h-auto min-h-11 flex-1 whitespace-normal"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Accept with message
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Accept sponsorship</DialogTitle>
                        <DialogDescription>
                          Add a message to your acceptance. This accepts the offer; it does not send a counteroffer.
                        </DialogDescription>
                      </DialogHeader>
                      <Textarea
                        aria-label="Message to sponsor"
                        placeholder="Add a message…"
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        className="min-h-[100px]"
                      />
                      {respond.isError ? <p role="alert" className="text-sm text-destructive">Your response was not saved. Try again.</p> : null}
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setActiveRequestId(null);
                            setResponseMessage("");
                          }}
                        >
                          {webT("findOrAsk.cancel")}
                        </Button>
                        <Button
                          onClick={() => handleRespond(request.id, "accepted", responseMessage)}
                          disabled={respond.isPending}
                        >
                          {respond.isPending ? "Accepting…" : "Accept with message"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRespond(request.id, "declined")}
                    disabled={respond.isPending}
                    aria-label="Decline sponsorship"
                    className="min-h-11 text-destructive hover:text-destructive"
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
        <h3 className="font-sans font-semibold text-foreground mb-4">Request history</h3>
        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex flex-col gap-3 rounded-sm  bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-foreground">
                  ${request.bid_amount} {webT("web.offerLower")}
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

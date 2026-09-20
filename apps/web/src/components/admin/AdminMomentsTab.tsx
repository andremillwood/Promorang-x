import { useState } from "react";
import { Link } from "react-router-dom";
import { useMomentsForApproval, useUpdateMomentStatus } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MomentStatusBadge, type MomentStatus } from "@/components/MomentStatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Archive,
  Calendar,
  MapPin,
  Clock,
  Pencil,
  AlertTriangle,
  Radio,
} from "lucide-react";
import { format } from "date-fns";
import { ADMIN_AFTRHRS_TAB_HREF, isAftrHrsMoment } from "@/lib/admin-surface";
import { useCanonicalMomentFeed } from "@/hooks/useCanonicalMomentFeed";

const PRIMARY_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Live" },
  { value: "upcoming", label: "Upcoming" },
  { value: "draft", label: "Drafts" },
];

const SECONDARY_FILTERS = ["scheduled", "joinable", "closed", "archived"];

export function AdminMomentsTab() {
  const { data: moments, isLoading } = useMomentsForApproval();
  const updateStatus = useUpdateMomentStatus();
  const publicFeed = useCanonicalMomentFeed();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredMoments = moments?.filter((moment) => {
    const matchesSearch = 
      moment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      moment.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      statusFilter === "all"
      || (statusFilter === "upcoming" && ["scheduled", "joinable"].includes(moment.status))
      || moment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (momentId: string, status: string) => {
    updateStatus.mutate({ momentId, status });
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case "open": return <Badge variant="secondary">Open</Badge>;
      case "invite": return <Badge variant="outline">Invite Only</Badge>;
      case "private": return <Badge variant="outline">Private</Badge>;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-5 rounded-[1.5rem] border border-white/10 bg-white/[.025] p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[.2em] text-[#ff7a35]">Moment operations</p>
          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Find the room that needs a decision.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">Search first. Use the common operating states below. Less common lifecycle controls stay available without occupying the main workspace.</p>
        </div>
        <p className="text-xs text-white/35">{filteredMoments?.length || 0} of {moments?.length || 0} records shown</p>
      </section>

      {publicFeed.data ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Moment inventory health">
          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><p className="text-[9px] font-black uppercase tracking-[.16em] text-white/35">Surfaced now</p><p className="mt-3 text-3xl font-black text-white">{publicFeed.data.health.surfaced}</p><p className="mt-1 text-xs text-white/30">public feed records</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><p className="text-[9px] font-black uppercase tracking-[.16em] text-white/35">Live now</p><p className="mt-3 flex items-center gap-2 text-3xl font-black text-white"><Radio className="h-5 w-5 text-emerald-400" />{publicFeed.data.counts.live}</p><p className="mt-1 text-xs text-white/30">active Moments</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><p className="text-[9px] font-black uppercase tracking-[.16em] text-white/35">Coming up</p><p className="mt-3 text-3xl font-black text-white">{publicFeed.data.counts.starting_soon + publicFeed.data.counts.upcoming}</p><p className="mt-1 text-xs text-white/30">starting soon or upcoming</p></div>
          <div className={`rounded-2xl border p-5 ${publicFeed.data.health.needs_attention ? "border-amber-500/25 bg-amber-500/[.05]" : "border-emerald-500/20 bg-emerald-500/[.04]"}`}><p className="text-[9px] font-black uppercase tracking-[.16em] text-white/35">Needs attention</p><p className={`mt-3 flex items-center gap-2 text-3xl font-black ${publicFeed.data.health.needs_attention ? "text-amber-300" : "text-emerald-300"}`}><AlertTriangle className="h-5 w-5" />{publicFeed.data.health.needs_attention}</p><p className="mt-1 text-xs text-white/30">data-quality issues</p></div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5" aria-label="Moment search and filters">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <Input
              placeholder="Search title or place..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 rounded-xl border-white/10 bg-white/[.025] pl-10 text-white placeholder:text-white/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {PRIMARY_FILTERS.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(filter.value)}
                className={statusFilter === filter.value ? "bg-[#ff6500] text-black hover:bg-[#ff7a20]" : "border-white/10 bg-white/[.025] text-white/60 hover:bg-white/[.06] hover:text-white"}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
        <details className="mt-4 border-t border-white/8 pt-4">
          <summary className="cursor-pointer list-none text-xs font-black text-white/40 hover:text-white/70">More lifecycle filters</summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {SECONDARY_FILTERS.map((status) => (
              <Button key={status} variant={statusFilter === status ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(status)} className="capitalize">
                {status}
              </Button>
            ))}
          </div>
        </details>
      </section>

      {/* Moments Grid */}
      {filteredMoments?.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[.025] p-10 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No moments found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredMoments?.map((moment) => (
            <div
              key={moment.id}
              className="rounded-2xl border border-white/10 bg-white/[.02] p-5 transition hover:border-white/20 hover:bg-white/[.035] sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 font-sans">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <MomentStatusBadge status={moment.status as MomentStatus} />
                    {getVisibilityBadge(moment.visibility)}
                  </div>
                  
                  <h3 className="text-lg font-semibold tracking-normal text-foreground break-words">
                    {moment.title}
                  </h3>
                  
                  {moment.description && (
                    <p className="mt-1 text-sm leading-6 tracking-normal text-muted-foreground line-clamp-2">
                      {moment.description}
                    </p>
                  )}
                  
                  <div className="mt-3 flex flex-col gap-2 text-sm leading-6 tracking-normal text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                    <span className="flex items-start gap-1.5">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="break-words">{moment.location}</span>
                    </span>
                    <span className="flex items-start gap-1.5">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{format(new Date(moment.starts_at), "MMM d, yyyy 'at' h:mm a")}</span>
                    </span>
                  </div>
                  
                  {moment.host_profile && (
                    <div className="flex items-center gap-2 mt-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={moment.host_profile.avatar_url || undefined} />
                        <AvatarFallback>
                          {(moment.host_profile?.full_name || "H").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm leading-6 tracking-normal text-muted-foreground">
                        Hosted by {moment.host_profile.full_name || "Anonymous"}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {isAftrHrsMoment(moment) ? (
                    <Button size="sm" className="shrink-0" asChild>
                      <Link to={ADMIN_AFTRHRS_TAB_HREF}>
                        RSVPs
                      </Link>
                    </Button>
                  ) : null}
                  <Button variant="outline" size="sm" className="shrink-0" asChild>
                    <Link to={isAftrHrsMoment(moment) ? "/moments/aftrhrs" : `/moments/${moment.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="shrink-0" asChild>
                    <Link to={`/moments/${moment.id}/edit`}>
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(moment.id, "joinable")}
                        disabled={moment.status === "joinable"}
                      >
                        <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                        Approve (Joinable)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(moment.id, "active")}
                        disabled={moment.status === "active"}
                      >
                        <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                        Set Active
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(moment.id, "closed")}
                        disabled={moment.status === "closed"}
                      >
                        <XCircle className="w-4 h-4 mr-2 text-muted-foreground" />
                        Close
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(moment.id, "archived")}
                        disabled={moment.status === "archived"}
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

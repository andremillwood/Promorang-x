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
} from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const STATUS_FILTERS = ["all", "draft", "scheduled", "joinable", "active", "closed", "archived"] as const;
const STATUS_LABEL: Record<(typeof STATUS_FILTERS)[number], TranslationKey> = {
  all: "momDesk.stAll",
  draft: "momDesk.stDraft",
  scheduled: "momDesk.stScheduled",
  joinable: "momDesk.stJoinable",
  active: "momDesk.stActive",
  closed: "momDesk.stClosed",
  archived: "momDesk.stArchived",
};

export function AdminMomentsTab() {
  const { t, formatDate } = useI18n();
  const { data: moments, isLoading } = useMomentsForApproval();
  const updateStatus = useUpdateMomentStatus();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredMoments = moments?.filter((moment) => {
    const matchesSearch = 
      moment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      moment.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || moment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (momentId: string, status: string) => {
    updateStatus.mutate({ momentId, status });
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case "open": return <Badge variant="secondary">{t("momDesk.visOpen")}</Badge>;
      case "invite": return <Badge variant="outline">{t("momDesk.visInvite")}</Badge>;
      case "private": return <Badge variant="outline">{t("momDesk.visPrivate")}</Badge>;
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
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("momDesk.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="-mx-1 overflow-x-auto px-1 touch-pan-x snap-x-mandatory scrollbar-none">
          <div className="flex min-w-max gap-2">
          {STATUS_FILTERS.map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="snap-start"
            >
              {t(STATUS_LABEL[status])}
            </Button>
          ))}
          </div>
        </div>
      </div>

      {/* Moments Grid */}
      {filteredMoments?.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">{t("momDesk.empty")}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredMoments?.map((moment) => (
            <div
              key={moment.id}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-card transition-shadow"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <MomentStatusBadge status={moment.status as MomentStatus} />
                    {getVisibilityBadge(moment.visibility)}
                  </div>
                  
                  <h3 className="font-semibold text-foreground text-lg truncate">
                    {moment.title}
                  </h3>
                  
                  {moment.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {moment.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {moment.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(moment.starts_at, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
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
                      <span className="text-sm text-muted-foreground">
                        {t("momDesk.hostedBy", { name: moment.host_profile.full_name || t("momDesk.anon") })}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button variant="outline" size="sm" className="shrink-0" asChild>
                    <Link to={`/moments/${moment.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      {t("momDesk.view")}
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="shrink-0" asChild>
                    <Link to={`/moments/${moment.id}/edit`}>
                      <Pencil className="w-4 h-4 mr-1" />
                      {t("momDesk.edit")}
                    </Link>
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t("momDesk.changeStatus")}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(moment.id, "joinable")}
                        disabled={moment.status === "joinable"}
                      >
                        <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                        {t("momDesk.approveJoin")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(moment.id, "active")}
                        disabled={moment.status === "active"}
                      >
                        <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                        {t("momDesk.setActive")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(moment.id, "closed")}
                        disabled={moment.status === "closed"}
                      >
                        <XCircle className="w-4 h-4 mr-2 text-muted-foreground" />
                        {t("momDesk.close")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(moment.id, "archived")}
                        disabled={moment.status === "archived"}
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        {t("momDesk.archive")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total count */}
      <p className="text-sm text-muted-foreground">
        {t("momDesk.showing", { shown: filteredMoments?.length || 0, total: moments?.length || 0 })}
      </p>
    </div>
  );
}

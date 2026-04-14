import { useState } from "react";
import { Camera, Check, X, ArrowLeft, Image, Eye, Clock, Filter, Loader2, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useHostedMoments } from "@/hooks/useMoments";
import { useModerateMedia, type MomentMedia } from "@/hooks/useUGC";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

type StatusFilter = "pending" | "approved" | "rejected" | "all";

const UGCReview = () => {
    const { user } = useAuth();
    const { data: hostedMoments } = useHostedMoments();
    const moderateMedia = useModerateMedia();
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");

    // Get IDs of moments this host owns
    const momentIds = hostedMoments?.map((m) => m.id) || [];

    // Fetch all media across the host's moments
    const { data: allMedia, isLoading } = useQuery({
        queryKey: ["host-ugc", user?.id, momentIds],
        queryFn: async () => {
            if (momentIds.length === 0) return [];

            const { data, error } = await supabase
                .from("moment_media")
                .select("*")
                .in("moment_id", momentIds)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as MomentMedia[];
        },
        enabled: momentIds.length > 0,
    });

    // Build moment title lookup
    const momentTitles: Record<string, string> = {};
    hostedMoments?.forEach((m) => {
        momentTitles[m.id] = m.title;
    });

    // Filter by status
    const filteredMedia = (allMedia || []).filter((m) => {
        if (statusFilter === "all") return true;
        return m.moderation_status === statusFilter;
    });

    const pendingCount = (allMedia || []).filter((m) => m.moderation_status === "pending").length;
    const approvedCount = (allMedia || []).filter((m) => m.moderation_status === "approved").length;
    const rejectedCount = (allMedia || []).filter((m) => m.moderation_status === "rejected").length;

    const handleModerate = (mediaId: string, status: "approved" | "rejected") => {
        moderateMedia.mutate({ mediaId, status });
    };

    const filterOptions: { value: StatusFilter; label: string; count: number }[] = [
        { value: "pending", label: "Pending", count: pendingCount },
        { value: "approved", label: "Approved", count: approvedCount },
        { value: "rejected", label: "Rejected", count: rejectedCount },
        { value: "all", label: "All", count: allMedia?.length || 0 },
    ];

    return (
        <main className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-xl" asChild>
                        <Link to="/dashboard">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="font-serif text-3xl font-bold tracking-tight">
                            Review <span className="italic text-primary">Content</span>
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Approve or reject photos and videos from your moments
                        </p>
                    </div>
                </div>
                {pendingCount > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        {pendingCount} pending review
                    </div>
                )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 text-center">
                    <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Pending</p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{approvedCount}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Approved</p>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 text-center">
                    <p className="text-2xl font-bold text-red-500">{rejectedCount}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Rejected</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {filterOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => setStatusFilter(option.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${statusFilter === option.value
                                ? "bg-primary text-primary-foreground shadow-soft"
                                : "bg-card border border-border hover:bg-muted"
                            }`}
                    >
                        {option.label}
                        <span className="text-[10px] opacity-70">({option.count})</span>
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-72 rounded-2xl" />
                    ))}
                </div>
            ) : filteredMedia.length === 0 ? (
                <div className="bg-card rounded-[2rem] p-16 border border-dashed border-border/60 text-center flex flex-col items-center">
                    <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                        <Camera className="w-10 h-10 text-primary/40" />
                    </div>
                    <h2 className="font-serif text-2xl font-bold mb-2">
                        {statusFilter === "pending" ? "No pending content" : "No content found"}
                    </h2>
                    <p className="text-muted-foreground max-w-sm">
                        {statusFilter === "pending"
                            ? "You're all caught up! New submissions from participants will appear here."
                            : "No content matches this filter."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMedia.map((item) => (
                        <div
                            key={item.id}
                            className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-soft hover:shadow-soft-xl transition-all duration-300"
                        >
                            {/* Media Preview */}
                            <div className="relative aspect-video bg-muted">
                                {item.media_type === "video" ? (
                                    <video
                                        src={item.media_url}
                                        className="w-full h-full object-cover"
                                        muted
                                        playsInline
                                    />
                                ) : (
                                    <img
                                        src={item.media_url}
                                        alt={item.caption || "Submission"}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                )}
                                {/* Status badge */}
                                <div
                                    className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${item.moderation_status === "pending"
                                            ? "bg-amber-500/90 text-white"
                                            : item.moderation_status === "approved"
                                                ? "bg-emerald-500/90 text-white"
                                                : "bg-red-500/90 text-white"
                                        }`}
                                >
                                    {item.moderation_status}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-5 space-y-3">
                                {item.caption && (
                                    <p className="text-sm text-foreground line-clamp-2">{item.caption}</p>
                                )}
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                                    <span>{momentTitles[item.moment_id] || "Unknown Moment"}</span>
                                    <span>{format(new Date(item.created_at), "MMM d, h:mm a")}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-3 h-3" /> {item.view_count} views
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Image className="w-3 h-3" /> {item.media_type}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                {item.moderation_status === "pending" && (
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            size="sm"
                                            className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white gap-1"
                                            onClick={() => handleModerate(item.id, "approved")}
                                            disabled={moderateMedia.isPending}
                                        >
                                            <Check className="w-3.5 h-3.5" /> Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 rounded-xl gap-1 text-red-500 border-red-500/20 hover:bg-red-500/10"
                                            onClick={() => handleModerate(item.id, "rejected")}
                                            disabled={moderateMedia.isPending}
                                        >
                                            <X className="w-3.5 h-3.5" /> Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
};

export default UGCReview;

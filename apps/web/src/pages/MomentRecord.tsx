import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MomentStatusBadge } from "@/components/MomentStatusBadge";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Gift,
  CheckCircle,
  Download,
  FileText,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type Moment = Tables<"moments">;

interface RecordStats {
  totalParticipants: number;
  verifiedParticipants: number;
  rewardsIssued: number;
  rewardsClaimed: number;
}

const MomentRecord = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [moment, setMoment] = useState<Moment | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RecordStats | null>(null);
  const [hostProfile, setHostProfile] = useState<{ full_name: string | null } | null>(null);

  const isHost = user && moment?.host_id === user.id;

  useEffect(() => {
    if (id) {
      fetchMomentRecord();
    }
  }, [id]);

  const fetchMomentRecord = async () => {
    if (!id) return;

    setLoading(true);
    try {
      // Fetch moment details
      const { data: momentData, error: momentError } = await supabase
        .from("moments")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (momentError) throw momentError;
      if (!momentData) {
        navigate("/discover");
        return;
      }

      setMoment(momentData);

      // Fetch participant stats
      const { count: totalParticipants } = await supabase
        .from("moment_participants")
        .select("*", { count: "exact", head: true })
        .eq("moment_id", id);

      const { count: verifiedParticipants } = await supabase
        .from("moment_participants")
        .select("*", { count: "exact", head: true })
        .eq("moment_id", id)
        .eq("status", "checked_in");

      const { count: rewardsIssued } = await supabase
        .from("rewards")
        .select("*", { count: "exact", head: true })
        .eq("moment_id", id);

      const { count: rewardsClaimed } = await supabase
        .from("rewards")
        .select("*", { count: "exact", head: true })
        .eq("moment_id", id)
        .eq("status", "claimed");

      setStats({
        totalParticipants: totalParticipants || 0,
        verifiedParticipants: verifiedParticipants || 0,
        rewardsIssued: rewardsIssued || 0,
        rewardsClaimed: rewardsClaimed || 0,
      });

      // Fetch host profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", momentData.host_id)
        .maybeSingle();

      setHostProfile(profileData);
    } catch (error) {
      console.error("Error fetching moment record:", error);
      toast({
        title: "Error loading record",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!moment || !stats) return;

    // Create CSV content
    const csvContent = [
      ["Moment Record Summary"],
      [""],
      ["Title", moment.title],
      ["Date", format(new Date(moment.starts_at), "PPP")],
      ["Location", moment.location],
      ["Venue", moment.venue_name || "N/A"],
      ["Host", hostProfile?.full_name || "Anonymous"],
      [""],
      ["Participation Metrics"],
      ["Total Participants", stats.totalParticipants.toString()],
      ["Verified Check-ins", stats.verifiedParticipants.toString()],
      ["Verification Rate", stats.totalParticipants > 0 ? `${Math.round((stats.verifiedParticipants / stats.totalParticipants) * 100)}%` : "N/A"],
      [""],
      ["Reward Metrics"],
      ["Rewards Issued", stats.rewardsIssued.toString()],
      ["Rewards Claimed", stats.rewardsClaimed.toString()],
      ["Claim Rate", stats.rewardsIssued > 0 ? `${Math.round((stats.rewardsClaimed / stats.rewardsIssued) * 100)}%` : "N/A"],
    ].map(row => row.join(",")).join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `moment-record-${moment.id.slice(0, 8)}.csv`;
    link.click();

    toast({
      title: "Record Exported",
      description: "CSV file downloaded successfully",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-24 pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="h-64 w-full rounded-2xl mb-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!moment) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-24 pb-12 px-4 text-center">
          <h1 className="font-serif text-2xl font-bold mb-4">Record not found</h1>
          <Button asChild>
            <Link to="/discover">Browse Moments</Link>
          </Button>
        </div>
      </div>
    );
  }

  const status = (moment as any).status as string || 'closed';

  return (
    <div className="min-h-screen bg-background">

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {isHost && (
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export Record
              </Button>
            )}
          </div>

          {/* Header */}
          <div className="bg-gradient-warm rounded-2xl p-8 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Moment Record
                  </span>
                </div>
                <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                  {moment.title}
                </h1>
                <p className="text-muted-foreground">
                  Hosted by {hostProfile?.full_name || "Anonymous Host"}
                </p>
              </div>
              <MomentStatusBadge status={status as any} />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl p-5 border border-border">
              <Users className="w-5 h-5 text-primary mb-3" />
              <p className="text-2xl font-bold text-foreground">{stats?.totalParticipants || 0}</p>
              <p className="text-sm text-muted-foreground">Participants Joined</p>
            </div>
            <div className="bg-card rounded-xl p-5 border border-border">
              <CheckCircle className="w-5 h-5 text-emerald-500 mb-3" />
              <p className="text-2xl font-bold text-foreground">{stats?.verifiedParticipants || 0}</p>
              <p className="text-sm text-muted-foreground">Verified Check-ins</p>
            </div>
            <div className="bg-card rounded-xl p-5 border border-border">
              <Gift className="w-5 h-5 text-accent mb-3" />
              <p className="text-2xl font-bold text-foreground">{stats?.rewardsIssued || 0}</p>
              <p className="text-sm text-muted-foreground">Rewards Issued</p>
            </div>
            <div className="bg-card rounded-xl p-5 border border-border">
              <Gift className="w-5 h-5 text-blue-500 mb-3" />
              <p className="text-2xl font-bold text-foreground">{stats?.rewardsClaimed || 0}</p>
              <p className="text-sm text-muted-foreground">Rewards Claimed</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Event Details */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Event Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(moment.starts_at), "EEEE, MMMM d, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(moment.starts_at), "h:mm a")}
                      {moment.ends_at && ` - ${format(new Date(moment.ends_at), "h:mm a")}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Location</p>
                    {moment.venue_name && (
                      <p className="text-sm text-muted-foreground">{moment.venue_name}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{moment.location}</p>
                  </div>
                </div>
                {moment.reward && (
                  <div className="flex items-start gap-3">
                    <Gift className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Reward Offered</p>
                      <p className="text-sm text-muted-foreground">{moment.reward}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Summary */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Verification Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Check-in Rate</span>
                    <span className="font-medium text-foreground">
                      {stats?.totalParticipants
                        ? `${Math.round((stats.verifiedParticipants / stats.totalParticipants) * 100)}%`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: stats?.totalParticipants
                          ? `${(stats.verifiedParticipants / stats.totalParticipants) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>

                {stats?.rewardsIssued && stats.rewardsIssued > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Redemption Rate</span>
                      <span className="font-medium text-foreground">
                        {`${Math.round((stats.rewardsClaimed / stats.rewardsIssued) * 100)}%`}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{
                          width: `${(stats.rewardsClaimed / stats.rewardsIssued) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Record generated {format(new Date(), "PPP 'at' h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {moment.description && (
            <div className="bg-card border border-border rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground">{moment.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to={`/moments/${moment.id}`}>View Moment Details</Link>
            </Button>
            {isHost && (
              <Button variant="hero" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Download Full Record (CSV)
              </Button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default MomentRecord;

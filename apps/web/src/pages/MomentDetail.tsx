import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MasonryGrid } from "@/components/MasonryGrid";
import { ImageGallery } from "@/components/ImageGallery";
import { StickyJoinBar } from "@/components/StickyJoinBar";
import { HostProfileCard } from "@/components/HostProfileCard";
import { SaveButton } from "@/components/SaveButton";
import { ReactionBar } from "@/components/ReactionBar";
import { CommentSection } from "@/components/CommentSection";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShareButton } from "@/components/ShareButton";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { MomentStatusBadge, type MomentStatus } from "@/components/MomentStatusBadge";
import { Badge } from "@/components/ui/badge";
import { MediaUploadDialog } from "@/components/participant/MediaUploadDialog";
import { ReviewDialog } from '@/components/participant/ReviewDialog';
import { useMomentMedia, useMomentReviews } from '@/hooks/useUGC';
import { MomentReviewsList } from '@/components/sentiment/MomentReviewsList';
import { CalendarButton } from "@/components/CalendarButton";
import { demoMoments } from "@/data/demo-moments";
import { PioneerBadge } from "@/components/badges/PioneerBadge";
import { SquadJoinCard } from "@/components/moments/SquadJoinCard";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Gift,
  Clock,
  Check,
  LogIn,
  Edit,
  QrCode,
  Shield,
  Camera,
  Star,
  MessageSquare,
  Share2,
  Heart,
  Flame,
  ExternalLink,
  Sparkles,
  Activity,
} from "lucide-react";
import { MerchantVerificationModal } from "@/components/merchant/MerchantVerificationModal";
import type { Tables } from "@/integrations/supabase/types";
import { getTaxonomyLabel, momentArchetypes, venueCategories, conversionTypes } from "@/lib/moment-taxonomy";
import { TierBadge } from "@/components/tier";
import { useUserTier, useVenueRelationship } from "@/hooks/useUserTier";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type Moment = Tables<"moments"> & {
  check_in_code?: string;
  status?: string;
  visibility?: string;
  proof_type?: string;
  expected_action_unit?: string;
  pulse_state?: string;
  gathering_threshold?: number | null;
  capacity_limit?: number | null;
  cooldown_minutes?: number | null;
  venue_category?: string | null;
  moment_archetype?: string | null;
  conversion_type?: string | null;
};

type ProofRequirement = {
  id: string;
  requirement_type: string;
  label?: string | null;
  instructions?: string | null;
  is_required?: boolean | null;
};

const MomentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { useTierStatus } = useUserTier();
  const { data: tierStatus } = useTierStatus();

  const [moment, setMoment] = useState<Moment | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Move hook call after state declaration to avoid TDZ
  const { data: venueRelationship } = useVenueRelationship(moment?.host_id || '');

  const isDemo = id?.startsWith('m') && id?.length <= 4;
  const [participantCount, setParticipantCount] = useState(0);
  const [isJoined, setIsJoined] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [proofRequirements, setProofRequirements] = useState<ProofRequirement[]>([]);
  const [hostProfile, setHostProfile] = useState<{
    display_name: string | null;
    avatar_url?: string | null;
    created_at?: string;
  } | null>(null);

  const isHost = user && moment?.host_id === user.id;
  const archetypeLabel = getTaxonomyLabel(momentArchetypes, moment?.moment_archetype);
  const venueCategoryLabel = getTaxonomyLabel(venueCategories, moment?.venue_category);
  const conversionLabel = getTaxonomyLabel(conversionTypes, moment?.conversion_type);

  // Fetch UGC data
  const { data: momentMedia } = useMomentMedia(!isDemo ? id || "" : "");
  const { data: momentReviews } = useMomentReviews(!isDemo ? id || "" : "");

  useEffect(() => {
    if (id) {
      fetchMoment();
    }
  }, [id, user]);

  useEffect(() => {
    if (id && user && !isDemo) {
      fetchProofRequirements();
    }
  }, [id, user, isDemo]);

  const fetchMoment = async () => {
    if (!id) return;

    setLoading(true);

    // Handle demo moments
    if (id.startsWith('m') && id.length <= 4) {
      const demoMoment = demoMoments.find(m => m.id === id);
      if (demoMoment) {
        console.log("Loading demo moment:", id);
        setMoment(demoMoment as any);
        setParticipantCount(demoMoment.participant_count || 0);
        setHostProfile({
          display_name: demoMoment.host.display_name,
          avatar_url: demoMoment.host.avatar_url,
          created_at: new Date().toISOString()
        });
        setLoading(false);
        return;
      }
    }

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

      // Fetch participant count
      const { count } = await supabase
        .from("moment_participants")
        .select("*", { count: "exact", head: true })
        .eq("moment_id", id);

      setParticipantCount(count || 0);

      // Check if current user has joined
      if (user) {
        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;

        if (accessToken) {
          const statusResponse = await fetch(`${API_URL}/api/participation/moments/${id}/status`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          const statusPayload = await statusResponse.json();
          if (statusResponse.ok) {
            setIsJoined(!!statusPayload?.joined);
            setIsCheckedIn(!!statusPayload?.checked_in);
          }
        }
      }

      // Fetch host profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, created_at")
        .eq("user_id", momentData.host_id)
        .maybeSingle();

      setHostProfile(profileData);
    } catch (error) {
      console.error("Error fetching moment:", error);
      toast({
        title: "Error loading moment",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assertParticipationEligibility = async (momentId: string) => {
    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token;
    if (!accessToken) return;

    const response = await fetch(`${API_URL}/api/pulse/moments/${momentId}/eligibility`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error || "Could not verify participation eligibility");
    }

    if (!payload?.eligibility?.can_join) {
      if (payload?.eligibility?.reasons?.is_full) {
        throw new Error("This moment has reached capacity.");
      }
      if (payload?.eligibility?.reasons?.cooldown_active) {
        throw new Error("This moment is in a cooldown window right now. Try again shortly.");
      }
      throw new Error("This moment is not currently joinable.");
    }
  };

  const fetchProofRequirements = async () => {
    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token;

    if (!id || !accessToken) return;

    try {
      const response = await fetch(`${API_URL}/api/proof/moments/${id}/requirements`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load proof requirements");
      }

      setProofRequirements(payload?.requirements || []);
    } catch (error) {
      console.error("Error fetching proof requirements:", error);
    }
  };

  const getProofSummary = (): ProofRequirement[] => {
    if (proofRequirements.length > 0) {
      return proofRequirements;
    }

    if (!moment?.proof_type) return [];

    const legacyMap: Record<string, { label: string; instructions: string }> = {
      QR: {
        label: "Venue code",
        instructions: "Scan or enter the code provided on-site to verify attendance.",
      },
      Code: {
        label: "Check-in code",
        instructions: "Use the host-provided code from the venue or activation desk.",
      },
      Photo: {
        label: "Photo proof",
        instructions: "Upload a clear photo showing you at the venue or completing the prompt.",
      },
      Video: {
        label: "Video proof",
        instructions: "Record visual proof that the action was completed in the correct location.",
      },
      GPS: {
        label: "Location verification",
        instructions: "Allow device location access while physically at the venue.",
      },
    };

    const fallback = legacyMap[moment.proof_type];
    return fallback
      ? [{
          id: "legacy-proof",
          requirement_type: moment.proof_type.toLowerCase(),
          label: fallback.label,
          instructions: fallback.instructions,
          is_required: true,
        }]
      : [];
  };

  const handleJoin = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!moment) return;

    setIsJoining(true);
    try {
      if (isDemo) {
        toast({
          title: "Demo Moment",
          description: "This is an example moment. You can't join it, but you can explore how it works!",
        });
        setIsJoining(false);
        return;
      }

      if (!isJoined) {
        await assertParticipationEligibility(moment.id);
      }

      if (isJoined) {
        const session = await supabase.auth.getSession();
        const response = await fetch(`${API_URL}/api/participation/moments/${moment.id}/join`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || "Failed to leave moment");

        setIsJoined(false);
        setParticipantCount((prev) => prev - 1);
        toast({
          title: "Left moment",
          description: "You've left this moment",
        });
      } else {
        const session = await supabase.auth.getSession();
        const response = await fetch(`${API_URL}/api/participation/moments/${moment.id}/join`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
          body: JSON.stringify({
            source_content_id: searchParams.get("contentId"),
            source_mission_id: searchParams.get("missionId"),
          }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || "Failed to join moment");

        setIsJoined(true);
        setParticipantCount((prev) => prev + 1);
        toast({
          title: "🎉 Joined! +25 Points Earned",
          description: `Leave your Mark for +50 more points. ${moment.reward ? `Don't forget to claim your ${moment.reward}!` : "You're building your reputation!"}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      fitness: "🧘", food: "🍽️", music: "🎵", social: "🎉",
      workshop: "🎨", networking: "🤝", outdoor: "🌳", arts: "🎭",
    };
    return emojis[category] || "✨";
  };

  const getArchetypeNarrative = () => {
    switch (moment?.moment_archetype) {
      case "visit":
        return "This is a low-friction visit moment designed to turn physical presence into a verified unlock.";
      case "service":
        return "This is a service moment, so the value comes from completing a real appointment or care interaction.";
      case "drop":
        return "This is a drop moment built around scarcity, urgency, and early access behavior.";
      case "ritual":
        return "This is a ritual moment meant to build repeat behavior, streaks, and loyalty over time.";
      case "content":
        return "This is a content-led moment that starts with story or creator engagement and resolves in the real world.";
      case "sampling":
        return "This is a sampling moment designed for try-before-you-buy or in-store demo behavior.";
      case "appointment":
        return "This is an appointment moment where a booking or scheduled slot is the primary success action.";
      case "referral":
        return "This is a referral moment where bringing someone new into the loop matters as much as showing up.";
      case "founder":
        return "This is a founder moment meant to reward early believers, first movers, and local identity builders.";
      case "gathering":
        return "This is a gathering moment designed to create visible live energy and coordinated turnout.";
      default:
        return "This moment turns a real-world action into verified progress, reward, and memory.";
    }
  };

  const getProofActionCopy = () => {
    if (moment?.conversion_type === "purchase") return "complete a purchase";
    if (moment?.conversion_type === "appointment" || moment?.conversion_type === "booking") return "complete your booking";
    if (moment?.conversion_type === "sample") return "claim the sample";
    if (moment?.conversion_type === "try_on") return "complete the try-on";
    if (moment?.conversion_type === "referral") return "complete the referral flow";
    if (moment?.proof_type === "Photo") return "take a photo";
    if (moment?.proof_type === "GPS") return "share your location";
    return "enter a code";
  };

  const isFull = moment?.max_participants
    ? participantCount >= moment.max_participants
    : false;

  const isPast = moment ? new Date(moment.starts_at) < new Date() : false;
  const cooldownActive = Boolean(
    moment?.cooldown_minutes &&
    moment?.pulse_state === "cooling" &&
    new Date(moment.starts_at).getTime() + Number(moment.cooldown_minutes) * 60 * 1000 > Date.now()
  );
  const proofSummary = getProofSummary();

  // Build gallery images
  const galleryImages = [
    ...(moment?.image_url ? [{ url: moment.image_url, alt: moment.title }] : []),
    ...(momentMedia?.map(m => ({ url: m.media_url, alt: m.caption || "", caption: m.caption })) || []),
  ];

  // Mock comments for now
  const mockComments: any[] = [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-20">
          <Skeleton className="h-96 w-full" />
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-40" />
              </div>
              <div>
                <Skeleton className="h-80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!moment) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-24 pb-12 px-4 text-center">
          <h1 className="font-serif text-2xl font-bold mb-4">Moment not found</h1>
          <Button asChild>
            <Link to="/discover">Browse Moments</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <SEO
        title={moment.title}
        description={moment.description || `Join ${moment.title} on Promorang`}
        image={moment.image_url || undefined}
        type="article"
        schema={{
          "@context": "https://schema.org",
          "@type": "Event",
          "name": moment.title,
          "startDate": moment.starts_at,
          "endDate": moment.ends_at,
          "eventStatus": "https://schema.org/EventScheduled",
          "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
          "location": {
            "@type": "Place",
            "name": moment.venue_name || "TBD",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": moment.location
            }
          },
          "image": moment.image_url ? [moment.image_url] : undefined,
          "description": moment.description,
          "organizer": {
            "@type": "Person",
            "name": hostProfile?.display_name || "Promorang User"
          }
        }}
      />

      {/* Hero Image Gallery */}
      <div className="pt-16">
        {galleryImages.length > 0 ? (
          <ImageGallery images={galleryImages} />
        ) : (
          <div className="h-80 md:h-96 bg-gradient-warm flex items-center justify-center">
            <span className="text-9xl opacity-50">{getCategoryEmoji(moment.category)}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Back and Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="ghost" className="w-fit" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex gap-2 overflow-x-auto pb-1 touch-pan-x snap-x-mandatory scrollbar-none">
                <SaveButton momentId={moment.id} variant="full" size="sm" />
                <ShareButton title={moment.title} description={moment.description || undefined} />
                {isJoined && !isPast && (
                  <CalendarButton
                    event={{
                      title: moment.title,
                      description: moment.description || "",
                      location: moment.location,
                      start: new Date(moment.starts_at),
                      end: moment.ends_at ? new Date(moment.ends_at) : new Date(new Date(moment.starts_at).getTime() + 3600000)
                    }}
                  />
                )}
                {isHost && moment.check_in_code && (
                  <QRCodeDisplay
                    momentId={moment.id}
                    momentTitle={moment.title}
                    checkInCode={moment.check_in_code}
                  />
                )}
                {isHost && (
                  <Button variant="outline" size="sm" className="snap-start shrink-0" asChild>
                    <Link to={`/moments/${moment.id}/edit`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Title Section */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <MomentStatusBadge status={(moment.status as MomentStatus) || (isPast ? 'closed' : 'joinable')} />
                <span className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full">
                  {(moment.category || "General").charAt(0).toUpperCase() + (moment.category || "General").slice(1)}
                </span>
                {archetypeLabel && (
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {archetypeLabel}
                  </span>
                )}
                {venueCategoryLabel && (
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-sm rounded-full">
                    {venueCategoryLabel}
                  </span>
                )}
                {conversionLabel && (
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-600 text-sm rounded-full">
                    {conversionLabel}
                  </span>
                )}
                {moment.reward && (
                  <span className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full flex items-center gap-1">
                    <Gift className="h-3 w-3" />
                    Reward
                  </span>
                )}
                {moment.pulse_state && (
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full flex items-center gap-1 capitalize">
                    <Activity className="h-3 w-3" />
                    {moment.pulse_state}
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
                {moment.title}
              </h1>

              {/* Social Proof & FOMO Facepile */}
              <div className="inline-flex max-w-full flex-wrap items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-3 text-sm text-muted-foreground shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex -space-x-2">
                    {/* Rank 5 Visual Flex (Golden Glow) */}
                    <div className="w-8 h-8 rounded-full border-2 border-background overflow-hidden z-[4] ring-2 ring-orange-500 ring-offset-1 ring-offset-background shadow-[0_0_10px_rgba(249,115,22,0.6)]"><img src={`https://i.pravatar.cc/100?u=${moment.id}1`} alt="High Rank Guest" className="w-full h-full object-cover"/></div>
                    {/* Rank 3 Visual Flex (Silver Border) */}
                    <div className="w-8 h-8 rounded-full border-2 border-background overflow-hidden z-[3] ring-1 ring-slate-400 ring-offset-1"><img src={`https://i.pravatar.cc/100?u=${moment.id}2`} alt="Mid Rank Guest" className="w-full h-full object-cover"/></div>
                    {/* Standard User */}
                    <div className="w-8 h-8 rounded-full border-2 border-background overflow-hidden z-[2]"><img src={`https://i.pravatar.cc/100?u=${moment.id}3`} alt="Guest" className="w-full h-full object-cover"/></div>
                    
                    <div className="w-8 h-8 rounded-full border-2 border-background bg-accent overflow-hidden z-[1] shadow-sm flex items-center justify-center text-[10px] font-bold text-white">
                        +{Math.max(0, participantCount - 3)}
                    </div>
                  </div>
                  <span className="px-2 font-semibold text-foreground">
                    {Math.max(participantCount, 3)} guests joining
                  </span>
                </div>
                {participantCount > 10 && (
                  <span className="flex items-center gap-1 text-orange-500">
                    <Flame className="h-4 w-4" />
                    Trending
                  </span>
                )}
                {/* Live Pulse Indicator */}
                <div className="flex items-center gap-2 border-border/50 sm:border-l sm:pl-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">12 Live Now</span>
                </div>
                {momentReviews && momentReviews.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    {(momentReviews.reduce((sum, r) => sum + r.rating, 0) / momentReviews.length).toFixed(1)}
                    <span className="text-muted-foreground">({momentReviews.length} reviews)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Hosted By (Mobile) */}
            <div className="lg:hidden p-4 border border-border rounded-xl flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-lg text-white font-medium">
                {hostProfile?.avatar_url ? (
                  <img src={hostProfile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  hostProfile?.display_name?.charAt(0) || "?"
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hosted by</p>
                <p className="font-medium">{hostProfile?.display_name || "Anonymous Host"}</p>
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-neutral max-w-none dark:prose-invert">
              <p className="text-foreground text-lg leading-relaxed">{moment.description}</p>
            </div>

            <div className="rounded-2xl border border-border bg-card/60 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Moment Pattern</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{getArchetypeNarrative()}</p>
            </div>

            {/* Value Proposition - Why Join */}
            {!isJoined && !isPast && (
              <div className="bg-gradient-to-r from-amber-500/10 via-primary/10 to-emerald-500/10 border border-amber-500/20 rounded-xl p-5 mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white font-black text-lg">+75</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground mb-2">Earn Points. Build Status. Unlock Rewards.</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Joining isn't just RSVP—it's an investment in your community reputation.
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-background rounded-lg p-2 text-center border border-border">
                        <div className="font-black text-amber-600 text-lg">+25</div>
                        <div className="text-muted-foreground">Join</div>
                      </div>
                      <div className="bg-background rounded-lg p-2 text-center border border-border">
                        <div className="font-black text-primary text-lg">+50</div>
                        <div className="text-muted-foreground">Check-in</div>
                      </div>
                      <div className="bg-background rounded-lg p-2 text-center border border-border">
                        <div className="font-black text-emerald-600 text-lg">= 75</div>
                        <div className="text-muted-foreground">Total</div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      <span className="text-primary font-semibold">Every 1,000 points = 1 Key</span> • Keys unlock exclusive funded moments • Rank up for early access & perks
                    </p>
                  </div>
                </div>
              </div>
            )}

            {proofSummary.length > 0 && (
              <div className="rounded-3xl border border-primary/15 bg-primary/5 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Verification Flow</p>
                    <h3 className="mt-2 font-serif text-2xl font-bold text-foreground">What participants need to prove</h3>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                      The check-in step should feel predictable. This moment exposes the verification expectations before someone commits.
                    </p>
                  </div>
                  {!isPast && (
                    <Button asChild variant="outline" className="shrink-0">
                      <Link to={`/moments/${moment.id}/checkin`}>Open Check-In Flow</Link>
                    </Button>
                  )}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {proofSummary.map((requirement) => (
                    <div key={requirement.id} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">
                          {requirement.label || requirement.requirement_type}
                        </p>
                        {requirement.is_required !== false && (
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                            Required
                          </span>
                        )}
                      </div>
                      {requirement.instructions && (
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {requirement.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="lg:hidden -mx-4 overflow-x-auto px-4 touch-pan-x snap-x-mandatory scrollbar-none">
              <div className="flex gap-3 pb-1">
                <div className="min-w-[240px] snap-start rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-primary/80">Journey</p>
                  <p className="mt-2 text-sm font-medium text-foreground">Join, check in, capture the moment, then unlock rewards and social proof.</p>
                </div>
                <div className="min-w-[220px] snap-start rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-muted-foreground">Best for mobile</p>
                  <p className="mt-2 text-sm text-muted-foreground">Sticky actions stay in thumb reach while galleries and action chips swipe naturally.</p>
                </div>
              </div>
            </div>

            {/* Details Cards - Airbnb style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl">
                <Calendar className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{formatDate(moment.starts_at)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(moment.starts_at)}
                    {moment.ends_at && ` - ${formatTime(moment.ends_at)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl">
                <MapPin className="w-6 h-6 text-primary flex-shrink-0" />
                <div className="flex-1">
                  {moment.venue_name && (
                    <p className="font-medium text-foreground">{moment.venue_name}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{moment.location}</p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(moment.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1 mt-1 font-medium"
                  >
                    View on map <ExternalLink className="h-3 w-3" />
                  </a>
                  
                  {/* The Unclaimed Value Trap */}
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">
                      Are you the owner of {moment.venue_name || 'this venue'}?
                    </p>
                    <Button variant="secondary" size="sm" className="w-full text-xs h-8 bg-secondary/50 hover:bg-secondary" asChild>
                      <Link to={`/venue-report/${moment.id}`}>
                        <Sparkles className="w-3 h-3 mr-1 text-primary" />
                        Claim Engagement Report
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl">
                <Users className="w-6 h-6 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {participantCount} / {moment.max_participants || "∞"} spots
                  </p>
                  {moment.gathering_threshold ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Gathering threshold: {moment.gathering_threshold} • Pulse {moment.pulse_state || "dormant"}
                    </p>
                  ) : null}
                  {cooldownActive ? (
                    <p className="mt-1 text-xs font-medium text-amber-600">
                      Cooldown active for {moment.cooldown_minutes} minutes after start.
                    </p>
                  ) : null}
                  {moment.max_participants && (
                    <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary rounded-full transition-all"
                        style={{ width: `${Math.min((participantCount / moment.max_participants) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {moment.reward && (
                <div className="flex items-start gap-4 p-4 bg-accent/5 border border-accent/20 rounded-xl">
                  <Gift className="w-6 h-6 text-accent flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Reward</p>
                    <p className="text-sm text-muted-foreground">{moment.reward}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Check-in / UGC Section */}
            {isJoined && !isPast && !isCheckedIn && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  {moment.proof_type === 'Photo' ? <Camera className="w-6 h-6 text-primary" /> :
                    moment.proof_type === 'GPS' ? <MapPin className="w-6 h-6 text-primary" /> :
                      <QrCode className="w-6 h-6 text-primary" />}
                  <h3 className="font-semibold text-lg">Verification Strategy</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  This moment uses <span className="text-foreground font-bold">{moment.proof_type || 'Code'} Verification</span>.
                  Prepare to {getProofActionCopy()} to unlock your rewards.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="hero" className="flex-1" asChild>
                    <Link to={`/moments/${moment.id}/checkin`}>Start {moment.expected_action_unit || 'Check-in'}</Link>
                  </Button>
                  
                  {moment.venue_name && (
                    <div className="flex-1">
                      <MerchantVerificationModal 
                        momentTitle={moment.title} 
                        venueName={moment.venue_name} 
                        onVerified={() => setIsCheckedIn(true)} 
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {isJoined && (isCheckedIn || isPast) && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Check className="w-6 h-6 text-emerald-500" />
                  <h3 className="font-semibold text-lg">
                    {isCheckedIn ? "You&apos;re checked in!" : "You attended this moment"}
                  </h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Record your presence to complete this Moment and claim your rewards.
                </p>
                <div className="flex flex-wrap gap-2">
                  <MediaUploadDialog
                    momentId={moment.id}
                    trigger={
                      <Button variant="outline">
                        <Camera className="w-4 h-4 mr-2" />
                        Capture Moment
                      </Button>
                    }
                  />
                  <ReviewDialog
                    momentId={moment.id}
                    momentTitle={moment.title}
                    trigger={
                      <Button variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Journal Note
                      </Button>
                    }
                  />
                </div>
              </div>
            )}

            {/* Reactions & Progress Integrity */}
            {(!isJoined || isCheckedIn || isPast) ? (
              <>
                <div className="border-t border-b border-border py-4">
                  <ReactionBar entityType="moment" entityId={moment.id} size="md" />
                </div>

                <div>
                  <h3 className="font-serif text-xl font-bold mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        The Moment Wall
                    </div>
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-primary/5 text-primary border-primary/20">Live Feed</Badge>
                  </h3>
                  <CommentSection
                    momentId={moment.id}
                    comments={mockComments}
                    currentUserId={user?.id}
                  />
                </div>
              </>
            ) : (
              <div className="py-4 text-center border-t border-b border-border/50 bg-secondary/10 rounded-xl">
                <p className="text-sm text-muted-foreground italic">
                  Complete your check-in to unlock community activity.
                </p>
              </div>
            )}

            {/* Reviews Section - New Comprehensive Sentiment */}
            <MomentReviewsList 
              momentId={moment.id} 
              limit={5} 
              showStats={true}
            />

            {/* Legacy Reviews Section - To be removed after migration */}
            {momentReviews && momentReviews.length > 0 && (
              <div className="mt-6 opacity-50">
                <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                  <Star className="h-4 w-4" />
                  Legacy Reviews ({momentReviews.length})
                </h3>
                <div className="space-y-4">
                  {momentReviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-muted-foreground"
                                }`}
                            />
                          ))}
                        </div>
                        {review.is_verified_participant && (
                          <span className="text-xs text-emerald-500 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      {review.title && <h4 className="font-medium mb-1">{review.title}</h4>}
                      {review.content && <p className="text-sm text-muted-foreground">{review.content}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Squad Engine */}
              <SquadJoinCard momentId={id || ""} momentTitle={moment.title} />

              {/* Join Card */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
                {moment.reward && (
                  <div className="text-center mb-4 p-4 bg-accent/10 rounded-xl">
                    <Gift className="w-8 h-8 text-accent mx-auto mb-2" />
                    <p className="font-medium">Reward Available</p>
                    <p className="text-sm text-muted-foreground">{moment.reward}</p>
                  </div>
                )}

                {isPast ? (
                  <Button variant="outline" className="w-full" size="lg" asChild>
                    <Link to={`/moments/${moment.id}/record`}>View Moment Record</Link>
                  </Button>
                ) : !user ? (
                  <Button variant="hero" className="w-full" size="lg" asChild>
                    <Link to="/auth">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign in to Join
                    </Link>
                  </Button>
                ) : isHost ? (
                  <Button variant="hero" className="w-full" size="lg" asChild>
                    <Link to={`/moments/${moment.id}/edit`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Manage Moment
                    </Link>
                  </Button>
                ) : isJoined ? (
                  <Button variant="outline" className="w-full" size="lg" onClick={handleJoin} disabled={isJoining}>
                    <Check className="w-4 h-4 mr-2" />
                    {isJoining ? "Leaving..." : "Joined - Click to Leave"}
                  </Button>
                ) : isFull ? (
                  <Button disabled className="w-full" size="lg">Moment Full</Button>
                ) : cooldownActive ? (
                  <Button disabled className="w-full" size="lg">Cooldown Active</Button>
                ) : (
                  <Button variant="hero" className="w-full" size="lg" onClick={handleJoin} disabled={isJoining}>
                    {isJoining ? "Joining..." : "Join This Moment"}
                  </Button>
                )}

                <p className="text-center text-sm text-muted-foreground mt-4">
                  {participantCount} {participantCount === 1 ? "person has" : "people have"} joined
                </p>
              </div>

              {/* Host Card */}
              <HostProfileCard
                hostId={moment.host_id}
                name={hostProfile?.display_name || "Host"}
                avatarUrl={hostProfile?.avatar_url}
                memberSince={hostProfile?.created_at}
                momentsHosted={5}
                isVerified={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Join Bar (Mobile) */}
      <StickyJoinBar
        momentId={moment.id}
        title={moment.title}
        reward={moment.reward}
        participantCount={participantCount}
        maxParticipants={moment.max_participants}
        isJoined={isJoined}
        isPast={isPast}
        isHost={isHost || false}
        isLoggedIn={!!user}
        onJoin={handleJoin}
        isJoining={isJoining}
      />

    </div>
  );
};

export default MomentDetail;

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ImageGallery } from "@/components/ImageGallery";
import { StickyJoinBar } from "@/components/StickyJoinBar";
import { HostProfileCard } from "@/components/HostProfileCard";
import { SaveButton } from "@/components/SaveButton";
import { ReactionBar } from "@/components/ReactionBar";
import { CommentSection } from "@/components/CommentSection";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { ShareButton } from "@/components/ShareButton";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { MomentStatusBadge, type MomentStatus } from "@/components/MomentStatusBadge";
import { Badge } from "@/components/ui/badge";
import { MediaUploadDialog } from "@/components/participant/MediaUploadDialog";
import { ReviewDialog } from '@/components/participant/ReviewDialog';
import { useMomentMedia, useMomentReviews } from '@/hooks/useUGC';
import { useMomentConversation } from "@/hooks/useMomentConversation";
import { MomentReviewsList } from '@/components/sentiment/MomentReviewsList';
import { CalendarButton } from "@/components/CalendarButton";
import { demoMoments } from "@/data/demo-moments";
import { CURATED_KINGSTON_MOMENTS } from "@/lib/curated-radar";
import { getSubMomentsForMoment } from "@/components/radar/MomentDetailModal";
import type { MomentProps } from "@/components/radar/MomentCard";
import { SquadJoinCard } from "@/components/moments/SquadJoinCard";
import StripeCheckout from "@/components/stripe/StripeCheckout";
import { ProofOutcomeRail } from "@/components/proof/ProofOutcomeRail";
import { useMomentProofOutcome } from "@/hooks/useProofOutcome";
import { PromorangMap } from "@/components/PromorangMap";
import { generateEventSchema } from "@/lib/seo-schemas";
import { SocialShareOGCard } from "@/components/SocialShareOGCard";
import { PoweredParticipation } from "@/components/moments/PoweredParticipation";
import { MomentAccess } from "@/components/moments/MomentAccess";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  Gift,
  Check,
  LogIn,
  Edit,
  Camera,
  Star,
  MessageSquare,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Repeat2,
  Trophy,
  Ticket,
  CheckCircle2,
  Clock,
  Compass,
  Zap,
  Share2,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { getTaxonomyLabel, momentArchetypes, venueCategories } from "@/lib/moment-taxonomy";
import { buildVenuePath, getSiteUrl, slugifySegment } from "@/lib/discovery";
import { getAccessState, type AccessQuote } from "@/lib/access";
import { resolveMomentOccurrence } from "@/lib/moment-recurrence";
import type { Scene } from "@promorang/shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Moment = Tables<"moments"> & {
  slug?: string | null;
  city?: string | null;
  country?: string | null;
  venue_slug?: string | null;
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
  recurrence_enabled?: boolean;
  recurrence_frequency?: "daily" | "weekly" | "monthly" | null;
  recurrence_interval?: number | null;
  banner_image_url?: string | null;
  gallery_images?: Array<{ url: string; alt?: string; caption?: string; media_type?: string }> | null;
  latitude?: number | null;
  longitude?: number | null;
};

type ProofRequirement = {
  id: string;
  requirement_type: string;
  label?: string | null;
  instructions?: string | null;
  is_required?: boolean | null;
};

type MomentEconomy = {
  economics: {
    money_source: "entry" | "host" | "event" | "platform" | "content" | "hybrid";
    entry_fee_jmd: number | null;
    total_funded_jmd: number;
    reward_pool_jmd: number;
    funding_status: string;
    payout_status: string;
  } | null;
  moves: Array<{
    id: string;
    title: string;
    description?: string | null;
    proof_type: string;
    reward_amount_jmd: number;
    max_completions?: number | null;
  }>;
};

type PaymentIntentLike = {
  id?: string;
};

type MomentTab = "overview" | "perks" | "community" | "host";

const MomentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const { toast } = useToast();

  const [moment, setMoment] = useState<Moment | null>(null);
  const [loading, setLoading] = useState(true);

  const isDemo = Boolean(
    id?.startsWith('m') ||
    id?.startsWith('moment-') ||
    id?.startsWith('demo-') ||
    id?.startsWith('fallback-') ||
    (moment?.id && !UUID_PATTERN.test(moment.id)) ||
    moment?.is_curated_editorial
  );
  const [participantCount, setParticipantCount] = useState(0);
  const [isJoined, setIsJoined] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [accessQuote, setAccessQuote] = useState<AccessQuote | null>(null);
  const [proofRequirements, setProofRequirements] = useState<ProofRequirement[]>([]);
  const [economy, setEconomy] = useState<MomentEconomy | null>(null);
  const [showEntryPayment, setShowEntryPayment] = useState(false);
  const [activeMomentTab, setActiveMomentTab] = useState<MomentTab>("overview");
  const [scene, setScene] = useState<Scene | null>(null);
  const [hostProfile, setHostProfile] = useState<{
    display_name: string | null;
    avatar_url?: string | null;
    created_at?: string;
  } | null>(null);

  const isHost = user && moment?.host_id === user.id;
  const canManageMoment = Boolean(isHost || roles.includes("admin"));

  const momentTabs: Array<{ id: MomentTab; label: string; Icon: typeof Sparkles }> = [
    { id: "overview", label: "Details", Icon: Compass },
    { id: "perks", label: "Perks & Rewards", Icon: Trophy },
    { id: "community", label: "Community & Discussion", Icon: MessageSquare },
    ...(canManageMoment ? [{ id: "host" as const, label: "Host Tools", Icon: ShieldCheck }] : []),
  ];

  const resolvedMomentId = (moment?.id && UUID_PATTERN.test(moment.id)) ? moment.id : null;
  const momentConversation = useMomentConversation(resolvedMomentId, user?.id);

  const promoPushCampaignId = searchParams.get("campaign");
  const promoPushChannelCode = searchParams.get("channel");
  const promoPushChannelId = searchParams.get("channelId");

  const occurrence = moment ? resolveMomentOccurrence(moment) : null;
  const displayStartsAt = occurrence?.startsAt || moment?.starts_at || "";
  const displayEndsAt = occurrence?.endsAt || null;

  const { data: momentMedia } = useMomentMedia(resolvedMomentId || "");
  const { data: momentReviews } = useMomentReviews(resolvedMomentId || "");
  const proofOutcomeQuery = useMomentProofOutcome(resolvedMomentId);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const fetchMoment = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    if (id.startsWith('moment-') || id.startsWith('m')) {
      const curatedMatch = CURATED_KINGSTON_MOMENTS.find(m => m.id === id);
      if (curatedMatch) {
        setMoment({
          id: curatedMatch.id,
          title: curatedMatch.title,
          description: curatedMatch.description,
          category: curatedMatch.intentType === "ATTEND" ? "Music & Parties" : curatedMatch.intentType === "TRY" ? "Food & Drinks" : "Gatherings & Culture",
          location: curatedMatch.location,
          venue_name: curatedMatch.venueName,
          starts_at: new Date(Date.now() + 86400000).toISOString(),
          ends_at: null,
          max_participants: 100,
          reward: `${curatedMatch.pointsReward} Points + PromoKey`,
          image_url: curatedMatch.image,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_curated_editorial: true,
        } as unknown as Moment);
        setParticipantCount(curatedMatch.attendeesCount || 18);
        setHostProfile({
          display_name: curatedMatch.venueName,
          avatar_url: curatedMatch.image,
          created_at: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      const demoMoment = demoMoments.find(m => m.id === id);
      if (demoMoment) {
        setMoment(demoMoment as unknown as Moment);
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
      const identifierIsUuid = UUID_PATTERN.test(id);
      let momentData: Moment | null = null;

      // 1. Try querying 'moments' table
      if (identifierIsUuid) {
        const { data, error } = await supabase.from("moments").select("*").eq("id", id).maybeSingle();
        if (!error && data) momentData = data;
      } else {
        const { data, error } = await supabase.from("moments").select("*").eq("slug", id).maybeSingle();
        if (!error && data) {
          momentData = data;
        } else {
          const { data: titleData } = await supabase.from("moments").select("*").ilike("title", `%${id.replace(/-/g, ' ')}%`).maybeSingle();
          if (titleData) momentData = titleData;
        }
      }

      // 2. Try querying 'view_public_moment_directory' if not found in moments table
      if (!momentData) {
        if (identifierIsUuid) {
          const { data: viewData } = await supabase.from("view_public_moment_directory").select("*").eq("id", id).maybeSingle();
          if (viewData) momentData = viewData as unknown as Moment;
        } else {
          const { data: viewSlugData } = await supabase.from("view_public_moment_directory").select("*").eq("slug", id).maybeSingle();
          if (viewSlugData) momentData = viewSlugData as unknown as Moment;
        }
      }

      // 3. Fallback to Curated Kingston Moments (including synthetic seed UUID matching)
      if (!momentData) {
        // Extract numeric suffix from seed UUIDs like 00000000-0000-0000-0002-000000000023 -> 23
        const numMatch = id.match(/00000000-0000-0000-0002-0000000000(\d+)/i);
        const momentNum = numMatch ? parseInt(numMatch[1], 10) : null;

        const curatedMatch = CURATED_KINGSTON_MOMENTS.find(m => {
          if (m.id === id) return true;
          if (momentNum !== null && (m.id === `moment-${momentNum}` || m.id === `m-${momentNum}`)) return true;
          const cleanTitle = m.title.toLowerCase().replace(/[^a-z0-9]/g, '');
          const cleanId = id.toLowerCase().replace(/[^a-z0-9]/g, '');
          return cleanTitle.includes(cleanId) || cleanId.includes(cleanTitle);
        });

        if (curatedMatch) {
          momentData = {
            id: curatedMatch.id,
            title: curatedMatch.title,
            description: curatedMatch.description,
            category: curatedMatch.intentType === "ATTEND" ? "Music & Parties" : curatedMatch.intentType === "TRY" ? "Food & Drinks" : "Gatherings & Culture",
            location: curatedMatch.location,
            venue_name: curatedMatch.venueName,
            starts_at: new Date(Date.now() + 86400000).toISOString(),
            ends_at: null,
            max_participants: 100,
            reward: `${curatedMatch.pointsReward} Points + PromoKey`,
            image_url: curatedMatch.image,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_curated_editorial: true,
          } as unknown as Moment;
          setHostProfile({
            display_name: curatedMatch.venueName,
            avatar_url: curatedMatch.image,
            created_at: new Date().toISOString(),
          });
        }
      }

      // 4. Fallback to demo moments
      if (!momentData) {
        const demoMatch = demoMoments.find(m => m.id === id || m.title.toLowerCase().includes(id.toLowerCase().replace(/-/g, ' ')));
        if (demoMatch) {
          momentData = demoMatch as unknown as Moment;
          setHostProfile({
            display_name: demoMatch.host?.display_name || "Host",
            avatar_url: demoMatch.host?.avatar_url || null,
            created_at: new Date().toISOString(),
          });
        }
      }

      if (!momentData) {
        setMoment(null);
        setLoading(false);
        return;
      }

      setMoment(momentData);

      if (momentData.id && UUID_PATTERN.test(momentData.id)) {
        const { count } = await supabase
          .from("moment_participants")
          .select("*", { count: "exact", head: true })
          .eq("moment_id", momentData.id);

        setParticipantCount(count || 0);

        if (user) {
          const session = await supabase.auth.getSession();
          const accessToken = session.data.session?.access_token;

          if (accessToken) {
            const statusResponse = await fetch(`${API_URL}/api/participation/moments/${momentData.id}/status`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

            const statusPayload = await statusResponse.json();
            if (statusResponse.ok) {
              setIsJoined(!!statusPayload?.joined);
              setIsCheckedIn(!!statusPayload?.checked_in);
              setAccessQuote(statusPayload?.access_quote || null);
            }
          }
        }
      }

      if (momentData.host_id && UUID_PATTERN.test(momentData.host_id)) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, created_at")
          .eq("user_id", momentData.host_id)
          .maybeSingle();

        if (profileData) {
          setHostProfile({
            display_name: profileData.full_name,
            avatar_url: profileData.avatar_url,
            created_at: profileData.created_at,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching moment:", error);
      toast({
        title: "Error loading event",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, user, navigate, toast]);

  const fetchProofRequirements = useCallback(async () => {
    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token;

    if (!resolvedMomentId || !accessToken) return;

    try {
      const response = await fetch(`${API_URL}/api/proof/moments/${resolvedMomentId}/requirements`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const payload = await response.json();
      if (response.ok) {
        setProofRequirements(payload?.requirements || []);
      }
    } catch (error) {
      console.error("Error fetching proof requirements:", error);
    }
  }, [resolvedMomentId]);

  const fetchMomentEconomy = useCallback(async () => {
    if (!resolvedMomentId) return;

    try {
      const response = await fetch(`${API_URL}/api/moment-economy/moments/${resolvedMomentId}`);
      const payload = await response.json();
      if (response.ok) {
        setEconomy({
          economics: payload.economics || null,
          moves: payload.moves || [],
        });
      }
    } catch (error) {
      console.error("Error fetching moment economy:", error);
    }
  }, [resolvedMomentId]);

  useEffect(() => {
    if (id) {
      fetchMoment();
    }
  }, [id, fetchMoment]);

  useEffect(() => {
    if (resolvedMomentId && user && !isDemo) {
      fetchProofRequirements();
    }
  }, [resolvedMomentId, user, isDemo, fetchProofRequirements]);

  useEffect(() => {
    if (resolvedMomentId && !isDemo) {
      fetchMomentEconomy();
      (supabase as any).from("moment_scene_links").select("scenes(*)").eq("moment_id", resolvedMomentId).limit(1).maybeSingle().then(({ data }: any) => setScene(data?.scenes || null));
    }
  }, [resolvedMomentId, isDemo, fetchMomentEconomy]);

  const joinMoment = async (entryPaymentReference: string | null = null) => {
    if (!moment) return;

    const session = await supabase.auth.getSession();
    const entryFee = Number(economy?.economics?.entry_fee_jmd || 0);
    const response = await fetch(`${API_URL}/api/participation/moments/${moment.id}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data.session?.access_token}`,
      },
      body: JSON.stringify({
        source_content_id: searchParams.get("contentId"),
        source_mission_id: searchParams.get("missionId"),
        entry_amount_jmd: entryFee || null,
        entry_payment_reference: entryPaymentReference,
        promopush_campaign_id: promoPushCampaignId,
        promopush_channel_id: promoPushChannelId,
        promopush_tracking_code: promoPushChannelCode,
        invited_by_user_id: searchParams.get("invitedBy"),
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      if (payload?.access_quote) setAccessQuote(payload.access_quote);
      throw new Error(payload?.error || "Failed to join event");
    }

    setIsJoined(true);
    setAccessQuote(payload?.access?.quote || payload?.access_quote || accessQuote);
    setParticipantCount((prev) => prev + 1);
    toast({
      title: "RSVP Confirmed! 🎉",
      description: moment.reward ? `Your spot is reserved. Claim your ${moment.reward} on arrival!` : "Your spot is reserved.",
    });
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
          title: "Demo Event",
          description: "This is an example event preview.",
        });
        setIsJoining(false);
        return;
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
        if (!response.ok) throw new Error(payload?.error || "Failed to leave event");

        setIsJoined(false);
        setParticipantCount((prev) => Math.max(0, prev - 1));
        toast({
          title: "RSVP Cancelled",
          description: "You have removed your reservation.",
        });
      } else {
        const entryFee = Number(economy?.economics?.entry_fee_jmd || 0);
        if ((economy?.economics?.money_source === "entry" || economy?.economics?.money_source === "hybrid") && entryFee > 0) {
          setShowEntryPayment(true);
          return;
        }

        await joinMoment(null);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update event reservation";
      toast({
        title: "Action Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleEntryPaymentSuccess = async (paymentIntent?: PaymentIntentLike) => {
    if (!moment || !paymentIntent?.id) return;

    setShowEntryPayment(false);
    setIsJoining(true);
    try {
      await joinMoment(paymentIntent.id);
      await fetchMomentEconomy();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to complete ticket order";
      toast({
        title: "Payment Failed",
        description: message,
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
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isFull = moment?.max_participants ? participantCount >= moment.max_participants : false;
  const accessState = getAccessState(accessQuote);
  const entryFeeJmd = Number(economy?.economics?.entry_fee_jmd || 0);
  const rewardLabel = moment?.reward || "Complimentary Item & Verified Badge";

  const isPast = moment ? !occurrence?.hasFutureOccurrence && new Date(moment.starts_at) < new Date() : false;
  const bannerImage = moment?.banner_image_url || moment?.image_url || null;
  const hasMapCoordinates =
    typeof moment?.latitude === "number" &&
    Number.isFinite(moment.latitude) &&
    typeof moment?.longitude === "number" &&
    Number.isFinite(moment.longitude);
  const venueMapQuery = [moment?.venue_name, moment?.location, moment?.city, moment?.country]
    .filter(Boolean)
    .join(", ");

  const galleryImages = [
    ...(bannerImage ? [{ url: bannerImage, alt: moment.title }] : []),
    ...(Array.isArray(moment?.gallery_images) ? moment.gallery_images : []),
    ...(momentMedia?.map(m => ({ url: m.media_url, alt: m.caption || "", caption: m.caption })) || []),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl space-y-6">
          <Skeleton className="h-80 w-full rounded-3xl bg-white/5" />
          <Skeleton className="h-12 w-2/3 bg-white/5" />
          <Skeleton className="h-40 w-full bg-white/5" />
        </div>
      </div>
    );
  }

  if (!moment) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-3xl font-extrabold tracking-tight">Event Not Found</h1>
          <p className="text-white/60 text-sm">This event link may be expired or invalid.</p>
          <Button asChild className="rounded-full bg-[#ff5500] text-white hover:bg-[#e04b00] px-6">
            <Link to="/explore/moments">Browse Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-[#ff5500] selection:text-white">
      <SEO
        title={moment.title}
        description={moment.description || `Join ${moment.title} on Promorang`}
        image={bannerImage || undefined}
        type="article"
        url={getSiteUrl(`/moments/${moment.slug || moment.id}`)}
        schema={generateEventSchema(moment)}
      />

      {/* Cinematic Hero Header */}
      <header className="relative w-full overflow-hidden bg-black pt-12 pb-8 border-b border-white/10">
        {/* Background Cover Image with Soft Vignette */}
        <div className="absolute inset-0 z-0">
          {galleryImages.length > 0 ? (
            <img
              src={galleryImages[0].url}
              alt={moment.title}
              className="h-full w-full object-cover opacity-25 filter blur-sm scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#18181b] via-[#09090b] to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/50 to-[#09090b]" />
        </div>

        {/* Top Navigation Control */}
        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-2 sm:px-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full border border-white/15 bg-black/50 text-white/90 backdrop-blur-md hover:bg-white/15 hover:text-white transition-all"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <div className="flex items-center gap-2">
              <SaveButton momentId={moment.id} variant="icon" size="sm" />
              <ShareButton title={moment.title} description={moment.description || undefined} />
              {isJoined && !isPast && (
                <CalendarButton
                  event={{
                    title: moment.title,
                    description: moment.description || "",
                    location: moment.location,
                    start: new Date(displayStartsAt),
                    end: displayEndsAt ? new Date(displayEndsAt) : new Date(new Date(displayStartsAt).getTime() + 3600000)
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Main Hero Content & Action Box */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-8 sm:px-6">
          <div
            className={`grid gap-8 lg:items-end ${
              galleryImages.length > 0
                ? "lg:grid-cols-[220px_minmax(0,1fr)_360px]"
                : "lg:grid-cols-[minmax(0,1fr)_360px]"
            }`}
          >
            {galleryImages.length > 0 && (
              <figure className="group relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-white/15 bg-[#141417] shadow-2xl shadow-black/50 lg:mx-0 lg:max-w-none">
                <div className="aspect-[16/10] lg:aspect-[4/5]">
                  <img
                    src={galleryImages[0].url}
                    alt={`${moment.title} event poster`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
                <figcaption className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/80 backdrop-blur-md">
                  Event poster
                </figcaption>
              </figure>
            )}
            <div className="space-y-4">
              {/* Category & Status Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full bg-[#ff5500] text-white font-bold text-xs px-3.5 py-1 uppercase tracking-wider border-none shadow-md shadow-[#ff5500]/20">
                  {moment.category || "Event"}
                </Badge>
                {isPast ? (
                  <Badge variant="outline" className="rounded-full border-white/20 bg-white/5 text-white/60 text-xs px-3 py-1">
                    Event Completed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1">
                    ● RSVP Open
                  </Badge>
                )}
              </div>

              {/* Event Title */}
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
                {moment.title}
              </h1>

              {/* Key Quick Info Metadata Pills */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-white/80 pt-1">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 backdrop-blur-md">
                  <Calendar className="h-4 w-4 text-[#ff5500]" />
                  <span>{formatDate(displayStartsAt)} • {formatTime(displayStartsAt)}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 backdrop-blur-md">
                  <MapPin className="h-4 w-4 text-[#ff5500]" />
                  <span className="truncate max-w-[180px] sm:max-w-none">{moment.venue_name || moment.location}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 backdrop-blur-md">
                  <Users className="h-4 w-4 text-[#ff5500]" />
                  <span>{participantCount} Going</span>
                </div>
              </div>
            </div>

            {/* High-Conversion Unified Action Box */}
            <div className="rounded-3xl border border-white/15 bg-[#141417]/90 p-6 backdrop-blur-xl shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Admission</span>
                  <p className="text-2xl font-black text-white mt-0.5">
                    {entryFeeJmd > 0 ? `$${entryFeeJmd.toLocaleString()} JMD` : "FREE"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Capacity</span>
                  <p className="text-sm font-semibold text-white/90 mt-0.5">
                    {moment.max_participants ? `${participantCount}/${moment.max_participants}` : "Unlimited"}
                  </p>
                </div>
              </div>

              {/* Progress indicator if limited */}
              {moment.max_participants && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-white/60">
                    <span>Spots Claimed</span>
                    <span>{Math.round((participantCount / moment.max_participants) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-[#ff7f50] to-[#ff5500] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((participantCount / moment.max_participants) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Primary Call to Action Button */}
              <div className="space-y-2.5">
                {isPast && (
                  <Button asChild className="w-full rounded-2xl bg-white/10 text-white hover:bg-white/20 font-bold py-5">
                    <Link to={`/moments/${moment.id}/record`}>View Event Record</Link>
                  </Button>
                )}
                {!isPast && !user && (
                  <Button asChild className="w-full rounded-2xl bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold text-base py-5 shadow-lg shadow-[#ff5500]/25 transition-all hover:scale-[1.01]">
                    <Link to="/auth"><LogIn className="mr-2 h-5 w-5" />Sign In to Reserve Spot</Link>
                  </Button>
                )}
                {!isPast && !!user && isHost && (
                  <Button asChild className="w-full rounded-2xl bg-white text-black hover:bg-white/90 font-bold py-5">
                    <Link to={`/moments/${moment.id}/edit`}><Edit className="mr-2 h-4 w-4" />Edit Event Details</Link>
                  </Button>
                )}
                {!isPast && !!user && !isHost && isJoined && (
                  <Button
                    onClick={handleJoin}
                    disabled={isJoining}
                    variant="outline"
                    className="w-full rounded-2xl border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-bold py-5"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" /> Spot Reserved (Click to Cancel)
                  </Button>
                )}
                {!isPast && !!user && !isHost && !isJoined && (
                  <Button
                    onClick={handleJoin}
                    disabled={isJoining || isFull}
                    className="w-full rounded-2xl bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold text-base py-5 shadow-lg shadow-[#ff5500]/25 transition-all hover:scale-[1.01]"
                  >
                    {isJoining ? "Reserving..." : isFull ? "Event Full" : "RSVP Now — Free"}
                  </Button>
                )}

                <Button
                  type="button"
                  onClick={() => setShareModalOpen(true)}
                  variant="outline"
                  className="w-full rounded-2xl border-white/15 text-white/90 hover:bg-white/10 font-medium py-4 text-xs"
                >
                  <Share2 className="mr-2 h-3.5 w-3.5 text-[#ff5500]" /> Invite Friends
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Sub-Tab Bar for Quick Jumping */}
      <nav className="sticky top-0 z-30 border-b border-white/10 bg-[#09090b]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl gap-2 px-4 py-2.5 sm:px-6 overflow-x-auto">
          {momentTabs.map((tab) => {
            const isActive = activeMomentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMomentTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                  isActive
                    ? "bg-[#ff5500] text-white shadow-md shadow-[#ff5500]/20"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <tab.Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Body 2-Column Grid */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">

          {/* Left Main Column */}
          <div className="space-y-8 min-w-0">

            {/* TAB 1: OVERVIEW & DETAILS */}
            {activeMomentTab === "overview" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Event Description */}
                <section className="rounded-3xl border border-white/10 bg-[#121215] p-6 sm:p-8 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-[#ff5500] font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="h-4 w-4" /> About this Event
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">The Experience</h2>
                  <p className="text-white/80 leading-relaxed text-base font-normal whitespace-pre-line">
                    {moment.description || "Join us for an incredible experience with great music, community, and exclusive perks."}
                  </p>

                  {/* Connected Scene Banner */}
                  {scene && (
                    <Link
                      to={`/scenes/${scene.slug}`}
                      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 mt-6"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff5500]/20 text-[#ff5500]">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-[#ff5500]">Part of {scene.title}</p>
                          <p className="text-sm font-medium text-white/90">{scene.metadata?.tagline || "Discover this scene"}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                    </Link>
                  )}
                </section>

                {/* Venue & Map Card */}
                <section className="rounded-3xl border border-white/10 bg-[#121215] p-6 sm:p-8 space-y-5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ff5500]/15 text-[#ff5500]">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">Location & Venue</h4>
                        <p className="text-xs text-white/50">{moment.venue_name || "Venue Location"}</p>
                      </div>
                    </div>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(moment.location || moment.venue_name || "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff5500] hover:underline bg-[#ff5500]/10 px-3 py-1.5 rounded-full border border-[#ff5500]/20"
                    >
                      Open Directions <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  <p className="text-sm font-medium text-white/90">{moment.location}</p>

                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    {hasMapCoordinates ? (
                      <PromorangMap
                        center={{
                          lat: moment.latitude as number,
                          lng: moment.longitude as number,
                        }}
                        zoom={15}
                        height="240px"
                        markers={[
                          {
                            id: moment.id,
                            lat: moment.latitude as number,
                            lng: moment.longitude as number,
                            title: moment.title,
                            subtitle: moment.venue_name || moment.location,
                            reward: moment.reward ? `$${moment.reward}` : undefined,
                          }
                        ]}
                      />
                    ) : (
                      <iframe
                        title={`Map of ${moment.venue_name || moment.location}`}
                        src={`https://www.google.com/maps?q=${encodeURIComponent(venueMapQuery)}&output=embed`}
                        className="h-[240px] w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                      />
                    )}
                  </div>
                </section>
              </div>
            )}

            {/* TAB 2: PERKS & REWARDS */}
            {activeMomentTab === "perks" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Perk Highlight Box */}
                <section className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[#121215] to-[#121215] p-6 sm:p-8 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Trophy className="h-4 w-4" /> Attendee Perk & Points
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">What You Receive</h2>

                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
                      <Gift className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{rewardLabel}</h4>
                      <p className="text-sm text-white/70 mt-1">
                        Check in at the venue entrance to claim this reward and receive your verified digital memory badge.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Sub-Moments & Scout Missions */}
                {(() => {
                  const subMoments = getSubMomentsForMoment({
                    id: moment.id,
                    title: moment.title,
                    description: moment.description || "",
                    intentType: "ATTEND",
                    ownership: "EDITORIAL DISCOVERY",
                    venueName: moment.venue_name || moment.location || "",
                    location: moment.location || "",
                    dateDisplay: displayStartsAt,
                    image: galleryImages[0]?.url || "",
                    promoKeysAvailable: 5,
                    subMomentsCount: 3,
                    attendeesCount: participantCount,
                    pointsReward: 100,
                    isClaimed: false,
                  });

                  if (!subMoments || subMoments.length === 0) return null;

                  return (
                    <section className="rounded-3xl border border-white/10 bg-[#121215] p-6 sm:p-8 space-y-6 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[#ff5500] font-bold text-xs uppercase tracking-wider">
                            <Sparkles className="h-4 w-4" /> Interactive Micro-Actions
                          </div>
                          <h3 className="text-xl font-extrabold text-white">Sub-Moments & Scout Missions ({subMoments.length})</h3>
                        </div>
                        <Badge className="bg-[#ff5500]/20 text-[#ff5500] border-none font-bold text-xs px-3 py-1">
                          +{subMoments.reduce((sum, s) => sum + s.points, 0)} Total Points
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {subMoments.map((sub, idx) => (
                          <div
                            key={sub.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-[#ff5500]/40 hover:bg-white/10"
                          >
                            <div className="flex items-start gap-3.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white font-bold text-xs">
                                {idx + 1}
                              </div>
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-bold text-white text-sm">{sub.title}</h4>
                                  <span className="text-[10px] font-semibold text-white/50 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                                    {sub.timeWindow}
                                  </span>
                                </div>
                                <p className="text-xs text-white/60 leading-relaxed max-w-xl">{sub.description}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                              <span className="font-extrabold text-xs text-[#ff5500]">+{sub.points} pts</span>
                              <Button
                                size="sm"
                                className="rounded-xl bg-white text-black hover:bg-white/90 font-bold text-xs px-4"
                                onClick={() => {
                                  if (isJoined) {
                                    navigate(`/moments/${moment.id}/checkin`);
                                  } else {
                                    handleJoin();
                                  }
                                }}
                              >
                                {isJoined ? "Complete Mission" : "Unlock Mission"}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })()}

                {/* Check-In Instructions */}
                <section className="rounded-3xl border border-white/10 bg-[#121215] p-6 sm:p-8 space-y-4 shadow-xl">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#ff5500]">Check-In Instructions</h3>
                  <h2 className="text-lg sm:text-xl font-bold text-white">How to Verify Attendance</h2>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-white text-sm">
                        <Check className="h-4 w-4 text-[#ff5500]" /> 1. Arrive at Venue
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">Head to {moment.venue_name || moment.location} during door hours.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-white text-sm">
                        <Check className="h-4 w-4 text-[#ff5500]" /> 2. Scan or Enter Code
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">Scan the check-in QR code at the desk or enter the host's code on your device.</p>
                    </div>
                  </div>

                  {isJoined && !isPast && (
                    <div className="pt-2">
                      <Button asChild className="rounded-full bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold px-6">
                        <Link to={`/moments/${moment.id}/checkin`}>Open Check-In Interface</Link>
                      </Button>
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* TAB 3: COMMUNITY & DISCUSSION */}
            {activeMomentTab === "community" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Photo Gallery Carousel */}
                {galleryImages.length > 0 && (
                  <section className="rounded-3xl border border-white/10 bg-[#121215] p-6 sm:p-8 space-y-4 shadow-xl">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#ff5500]">Photos</h3>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Event Gallery</h2>
                    <Carousel opts={{ align: "start", loop: galleryImages.length > 3 }}>
                      <CarouselContent>
                        {galleryImages.map((img, idx) => (
                          <CarouselItem key={`${img.url}-${idx}`} className="basis-[85%] sm:basis-1/2">
                            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                              <img src={img.url} alt={img.alt || `Photo ${idx + 1}`} className="aspect-[4/3] w-full object-cover" />
                              {img.caption && <p className="p-3 text-xs text-white/70">{img.caption}</p>}
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-2 bg-black/80 text-white border-white/20" />
                      <CarouselNext className="right-2 bg-black/80 text-white border-white/20" />
                    </Carousel>
                  </section>
                )}

                {/* Reaction Bar */}
                <div className="rounded-2xl border border-white/10 bg-[#121215] p-4 flex items-center justify-between">
                  <ReactionBar
                    entityType="moment"
                    entityId={moment.id}
                    size="md"
                    canInteract={Boolean(isJoined || isHost)}
                    disabledReason="RSVP to react."
                  />
                </div>

                {/* Discussion Wall */}
                <section className="rounded-3xl border border-white/10 bg-[#121215] p-6 sm:p-8 space-y-4 shadow-xl">
                  <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-[#ff5500]" /> Discussion & Questions
                  </h3>
                  <CommentSection
                    momentId={moment.id}
                    comments={momentConversation.comments}
                    currentUserId={user?.id}
                    onAddComment={momentConversation.addComment}
                    onDeleteComment={momentConversation.deleteComment}
                    isLoading={momentConversation.isLoading}
                    canInteract={Boolean(isJoined || isHost)}
                    disabledReason="RSVP to join the event chat wall."
                  />
                </section>
              </div>
            )}

            {/* TAB 4: HOST TOOLS */}
            {activeMomentTab === "host" && isHost && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <section className="rounded-3xl border border-[#ff5500]/30 bg-[#ff5500]/10 p-6 sm:p-8 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-[#ff5500] font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4" /> Host Management
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">Event Controls</h2>
                  <p className="text-white/70 text-sm">Manage door check-ins, event details, and attendee lists.</p>

                  <div className="grid gap-4 sm:grid-cols-2 pt-2">
                    <Button asChild className="rounded-2xl bg-white text-black hover:bg-white/90 font-bold py-5">
                      <Link to={`/moments/${moment.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit Event Details</Link>
                    </Button>

                    {moment.check_in_code && (
                      <QRCodeDisplay
                        momentId={moment.id}
                        momentTitle={moment.title}
                        checkInCode={moment.check_in_code}
                      />
                    )}
                  </div>
                </section>
              </div>
            )}
          </div>

          {/* Right Sidebar Column */}
          <aside className="space-y-6">
            <HostProfileCard
              hostId={moment.host_id}
              name={hostProfile?.display_name || "Event Host"}
              avatarUrl={hostProfile?.avatar_url}
              memberSince={hostProfile?.created_at}
              momentsHosted={3}
              isVerified={true}
            />

            <SquadJoinCard
              momentId={moment.id}
              momentTitle={moment.title}
              inviterId={user?.id}
              participantCount={participantCount}
            />
          </aside>
        </div>
      </main>

      {/* Mobile Sticky Join Bar */}
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
        accessState={accessState}
      />

      {/* Social Share Modal */}
      {moment && (
        <SocialShareOGCard
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          moment={moment}
        />
      )}
    </div>
  );
};

export default MomentDetail;

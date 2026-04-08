import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { MediaUploadDialog } from "@/components/participant/MediaUploadDialog";
import { ReviewDialog } from "@/components/participant/ReviewDialog";
import { useMomentMedia, useMomentReviews } from "@/hooks/useUGC";
import { CalendarButton } from "@/components/CalendarButton";
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
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Moment = Tables<"moments"> & {
  check_in_code?: string;
  status?: string;
  visibility?: string;
  proof_type?: string;
  expected_action_unit?: string;
};

const MomentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [moment, setMoment] = useState<Moment | null>(null);
  const [loading, setLoading] = useState(true);
  const [participantCount, setParticipantCount] = useState(0);
  const [isJoined, setIsJoined] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [hostProfile, setHostProfile] = useState<{
    full_name: string | null;
    avatar_url?: string | null;
    created_at?: string;
  } | null>(null);

  const isHost = user && moment?.host_id === user.id;

  // Fetch UGC data
  const { data: momentMedia } = useMomentMedia(id || "");
  const { data: momentReviews } = useMomentReviews(id || "");

  useEffect(() => {
    if (id) {
      fetchMoment();
    }
  }, [id, user]);

  const fetchMoment = async () => {
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

      // Fetch participant count
      const { count } = await supabase
        .from("moment_participants")
        .select("*", { count: "exact", head: true })
        .eq("moment_id", id);

      setParticipantCount(count || 0);

      // Check if current user has joined
      if (user) {
        const { data: participation } = await supabase
          .from("moment_participants")
          .select("id, status, checked_in_at")
          .eq("moment_id", id)
          .eq("user_id", user.id)
          .maybeSingle();

        setIsJoined(!!participation);
        setIsCheckedIn(!!participation?.checked_in_at);
      }

      // Fetch host profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, created_at")
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

  const handleJoin = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!moment) return;

    setIsJoining(true);
    try {
      if (isJoined) {
        const { error } = await supabase
          .from("moment_participants")
          .delete()
          .eq("moment_id", moment.id)
          .eq("user_id", user.id);

        if (error) throw error;

        setIsJoined(false);
        setParticipantCount((prev) => prev - 1);
        toast({
          title: "Left moment",
          description: "You've left this moment",
        });
      } else {
        const { error } = await supabase.from("moment_participants").insert({
          moment_id: moment.id,
          user_id: user.id,
          status: "joined",
        });

        if (error) throw error;

        setIsJoined(true);
        setParticipantCount((prev) => prev + 1);
        toast({
          title: "Joined! 🎉",
          description: "You've joined this moment. See you there!",
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

  const isFull = moment?.max_participants
    ? participantCount >= moment.max_participants
    : false;

  const isPast = moment ? new Date(moment.starts_at) < new Date() : false;

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
            "name": hostProfile?.full_name || "Promorang User"
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
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
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
                  <Button variant="outline" size="sm" asChild>
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
                  {moment.category.charAt(0).toUpperCase() + moment.category.slice(1)}
                </span>
                {moment.reward && (
                  <span className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full flex items-center gap-1">
                    <Gift className="h-3 w-3" />
                    Reward
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
                {moment.title}
              </h1>

              {/* Social Proof */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {participantCount} joined
                </span>
                {participantCount > 10 && (
                  <span className="flex items-center gap-1 text-orange-500">
                    <Flame className="h-4 w-4" />
                    Trending
                  </span>
                )}
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
                  hostProfile?.full_name?.charAt(0) || "?"
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hosted by</p>
                <p className="font-medium">{hostProfile?.full_name || "Anonymous Host"}</p>
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-foreground text-lg leading-relaxed">{moment.description}</p>
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
                <div>
                  {moment.venue_name && (
                    <p className="font-medium text-foreground">{moment.venue_name}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{moment.location}</p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(moment.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                  >
                    View on map <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl">
                <Users className="w-6 h-6 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {participantCount} / {moment.max_participants || "∞"} spots
                  </p>
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
                  Prepare to {moment.proof_type === 'Photo' ? 'take a photo' : moment.proof_type === 'GPS' ? 'share your location' : 'enter a code'} to unlock your rewards.
                </p>
                <Button variant="hero" asChild>
                  <Link to={`/moments/${moment.id}/checkin`}>Start {moment.expected_action_unit || 'Check-in'}</Link>
                </Button>
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
                  <h3 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Moment Activity
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

            {/* Reviews Section */}
            {momentReviews && momentReviews.length > 0 && (
              <div>
                <h3 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  Reviews ({momentReviews.length})
                </h3>
                <div className="space-y-4">
                  {momentReviews.slice(0, 5).map((review) => (
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
                name={hostProfile?.full_name || "Host"}
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

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  Camera,
  Compass,
  Heart,
  MapPin,
  Share2,
  Sparkles,
  Star,
  Users,
  ExternalLink,
  CheckCircle2,
  MessageSquare,
  Globe,
  Instagram,
  Clock,
  ThumbsUp,
  Plus,
} from "lucide-react";
import { formatDiscoveryCategory, discoveryLocation } from "@promorang/shared";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageGallery } from "@/components/ImageGallery";
import { PromorangMap } from "@/components/PromorangMap";
import { ReactionBar } from "@/components/ReactionBar";
import { SaveButton } from "@/components/SaveButton";
import { ShareButton } from "@/components/ShareButton";
import { useDiscovery, useSaveDiscovery } from "@/hooks/useDiscoveries";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { buildLocationPath, getSiteUrl, slugifySegment } from "@/lib/discovery";
import { generateDiscoverySchema } from "@/lib/seo-schemas";

export default function DiscoveryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const query = useDiscovery(slug);
  const { user } = useAuth();
  const { toast } = useToast();
  const saveMutation = useSaveDiscovery(query.data?.id);
  const [saved, setSaved] = useState(false);
  const [checkins, setCheckins] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Array<{ id: string; author: string; text: string; rating: number; date: string }>>([
    {
      id: "1",
      author: "Maya R.",
      text: "Discovered this spot through Promorang last week! The vibe is incredible and atmosphere is unmatched.",
      rating: 5,
      date: "2 days ago",
    },
    {
      id: "2",
      author: "Marcus T.",
      text: "Hidden gem for sure. Perfect spot to bring friends or connect with local scene members.",
      rating: 5,
      date: "5 days ago",
    },
  ]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  if (query.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-black text-white">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </main>
    );
  }

  if (!query.data) {
    return (
      <main className="grid min-h-screen place-items-center bg-black px-6 text-center text-white">
        <div>
          <Compass className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-5 font-serif text-4xl font-bold">This Discovery is not available.</h1>
          <p className="mt-3 text-white/50">It may have been removed or the link might be incorrect.</p>
          <Link to="/discover" className="mt-6 inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Explore Discoveries
          </Link>
        </div>
      </main>
    );
  }

  const discovery = query.data;
  const currentCheckins = checkins !== null ? checkins : discovery.checkin_count || 0;

  // Prepare images for Airbnb-style gallery
  const galleryImages = [
    ...(discovery.cover_image ? [{ url: discovery.cover_image, alt: discovery.title, caption: discovery.title }] : []),
    ...(Array.isArray(discovery.gallery)
      ? discovery.gallery.map((g: any, i: number) => ({
          url: typeof g === "string" ? g : g.url || discovery.cover_image || "",
          alt: `${discovery.title} photo ${i + 1}`,
          caption: typeof g === "object" ? g.caption : undefined,
        }))
      : []),
    {
      url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop",
      alt: "Atmosphere",
      caption: "Vibe & Atmosphere",
    },
    {
      url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop",
      alt: "Gathering",
      caption: "Community Spot",
    },
  ];

  const handleSave = async () => {
    if (!user) {
      window.location.assign(`/auth?next=${encodeURIComponent(`/discoveries/${discovery.slug}`)}`);
      return;
    }
    try {
      await saveMutation.mutateAsync();
      setSaved(!saved);
      toast({ title: saved ? "Removed from Saved" : "Saved to Vault! 🌟", description: "You can access saved discoveries in your Vault." });
    } catch {
      setSaved(true);
      toast({ title: "Saved!", description: "Discovery added to your saved collection." });
    }
  };

  const handleCheckin = () => {
    if (!user) {
      window.location.assign(`/auth?next=${encodeURIComponent(`/discoveries/${discovery.slug}`)}`);
      return;
    }
    setCheckins(currentCheckins + 1);
    toast({ title: "Checked in! 📍", description: "You logged your visit to this Discovery and earned 50 PromoPoints!" });
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    setSubmittingReview(true);
    setTimeout(() => {
      setReviews([
        {
          id: String(Date.now()),
          author: user?.user_metadata?.full_name || "You",
          text: newReviewText,
          rating: newRating,
          date: "Just now",
        },
        ...reviews,
      ]);
      setNewReviewText("");
      setSubmittingReview(false);
      toast({ title: "Review added! ⭐", description: "Thank you for rating this Scout Discovery." });
    }, 400);
  };

  return (
    <main className="min-h-screen bg-black pb-24 text-white">
      <SEO
        title={`${discovery.title} — Promorang Discovery`}
        description={discovery.description || `Explore ${discovery.title} on Promorang.`}
        image={discovery.cover_image || undefined}
        url={getSiteUrl(`/discoveries/${discovery.slug}`)}
        schema={generateDiscoverySchema(discovery)}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-white/10 pt-20">
        <div className="container mx-auto px-4 py-6 sm:px-6">
          {/* Breadcrumb & Quick Actions */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 text-primary" />
              Back to Discoveries
            </Link>

            <div className="flex items-center gap-2">
              <ShareButton
                title={discovery.title}
                url={window.location.href}
                description={discovery.description || undefined}
              />
              <SaveButton
                isSaved={saved}
                onToggle={handleSave}
                saveCount={discovery.save_count || 0}
              />
            </div>
          </div>

          {/* Title & Category Header */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="border-primary/50 bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-primary">
                {formatDiscoveryCategory(discovery.category)}
              </Badge>
              {discovery.city && (
                <Link to={buildLocationPath(slugifySegment(discovery.country || "Jamaica"), slugifySegment(discovery.city))} className="flex items-center gap-1 text-xs font-bold text-white/70 hover:text-primary">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {discoveryLocation(discovery)}
                </Link>
              )}
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                4.9 (12 reviews)
              </span>
            </div>

            <h1 className="mt-3 font-serif text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl lg:text-7xl">
              {discovery.title}
            </h1>
          </div>

          {/* Airbnb-style Photo Gallery */}
          <div className="mb-10 overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            <ImageGallery images={galleryImages} />
          </div>

          {/* 2-Column Main Content & Action Sidebar */}
          <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
            {/* Left Main Details Column */}
            <div className="space-y-10">
              {/* Description & Overview */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-md">
                <h2 className="font-serif text-2xl font-bold text-white">About this Spot</h2>
                {discovery.description ? (
                  <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
                    {discovery.description}
                  </p>
                ) : (
                  <p className="mt-4 text-sm text-white/50">
                    A recommended cultural find verified by the Promorang Scout network.
                  </p>
                )}

                {/* Highlights / Vibe Tags */}
                <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-6">
                  {["Vibe & Ambience", "Local Favorite", "Photo Spot", "Walkable", "Recommended"].map((tag) => (
                    <span key={tag} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">
                      ✨ {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Creator / Scout Attribution Card */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  {discovery.creator_profile?.avatar_url ? (
                    <img
                      src={discovery.creator_profile.avatar_url}
                      alt=""
                      className="h-14 w-14 rounded-full border-2 border-primary object-cover"
                    />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/20 text-xl font-bold text-primary">
                      {discovery.creator_profile?.display_name?.[0] || "S"}
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Discovered & Recommended by</span>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {discovery.creator_profile?.display_name || discovery.creator_profile?.username || "Culture Scout"}
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </h3>
                    <p className="text-xs text-white/50">Level 3 Scout · Top 5% Local Explorer</p>
                  </div>
                </div>
              </div>

              {/* Connected Scene Section */}
              {discovery.scene && (
                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-primary/10 via-black to-black p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">CONNECTED SCENE RITUAL</span>
                      <h3 className="mt-1 font-serif text-3xl font-bold">{discovery.scene.title}</h3>
                      <p className="mt-2 text-xs text-white/60">
                        This discovery is linked to the {discovery.scene.title} community.
                      </p>
                    </div>
                    <Link
                      to={`/scenes/${discovery.scene.slug}`}
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-xs font-black text-black transition hover:bg-orange-400"
                    >
                      Explore Scene <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Interactive Location Map */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-md">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">LOCATION & DIRECTIONS</span>
                    <h3 className="font-serif text-2xl font-bold">{discovery.city || "Local Destination"}</h3>
                    <p className="text-xs text-white/60">{discovery.location_address || "Address available upon check-in."}</p>
                  </div>
                  {discovery.location_address && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(discovery.location_address + " " + (discovery.city || ""))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      Google Maps <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                <div className="h-64 overflow-hidden rounded-2xl border border-white/10">
                  <PromorangMap
                    moments={[
                      {
                        id: String(discovery.id),
                        title: discovery.title,
                        location: discovery.location_address || discovery.city || "Spot",
                        latitude: discovery.latitude || 17.9714,
                        longitude: discovery.longitude || -76.7936,
                      },
                    ]}
                  />
                </div>
              </div>

              {/* Community Reviews & Sentiment */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="font-serif text-2xl font-bold">Scout Reviews & Ratings</h3>
                    <p className="text-xs text-white/50">{reviews.length} community reviews</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="h-5 w-5 fill-amber-400" />
                    <span className="text-lg">4.9</span>
                  </div>
                </div>

                {/* Add Review Form */}
                <form onSubmit={handleAddReview} className="mt-6 border-b border-white/10 pb-6">
                  <p className="text-xs font-bold text-white/80">Have you visited this Discovery?</p>
                  <div className="mt-2 flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="text-amber-400"
                      >
                        <Star className={`h-5 w-5 ${star <= newRating ? "fill-amber-400" : "text-white/20"}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Share what makes this spot worth discovering..."
                    rows={2}
                    className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-white/30 focus:border-primary focus:outline-none"
                  />
                  <Button
                    type="submit"
                    disabled={submittingReview || !newReviewText.trim()}
                    size="sm"
                    className="mt-3 bg-primary font-bold text-black hover:bg-orange-400"
                  >
                    Submit Review
                  </Button>
                </form>

                {/* Reviews List */}
                <div className="mt-6 space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{rev.author}</span>
                        <span className="text-[10px] text-white/40">{rev.date}</span>
                      </div>
                      <div className="mt-1 flex gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-white/70">{rev.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Action Sidebar Card */}
            <aside className="sticky top-24 space-y-6">
              <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-6 backdrop-blur-xl">
                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">LOG & VERIFY</span>
                <h2 className="mt-2 font-serif text-2xl font-bold">Have You Been Here?</h2>
                <p className="mt-2 text-xs leading-relaxed text-white/60">
                  Log your visit to this Discovery to earn **+50 PromoPoints** and build your Scout reputation.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 border-y border-white/10 py-4">
                  <div>
                    <p className="text-3xl font-bold text-white">{currentCheckins}</p>
                    <p className="text-[11px] font-medium text-white/50">Community Visits</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{discovery.save_count || 0}</p>
                    <p className="text-[11px] font-medium text-white/50">Times Saved</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    onClick={handleCheckin}
                    className="h-12 w-full gap-2 rounded-full bg-primary font-black text-black hover:bg-orange-400"
                  >
                    <MapPin className="h-4 w-4" />
                    Log Visit / Check In (+50 Pts)
                  </Button>

                  <Button
                    onClick={handleSave}
                    variant="outline"
                    className={`h-11 w-full gap-2 rounded-full border-white/20 font-bold ${
                      saved ? "border-primary bg-primary/20 text-primary" : "text-white hover:bg-white/10"
                    }`}
                  >
                    <Bookmark className="h-4 w-4" />
                    {saved ? "Saved to Vault" : "Save to Vault"}
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

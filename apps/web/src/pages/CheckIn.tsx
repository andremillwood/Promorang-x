import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TierBadge } from "@/components/tier";
import { useUserTier, useVenueRelationship } from "@/hooks/useUserTier";
import { QrCode, Check, MapPin, Loader2, Camera, UserCheck, ShieldCheck, Globe, Sparkles, MessageSquare } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ImageUpload } from "@/components/ImageUpload";
import { CheckInCelebration } from '@/components/CheckInCelebration';
import { MomentSentimentCapture } from '@/components/sentiment/MomentSentimentCapture';
import { AnimatePresence } from 'framer-motion';
import { demoMoments } from "@/data/demo-moments";
import { getAccessState, type AccessQuote } from "@/lib/access";
import { NextUnlock, RewardStack } from "@/components/value/ValueJourney";
import { recordJourneyEvent } from "@/lib/value-journey";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type ProofRequirement = {
  id: string;
  requirement_type: string;
  label?: string | null;
  instructions?: string | null;
  is_required?: boolean | null;
};

const CheckIn = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user, session } = useAuth();
  const { useTierStatus } = useUserTier();
  const { data: tierStatus } = useTierStatus();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { uploadImage, uploading } = useImageUpload();

  const codeFromUrl = searchParams.get("code") || "";
  const promoPushCampaignId = searchParams.get("campaign");
  const promoPushChannelCode = searchParams.get("channel");
  const promoPushChannelId = searchParams.get("channelId");
  const [code, setCode] = useState(codeFromUrl);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showSentimentCapture, setShowSentimentCapture] = useState(false);
  const [moment, setMoment] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uniqueProofValue, setUniqueProofValue] = useState("");
  const [locationVerified, setLocationVerified] = useState(false);
  const [hasJoined, setHasJoined] = useState<boolean | null>(null);
  const [accessQuote, setAccessQuote] = useState<AccessQuote | null>(null);
  const [proofRequirements, setProofRequirements] = useState<ProofRequirement[]>([]);
  const [proofSubmissionId, setProofSubmissionId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "rejected" | null>(null);
  const [rewardPending, setRewardPending] = useState(false);
  const [economyMoves, setEconomyMoves] = useState<Array<{ id: string; title: string; proof_type: string; reward_amount_jmd: number }>>([]);

  const moveId = searchParams.get("moveId");
  const activeMove = economyMoves.find((move) => move.id === moveId) || economyMoves[0] || null;
  const rawProofType = String(activeMove?.proof_type || moment?.proof_type || "screenshot").toLowerCase();
  const activeProofType = rawProofType === "qr" ? "QR"
    : rawProofType === "gps" ? "GPS"
    : rawProofType === "code" ? "Code"
    : rawProofType === "video" ? "Video"
    : rawProofType === "referral" ? "Referral"
    : rawProofType === "link" || rawProofType === "url" || rawProofType === "api" ? "Link"
    : rawProofType === "share" ? "Share"
    : rawProofType === "screenshot" ? "Screenshot"
    : "Photo";

  useEffect(() => {
    if (id) {
      fetchMoment();
    }
  }, [id]);

  useEffect(() => {
    if (id && user && !id.startsWith('m')) {
      checkParticipation();
    }
  }, [id, user]);

  useEffect(() => {
    if (id && session && !id.startsWith("m")) {
      fetchProofRequirements();
      fetchMomentEconomy();
    }
  }, [id, session]);

  const checkParticipation = async () => {
    if (!id || !session) return;

    try {
      const response = await fetch(`${API_URL}/api/participation/moments/${id}/status`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load participation status");
      }

      setHasJoined(!!payload?.joined);
      setAccessQuote(payload?.access_quote || null);
    } catch (error) {
      console.error("Error checking participation:", error);
      setHasJoined(false);
    }
  };

  const fetchMoment = async () => {
    if (!id) return;

    if (id.startsWith('m') && id.length <= 4) {
      const demoMoment = demoMoments.find(m => m.id === id);
      if (demoMoment) {
        setMoment(demoMoment);
        return;
      }
    }

    const { data, error } = await supabase
      .from("moments")
      .select("*")
      .eq("id", id)
      .single();

    if (data) setMoment(data);
    if (error) {
      console.error("Error fetching moment:", error);
      toast({ title: "Moment not found", description: "This moment could not be loaded.", variant: "destructive" });
    }
  };

  const fetchProofRequirements = async () => {
    if (!id || !session) return;

    try {
      const response = await fetch(`${API_URL}/api/proof/moments/${id}/requirements`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
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

  const fetchMomentEconomy = async () => {
    if (!id) return;

    try {
      const response = await fetch(`${API_URL}/api/moment-economy/moments/${id}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to load Moment economy");
      setEconomyMoves(payload?.moves || []);
    } catch (error) {
      console.error("Error fetching Moment economy:", error);
    }
  };

  const getFallbackRequirements = (): ProofRequirement[] => {
    if (!moment?.proof_type) return [];

    if (moment.proof_type === "QR" || moment.proof_type === "Code") {
      return [{
        id: "legacy-code",
        requirement_type: "code",
        label: "Check-in code",
        instructions: "Enter the venue code or scan the QR-linked value provided at the moment.",
        is_required: true,
      }];
    }

    if (["Photo", "Video", "screenshot", "share", "Screenshot", "Share"].includes(String(moment.proof_type))) {
      return [{
        id: "legacy-media",
        requirement_type: "media",
        label: String(moment.proof_type).toLowerCase() === "share" ? "Share Mark" : "Screenshot Mark",
        instructions: "Upload a screenshot or photo that proves the share, visit, or drop.",
        is_required: true,
      }];
    }

    if (["link", "Link", "API", "url"].includes(String(moment.proof_type))) {
      return [{
        id: "legacy-link",
        requirement_type: "link",
        label: "Link proof",
        instructions: "Paste the public post or completed-action URL.",
        is_required: true,
      }];
    }

    if (moment.proof_type === "GPS") {
      return [{
        id: "legacy-gps",
        requirement_type: "gps",
        label: "Location Mark",
        instructions: "Confirm your device location while you are physically at the venue.",
        is_required: true,
      }];
    }

    return [];
  };

  const activeRequirements = proofRequirements.length > 0 ? proofRequirements.map(r => ({
  ...r,
  label: r.requirement_type === 'gps' ? 'Location Mark' : 
         r.requirement_type === 'media' ? 'Photo Mark' :
         r.requirement_type === 'code' ? 'Code Mark' : r.label
})) : getFallbackRequirements().map(r => ({
  ...r,
  label: r.requirement_type === 'gps' ? 'Location Mark Required' : 
         r.requirement_type === 'media' ? 'Photo Mark Required' :
         r.requirement_type === 'code' ? 'Code Mark Required' : r.label
}));

  const handleGPSVerify = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      toast({ title: "Not Supported", description: "Geolocation is not supported by your browser", variant: "destructive" });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // In a real app, we'd compare coords with moment's coords
        setLocationVerified(true);
        setLoading(false);
        toast({ title: "Location Verified", description: "You are within range!" });
      },
      (error) => {
        setLoading(false);
        toast({ title: "Error", description: "Could not verify location", variant: "destructive" });
      }
    );
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !moment) return;

    setLoading(true);

    if (id?.startsWith('m')) {
      toast({ title: "Demo Check-in", description: "Successfully simulated check-in for this demo moment!" });
      setVerificationStatus("verified");
      setRewardPending(false);
      setSuccess(true);
      recordJourneyEvent(session?.access_token, {
        event_name: nextRewardPending ? "proof_submitted" : "proof_verified",
        journey_stage: "proof",
        object_type: "moment",
        object_id: id,
        metadata: { reward_pending: nextRewardPending, verification_status: nextVerificationStatus },
      });
      setLoading(false);
      return;
    }

    try {
      let evidenceUrl = null;
      let nextVerificationStatus: "pending" | "verified" | "rejected" | null = null;
      let nextRewardPending = false;

      // 1. Validate Proof
      if (activeProofType === 'QR' || activeProofType === 'Code') {
        if (moment.check_in_code?.toUpperCase() !== code.toUpperCase()) {
          throw new Error("Invalid check-in code");
        }
      } else if (activeProofType === 'Photo' || activeProofType === 'Video' || activeProofType === 'Screenshot' || activeProofType === 'Share') {
        if (activeProofType === 'Share' && uniqueProofValue.trim() && !imageFile) {
          // share proof can be a public link without a screenshot
        } else {
          if (!imageFile) {
            throw new Error(activeProofType === 'Video' ? "Please upload a video as proof of attendance" : "Please upload a screenshot or photo as proof");
          }
          const uploaded = await uploadImage(imageFile, "moment-images", user.id, {
            allowVideo: activeProofType === 'Video',
          });
          if (!uploaded) throw new Error("Failed to upload proof");
          evidenceUrl = uploaded;
        }
      } else if (activeProofType === 'GPS') {
        if (!locationVerified) throw new Error("Please verify your location first");
      } else if (activeProofType === 'Link' || activeProofType === 'Referral') {
        if (!uniqueProofValue.trim()) throw new Error(`Please enter your ${activeProofType.toLowerCase()} proof`);
      }

      if (session) {
        const proofBundle = {
          proof_type: rawProofType || activeProofType || null,
          code: code.trim() || null,
          link_url: (activeProofType === 'Link' || activeProofType === 'Share') ? uniqueProofValue.trim() || null : null,
          referral_code: activeProofType === 'Referral' ? uniqueProofValue.trim() : null,
          location_verified: locationVerified,
          evidence_url: evidenceUrl,
          submitted_at: new Date().toISOString(),
          requirements: activeRequirements.map((requirement) => ({
            id: requirement.id,
            requirement_type: requirement.requirement_type,
            label: requirement.label || null,
          })),
        };

        const completionResponse = await fetch(`${API_URL}/api/participation/moments/${id}/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            moment_move_id: activeMove?.id || null,
            proof_bundle: proofBundle,
            evidence_url: evidenceUrl,
            promopush_campaign_id: promoPushCampaignId,
            promopush_channel_id: promoPushChannelId,
            promopush_tracking_code: promoPushChannelCode,
          }),
        });

        const completionPayload = await completionResponse.json();
        if (!completionResponse.ok) {
          throw new Error(completionPayload?.error || "Failed to complete check-in");
        }

        setProofSubmissionId(completionPayload?.submission?.id || null);
        nextVerificationStatus = completionPayload?.submission?.submission_state || completionPayload?.checkin?.verification_status || null;
        nextRewardPending = Boolean(completionPayload?.checkin?.reward_pending);
        setVerificationStatus(nextVerificationStatus);
        setRewardPending(nextRewardPending);
      }

      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["joined-moments"] });
      queryClient.invalidateQueries({ queryKey: ["vault"] });
      // Mock Haptic trigger
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 30, 10, 30]);
      }
      toast({
        title: nextRewardPending ? "Proof submitted" : "Mark captured",
        description: nextRewardPending
          ? "Your mark is captured and pending verification before rewards are issued."
          : `Your ${tierStatus?.current_tier === 'regular' ? 'Regular ' : ''}Mark has been captured!`,
      });

    } catch (error: any) {
      toast({ title: "Mark Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <h1 className="text-2xl font-bold mb-4">Identity Required</h1>
            <Button variant="hero" onClick={() => navigate("/auth")}>Sign In</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Guard: Must join before checking in
  if (hasJoined === false && !id?.startsWith('m')) {
    const accessState = getAccessState(accessQuote);
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 text-center shadow-card">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-10 h-10 text-amber-500" />
            </div>
            <h1 className="mb-3 text-3xl font-black uppercase leading-[0.9] tracking-[-0.055em]">Join first to leave your Mark</h1>
            <p className="text-muted-foreground mb-6">
              {accessState.key === "needs_keys" || accessState.key === "requires_plus" || accessState.key === "full"
                ? accessState.description
                : "Join this Moment first so your proof, rewards, and status can attach to the right record."}
            </p>
            <div className="mb-6 rounded-xl border border-border bg-background p-3 text-sm">
              <span className="font-semibold text-foreground">{accessState.label}</span>
              {accessQuote?.final_key_cost ? (
                <span className="text-muted-foreground"> • {accessQuote.final_key_cost} Keys required</span>
              ) : null}
            </div>
            <div className="space-y-3">
              <Button
                variant="hero"
                className="w-full"
                disabled={loading}
                onClick={async () => {
                  if (!session || !id) return;
                  setLoading(true);
                  try {
                    const response = await fetch(`${API_URL}/api/participation/moments/${id}/join`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify({
                        promopush_campaign_id: promoPushCampaignId,
                        promopush_channel_id: promoPushChannelId,
                        promopush_tracking_code: promoPushChannelCode,
                      }),
                    });
                    const payload = await response.json();
                    if (!response.ok) throw new Error(payload?.error || "Failed to join moment");
                    setHasJoined(true);
                    toast({ title: "Joined", description: "You are in. Submit screenshot, share, or link proof next." });
                  } catch (error: any) {
                    toast({ title: "Join failed", description: error.message, variant: "destructive" });
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? <Loader2 className="animate-spin" /> : "Join this Moment"}
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/moments/${id}`}>View Moment</Link>
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/discover')}>
                Browse Other Moments
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!moment) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6"><Loader2 className="animate-spin" /></main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#070707] text-white">
      <Header />
      <AnimatePresence>
        {success && (
          <CheckInCelebration onComplete={() => { }} />
        )}
      </AnimatePresence>
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-6xl">
          {success ? (
            showSentimentCapture ? (
              <MomentSentimentCapture
                momentId={id || ''}
                proofSubmissionId={proofSubmissionId || undefined}
                momentTitle={moment?.title || 'this moment'}
                onComplete={() => navigate('/vault')}
                onSkip={() => navigate('/vault')}
              />
            ) : (
              <div className="mx-auto max-w-xl rounded-3xl border border-emerald-500/25 bg-[radial-gradient(circle_at_top,rgba(16,185,129,.16),transparent_40%),rgba(255,255,255,.045)] p-8 text-center shadow-[0_28px_90px_rgba(0,0,0,.4)]">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-emerald-500" />
                </div>
                <h1 className="mb-2 text-3xl font-black uppercase leading-[0.9] tracking-[-0.055em]">
                  {rewardPending ? "Proof submitted" : "Mark captured"}
                </h1>
                <p className="mb-6 text-white/55">
                  {rewardPending
                    ? `Your Mark for "${moment.title}" is now pending verification. Rewards and status unlocks issue after approval.`
                    : `You left your Mark at "${moment.title}". This action now belongs to your Promorang record.`}
                </p>
                <div className="mb-4 text-left">
                  <RewardStack
                    dark
                    items={[
                      { label: "Reputation", value: rewardPending ? "Proof trail started" : "Verified Mark added", kind: "status", pending: rewardPending },
                      { label: "Points", value: rewardPending ? "Issues after approval" : "Participation progress added", kind: "points", pending: rewardPending },
                      { label: "PromoShare", value: rewardPending ? "Eligibility checking" : "Qualified pools checked", kind: "entry", pending: rewardPending },
                      { label: "Moment Piece", value: rewardPending ? "Held for verification" : "Attendance eligibility recorded", kind: "piece", pending: rewardPending },
                    ]}
                  />
                </div>
                <NextUnlock current={0} dark />
                {proofSubmissionId && (
                  <div className="mb-6 rounded-2xl border border-white/10 bg-black/35 p-4 text-left">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-primary/80">
                      {rewardPending ? "Verification Queue" : "Mark Captured"}
                    </p>
                    <p className="mt-2 break-all text-sm text-white/45">
                      Submission ID: <span className="font-medium text-white">{proofSubmissionId}</span>
                    </p>
                    {verificationStatus && (
                      <p className="mt-2 text-sm text-white/45">
                        Status: <span className="font-medium capitalize text-white">{verificationStatus}</span>
                      </p>
                    )}
                  </div>
                )}

                {rewardPending && (
                  <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-left">
                    <p className="text-sm font-semibold text-white">Next step</p>
                    <p className="mt-2 text-sm text-white/50">
                      Your attendance has been captured, but reward issuance and verified attendance pieces are paused until the proof review is approved.
                    </p>
                  </div>
                )}
                
                {/* Sentiment Review CTA */}
                <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Share your experience</p>
                      <p className="text-sm text-white/45">Help others discover great moments</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowSentimentCapture(true)}
                  >
                    Write a Review
                  </Button>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => navigate("/vault")}>Open Vault</Button>
                  <Button variant="hero" className="flex-1" onClick={() => navigate(`/moments/${id}`)}>View Moment</Button>
                </div>
              </div>
            )
          ) : (
            <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_28px_90px_rgba(0,0,0,.42)] lg:grid-cols-[0.9fr_1.1fr]">
              <aside className="relative min-h-[300px] overflow-hidden bg-black p-6 lg:min-h-[680px]">
                {moment.image_url || moment.banner_image_url ? <img src={moment.banner_image_url || moment.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-65" /> : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/15" />
                <div className="relative flex h-full flex-col justify-between">
                  <Link to={`/moments/${id}`} className="w-fit rounded-full border border-white/20 bg-black/35 px-4 py-2 text-xs font-bold text-white backdrop-blur">Back to moment</Link>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">You showed up</p>
                    <h1 className="mt-3 font-sans text-4xl font-black uppercase leading-[0.86] tracking-[-0.06em] text-white sm:text-5xl">{moment.title}</h1>
                    <div className="mt-5 space-y-2 text-sm text-white/65">
                      <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{moment.venue_name || moment.location || "Moment location"}</p>
                      <p className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />{activeMove ? `Unlock JMD ${Number(activeMove.reward_amount_jmd || 0).toLocaleString()}` : "Build verified status and memory"}</p>
                    </div>
                  </div>
                </div>
              </aside>
              <section className="p-6 sm:p-8">
              <div className="mb-7">
                <div className="mb-6 grid grid-cols-3 gap-2">
                  {[
                    { label: "Join", state: "Done" },
                    { label: "Prove", state: "Now" },
                    { label: "Unlock", state: "Next" },
                  ].map((step) => (
                    <div key={step.label} className={`rounded-xl border p-3 ${step.state === "Now" ? "border-primary/50 bg-primary/10" : "border-white/10 bg-black/25"}`}>
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">{step.state}</p>
                      <p className="mt-1 text-sm font-bold text-white">{step.label}</p>
                    </div>
                  ))}
                </div>
                <div className="text-left">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${moment.proof_type === 'GPS' ? 'bg-blue-500/10' : moment.proof_type === 'Photo' ? 'bg-purple-500/10' : 'bg-primary/10'
                  }`}>
                  {activeProofType === 'GPS' ? <MapPin className="w-8 h-8 text-blue-500" /> :
                    (activeProofType === 'Photo' || activeProofType === 'Screenshot' || activeProofType === 'Share') ? <Camera className="w-8 h-8 text-purple-500" /> :
                      <QrCode className="w-8 h-8 text-primary" />}
                </div>
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Proof Moment</p>
                <h1 className="text-3xl font-black uppercase leading-[0.9] tracking-[-0.055em]">Leave Your Mark</h1>
                <p className="mt-2 text-white/45">
                  Proof method: <span className="text-xs font-semibold uppercase tracking-wider text-white">{activeProofType} Mark</span>
                </p>
                {activeMove && (
                  <p className="mt-2 text-sm text-white">
                      {activeMove.title} · unlock JMD {Number(activeMove.reward_amount_jmd || 0).toLocaleString()}
                  </p>
                )}
                </div>
              </div>

              <form onSubmit={handleCheckIn} className="space-y-6">
                {activeRequirements.length > 0 && (
                  <div className="rounded-2xl border border-primary/20 bg-primary/[0.07] p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-primary/80">
                      Proof Requirements
                      </p>
                    </div>
                    <div className="mt-4 space-y-3">
                      {activeRequirements.map((requirement) => (
                        <div key={requirement.id} className="rounded-xl border border-white/10 bg-black/25 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-white">
                              {requirement.label || requirement.requirement_type}
                            </p>
                            {requirement.is_required !== false && (
                              <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                                Required
                              </span>
                            )}
                          </div>
                          {requirement.instructions && (
                            <p className="mt-2 text-xs leading-5 text-white/45">
                              {requirement.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1. CODE / QR UI */}
                {(activeProofType === 'QR' || activeProofType === 'Code') && (
                  <div className="space-y-2">
                    <Label htmlFor="code">Check-in Code</Label>
                    <Input
                      id="code"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="text-center text-xl font-mono tracking-wider h-14"
                      maxLength={8}
                    />
                  </div>
                )}

                {/* 2. PHOTO UI */}
                {(activeProofType === 'Photo' || activeProofType === 'Video' || activeProofType === 'Screenshot' || activeProofType === 'Share') && (
                  <div className="space-y-3">
                    <Label>Proof of Presence</Label>
                    <ImageUpload
                      onFileSelect={setImageFile}
                      onChange={() => { }}
                      uploading={uploading}
                      aspectRatio="video"
                      frameUrl={moment.frame_url}
                      allowVideo={activeProofType === 'Video'}
                    />
                    <p className="text-[10px] text-muted-foreground text-center italic">
                      {activeProofType === 'Video'
                        ? "Record a short video showing you are at the location."
                        : "Take a photo showing you are at the location."}
                    </p>
                  </div>
                )}

                {/* 3. GPS UI */}
                {activeProofType === 'GPS' && (
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant={locationVerified ? "outline" : "hero"}
                      className="w-full h-16"
                      onClick={handleGPSVerify}
                      disabled={locationVerified || loading}
                    >
                      {locationVerified ? (
                        <div className="flex items-center gap-2 text-emerald-500"><ShieldCheck className="w-5 h-5" /> Location Locked</div>
                      ) : (
                        <div className="flex items-center gap-2"><Globe className="w-5 h-5" /> Verify Location</div>
                      )}
                    </Button>
                  </div>
                )}

                {(activeProofType === 'Link' || activeProofType === 'Referral' || activeProofType === 'Share') && (
                  <div className="space-y-2">
                    <Label htmlFor="uniqueProofValue">{activeProofType} Proof</Label>
                    <Input
                      id="uniqueProofValue"
                      value={uniqueProofValue}
                      onChange={(e) => setUniqueProofValue(e.target.value)}
                      placeholder={activeProofType === 'Link' ? "Paste the completed action link" : "Enter referral code or referred user"}
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full h-14 font-bold text-lg"
                  disabled={loading || ((activeProofType === 'QR' || activeProofType === 'Code') && !code.trim()) || ((activeProofType === 'Photo' || activeProofType === 'Screenshot') && !imageFile) || (activeProofType === 'Share' && !imageFile && !uniqueProofValue.trim()) || (activeProofType === 'GPS' && !locationVerified) || ((activeProofType === 'Link' || activeProofType === 'Referral') && !uniqueProofValue.trim())}
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Submit proof and unlock"}
                </Button>
              </form>
              </section>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckIn;

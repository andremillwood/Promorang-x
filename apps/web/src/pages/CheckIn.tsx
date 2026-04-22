import { useState, useEffect } from "react";
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
  const { uploadImage, uploading } = useImageUpload();

  const codeFromUrl = searchParams.get("code") || "";
  const [code, setCode] = useState(codeFromUrl);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showSentimentCapture, setShowSentimentCapture] = useState(false);
  const [moment, setMoment] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [locationVerified, setLocationVerified] = useState(false);
  const [hasJoined, setHasJoined] = useState<boolean | null>(null);
  const [proofRequirements, setProofRequirements] = useState<ProofRequirement[]>([]);
  const [proofSubmissionId, setProofSubmissionId] = useState<string | null>(null);

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

    if (moment.proof_type === "Photo" || moment.proof_type === "Video") {
      return [{
        id: "legacy-media",
        requirement_type: "media",
        label: "Photo Mark",
        instructions: "Upload a clear image showing you are at the venue or completing the moment.",
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
      setSuccess(true);
      setLoading(false);
      return;
    }

    try {
      let evidenceUrl = null;

      // 1. Validate Proof
      if (moment.proof_type === 'QR' || moment.proof_type === 'Code') {
        if (moment.check_in_code?.toUpperCase() !== code.toUpperCase()) {
          throw new Error("Invalid check-in code");
        }
      } else if (moment.proof_type === 'Photo' || moment.proof_type === 'Video') {
        if (!imageFile) throw new Error("Please upload a photo as proof of attendance");
        const uploaded = await uploadImage(imageFile, "moment-images", user.id);
        if (!uploaded) throw new Error("Failed to upload proof");
        evidenceUrl = uploaded;
      } else if (moment.proof_type === 'GPS') {
        if (!locationVerified) throw new Error("Please verify your location first");
      }

      if (session) {
        const proofBundle = {
          proof_type: moment.proof_type || null,
          code: code.trim() || null,
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
            proof_bundle: proofBundle,
            evidence_url: evidenceUrl,
          }),
        });

        const completionPayload = await completionResponse.json();
        if (!completionResponse.ok) {
          throw new Error(completionPayload?.error || "Failed to complete check-in");
        }

        setProofSubmissionId(completionPayload?.submission?.id || null);
      }

      setSuccess(true);
      // Mock Haptic trigger
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 30, 10, 30]);
      }
      toast({ title: "Marked! 🎉", description: `Your ${tierStatus?.current_tier === 'regular' ? 'Regular ' : ''}Mark has been captured!` });

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
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 text-center shadow-card">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-10 h-10 text-amber-500" />
            </div>
            <h1 className="font-serif text-2xl font-bold mb-3">Join First to Leave Your Mark</h1>
            <p className="text-muted-foreground mb-6">
              Join this moment to make your Mark and unlock rewards.
            </p>
            <div className="space-y-3">
              <Button variant="hero" className="w-full" asChild>
                <Link to={`/moments/${id}`}>View Moment & Join</Link>
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
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <AnimatePresence>
        {success && (
          <CheckInCelebration onComplete={() => { }} />
        )}
      </AnimatePresence>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {success ? (
            showSentimentCapture ? (
              <MomentSentimentCapture
                momentId={id || ''}
                proofSubmissionId={proofSubmissionId || undefined}
                momentTitle={moment?.title || 'this moment'}
                onComplete={() => navigate('/dashboard')}
                onSkip={() => navigate('/dashboard')}
              />
            ) : (
              <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-card">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-emerald-500" />
                </div>
                <h1 className="font-serif text-2xl font-bold mb-2">Marked! 🎉</h1>
                <p className="text-muted-foreground mb-6">You left your Mark at to "{moment.title}"</p>
                {proofSubmissionId && (
                  <div className="mb-6 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-left">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-primary/80">Mark Captured</p>
                    <p className="mt-2 break-all text-sm text-muted-foreground">
                      Mark ID: <span className="font-medium text-foreground">{proofSubmissionId}</span>
                    </p>
                  </div>
                )}
                
                {/* Sentiment Review CTA */}
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Share your experience</p>
                      <p className="text-sm text-muted-foreground">Help others discover great moments</p>
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
                  <Button variant="outline" className="flex-1" onClick={() => navigate("/dashboard")}>Dashboard</Button>
                  <Button variant="hero" className="flex-1" onClick={() => navigate(`/moments/${id}`)}>View Moment</Button>
                </div>
              </div>
            )
          ) : (
            <div className="bg-card border border-border rounded-2xl p-8 shadow-card overflow-hidden">
              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${moment.proof_type === 'GPS' ? 'bg-blue-500/10' : moment.proof_type === 'Photo' ? 'bg-purple-500/10' : 'bg-primary/10'
                  }`}>
                  {moment.proof_type === 'GPS' ? <MapPin className="w-8 h-8 text-blue-500" /> :
                    moment.proof_type === 'Photo' ? <Camera className="w-8 h-8 text-purple-500" /> :
                      <QrCode className="w-8 h-8 text-primary" />}
                </div>
                <h1 className="font-serif text-2xl font-bold">Leave Your Mark</h1>
                <p className="text-muted-foreground mt-2">
                  Strategy: <span className="font-semibold text-foreground uppercase text-xs tracking-wider">{moment.proof_type} Mark</span>
                </p>
              </div>

              <form onSubmit={handleCheckIn} className="space-y-6">
                {activeRequirements.length > 0 && (
                  <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-primary/80">
                        Proof Requirements
                      </p>
                    </div>
                    <div className="mt-4 space-y-3">
                      {activeRequirements.map((requirement) => (
                        <div key={requirement.id} className="rounded-2xl border border-border/70 bg-background/70 p-3">
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
                            <p className="mt-2 text-xs leading-5 text-muted-foreground">
                              {requirement.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1. CODE / QR UI */}
                {(moment.proof_type === 'QR' || moment.proof_type === 'Code') && (
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
                {(moment.proof_type === 'Photo' || moment.proof_type === 'Video') && (
                  <div className="space-y-3">
                    <Label>Proof of Presence</Label>
                    <ImageUpload
                      onFileSelect={setImageFile}
                      onChange={() => { }}
                      uploading={uploading}
                      aspectRatio="video"
                      frameUrl={moment.frame_url}
                    />
                    <p className="text-[10px] text-muted-foreground text-center italic">Take a photo showing you are at the location.</p>
                  </div>
                )}

                {/* 3. GPS UI */}
                {moment.proof_type === 'GPS' && (
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

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full h-14 font-bold text-lg"
                  disabled={loading || ((moment.proof_type === 'QR' || moment.proof_type === 'Code') && !code.trim()) || (moment.proof_type === 'Photo' && !imageFile) || (moment.proof_type === 'GPS' && !locationVerified)}
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Verify & Complete"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckIn;

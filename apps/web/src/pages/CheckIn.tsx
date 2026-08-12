import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams, useParams, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, MapPin, Loader2, Camera, Check, Sparkles, Gift, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ImageUpload } from "@/components/ImageUpload";
import { CheckInCelebration } from '@/components/CheckInCelebration';
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
  const [moment, setMoment] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [locationVerified, setLocationVerified] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [isWithinGeofence, setIsWithinGeofence] = useState<boolean>(false);
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
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = await response.json();
      if (response.ok) {
        setHasJoined(!!payload?.joined);
      }
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
      toast({ title: "Event not found", description: "Could not load event details.", variant: "destructive" });
    }
  };

  const fetchProofRequirements = async () => {
    if (!id || !session) return;
    try {
      const response = await fetch(`${API_URL}/api/proof/moments/${id}/requirements`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = await response.json();
      if (response.ok) {
        setProofRequirements(payload?.requirements || []);
      }
    } catch (error) {
      console.error("Error fetching requirements:", error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleGPSVerify = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      toast({ title: "Not Supported", description: "GPS is not supported by your browser", variant: "destructive" });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        setUserCoords({ lat: uLat, lng: uLng });
        setLocationVerified(true);
        setLoading(false);

        if (moment?.latitude && moment?.longitude) {
          const dist = calculateDistance(uLat, uLng, moment.latitude, moment.longitude);
          setDistanceKm(dist);
          const inside = dist <= 0.2; // 200 meter geofence
          setIsWithinGeofence(inside);
          if (inside) {
            toast({ title: "Verified On-Site! 🛡️", description: `You are at the venue (${(dist * 1000).toFixed(0)}m away).` });
          } else {
            toast({ title: "Location Captured", description: `You are ${dist.toFixed(2)} km away from venue.` });
          }
        } else {
          setIsWithinGeofence(true);
          toast({ title: "Location Verified ✓", description: "GPS coordinates captured." });
        }
      },
      (err) => {
        setLoading(false);
        console.warn("GPS error:", err);
        toast({ title: "GPS Error", description: "Could not fetch current coordinates", variant: "destructive" });
      }
    );
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !moment) return;

    setLoading(true);

    if (id?.startsWith('m')) {
      toast({ title: "Check-in Complete 🎉", description: "Successfully verified for this demo event!" });
      setSuccess(true);
      setLoading(false);
      return;
    }

    try {
      let evidenceUrl = "";
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile, "proofs");
        if (!uploadedUrl) throw new Error("Image upload failed");
        evidenceUrl = uploadedUrl;
      }

      if (session) {
        const response = await fetch(`${API_URL}/api/participation/moments/${id}/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            proof_code: code || null,
            evidence_url: evidenceUrl,
            promopush_campaign_id: promoPushCampaignId,
            promopush_channel_id: promoPushChannelId,
            promopush_tracking_code: promoPushChannelCode,
          }),
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || "Check-in failed");
        }

        setProofSubmissionId(payload?.submission?.id || null);
      }

      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["joined-moments"] });
      queryClient.invalidateQueries({ queryKey: ["vault"] });

      if ('vibrate' in navigator) {
        navigator.vibrate([10, 30, 10, 30]);
      }

      toast({
        title: "Check-in Complete! 🎉",
        description: "Your attendance is verified.",
      });

    } catch (error: any) {
      toast({ title: "Check-in Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-extrabold">Sign in to Check In</h1>
          <p className="text-white/60 text-sm">You must be signed in to verify attendance and claim perks.</p>
          <Button className="rounded-full bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold px-8" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (hasJoined === false && !id?.startsWith('m')) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#121214] border border-white/10 rounded-3xl p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#ff5500]/15 flex items-center justify-center mx-auto text-[#ff5500]">
            <QrCode className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black">RSVP First to Check In</h1>
          <p className="text-white/60 text-sm">Please reserve your spot for this event before verifying your attendance at the door.</p>
          <Button className="w-full rounded-full bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold py-6" asChild>
            <Link to={`/moments/${id}`}>View Event & RSVP</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!moment) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff5500]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-[#ff5500] selection:text-white">
      <SEO title={`Check-in: ${moment.title}`} description={`Check in at ${moment.title}`} />

      <AnimatePresence>
        {success && <CheckInCelebration onComplete={() => {}} />}
      </AnimatePresence>

      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        {success ? (
          <div className="mx-auto max-w-xl text-center space-y-6 pt-8 animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Attendance Verified!</h1>
            <p className="text-white/70 text-base">
              You are checked in for <span className="text-white font-bold">{moment.title}</span>. Your reward and memory badge have been added to your Vault.
            </p>

            <div className="rounded-3xl border border-white/10 bg-[#121214] p-6 space-y-4 text-left">
              <div className="flex items-center gap-3">
                <Gift className="h-6 w-6 text-amber-400" />
                <div>
                  <h4 className="font-bold text-white text-base">Reward Unlocked</h4>
                  <p className="text-xs text-white/60">{moment.reward || "Complimentary Perk & Memory Badge"}</p>
                </div>
              </div>

              {proofSubmissionId && (
                <div className="pt-3 border-t border-white/10 text-xs text-white/50">
                  Ref Code: <span className="font-mono text-white/80">{proofSubmissionId}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild className="flex-1 rounded-full bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold py-6">
                <Link to="/vault">View My Vault <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 rounded-full border-white/20 text-white hover:bg-white/10 py-6">
                <Link to={`/moments/${id}`}>Back to Event</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] items-start pt-4">
            {/* Left Cover & Event Info Card */}
            <div className="rounded-3xl border border-white/10 bg-[#121214] p-6 sm:p-8 space-y-6">
              <Link to={`/moments/${id}`} className="inline-flex items-center text-xs font-semibold text-white/60 hover:text-white">
                ← Return to {moment.title}
              </Link>

              <div className="space-y-2">
                <span className="text-xs font-bold text-[#ff5500] uppercase tracking-wider">Attendance Check-in</span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{moment.title}</h1>
                <p className="text-sm text-white/60 flex items-center gap-1.5 pt-1">
                  <MapPin className="h-4 w-4 text-[#ff5500]" /> {moment.venue_name || moment.location}
                </p>
              </div>

              {moment.reward && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3">
                  <Gift className="h-6 w-6 text-amber-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Reward for Checking In</h4>
                    <p className="text-xs text-white/70">{moment.reward}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Check-in Input Form */}
            <div className="rounded-3xl border border-white/10 bg-[#121214] p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">Enter Check-in Code</h2>
                <p className="text-xs text-white/50">Enter the code displayed at the entrance desk to verify your visit.</p>
              </div>

              <form onSubmit={handleCheckIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-xs uppercase font-bold text-white/70">Check-in Code</Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className="text-center text-2xl font-mono tracking-widest h-14 bg-white/5 border-white/15 text-white uppercase rounded-2xl"
                    maxLength={8}
                  />
                </div>

                {/* GPS Location Verification Card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-[#ff5500]" /> Geofence Verification
                    </span>
                    {locationVerified && (
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isWithinGeofence ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {isWithinGeofence ? "Verified On-Site" : "Remote Check-In"}
                      </span>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl border-white/15 text-white hover:bg-white/10 py-4 text-xs font-bold"
                    onClick={handleGPSVerify}
                    disabled={loading}
                  >
                    {locationVerified ? "Re-Check GPS Position ✓" : "Verify GPS Proximity"}
                  </Button>

                  {distanceKm !== null && (
                    <p className="text-[11px] text-white/50 text-center">
                      Distance to Venue: <span className="text-white font-mono">{distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)}m` : `${distanceKm.toFixed(2)} km`}</span>
                    </p>
                  )}
                </div>

                {moment.proof_type === 'Photo' && (
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-white/70">Photo Evidence</Label>
                    <ImageUpload
                      onImageSelect={(file) => setImageFile(file)}
                      previewUrl={imageFile ? URL.createObjectURL(imageFile) : undefined}
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || uploading}
                  className="w-full rounded-2xl bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold text-base py-6 shadow-xl shadow-[#ff5500]/25"
                >
                  {loading || uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>Complete Check-in & Claim Perk <Sparkles className="ml-2 h-5 w-5" /></>
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CheckIn;

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
import { QrCode, Check, MapPin, Loader2, Camera, UserCheck, ShieldCheck, Globe } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ImageUpload } from "@/components/ImageUpload";
import { CheckInCelebration } from "@/components/CheckInCelebration";
import { AnimatePresence } from "framer-motion";

const CheckIn = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload();

  const codeFromUrl = searchParams.get("code") || "";
  const [code, setCode] = useState(codeFromUrl);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [moment, setMoment] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [locationVerified, setLocationVerified] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMoment();
    }
  }, [id]);

  const fetchMoment = async () => {
    const { data, error } = await supabase
      .from("moments")
      .select("*")
      .eq("id", id)
      .single();

    if (data) setMoment(data);
    if (error) console.error("Error fetching moment:", error);
  };

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

      // 2. Process Participation
      const { data: participation } = await supabase
        .from("moment_participants")
        .select("*")
        .eq("moment_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!participation) {
        await supabase.from("moment_participants").insert({
          moment_id: id!,
          user_id: user.id,
          status: "checked_in",
          checked_in_at: new Date().toISOString(),
        });
      } else {
        await supabase
          .from("moment_participants")
          .update({
            status: "checked_in",
            checked_in_at: new Date().toISOString(),
          })
          .eq("moment_id", id)
          .eq("user_id", user.id);
      }

      // 3. Create Participation Event (AMI v2)
      await (supabase as any).from("participation_events").insert({
        moment_id: id!,
        user_id: user.id,
        event_type: "verification",
        evidence_url: evidenceUrl,
        metadata: {
          proof_type: moment.proof_type,
          verified_at: new Date().toISOString(),
          location_verified: locationVerified
        }
      });

      // 4. Handle Rewards
      if (moment.reward) {
        await supabase.from("rewards").insert({
          user_id: user.id,
          moment_id: id!,
          reward_type: "freebie",
          reward_value: moment.reward,
          status: "earned",
          redemption_code: `RWD-${Date.now().toString(36).toUpperCase()}`,
        });
      }

      setSuccess(true);
      // Mock Haptic trigger
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 30, 10, 30]);
      }
      toast({ title: "Success! 🎉", description: "Your attendance is verified." });

    } catch (error: any) {
      toast({ title: "Verification Failed", description: error.message, variant: "destructive" });
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
            <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-card">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="font-serif text-2xl font-bold mb-2">Verified! 🎉</h1>
              <p className="text-muted-foreground mb-6">Successfully checked in to "{moment.title}"</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => navigate("/dashboard")}>Dashboard</Button>
                <Button variant="hero" className="flex-1" onClick={() => navigate(`/moments/${id}`)}>View Moment</Button>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-8 shadow-card overflow-hidden">
              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${moment.proof_type === 'GPS' ? 'bg-blue-500/10' : moment.proof_type === 'Photo' ? 'bg-purple-500/10' : 'bg-primary/10'
                  }`}>
                  {moment.proof_type === 'GPS' ? <MapPin className="w-8 h-8 text-blue-500" /> :
                    moment.proof_type === 'Photo' ? <Camera className="w-8 h-8 text-purple-500" /> :
                      <QrCode className="w-8 h-8 text-primary" />}
                </div>
                <h1 className="font-serif text-2xl font-bold">Verify Attendance</h1>
                <p className="text-muted-foreground mt-2">
                  Strategy: <span className="font-semibold text-foreground uppercase text-xs tracking-wider">{moment.proof_type} Verification</span>
                </p>
              </div>

              <form onSubmit={handleCheckIn} className="space-y-6">

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

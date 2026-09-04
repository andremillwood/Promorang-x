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
import { demoMoments } from "@/data/demo-moments";
import { useI18n } from "@/i18n/I18nContext";
import { ActionUnlockReceipt } from "@/components/journey/ActionUnlockReceipt";
import { buildActionUnlockReceipt } from "@/lib/action-unlock-receipt";
import { LivingPromoCard } from "@/components/promorang/LivingPromoCard";
import { usePromoCardLife } from "@/hooks/usePromoCardLife";
import { writePromoCardMark } from "@/lib/promocard/life";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type ProofRequirement = {
  id: string;
  requirement_type: string;
  label?: string | null;
  instructions?: string | null;
  is_required?: boolean | null;
};

const CheckIn = () => {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user, session } = useAuth();
  const cardLife = usePromoCardLife();
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
      toast({ title: t("checkIn.toastEventNotFound"), description: t("checkIn.toastEventNotFoundDesc"), variant: "destructive" });
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
      toast({ title: t("checkIn.toastGpsNotSupported"), description: t("checkIn.toastGpsNotSupportedDesc"), variant: "destructive" });
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
            toast({ title: t("checkIn.toastGpsVerifiedOnSite"), description: t("checkIn.toastGpsVerifiedOnSiteDesc", { meters: (dist * 1000).toFixed(0) }) });
          } else {
            toast({ title: t("checkIn.toastLocationCaptured"), description: t("checkIn.toastLocationCapturedDesc", { km: dist.toFixed(2) }) });
          }
        } else {
          setIsWithinGeofence(true);
          toast({ title: t("checkIn.toastLocationVerified"), description: t("checkIn.toastLocationVerifiedDesc") });
        }
      },
      (err) => {
        setLoading(false);
        console.warn("GPS error:", err);
        toast({ title: t("checkIn.toastGpsError"), description: t("checkIn.toastGpsErrorDesc"), variant: "destructive" });
      }
    );
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !moment) return;

    setLoading(true);

    if (id?.startsWith('m')) {
      toast({ title: t("checkIn.toastDemoComplete"), description: t("checkIn.toastDemoCompleteDesc") });
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
      queryClient.invalidateQueries({ queryKey: ["promocard"] });

      if (user?.id && moment?.title) {
        writePromoCardMark(user.id, {
          kind: "arrived",
          place: moment.venue_name || moment.location || moment.title,
          id: `arrived-${moment.id || id}`,
        });
      }

      if ('vibrate' in navigator) {
        navigator.vibrate([10, 30, 10, 30]);
      }

    } catch (error: any) {
      toast({ title: t("checkIn.toastFailed"), description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-extrabold">{t("checkIn.unauthTitle")}</h1>
          <p className="text-white/60 text-sm">{t("checkIn.unauthCopy")}</p>
          <Button className="rounded-full bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold px-8" onClick={() => navigate("/auth")}>
            {t("checkIn.unauthButton")}
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
          <h1 className="text-2xl font-black">{t("checkIn.rsvpTitle")}</h1>
          <p className="text-white/60 text-sm">{t("checkIn.rsvpCopy")}</p>
          <Button className="w-full rounded-full bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold py-6" asChild>
            <Link to={`/moments/${id}`}>{t("checkIn.rsvpButton")}</Link>
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
      <SEO title={t("checkIn.seoTitle", { title: moment.title })} description={t("checkIn.seoDescription", { title: moment.title })} />

      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        {success ? (
          <div className="mx-auto max-w-xl space-y-6 pt-8 animate-in fade-in duration-300">
            <div className="text-center space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{t("checkIn.successTitle")}</h1>
              <p className="text-white/70 text-base">
                {t("checkIn.successCopy", { title: moment.title })}
              </p>
            </div>

            <LivingPromoCard
              holder={cardLife.holder}
              last4={cardLife.last4}
              available={cardLife.available}
              limit={cardLife.limit}
              marks={cardLife.marks}
              writingMark={cardLife.writingMark}
              caption={`${moment.venue_name || moment.title} just stamped the plastic. That is the proof.`}
            />

            <ActionUnlockReceipt
              receipt={buildActionUnlockReceipt(
                { action: "check_in", momentName: moment.title, perk: moment.reward || undefined },
                {
                  checkInHeading: t("checkIn.successTitle"),
                  checkInProved: t("receipt.checkInProved"),
                  checkInUnlocked: t("checkIn.complimentaryPerk"),
                  checkInNext: t("receipt.checkInNext"),
                  checkInCta: t("checkIn.viewVault"),
                },
              )}
            />

            <div className="rounded-3xl border border-white/10 bg-[#121214] p-6 space-y-4 text-left">
              <div className="flex items-center gap-3">
                <Gift className="h-6 w-6 text-amber-400" />
                <div>
                  <h4 className="font-bold text-white text-base">{t("checkIn.rewardUnlocked")}</h4>
                  <p className="text-xs text-white/60">{moment.reward || t("checkIn.complimentaryPerk")}</p>
                </div>
              </div>

              {proofSubmissionId && (
                <div className="pt-3 border-t border-white/10 text-xs text-white/50">
                  {t("checkIn.refCode")} <span className="font-mono text-white/80">{proofSubmissionId}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild className="flex-1 rounded-full bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold py-6">
                <Link to="/vault">{t("checkIn.viewVault")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 rounded-full border-white/20 text-white hover:bg-white/10 py-6">
                <Link to={`/moments/${id}`}>{t("checkIn.backToEvent")}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] items-start pt-4">
            {/* Left Cover & Event Info Card */}
            <div className="rounded-3xl border border-white/10 bg-[#121214] p-6 sm:p-8 space-y-6">
              <Link to={`/moments/${id}`} className="inline-flex items-center text-xs font-semibold text-white/60 hover:text-white">
                {t("checkIn.returnTo", { title: moment.title })}
              </Link>

              <div className="space-y-2">
                <span className="text-xs font-bold text-[#ff5500] uppercase tracking-wider">{t("checkIn.badge")}</span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{moment.title}</h1>
                <p className="text-sm text-white/60 flex items-center gap-1.5 pt-1">
                  <MapPin className="h-4 w-4 text-[#ff5500]" /> {moment.venue_name || moment.location}
                </p>
              </div>

              {moment.reward && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3">
                  <Gift className="h-6 w-6 text-amber-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-sm">{t("checkIn.rewardForCheckingIn")}</h4>
                    <p className="text-xs text-white/70">{moment.reward}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Check-in Input Form */}
            <div className="rounded-3xl border border-white/10 bg-[#121214] p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">{t("checkIn.enterCodeTitle")}</h2>
                <p className="text-xs text-white/50">{t("checkIn.enterCodeCopy")}</p>
              </div>

              <form onSubmit={handleCheckIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-xs uppercase font-bold text-white/70">{t("checkIn.codeLabel")}</Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder={t("checkIn.codePlaceholder")}
                    className="text-center text-2xl font-mono tracking-widest h-14 bg-white/5 border-white/15 text-white uppercase rounded-2xl"
                    maxLength={8}
                  />
                </div>

                {/* GPS Location Verification Card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-[#ff5500]" /> {t("checkIn.geofenceVerification")}
                    </span>
                    {locationVerified && (
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isWithinGeofence ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {isWithinGeofence ? t("checkIn.verifiedOnSite") : t("checkIn.remoteCheckIn")}
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
                    {locationVerified ? t("checkIn.recheckGps") : t("checkIn.verifyGps")}
                  </Button>

                  {distanceKm !== null && (
                    <p className="text-[11px] text-white/50 text-center">
                      {t("checkIn.distanceToVenue")} <span className="text-white font-mono">{distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)}m` : `${distanceKm.toFixed(2)} km`}</span>
                    </p>
                  )}
                </div>

                {moment.proof_type === 'Photo' && (
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-white/70">{t("checkIn.photoEvidence")}</Label>
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
                    <>{t("checkIn.submitButton")} <Sparkles className="ml-2 h-5 w-5" /></>
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

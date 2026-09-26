import { useMomentJourney } from "@/hooks/useMomentJourney";
import { ParticipantProofArtifact } from "@/components/proof/ParticipantProofArtifact";
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
import { QrCode, MapPin, Loader2, Sparkles, Gift, ShieldCheck } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ImageUpload } from "@/components/ImageUpload";
import { resolveWorldConsequence } from "@promorang/shared";
import { ConsequenceReceipt } from "@/components/promorang/ConsequenceReceipt";
import { demoMoments } from "@/data/demo-moments";
import { useI18n } from "@/i18n/I18nContext";

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
  const [loadError, setLoadError] = useState(false);
  const journey = useMomentJourney(id);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [moment, setMoment] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [locationVerified, setLocationVerified] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [isWithinGeofence, setIsWithinGeofence] = useState<boolean>(false);
  const [hasJoined, setHasJoined] = useState<boolean | null>(null);
  const [proofRequirements, setProofRequirements] = useState<ProofRequirement[]>([]);
  const [proofSubmissionId, setProofSubmissionId] = useState<string | null>(null);
  const [consequence, setConsequence] = useState<ReturnType<typeof resolveWorldConsequence> | null>(null);
  const [keptMemory, setKeptMemory] = useState<{ title: string; origin: string; perk: string; scene?: string; place?: string; date?: string } | null>(null);

  useEffect(() => {
    if (!imageFile) { setPreviewUrl(undefined); return; }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const requiredTypes = proofRequirements
    .filter((requirement) => requirement.is_required !== false)
    .map((requirement) => String(requirement.requirement_type || "").toLowerCase());
  const requiresCode = requiredTypes.some((type) => type === "venue_qr" || type === "rotating_code");
  const requiresMedia = requiredTypes.some((type) => type === "timestamped_media" || type === "receipt");
  const requiresGeofence = requiredTypes.includes("geofence");

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
    setLoadError(false);
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
      setLoadError(true);
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
    const R = 6371;
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

        if (Number.isFinite(Number(moment?.latitude)) && Number.isFinite(Number(moment?.longitude))) {
          const dist = calculateDistance(uLat, uLng, Number(moment.latitude), Number(moment.longitude));
          setDistanceKm(dist);
          const inside = dist <= 0.2;
          setIsWithinGeofence(inside);
          if (inside) {
            toast({ title: t("checkIn.toastGpsVerifiedOnSite"), description: t("checkIn.toastGpsVerifiedOnSiteDesc", { meters: (dist * 1000).toFixed(0) }) });
          } else {
            toast({ title: t("checkIn.toastLocationCaptured"), description: t("checkIn.toastLocationCapturedDesc", { km: dist.toFixed(2) }) });
          }
        } else {
          setIsWithinGeofence(false);
          toast({
            title: "Venue location unavailable",
            description: "Your location was captured, but this Moment has no recorded geofence to verify against.",
            variant: "destructive",
          });
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

    if (requiresCode && !code.trim()) {
      toast({ title: "Code required", description: "This Moment requires a venue or rotating code before proof can be submitted.", variant: "destructive" });
      return;
    }
    if (requiresMedia && !imageFile) {
      toast({ title: "Evidence required", description: "This Moment requires photo or receipt evidence before proof can be submitted.", variant: "destructive" });
      return;
    }
    if (requiresGeofence && (!userCoords || !isWithinGeofence)) {
      toast({ title: "On-site verification required", description: "Verify your location within the Moment geofence before submitting proof.", variant: "destructive" });
      return;
    }

    setLoading(true);

    if (id?.startsWith('m')) {
      toast({ title: t("checkIn.toastDemoComplete"), description: t("checkIn.toastDemoCompleteDesc") });
      setConsequence(resolveWorldConsequence({
        verified: false,
        pending: true,
        momentTitle: moment.title,
        placeName: moment.venue_name || moment.location,
      }));
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
        const proofBundle = {
          proof_code: code || null,
          evidence_url: evidenceUrl || null,
          ...(userCoords ? { latitude: userCoords.lat, longitude: userCoords.lng } : {}),
          client_geofence_inside: userCoords ? isWithinGeofence : null,
        };
        const response = await fetch(`${API_URL}/api/participation/moments/${id}/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            proof_bundle: proofBundle,
            proof_code: code || null,
            evidence_url: evidenceUrl,
            promopush_campaign_id: promoPushCampaignId,
            promopush_channel_id: promoPushChannelId,
            promopush_tracking_code: promoPushChannelCode,
          }),
        });

        const payload = await response.json();
        if (!response.ok) {
          const missing = Array.isArray(payload?.missing_requirements)
            ? payload.missing_requirements.map((item: any) => item.label || item.type).filter(Boolean).join(", ")
            : null;
          throw new Error(missing ? `${payload?.error || "We still need something"}: ${missing}` : (payload?.error || "Couldn’t finish check-in"));
        }

        setProofSubmissionId(payload?.submission?.id || payload?.checkin?.participation?.id || null);
        const serverReceipt = payload?.checkin?.consequence || payload?.consequence;
        if (serverReceipt) {
          setConsequence(serverReceipt);
        } else {
          setConsequence(resolveWorldConsequence({
            verified: payload?.checkin?.verification_status === "verified",
            pending: payload?.checkin?.verification_status === "pending" || Boolean(payload?.submission?.id),
            momentTitle: moment.title,
            placeName: moment.venue_name || moment.location,
            momentImageUrl: moment.image_url || moment.banner_image_url || null,
            placeImageUrl: moment.venue_image_url || null,
            memoryKept: Boolean(payload?.checkin?.memory?.id),
            memoryTitle: payload?.checkin?.memory?.title,
            rewardTitle: payload?.checkin?.reward?.reward_value || moment.reward,
            promoCardEligible: Boolean(payload?.checkin?.promo_card_return?.eligible),
            promoCardReturnLabel: payload?.checkin?.promo_card_return?.label,
          }));
        }
        if (payload?.checkin?.memory?.id) {
          setKeptMemory({
            title: payload.checkin.memory.title || "First Current Memory",
            origin: moment.title,
            perk: payload.checkin.memory.perk?.title || "Kept from showing up",
            place: moment.venue_name || moment.location,
            date: new Date().toLocaleDateString(),
          });
        }

        const verificationPending = payload?.checkin?.verification_status === "pending" || Boolean(payload?.submission?.id);
        toast({
          title: verificationPending ? "We got it" : t("checkIn.toastComplete"),
          description: verificationPending
            ? "We’re checking what you sent. If it counts, anything you earned or kept will show up after."
            : t("checkIn.toastCompleteDesc"),
        });
      }

      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["joined-moments"] });
      queryClient.invalidateQueries({ queryKey: ["vault-data"] });
      queryClient.invalidateQueries({ queryKey: ["experience-home"] });
      queryClient.invalidateQueries({ queryKey: ["experience-card"] });
      queryClient.invalidateQueries({ queryKey: ["experience-crew"] });

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

  if (loadError) return <main className="participant-world min-h-screen p-8 text-white"><h1 className="font-serif text-3xl">This Moment couldn’t load.</h1><button type="button" onClick={() => void fetchMoment()} className="pr-world-primary mt-5">Try again</button><Link to="/discover" className="ml-5 underline">Back to Discover</Link></main>;

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

      <main className="proof-world mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        {!success && journey.data && ["pending", "verified"].includes(journey.data.proof_state || "") ? (
          <div className="mx-auto max-w-xl space-y-6"><ParticipantProofArtifact journey={journey.data} /><Link to={`/moments/${id}`} className="inline-flex min-h-11 items-center text-sm underline">Back to Moment</Link><button type="button" onClick={() => void journey.refetch()} className="ml-6 min-h-11 text-sm underline">Refresh status</button></div>
        ) : success ? (
          <div className="mx-auto max-w-xl space-y-6 pt-8 animate-in fade-in duration-300">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                {consequence?.eyebrow || "You showed up"}
              </p>
              <h1 className="mt-2 font-serif text-4xl font-bold text-white">{consequence?.heading || "We’re checking it"}</h1>
              <p className="mt-2 text-white/70">
                {moment.title}{moment.venue_name || moment.location ? ` · ${moment.venue_name || moment.location}` : ""}
              </p>
              {(moment.image_url || moment.banner_image_url) ? (
                <img
                  src={moment.image_url || moment.banner_image_url}
                  alt={moment.title}
                  className="mx-auto mt-5 h-40 w-full max-w-md rounded-[1.4rem] object-cover"
                />
              ) : null}
            </div>

            {consequence && !consequence.counted ? (
              <section className="pr-proof-artifact" data-proof-state="pending"><p className="pr-proof-stamp">We got it</p><h2 className="mt-4 font-serif text-3xl font-bold">We’re checking it.</h2><p className="mt-3 text-sm leading-6">If it counts, anything you earned or kept will show up after.</p></section>
            ) : consequence ? (
              <ConsequenceReceipt receipt={consequence} reveal={keptMemory} />
            ) : (
              <div className="rounded-3xl border border-white/10 bg-[#121214] p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-amber-400" />
                  <div>
                    <h4 className="font-bold text-white text-base">We got it</h4>
                    <p className="text-xs text-white/60">We’re checking it. Nothing has opened or been added to your story yet.</p>
                  </div>
                </div>
              </div>
            )}

            {proofSubmissionId && (
              <p className="text-center text-xs text-white/40">
                {t("checkIn.refCode")} <span className="font-mono text-white/70">{proofSubmissionId}</span>
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild variant="outline" className="flex-1 rounded-full border-white/20 text-white hover:bg-white/10 py-6">
                <Link to={`/moments/${id}`}>{t("checkIn.backToEvent")}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] items-start pt-4">
            <div className="overflow-hidden border-t border-white/15">
              {(moment.image_url || moment.banner_image_url) ? (
                <img src={moment.image_url || moment.banner_image_url} alt={moment.title} className="h-56 w-full object-cover" />
              ) : null}
              <div className="space-y-6 p-6 sm:p-8">
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
                    <h4 className="font-bold text-white text-sm">Potential consequence after verification</h4>
                    <p className="text-xs text-white/70">{moment.reward}</p>
                  </div>
                </div>
              )}
              </div>
            </div>

            <div className="pr-proof-artifact space-y-6" data-proof-state="ready">
              <div className="space-y-1">
                <p className="pr-proof-stamp">Evidence · not yet submitted</p>
                <h2 className="mt-3 font-serif text-3xl font-bold">Make your participation count.</h2>
                <p className="text-xs text-white/50">The platform records your evidence first. Verification and any downstream consequence happen separately.</p>
              </div>

              {journey.data?.proof_state === "rejected" || journey.data?.proof_state === "expired" ? <p role="status" className="border-l-2 border-red-500 pl-3 text-sm">Your previous proof was not approved. Check the requirements below.</p> : null}
              {proofRequirements.length ? <ul className="divide-y divide-current/15 border-y border-current/15">{proofRequirements.map((requirement) => <li key={requirement.id} className="py-3 text-sm"><strong>{requirement.label || requirement.requirement_type.replace(/_/g, " ")}</strong><span className="ml-2 text-xs opacity-60">{requirement.is_required === false ? "Optional" : "Required"}</span>{requirement.instructions ? <p className="mt-1 leading-6 opacity-75">{requirement.instructions}</p> : null}</li>)}</ul> : null}
              <form onSubmit={handleCheckIn} className="space-y-5">
                {(requiresCode || proofRequirements.length === 0) && (
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-xs uppercase font-bold text-white/70">{t("checkIn.codeLabel")}{requiresCode ? " · required" : ""}</Label>
                    <Input
                      id="code"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder={t("checkIn.codePlaceholder")}
                      className="text-center text-2xl font-mono tracking-widest h-14 bg-white/5 border-white/15 text-white uppercase rounded-2xl"
                      maxLength={8}
                    />
                  </div>
                )}

                {(requiresGeofence || proofRequirements.length === 0) && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-[#ff5500]" /> {t("checkIn.geofenceVerification")}{requiresGeofence ? " · required" : ""}
                      </span>
                      {locationVerified && (
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isWithinGeofence ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {isWithinGeofence ? "Location captured" : "Outside venue range"}
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
                )}

                {(requiresMedia || moment.proof_type === 'Photo') && (
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-white/70">{t("checkIn.photoEvidence")}{requiresMedia ? " · required" : ""}</Label>
                    <ImageUpload
                      onImageSelect={(file) => setImageFile(file)}
                      previewUrl={previewUrl}
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
                    <>Submit evidence</>
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

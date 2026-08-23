import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Clock3, KeyRound, LockKeyhole, MapPin, Sparkles, TicketCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { claimPresentsExperience, getMyPresents, getPresentsCatalog, PresentsExperience } from "@/lib/presents";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import "./PromorangPresents.css";

const filterKeys = ["All", "Tonight", "Music", "VIP", "Tables", "Secret"] as const;

export default function PromorangAccess() {
  const { t, formatNumber } = useI18n();
  const { user } = useAuth();
  const [experiences, setExperiences] = useState<PresentsExperience[]>([]);
  const [filter, setFilter] = useState<typeof filterKeys[number]>("All");
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [membership, setMembership] = useState<Record<string, unknown> | null>(null);
  const [claimed, setClaimed] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([getPresentsCatalog(), user ? getMyPresents() : Promise.resolve(null)])
      .then(([catalog, mine]) => {
        setExperiences(catalog.experiences);
        if (mine) {
          setMembership(mine.membership);
          const next: Record<string, string> = {};
          mine.claims.forEach((claim) => { const exp = claim.presents_experiences as { title?: string } | undefined; if (exp?.title) next[exp.title] = String(claim.credential_code); });
          setClaimed(next);
        }
      }).catch((error) => toast.error(error.message)).finally(() => setLoading(false));
  }, [user]);

  const visible = useMemo(() => experiences.filter((item) => filter === "All" || item.category.toLowerCase() === filter.toLowerCase() || (filter === "Tonight" && ["Wednesday","Thursday"].includes(item.metadata?.day || ""))), [experiences, filter]);

  const claim = async (experience: PresentsExperience) => {
    if (!user) { location.href = `/auth?mode=signup&destination=${encodeURIComponent('/access')}`; return; }
    if (!membership) { location.href = "/presents#access"; return; }
    setClaiming(experience.id);
    try {
      const result = await claimPresentsExperience(experience.id);
      setClaimed((state) => ({ ...state, [experience.title]: result.credential_code }));
      toast.success(result.status === "pending" ? t("promorangAccessPage.claimPendingToast") : t("promorangAccessPage.claimSuccessToast"));
    } catch (error) { toast.error(error instanceof Error ? error.message : t("promorangAccessPage.claimFailedToast")); }
    finally { setClaiming(null); }
  };

  const getFilterLabel = (key: typeof filterKeys[number]) => {
    switch (key) {
      case "All": return t("promorangAccessPage.filterAll");
      case "Tonight": return t("promorangAccessPage.filterTonight");
      case "Music": return t("promorangAccessPage.filterMusic");
      case "VIP": return t("promorangAccessPage.filterVip");
      case "Tables": return t("promorangAccessPage.filterTables");
      case "Secret": return t("promorangAccessPage.filterSecret");
      default: return key;
    }
  };

  return (
    <main className="min-h-screen bg-[#11100e] text-[#f4efe5]">
      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-28 sm:px-10 lg:px-20 lg:pb-24">
        <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-orange-600/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <p className="mb-5 flex items-center gap-2 text-xs font-bold tracking-[.24em] text-orange-400"><LockKeyhole className="h-4 w-4" /> {t("promorangAccessPage.badge")}</p>
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_.5fr]">
            <div><h1 className="max-w-4xl font-serif text-5xl leading-[.92] tracking-[-.045em] sm:text-7xl lg:text-8xl">{t("promorangAccessPage.title")}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-stone-400">{t("promorangAccessPage.subtitle")}</p></div>
            <div className="border-l border-orange-500 pl-5 text-sm leading-6 text-stone-400"><strong className="block text-2xl text-white">{t("promorangAccessPage.openDoorsTitle")}</strong>{t("promorangAccessPage.openDoorsDesc")}</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-10 lg:px-20">
        <div className="mb-10 flex gap-2 overflow-x-auto pb-2" aria-label="Filter experiences">
          {filterKeys.map((item) => <button key={item} onClick={() => setFilter(item)} className={`whitespace-nowrap border px-4 py-2 text-xs font-bold uppercase tracking-wider ${filter === item ? 'border-orange-500 bg-orange-500 text-white' : 'border-white/15 text-stone-400 hover:border-white/40'}`}>{getFilterLabel(item)}</button>)}
        </div>
        {loading ? <div className="grid gap-5 md:grid-cols-2"><div className="h-96 animate-pulse bg-white/5"/><div className="h-96 animate-pulse bg-white/5"/></div> : (
          <div className="grid gap-5 md:grid-cols-2">
            {visible.map((experience, index) => {
              const remaining = Math.max(0, experience.quantity - experience.claimed_count);
              const credential = claimed[experience.title];
              return <article key={experience.id} className="group relative overflow-hidden border border-white/10 bg-[#181613] p-6 sm:p-8">
                <div className="absolute right-5 top-2 font-serif text-8xl text-white/[.035]">0{index + 1}</div>
                <div className="relative">
                  <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[.2em] text-orange-400">{experience.event_name}</span><span className="border border-white/15 px-2 py-1 text-[10px] uppercase tracking-widest">{experience.metadata?.badge || experience.category}</span></div>
                  <h2 className="mt-12 font-serif text-4xl sm:text-5xl">{experience.title}</h2>
                  <p className="mt-4 max-w-xl leading-7 text-stone-400">{experience.description}</p>
                  <div className="mt-7 flex flex-wrap gap-4 text-xs text-stone-400"><span className="flex gap-1.5"><Clock3 className="h-4 w-4" />{experience.metadata?.day || t("promorangAccessPage.thisWeek")}</span><span className="flex gap-1.5"><MapPin className="h-4 w-4" />{experience.venue_name}</span><span className="flex gap-1.5"><TicketCheck className="h-4 w-4" />{t("promorangAccessPage.remainingCount", { count: formatNumber(remaining) })}</span></div>
                  <div className="mt-7 grid gap-2 border-y border-white/10 py-5 text-sm sm:grid-cols-3">
                    <span className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-orange-400" />{experience.promo_keys_required ? t("promorangAccessPage.keysCount", { count: formatNumber(experience.promo_keys_required) }) : t("promorangAccessPage.noKeys")}</span>
                    <span className="flex items-center gap-2"><Users className="h-4 w-4 text-orange-400" />{t("promorangAccessPage.referralsCount", { count: formatNumber(experience.referrals_required) })}</span>
                    <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-orange-400" />{t("promorangAccessPage.missionsCount", { count: formatNumber(experience.mission_requirements.length) })}</span>
                  </div>
                  {credential ? <div className="mt-6 border border-emerald-500/40 bg-emerald-500/10 p-4"><span className="flex items-center gap-2 text-xs font-bold text-emerald-400"><Check className="h-4 w-4" /> {t("promorangAccessPage.claimedBadge")}</span><code className="mt-2 block text-xl font-bold tracking-widest">{credential}</code></div> : <button disabled={remaining === 0 || claiming === experience.id} onClick={() => claim(experience)} className="mt-6 flex w-full items-center justify-center gap-2 bg-orange-500 px-5 py-4 text-sm font-black text-white hover:bg-orange-400 disabled:opacity-40">{remaining === 0 ? t("promorangAccessPage.fullyClaimed") : claiming === experience.id ? t("promorangAccessPage.checkingEligibility") : t("promorangAccessPage.unlockExperience")}<ArrowRight className="h-4 w-4" /></button>}
                </div>
              </article>;
            })}
          </div>
        )}
        {!membership && <div className="mt-12 flex flex-col items-start justify-between gap-5 border border-orange-500/30 bg-orange-500/10 p-6 sm:flex-row sm:items-center"><div><strong className="font-serif text-2xl">{t("promorangAccessPage.invitationOnlyTitle")}</strong><p className="mt-1 text-sm text-stone-400">{t("promorangAccessPage.invitationOnlyDesc")}</p></div><Link to="/presents#access" className="flex items-center gap-2 bg-white px-5 py-3 text-sm font-bold text-black">{t("promorangAccessPage.enterCodeCta")} <ArrowRight className="h-4 w-4" /></Link></div>}
      </section>
    </main>
  );
}


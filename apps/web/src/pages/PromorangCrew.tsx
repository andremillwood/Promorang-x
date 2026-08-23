import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, Crown, KeyRound, LockKeyhole, QrCode, Share2, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getMyPresents } from "@/lib/presents";
import { useI18n } from "@/i18n/I18nContext";

export default function PromorangCrew() {
  const { t, formatNumber } = useI18n();
  const { user } = useAuth();
  const [mine, setMine] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const ladder = [
    { n: 1, label: t("promorangCrewPage.ladderPromoPoints"), icon: Check },
    { n: 3, label: t("promorangCrewPage.ladderPromoKey"), icon: KeyRound },
    { n: 5, label: t("promorangCrewPage.ladderFastLane"), icon: LockKeyhole },
    { n: 10, label: t("promorangCrewPage.ladderVipExperience"), icon: Crown }
  ];

  useEffect(() => { if (!user) { setLoading(false); return; } getMyPresents().then(setMine).catch((e) => toast.error(e.message)).finally(() => setLoading(false)); }, [user]);
  const codes = mine?.invite_codes || [];
  const activated = codes.reduce((sum: number, code: any) => sum + code.used_count, 0);
  const share = async (code: string) => { await navigator.clipboard.writeText(`${location.origin}/presents?invite=${code}&utm_source=crew&utm_medium=referral`); toast.success(t("promorangCrewPage.copiedToast")); };

  if (!user && !loading) return <main className="grid min-h-screen place-items-center bg-[#11100e] px-5 text-white"><div className="max-w-lg text-center"><Users className="mx-auto h-10 w-10 text-orange-500"/><h1 className="mt-5 font-serif text-5xl">{t("promorangCrewPage.signedOutTitle")}</h1><p className="mt-4 text-stone-400">{t("promorangCrewPage.signedOutDesc")}</p><Link to="/auth?mode=signup&destination=/crew" className="mt-7 inline-flex bg-orange-500 px-6 py-3 font-bold">{t("promorangCrewPage.joinPromorang")}</Link></div></main>;
  return <main className="min-h-screen bg-[#f4efe5] px-5 pb-20 pt-28 text-[#151310] sm:px-10 lg:px-20">
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-black tracking-[.22em] text-orange-600">{t("promorangCrewPage.eyebrow")}</p>
      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_.45fr]"><div><h1 className="font-serif text-6xl leading-[.9] tracking-[-.05em] sm:text-8xl">{t("promorangCrewPage.heroTitle1")}<br/><i className="text-orange-600">{t("promorangCrewPage.heroTitle2")}</i></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">{t("promorangCrewPage.heroSubtitle")}</p></div><div className="border-l border-stone-300 pl-6"><span className="text-xs font-bold uppercase tracking-widest text-stone-500">{t("promorangCrewPage.verifiedCrew")}</span><strong className="mt-2 block font-serif text-7xl">{formatNumber(activated)}</strong><p className="text-sm text-stone-500">{t("promorangCrewPage.untilNextPromoKey")}</p></div></div>
      {!mine?.membership ? <div className="mt-14 border border-stone-300 bg-white p-8"><h2 className="font-serif text-3xl">{t("promorangCrewPage.noMembershipTitle")}</h2><p className="mt-2 text-stone-600">{t("promorangCrewPage.noMembershipDesc")}</p><Link to="/presents#access" className="mt-5 inline-flex bg-black px-5 py-3 text-sm font-bold text-white">{t("promorangCrewPage.enterAccessCode")}</Link></div> : <>
        <section className="mt-14 grid gap-4 md:grid-cols-3">{codes.map((code: any) => <article key={code.id} className="border border-stone-300 bg-white p-6"><div className="flex justify-between"><QrCode className="h-6 w-6 text-orange-600"/><span className="text-xs font-bold uppercase text-stone-400">{code.status}</span></div><code className="mt-9 block text-xl font-black tracking-wider">{code.code}</code><p className="mt-2 text-xs text-stone-500">{t("promorangCrewPage.usedCount", { used: formatNumber(code.used_count), max: formatNumber(code.max_uses) })}</p><button onClick={() => share(code.code)} disabled={code.status !== 'active'} className="mt-5 flex w-full items-center justify-center gap-2 bg-[#151310] py-3 text-sm font-bold text-white disabled:opacity-40"><Copy className="h-4 w-4"/>{t("promorangCrewPage.copyInvitation")}</button></article>)}</section>
        <section className="mt-16"><div className="flex items-end justify-between"><div><p className="text-xs font-black tracking-[.2em] text-orange-600">{t("promorangCrewPage.rewardLadder")}</p><h2 className="mt-2 font-serif text-4xl">{t("promorangCrewPage.rewardLadderTitle")}</h2></div><Share2 className="hidden h-7 w-7 text-stone-400 sm:block"/></div><div className="mt-7 grid gap-px overflow-hidden border border-stone-300 bg-stone-300 md:grid-cols-4">{ladder.map(({n,label,icon:Icon}) => <div key={n} className="bg-[#f4efe5] p-6"><div className={`grid h-10 w-10 place-items-center rounded-full ${activated >= n ? 'bg-emerald-600 text-white':'bg-stone-200 text-stone-500'}`}><Icon className="h-5 w-5"/></div><strong className="mt-7 block font-serif text-3xl">{formatNumber(n)}</strong><span className="text-sm text-stone-600">{n === 1 ? t("promorangCrewPage.verifiedArrivalSingle") : t("promorangCrewPage.verifiedArrivalPlural")}</span><p className="mt-4 font-bold">{label}</p></div>)}</div></section>
      </>}
    </div>
  </main>;
}


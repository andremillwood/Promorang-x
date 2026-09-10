import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { COMMUNITY_THEMES, REACH_CHANNELS } from "@promorang/shared";
import { useExperienceActions } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell } from "@/components/people/ExperienceShell";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import { localizedCommunityTheme } from "@/i18n/localize";

export default function StartCommunity() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const to = useExperiencePath();
  const { start } = useExperienceActions();
  const { toast } = useToast();
  const [theme, setTheme] = useState("food");
  const [location, setLocation] = useState("Kingston");
  const [name, setName] = useState("");
  const [reach, setReach] = useState<string[]>(["instagram"]);
  const [created, setCreated] = useState<any>(null);

  const toggleReach = (id: string) => {
    setReach((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const submit = async () => {
    try {
      const result = await start.mutateAsync({ name, theme, location, city: location, reach });
      setCreated(result);
    } catch (error) {
      toast({ title: t("start.createFailed"), description: (error as Error).message, variant: "destructive" });
    }
  };

  if (created?.scene) {
    return (
      <ExperienceShell eyebrow={t("start.youreIn")} title={t("start.givePeople")}>
        <p className="text-sm text-white/55">{t("start.liveDontStop", { title: created.scene.title })}</p>
        <Link to={to("/give")} className="block rounded-[1.6rem] bg-primary px-5 py-5 text-black">
          <p className="font-serif text-2xl font-bold">{t("start.firstPerk")}</p>
          <p className="mt-1 text-sm">{t("start.firstPerkCopy")}</p>
        </Link>
        <Link to={to("/people")} className="block rounded-[1.6rem] border border-white/10 px-5 py-5">
          <p className="font-serif text-2xl font-bold">{t("start.invitePeople")}</p>
          <p className="mt-1 text-sm text-white/50">{created.firstValue?.invite?.shareUrl || t("start.copyInvite")}</p>
        </Link>
        {created.firstValue?.opportunity ? (
          <Link to={to("/earn")} className="block rounded-[1.6rem] border border-white/10 px-5 py-5">
            <p className="font-serif text-2xl font-bold">{t("start.takeOpportunity")}</p>
            <p className="mt-1 text-sm text-white/50">{created.firstValue.opportunity.title}</p>
          </Link>
        ) : null}
        <button type="button" onClick={() => navigate(`/scenes/${created.scene.slug}`)} className="text-sm text-white/40">
          {t("start.seeCommunity")}
        </button>
      </ExperienceShell>
    );
  }

  return (
    <ExperienceShell
      eyebrow={t("start.eyebrow")}
      title={t("start.title")}
      description={t("start.copy")}
      backTo="/dashboard"
    >
      <div className="grid grid-cols-2 gap-2">
        {COMMUNITY_THEMES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTheme(item.id)}
            className={`min-h-12 rounded-full border text-sm font-bold ${theme === item.id ? "border-primary bg-primary text-black" : "border-white/10"}`}
          >
            {localizedCommunityTheme(item.id, t)}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t("start.where")}</span>
        <input value={location} onChange={(event) => setLocation(event.target.value)} className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4" />
      </label>

      <label className="block">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t("start.nameLabel")}</span>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder={t("start.namePh")} className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4" />
      </label>

      <section>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t("start.reach")}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {REACH_CHANNELS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleReach(item.id)}
              className={`min-h-12 rounded-full border text-sm font-bold ${reach.includes(item.id) ? "border-primary bg-primary text-black" : "border-white/10"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        disabled={!name.trim() || start.isPending}
        onClick={submit}
        className="min-h-14 w-full rounded-full bg-primary text-sm font-black text-black disabled:opacity-60"
      >
        {start.isPending ? t("start.creating") : t("start.createCta")}
      </button>
    </ExperienceShell>
  );
}

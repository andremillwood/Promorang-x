import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { COMMUNITY_THEMES } from "@promorang/shared";
import { useExperienceActions } from "@/hooks/usePeopleExperience";
import { ExperienceShell } from "@/components/people/ExperienceShell";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import { SceneContributionLinks } from "@/components/people/SceneContributionLinks";
import { shareSceneLink } from "@/lib/scene-share";
import { trackGrowthEvent } from "@/lib/marketing-attribution";
import { localizedCommunityTheme } from "@/i18n/localize";

export default function StartCommunity() {
  const { t } = useI18n();
  const { start } = useExperienceActions();
  const { toast } = useToast();
  const [theme, setTheme] = useState("other");
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState(0);
  const [idea, setIdea] = useState("");
  const [audience, setAudience] = useState("");
  const [promise, setPromise] = useState("");
  const [country, setCountry] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { void trackGrowthEvent({ eventName: "cta_clicked", properties: { action: "scene_creation_started" }, journey: "participant", stage: "activated" }); }, []);
  useEffect(() => { heading.current?.focus(); }, [step]);
  const [created, setCreated] = useState<any>(null);

  const submit = async () => {
    try {
      const result = await start.mutateAsync({ name: name.trim(), theme, city: location.trim(), country, description: idea, audience, promise, imageUrl });
      setCreated(result);
      void trackGrowthEvent({ eventName: "cta_clicked", properties: { action: "scene_published" }, journey: "participant", stage: "outcome", entityType: "scene", entityId: result.scene.id });
    } catch (error) {
      toast({ title: t("start.createFailed"), description: (error as Error).message, variant: "destructive" });
    }
  };

  const share = async () => {
    try {
      const result = await shareSceneLink(created.scene.title, new URL(`/scenes/${created.scene.slug}`, window.location.origin).href, created.scene.metadata?.tagline);
      if (result === "cancelled") return;
      if (result === "copied") toast({ title: t("launch.copied") });
      void trackGrowthEvent({ eventName: "cta_clicked", journey: "participant", stage: "amplified", entityType: "scene", entityId: created.scene.id, properties: { action: "scene_shared", method: result } });
    } catch { toast({ title: t("launch.shareError"), variant: "destructive" }); }
  };

  if (created?.scene) {
    return <ExperienceShell eyebrow={t("start.youreIn")} title={t("launch.first")}>
      <p className="text-base text-white/70">{created.scene.title} — {created.scene.metadata?.tagline}</p>
      <SceneContributionLinks sceneId={created.scene.id} sceneSlug={created.scene.slug} />
      <div className="flex flex-wrap gap-3">
        <Link to={`/scenes/${created.scene.slug}`} className="pr-world-primary">{t("launch.open")}</Link>
        <button type="button" onClick={share} className="pr-world-chip min-h-12">{t("common.share")}</button>
      </div>
    </ExperienceShell>;
  }

  const titles = ["launch.idea", "launch.promiseQuestion", "launch.details", "launch.preview"] as const;
  const valid = [Boolean(idea.trim() && audience.trim()), Boolean(promise.trim()), Boolean(name.trim() && location.trim()), true][step];
  const inputClass = "mt-2 min-h-12 w-full rounded-lg border border-white/20 bg-white/[.04] px-4 py-3 text-base focus-visible:outline-primary";
  return <ExperienceShell eyebrow={t("launch.start")} title={t(titles[step])} backTo="/scenes">
    <form className="mx-auto w-full max-w-2xl space-y-6 pb-[env(safe-area-inset-bottom)]" onSubmit={(event) => { event.preventDefault(); if (!valid) return; if (step < 3) setStep(step + 1); else void submit(); }}>
      <h2 ref={heading} tabIndex={-1} className="text-sm text-white/65 outline-none">{t("launch.step", { step: step + 1 })}</h2>
      {step === 0 ? <>
        <label className="block">{t("launch.idea")}<textarea required maxLength={2000} rows={4} value={idea} onChange={(event) => setIdea(event.target.value)} className={inputClass} /></label>
        <label className="block">{t("launch.audience")}<input required maxLength={500} value={audience} onChange={(event) => setAudience(event.target.value)} className={inputClass} /></label>
      </> : null}
      {step === 1 ? <label className="block">{t("launch.promise")}<textarea required maxLength={280} rows={3} value={promise} onChange={(event) => setPromise(event.target.value)} className={inputClass} /></label> : null}
      {step === 2 ? <>
        <label className="block">{t("start.nameLabel")}<input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className={inputClass} /></label>
        <label className="block">{t("start.where")}<input required maxLength={160} value={location} onChange={(event) => setLocation(event.target.value)} className={inputClass} /></label>
        <label className="block">{t("launch.country")}<input maxLength={100} value={country} onChange={(event) => setCountry(event.target.value)} className={inputClass} /></label>
        <label className="block">{t("launch.image")}<input type="url" pattern="https://.*" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} className={inputClass} /></label>
        <div className="grid grid-cols-2 gap-2">{COMMUNITY_THEMES.map((item) => <button key={item.id} type="button" aria-pressed={theme === item.id} onClick={() => setTheme(item.id)} className={`min-h-12 border px-3 py-2 text-sm ${theme === item.id ? "border-primary text-primary" : "border-white/20"}`}>{localizedCommunityTheme(item.id, t)}</button>)}</div>
      </> : null}
      {step === 3 ? <section className="overflow-hidden border-y border-white/20 py-6 break-words">
        {imageUrl ? <img src={imageUrl} alt="" className="mb-6 aspect-video w-full object-cover" /> : null}
        <p className="text-sm text-primary">{[location, country].filter(Boolean).join(", ")}</p><h3 className="mt-3 font-serif text-4xl font-bold">{name}</h3><p className="mt-4 text-xl">{promise}</p><p className="mt-4 text-white/65">{idea}</p><p className="mt-3 text-sm text-white/65">{t("launch.audience")} {audience}</p><p className="mt-6 text-sm leading-6 text-white/65">{t("launch.publishCopy")}</p>
      </section> : null}
      <div className="flex gap-3">
        {step > 0 ? <button type="button" disabled={start.isPending} onClick={() => setStep(step - 1)} className="min-h-14 border border-white/20 px-5">{t("common.back")}</button> : null}
        <button type="submit" disabled={!valid || start.isPending} className="min-h-14 flex-1 bg-primary px-5 py-3 font-bold text-black disabled:opacity-50">{start.isPending ? t("start.creating") : step === 3 ? t("launch.publish") : t("launch.next")}</button>
      </div>
    </form>
  </ExperienceShell>;
}

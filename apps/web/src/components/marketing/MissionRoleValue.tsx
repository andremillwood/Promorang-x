import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { MISSION_ARCHETYPES, type MissionArchetype } from "@/lib/mission-archetypes";
import { useI18n } from "@/i18n/I18nContext";
import { TranslationKey } from "@/i18n/translations";

const ROLE_SETS: Record<"brand" | "creator" | "merchant", Array<{ role: MissionArchetype; valueKey: TranslationKey }>> = {
  brand: [
    { role: "aura", valueKey: "missionRole.brand.aura" },
    { role: "rally", valueKey: "missionRole.brand.rally" },
    { role: "signal", valueKey: "missionRole.brand.signal" },
    { role: "scout", valueKey: "missionRole.brand.scout" },
  ],
  creator: [
    { role: "aura", valueKey: "missionRole.creator.aura" },
    { role: "remix", valueKey: "missionRole.creator.remix" },
    { role: "signal", valueKey: "missionRole.creator.signal" },
    { role: "lore", valueKey: "missionRole.creator.lore" },
  ],
  merchant: [
    { role: "aura", valueKey: "missionRole.merchant.aura" },
    { role: "scout", valueKey: "missionRole.merchant.scout" },
    { role: "rally", valueKey: "missionRole.merchant.rally" },
    { role: "lore", valueKey: "missionRole.merchant.lore" },
  ],
};

const ARCHETYPE_KEYS: Record<MissionArchetype, { labelKey: TranslationKey; verbKey: TranslationKey }> = {
  scout: { labelKey: "archetype.scout.label", verbKey: "archetype.scout.verb" },
  aura: { labelKey: "archetype.aura.label", verbKey: "archetype.aura.verb" },
  rally: { labelKey: "archetype.rally.label", verbKey: "archetype.rally.verb" },
  signal: { labelKey: "archetype.signal.label", verbKey: "archetype.signal.verb" },
  remix: { labelKey: "archetype.remix.label", verbKey: "archetype.remix.verb" },
  lore: { labelKey: "archetype.lore.label", verbKey: "archetype.lore.verb" },
  side_quest: { labelKey: "archetype.sideQuest.label", verbKey: "archetype.sideQuest.verb" },
};

export function MissionRoleValue({ audience }: { audience: keyof typeof ROLE_SETS }) {
  const { t } = useI18n();

  return (
    <section className="border-b border-border bg-zinc-950 py-16 text-white md:py-20">
      <div className="container px-6">
        <div className="mb-8 max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{t("missionRole.eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-black uppercase leading-[0.9] tracking-[-0.05em] md:text-5xl">{t("missionRole.title")}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">{t("missionRole.copy")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ROLE_SETS[audience].map(({ role, valueKey }) => {
            const item = MISSION_ARCHETYPES[role];
            const meta = ARCHETYPE_KEYS[role];
            const Icon = item.icon;
            return (
              <Link key={role} to={`/missions?role=${role}`} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-primary/40">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${item.tone}`}><Icon className="h-5 w-5" /></div>
                <p className="mt-6 text-[9px] font-black uppercase tracking-[0.18em] text-white/35">{t(meta.verbKey)}</p>
                <h3 className="mt-1 text-xl font-black">{t(meta.labelKey)}</h3>
                <p className="mt-3 text-xs leading-5 text-white/50">{t(valueKey)}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-primary">{t("missionRole.participantView")} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}


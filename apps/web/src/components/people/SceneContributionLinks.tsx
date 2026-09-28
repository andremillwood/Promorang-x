import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { trackGrowthEvent } from "@/lib/marketing-attribution";

export function SceneContributionLinks({ sceneId, sceneSlug }: { sceneId: string; sceneSlug: string }) {
  const { t } = useI18n();
  const choices = [
    { kind: "want", href: `/create?intent=answer&hub=${encodeURIComponent(sceneId)}&scene_slug=${encodeURIComponent(sceneSlug)}`, title: "launch.want", copy: "launch.wantCopy" },
    { kind: "offer", href: `/give?scene_id=${encodeURIComponent(sceneId)}&scene_slug=${encodeURIComponent(sceneSlug)}`, title: "launch.offer", copy: "launch.offerCopy" },
  ] as const;
  return <div className="grid gap-4 sm:grid-cols-2">{choices.map((choice) => <Link key={choice.kind} to={choice.href}
    onClick={() => void trackGrowthEvent({ eventName: "cta_clicked", journey: "participant", stage: "activated", entityType: "scene", entityId: sceneId, properties: { action: "scene_contribution_initiated", kind: choice.kind } })}
    className="min-w-0 border-t border-white/20 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
    <h3 className="font-serif text-2xl font-bold">{t(choice.title)}</h3><p className="mt-2 text-sm leading-6 text-white/65">{t(choice.copy)}</p><ArrowRight aria-hidden="true" className="mt-4 h-5 w-5 text-primary" />
  </Link>)}</div>;
}

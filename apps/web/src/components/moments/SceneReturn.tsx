import { ACTIVATION_REVIEW_NEXT_DECISIONS, ACTIVATION_SUCCESS_LANGUAGE, SCENE_RETURN_CARDS } from "@promorang/shared";
import { ArrowRight, Building2, HeartHandshake, MapPin, Megaphone, Users } from "lucide-react";
import { Link } from "react-router-dom";

type SceneReturnProps = {
  sceneName?: string | null;
  sceneSlug?: string | null;
  venueName?: string | null;
};

const roleIcons = {
  participant: Users,
  creator: Megaphone,
  host: MapPin,
  brand: Building2,
} as const;

export function SceneReturn({ sceneName, sceneSlug, venueName }: SceneReturnProps) {
  const resolvedName = sceneName || (venueName ? `${venueName} Scene` : "the Scene around this Moment");
  const href = sceneSlug ? `/scenes/${sceneSlug}` : "/scenes";

  return (
    <section className="rounded-[2rem] border border-border/70 bg-card p-5 shadow-soft sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-primary">The Scene compounds the return</p>
          <h2 className="mt-2 font-serif text-3xl font-bold leading-tight text-foreground">One Moment ends. The relationships should not.</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {resolvedName} is the continuing network around the people, content, places, and partners who keep showing up. It turns one good night or action into familiar faces, stronger relationships, new invitations, and reasons to return.
          </p>
          <Link to={href} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
            Open the Scene <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div>
          <div className="mb-3 grid grid-cols-2 gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground sm:grid-cols-4">
            <span className="rounded-full bg-primary/8 px-3 py-2 text-center text-primary">Show up</span>
            <span className="rounded-full bg-primary/8 px-3 py-2 text-center text-primary">Become known</span>
            <span className="rounded-full bg-primary/8 px-3 py-2 text-center text-primary">Create return</span>
            <span className="rounded-full bg-primary/8 px-3 py-2 text-center text-primary">Grow together</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {SCENE_RETURN_CARDS.map(({ role, label, title, detail }) => {
              const Icon = roleIcons[role];
              return (
              <article key={label} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                </div>
                <h3 className="mt-3 text-sm font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
              </article>
              );
            })}
          </div>
          <div className="mt-3 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.06] p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-600">Shared return</p>
            <p className="mt-2 text-sm font-semibold text-foreground">{ACTIVATION_SUCCESS_LANGUAGE.sharedReturn}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Promorang should measure both without reducing people or culture to transactions.</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {ACTIVATION_REVIEW_NEXT_DECISIONS.map((decision) => (
                <span key={decision.id} title={decision.meaning} className="rounded-full border border-emerald-500/15 bg-background/60 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-emerald-700">
                  {decision.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

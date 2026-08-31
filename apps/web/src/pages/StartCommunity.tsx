import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { COMMUNITY_THEMES, REACH_CHANNELS } from "@promorang/shared";
import { useExperienceActions } from "@/hooks/usePeopleExperience";
import { ExperienceShell } from "@/components/people/ExperienceShell";
import { useToast } from "@/hooks/use-toast";

export default function StartCommunity() {
  const navigate = useNavigate();
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
      toast({ title: "Could not create that community", description: (error as Error).message, variant: "destructive" });
    }
  };

  if (created?.scene) {
    return (
      <ExperienceShell eyebrow="You’re in" title="Here’s something you can give your people.">
        <p className="text-sm text-white/55">{created.scene.title} is live. Don’t stop at the name.</p>
        <Link to="/give" className="block rounded-[1.6rem] bg-primary px-5 py-5 text-black">
          <p className="font-serif text-2xl font-bold">Give the first 50 a perk</p>
          <p className="mt-1 text-sm">A 2-for-1, free entry, or whatever you already have.</p>
        </Link>
        <Link to="/people" className="block rounded-[1.6rem] border border-white/10 px-5 py-5">
          <p className="font-serif text-2xl font-bold">Invite your people</p>
          <p className="mt-1 text-sm text-white/50">{created.firstValue?.invite?.shareUrl || "Copy your invite from My People."}</p>
        </Link>
        {created.firstValue?.opportunity ? (
          <Link to="/earn" className="block rounded-[1.6rem] border border-white/10 px-5 py-5">
            <p className="font-serif text-2xl font-bold">Take an opportunity</p>
            <p className="mt-1 text-sm text-white/50">{created.firstValue.opportunity.title}</p>
          </Link>
        ) : null}
        <button type="button" onClick={() => navigate(`/scenes/${created.scene.slug}`)} className="text-sm text-white/40">
          See the community
        </button>
      </ExperienceShell>
    );
  }

  return (
    <ExperienceShell
      eyebrow="Start"
      title="What is your community about?"
      description="Keep it short. You can give people something immediately after this."
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
            {item.label}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Where is your community?</span>
        <input value={location} onChange={(event) => setLocation(event.target.value)} className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4" />
      </label>

      <label className="block">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">What should we call it?</span>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Kingston Food Club" className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4" />
      </label>

      <section>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">How do you reach your people?</p>
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
        {start.isPending ? "Creating…" : "Create"}
      </button>
    </ExperienceShell>
  );
}

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CREATE_INTENTS, resolveCreateIntent } from "@promorang/shared";
import { useExperienceActions } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell } from "@/components/people/ExperienceShell";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { NextMoveStrip } from "@/components/journey/NextMoveStrip";
import { getMemberNextMove } from "@/lib/member-next-move";

export default function CreateSomething() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { ask } = useExperienceActions();
  const to = useExperiencePath();
  const { toast } = useToast();
  const { user } = useAuth();
  const selected = resolveCreateIntent(params.get("intent"));
  const nextMove = getMemberNextMove({ signedIn: Boolean(user), canCreate: Boolean(user) });
  const [question, setQuestion] = useState("");

  const submitAsk = async () => {
    try {
      await ask.mutateAsync({
        question,
        sceneId: params.get("hub") || undefined,
        category: "community",
      });
      toast({ title: "Asked", description: "Your people can answer this now." });
      navigate(to("/happened"));
    } catch (error) {
      toast({ title: "Could not ask that yet", description: (error as Error).message, variant: "destructive" });
    }
  };

  return (
    <ExperienceShell
      eyebrow="Create something"
      title="What do you want your people to do?"
      description="You choose the behaviour. PROMORANG picks the right tool underneath."
      backTo="/home"
    >
      <NextMoveStrip move={{ ...nextMove, href: "/create/moment" }} />
      <div className="grid gap-2">
        {CREATE_INTENTS.map((item) => (
          <Link
            key={item.intent}
            to={(() => {
              if (item.intent === "answer") return `${to("/create")}?intent=answer`;
              const [path, qs] = item.href.split("?");
              const stayInPeople = ["/give", "/people", "/create", "/earn", "/happened", "/card", "/start"].some(
                (prefix) => path === prefix || path.startsWith(`${prefix}/`),
              );
              const dest = stayInPeople ? to(path) : path;
              return qs ? `${dest}?${qs}` : dest;
            })()}
            className={`rounded-[1.5rem] border px-4 py-4 ${selected.intent === item.intent ? "border-primary bg-primary/15" : "border-white/10 bg-white/[0.04]"}`}
          >
            <p className="font-serif text-2xl font-bold">{item.label}</p>
            <p className="mt-1 text-sm text-white/50">{item.prompt}</p>
          </Link>
        ))}
      </div>

      {selected.intent === "answer" ? (
        <section className="space-y-3 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
          <h2 className="font-serif text-2xl font-bold">Ask your people</h2>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={4}
            placeholder="Where should we eat in Kingston this weekend?"
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
          />
          <button
            type="button"
            disabled={!question.trim() || ask.isPending}
            onClick={submitAsk}
            className="min-h-12 w-full rounded-full bg-primary text-sm font-black text-black disabled:opacity-60"
          >
            Ask them
          </button>
        </section>
      ) : null}
    </ExperienceShell>
  );
}

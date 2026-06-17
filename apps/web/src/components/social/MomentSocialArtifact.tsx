import { Link } from "react-router-dom";
import { Camera, CheckCircle2, MessageCircle, Share2, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShareButton } from "@/components/ShareButton";

type MomentSocialArtifactProps = {
  momentId: string;
  title: string;
  description?: string | null;
  participantCount: number;
  isJoined?: boolean;
  isCheckedIn?: boolean;
  isPast?: boolean;
  memoryHref?: string;
  checkInHref?: string;
};

export function MomentSocialArtifact({
  momentId,
  title,
  description,
  participantCount,
  isJoined = false,
  isCheckedIn = false,
  isPast = false,
  memoryHref,
  checkInHref,
}: MomentSocialArtifactProps) {
  const artifactState = isCheckedIn || isPast
    ? "I was there"
    : isJoined
      ? "I am going"
      : "Worth joining";

  const artifactCopy = isCheckedIn || isPast
    ? "This moment now has a social receipt: a Mark, a memory, proof, and a story you can carry forward."
    : isJoined
      ? "Your spot is part of the room now. Check in when you arrive to turn this into a Mark and memory."
      : "Every join helps the room take shape. If you show up, this can become part of your Promorang record.";

  return (
    <section className="overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-accent/10 shadow-soft">
      <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-primary/10 text-primary border border-primary/20">
              Moment Artifact
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {artifactState}
            </Badge>
          </div>

          <h2 className="mt-4 font-serif text-2xl font-bold text-foreground sm:text-3xl">
            This moment should leave something behind.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {artifactCopy}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {[
              { icon: CheckCircle2, label: "Mark", text: isCheckedIn ? "Verified" : "After check-in" },
              { icon: Camera, label: "Memory", text: isPast || isCheckedIn ? "Ready to capture" : "Unlocks later" },
              { icon: Users, label: "Crew proof", text: `${Math.max(participantCount, 0)} joined` },
              { icon: Share2, label: "Share object", text: artifactState },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <item.icon className="h-4 w-4 text-primary" />
                <p className="mt-3 text-sm font-semibold text-foreground">{item.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {checkInHref && isJoined && !isCheckedIn && !isPast ? (
              <Button asChild>
                <Link to={checkInHref}>
                  Leave your Mark
                  <Sparkles className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : null}
            {memoryHref && (isCheckedIn || isPast) ? (
              <Button asChild>
                <Link to={memoryHref}>
                  Open record
                  <Sparkles className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : null}
            <ShareButton
              title={`${artifactState}: ${title}`}
              description={description || "A Promorang moment worth showing up for."}
              url={typeof window !== "undefined" ? `${window.location.origin}/moments/${momentId}` : undefined}
            />
          </div>
        </div>

        <div className="border-t border-border/60 bg-background/60 p-5 sm:p-6 lg:border-l lg:border-t-0">
          <div className="rounded-3xl border border-border/60 bg-card p-5">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Social Signal</p>
            </div>
            <p className="mt-4 font-serif text-xl font-bold text-foreground">{title}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The goal is not just attendance. It is a visible receipt that says who showed up, what happened, what was earned, and why the next moment matters.
            </p>
            <div className="mt-5 flex -space-x-2">
              {Array.from({ length: Math.min(4, Math.max(3, participantCount || 0)) }).map((_, index) => (
                <div key={index} className="h-9 w-9 overflow-hidden rounded-full border-2 border-card bg-muted">
                  <img
                    src={`https://i.pravatar.cc/100?u=${momentId}-artifact-${index}`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-primary text-xs font-bold text-primary-foreground">
                +{Math.max(0, participantCount - 4)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

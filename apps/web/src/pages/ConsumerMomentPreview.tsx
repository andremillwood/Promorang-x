import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Share2, Users, CheckCircle2, Ticket, Sparkles } from "lucide-react";
import ConsumerShell from "@/components/consumer/ConsumerShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckIn, useJoinedMoments } from "@/hooks/useMoments";
import { useReferralCodes } from "@/hooks/useReferrals";

const formatDate = (value?: string | null) => {
  if (!value) return "Time TBA";
  try {
    return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
  } catch {
    return "Time TBA";
  }
};

export default function ConsumerMomentPreview() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const joined = useJoinedMoments();
  const checkIn = useCheckIn();
  const referrals = useReferralCodes();
  const [localPlanned, setLocalPlanned] = useState(false);

  const momentQuery = useQuery({
    queryKey: ["consumer-moment-preview", id],
    enabled: Boolean(id),
    queryFn: async () => {
      let query = supabase.from("moments").select("*");
      const isUuid = /^[0-9a-f-]{36}$/i.test(id || "");
      query = isUuid ? query.eq("id", id!) : query.eq("slug", id!);
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const moment = momentQuery.data;
  const isJoined = useMemo(() => (joined.data || []).some((m: any) => m.id === moment?.id), [joined.data, moment?.id]);
  const planned = isJoined || localPlanned;
  const displayName = (profile as any)?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";
  const initial = displayName.charAt(0).toUpperCase();
  const referralCode = referrals.data?.[0]?.code;

  const shareMoment = async () => {
    const url = `${window.location.origin}/moments/${moment?.slug || moment?.id}${referralCode ? `?ref=${encodeURIComponent(referralCode)}` : ""}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: moment?.title || "Promorang Moment", text: `Come check this out with me on Promorang.`, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(url);
  };

  if (momentQuery.isLoading) {
    return <ConsumerShell locationLabel="Kingston"><div className="py-20 text-sm text-muted-foreground">Loading Moment…</div></ConsumerShell>;
  }

  if (!moment) {
    return <ConsumerShell locationLabel="Kingston"><div className="py-20"><h1 className="font-serif text-4xl">Moment unavailable.</h1><a href="/discover" className="mt-4 inline-flex text-primary font-black">Back to Discover →</a></div></ConsumerShell>;
  }

  return (
    <ConsumerShell locationLabel="Kingston" actions={<div className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-xs font-black text-background">{initial}</div>}>
      <article className="pb-24 md:pb-12">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,.75fr)] lg:gap-12">
          <div>
            <div className="overflow-hidden bg-muted aspect-[16/10] md:aspect-[16/9]">
              {moment.image_url ? <img src={moment.image_url} alt={moment.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-muted-foreground">Promorang Moment</div>}
            </div>

            <div className="py-7 md:py-9">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">Moment · {moment.category || "Culture"}</p>
              <h1 className="mt-2 max-w-4xl font-serif text-5xl font-semibold leading-[0.92] tracking-[-0.05em] md:text-7xl">{moment.title}</h1>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />{formatDate(moment.starts_at)}</span>
                <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{moment.venue_name || moment.location || "Location TBA"}</span>
              </div>
              {moment.description ? <p className="mt-7 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">{moment.description}</p> : null}
            </div>

            <section className="border-y border-border py-7">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Why Promorang surfaced this</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div><strong className="block text-lg">Relevant</strong><span className="text-sm text-muted-foreground">Matches nightlife and live culture signals.</span></div>
                <div><strong className="block text-lg">Timely</strong><span className="text-sm text-muted-foreground">Happening soon enough to act on.</span></div>
                <div><strong className="block text-lg">Participatory</strong><span className="text-sm text-muted-foreground">Your action can unlock access and proof.</span></div>
              </div>
            </section>

            <section className="mt-10">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">The loop</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.04em] md:text-4xl">See it. Plan it. Bring people. Show up.</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-4">
                {["Signal interest", "Add to your plan", "Invite your crew", "Verify attendance"].map((label, index) => (
                  <div key={label} className="border-t border-border pt-4"><span className="text-[10px] font-black text-primary">0{index + 1}</span><strong className="mt-5 block text-sm">{label}</strong></div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <section className="border border-border bg-card p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Your move</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.04em]">{planned ? "This is on your radar." : "Worth moving for?"}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{planned ? "Promorang will keep this visible in your plans and event-day context." : "Signal intent now. You can still change your mind later."}</p>
              <div className="mt-5 grid gap-2">
                <button onClick={() => setLocalPlanned(true)} className="w-full bg-primary px-4 py-3 text-sm font-black text-primary-foreground">{planned ? "In your plan" : "I'm interested"}</button>
                <button onClick={shareMoment} className="inline-flex w-full items-center justify-center gap-2 border border-border bg-background px-4 py-3 text-sm font-black"><Share2 className="h-4 w-4" /> Invite your crew</button>
              </div>
            </section>

            <section className="border-t border-border pt-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Access</p>
              <div className="mt-3 flex items-start gap-3"><Ticket className="mt-1 h-5 w-5 text-primary" /><div><strong className="block">Member access may unlock here</strong><p className="mt-1 text-sm leading-6 text-muted-foreground">PromoKeys and perks should appear when eligibility is real—not as permanent clutter.</p></div></div>
            </section>

            <section className="border-t border-border pt-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Event day</p>
              <div className="mt-3 flex items-start gap-3"><Users className="mt-1 h-5 w-5 text-primary" /><div><strong className="block">When you're there, prove it.</strong><p className="mt-1 text-sm leading-6 text-muted-foreground">Check-in should become relevant only when attendance is plausible.</p></div></div>
              {isJoined && user ? <button onClick={() => checkIn.mutate(moment.id)} disabled={checkIn.isPending} className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-border bg-background px-4 py-3 text-sm font-black"><CheckCircle2 className="h-4 w-4" />{checkIn.isPending ? "Checking in…" : "Check in"}</button> : null}
            </section>

            <section className="border-t border-border pt-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Proof</p>
              <div className="mt-3 flex items-start gap-3"><Sparkles className="mt-1 h-5 w-5 text-primary" /><div><strong className="block">Participation should leave a trace.</strong><p className="mt-1 text-sm leading-6 text-muted-foreground">Verified attendance can feed Memories, Pieces, rewards and your cultural history.</p></div></div>
            </section>
          </aside>
        </section>
      </article>
    </ConsumerShell>
  );
}

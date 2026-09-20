import { useState } from "react";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bell, CheckCheck, Inbox, Loader2, Radio, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useMarkAllAsRead, useMarkAsRead, useNotifications } from "@/hooks/useNotifications";
import { getStakeholderLens } from "@promorang/shared";

function safeNotificationRoute(route?: string | null) {
  return route && route.startsWith("/") && !route.startsWith("//") ? route : null;
}

const Activity = () => {
  const { user, roles, activeRole } = useAuth();
  const primaryRole = activeRole || roles[0] || "participant";
  const lens = getStakeholderLens(primaryRole);
  const [filter, setFilter] = useState("all");
  const notifications = useNotifications();
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();

  const { data: events, isLoading, isError, refetch } = useQuery({
    queryKey: ["personalized-feed", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: feedData, error: feedError } = await supabase.rpc("fn_get_personalized_feed", {
        p_user_id: user.id,
        p_limit: 50,
        p_offset: 0,
      });
      if (feedError) throw feedError;
      return (feedData || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        event_type: item.activity_type,
        title: item.title,
        description: item.description,
        image_url: item.image_url,
        created_at: item.created_at,
        actor: { full_name: item.user_name, avatar_url: item.user_avatar },
        metadata: {
          likes_count: item.likes_count,
          comments_count: item.comments_count,
          source_id: item.source_id,
          source_table: item.source_table,
        },
      }));
    },
    enabled: !!user,
  });

  const filteredEvents = (events || []).filter((event) => {
    if (filter === "all") return true;
    if (filter === "proof") return ["reward", "check_in", "drop_completion", "redemption"].includes(event.event_type);
    if (filter === "social") return ["follow", "join", "comment", "reaction", "post"].includes(event.event_type);
    return true;
  });

  const inbox = notifications.data || [];
  const unread = inbox.filter((item) => !item.is_read);
  const watchUpdates = inbox.filter((item) => item.type === "market_watch_changed");
  const journeyUpdates = inbox.filter((item) => item.type !== "market_watch_changed");

  return (
    <main className="min-h-screen bg-[#090909] pb-20 text-white">
      <section className="border-b border-white/10 px-5 pb-10 pt-24 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 border-b border-primary/35 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary"><Radio className="h-3.5 w-3.5" /> Since you've been gone</div>
            <h1 className="mt-5 font-serif text-5xl font-bold leading-[.94] tracking-[-.05em] sm:text-7xl">What changed while you were away.</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">Updates on the things you’re watching live here, alongside activity from people and places around you.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-5 py-4"><p className="font-mono text-3xl font-black">{unread.length}</p><p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/35">Unread</p></div>
            <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-5 py-4"><p className="font-mono text-3xl font-black">{watchUpdates.length}</p><p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/35">Watch updates</p></div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-5 py-10 sm:px-8">
        <section>
          <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Updates for you</p>
              <h2 className="mt-2 font-serif text-4xl font-bold tracking-[-.04em]">The things you care about, moving.</h2>
            </div>
            {unread.length ? <button type="button" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-xs font-bold text-white/65"><CheckCheck className="h-4 w-4" />Mark all read</button> : null}
          </div>

          {notifications.isLoading ? (
            <div className="flex items-center gap-3 py-8 text-sm text-white/40"><Loader2 className="h-4 w-4 animate-spin text-primary" />Loading updates…</div>
          ) : inbox.length ? (
            <div className="divide-y divide-white/10 border-y border-white/10">
              {inbox.slice(0, 20).map((item) => {
                const route = safeNotificationRoute(item.route);
                const row = (
                  <div className="grid gap-3 py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                    <div className={`grid h-10 w-10 place-items-center rounded-full border ${item.type === "market_watch_changed" ? "border-primary/30 bg-primary/10" : "border-white/10 bg-white/[0.03]"}`}><Bell className={`h-4 w-4 ${item.type === "market_watch_changed" ? "text-primary" : "text-white/45"}`} /></div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><p className="font-serif text-xl font-bold text-white">{item.title}</p>{!item.is_read ? <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-black">New</span> : null}</div>
                      {item.message ? <p className="mt-1 text-sm leading-6 text-white/45">{item.message}</p> : null}
                      <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-white/25">{item.type === "market_watch_changed" ? "Something you’re watching" : item.type.replace(/_/g, " ")} · {new Date(item.created_at).toLocaleString()}</p>
                    </div>
                    {route ? <span className="inline-flex items-center gap-1 text-xs font-black text-primary">Open <ArrowRight className="h-3.5 w-3.5" /></span> : null}
                  </div>
                );
                return route ? <Link key={item.id} to={route} onClick={() => { if (!item.is_read) markRead.mutate(item.id); }} className="block transition hover:bg-white/[0.02]">{row}</Link> : <button key={item.id} type="button" onClick={() => { if (!item.is_read) markRead.mutate(item.id); }} className="block w-full text-left">{row}</button>;
              })}
            </div>
          ) : (
            <div className="rounded-[1.6rem] border border-dashed border-white/10 p-7">
              <Inbox className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-serif text-2xl font-bold">Nothing new yet.</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">Watch a Discovery, something people want, or a Moment and keep it close on your PromoCard. When something changes, you’ll see it here.</p>
              <Link to="/discover" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">Find something to watch <ArrowRight className="h-4 w-4" /></Link>
            </div>
          )}

          {watchUpdates.length || journeyUpdates.length ? <p className="mt-3 text-[11px] leading-5 text-white/30">Not every saved thing sends an alert, but the updates PROMORANG has for you will live here.</p> : null}
        </section>

        <section>
          <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Broader activity</p><h2 className="mt-2 font-serif text-4xl font-bold tracking-[-.04em]">People + activity around you.</h2></div>
            <div className="flex gap-2">{["all", "social", "proof"].map((value) => <button key={value} type="button" onClick={() => setFilter(value)} className={`min-h-9 rounded-full border px-4 text-xs font-bold capitalize ${filter === value ? "border-primary bg-primary text-black" : "border-white/10 text-white/50"}`}>{value === "proof" ? "actions" : value}</button>)}</div>
          </div>

          <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#111]">
            {isLoading ? (
              <div className="flex items-center justify-center gap-3 py-20 text-sm text-white/40"><Loader2 className="h-5 w-5 animate-spin text-primary" />Loading activity…</div>
            ) : isError ? (
              <div role="alert" className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-8 text-center">
                <Bell className="h-7 w-7 text-amber-300" />
                <h3 className="font-serif text-3xl font-bold">Activity is unavailable.</h3>
                <p className="max-w-lg text-sm leading-6 text-white/45">We couldn’t load activity right now. Try again in a moment.</p>
                <Button type="button" variant="outline" onClick={() => void refetch()}>Try again</Button>
              </div>
            ) : filteredEvents.length ? (
              <div className="p-3 sm:p-5"><ActivityFeed events={filteredEvents} /></div>
            ) : (
              <div className="grid min-h-[300px] place-items-center p-8 text-center">
                <div className="max-w-lg"><Sparkles className="mx-auto h-7 w-7 text-primary" /><h3 className="mt-4 font-serif text-3xl font-bold">Nothing else to show right now.</h3><p className="mt-3 text-sm leading-6 text-white/45">There’s no new activity here yet. Go find something worth following.</p><Button asChild className="mt-5 rounded-full bg-primary font-black text-black"><Link to={lens.putIn.href}>{lens.putIn.label} <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Activity;

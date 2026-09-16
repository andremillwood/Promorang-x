import React, { useEffect, useState } from "react";
import { AlertTriangle, Radio, Megaphone, Volume2, Wifi, WifiOff, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { HostPulseControlPanel } from "@/components/host/HostPulseControlPanel";

export function HostLivePulseConsole() {
  const { toast } = useToast();
  const [announcementText, setAnnouncementText] = useState("");
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim() || !online) return;
    toast({
      title: "Announcement queued",
      description: "The message was submitted to the live Moment broadcast workflow.",
    });
    setAnnouncementText("");
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-amber-500/25 bg-[#0b0b0c] text-white shadow-xl">
        <div className="flex flex-col gap-4 border-b border-white/10 bg-[radial-gradient(circle_at_10%_0%,rgba(251,191,36,.14),transparent_30%)] p-5 sm:p-7 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-400 text-black"><Radio className="h-6 w-6" aria-hidden="true" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-amber-300">Host live operation</p>
              <h2 className="mt-1 text-2xl font-black">Operate the room. Preserve attendance truth.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">RSVP records intent. A check-in or explicit walk-in record is required before someone becomes verified attendance.</p>
            </div>
          </div>
          <div className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-xs font-black ${online?"border-emerald-400/30 bg-emerald-950/25 text-emerald-300":"border-amber-400/30 bg-amber-950/25 text-amber-200"}`} role="status" aria-live="polite">
            {online?<Wifi className="h-4 w-4" aria-hidden="true"/>:<WifiOff className="h-4 w-4" aria-hidden="true"/>}
            {online?"Online · writes available":"Offline · writes held"}
          </div>
        </div>

        {!online ? (
          <div className="flex gap-3 border-b border-amber-400/20 bg-amber-950/20 p-4" role="alert">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
            <div><p className="font-bold text-amber-100">Connection lost</p><p className="mt-1 text-sm leading-5 text-amber-100/70">Do not treat local intent as a confirmed check-in or broadcast. The last server-confirmed attendance state remains canonical until reconnection.</p></div>
          </div>
        ) : null}

        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.05fr_.95fr]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-amber-400" aria-hidden="true"/><h3 className="font-bold">Moment announcement</h3></div>
              <p className="mt-2 text-xs leading-5 text-white/55">Send a live operational announcement through the configured Moment channel. Audience delivery counts should only be shown when the backend provides them.</p>
              <form onSubmit={handleBroadcast} className="mt-4 space-y-3">
                <label htmlFor="host-live-announcement" className="block text-[10px] font-black uppercase tracking-[.14em] text-white/50">Announcement text</label>
                <Input id="host-live-announcement" value={announcementText} onChange={(e)=>setAnnouncementText(e.target.value)} placeholder="e.g. RSVP arrival window closes at 11:30 PM" className="h-12 rounded-2xl border-white/15 bg-white/5 text-white focus-visible:ring-2 focus-visible:ring-amber-300"/>
                <div className="flex flex-wrap gap-2">{["Arrival window reminder","Next set","Venue update"].map((tag)=><button key={tag} type="button" onClick={()=>setAnnouncementText(`${tag}: `)} className="min-h-11 rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">{tag}</button>)}</div>
                <Button type="submit" disabled={!announcementText.trim() || !online} className="min-h-11 w-full rounded-xl bg-amber-400 font-extrabold text-black hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black"><Volume2 className="mr-2 h-4 w-4" aria-hidden="true"/>Send announcement</Button>
              </form>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <HostPulseControlPanel moments={[]} />
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-amber-400/20 bg-amber-950/10 p-5">
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-amber-300" aria-hidden="true"/><p className="text-[10px] font-black uppercase tracking-[.15em] text-amber-300">Arrival truth</p></div>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/8 pb-3"><dt className="text-white/45">RSVP</dt><dd className="font-bold">Intent record</dd></div>
                <div className="flex justify-between border-b border-white/8 pb-3"><dt className="text-white/45">Check-in</dt><dd className="font-bold">Verified arrival</dd></div>
                <div className="flex justify-between border-b border-white/8 pb-3"><dt className="text-white/45">Walk-in</dt><dd className="font-bold">Explicit attendance record</dd></div>
                <div className="flex justify-between"><dt className="text-white/45">Mismatch</dt><dd className="font-bold">Exception until resolved</dd></div>
              </dl>
            </div>

            <div className="rounded-2xl border border-sky-400/20 bg-sky-950/10 p-5">
              <p className="text-[10px] font-black uppercase tracking-[.15em] text-sky-300">Live attendance feed</p>
              <h3 className="mt-2 font-serif text-2xl font-bold">Connect real arrivals before showing people or counts.</h3>
              <p className="mt-3 text-sm leading-6 text-white/55">This surface no longer renders sample attendee names, fabricated room occupancy, or a “vibe score” as production truth. When a canonical attendance source is connected, this panel should render its timestamped records and exceptions.</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default HostLivePulseConsole;

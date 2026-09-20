import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, Building2, Camera, MapPin, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

type VenueReport = {
  venueName: string | null;
  location: string | null;
  momentTitle: string;
  participationRecords: number;
  mediaRecords: number;
};

export default function VenueReportTeaser() {
  const { id } = useParams<{ id: string }>();
  const reportQuery = useQuery({
    queryKey: ["venue-teaser-report", id],
    queryFn: async (): Promise<VenueReport | null> => {
      if (!id) return null;

      const { data: moment, error: momentError } = await supabase
        .from("moments")
        .select("venue_name, location, title")
        .eq("id", id)
        .maybeSingle();
      if (momentError) throw momentError;
      if (!moment) return null;

      const [participationResult, mediaResult] = await Promise.all([
        supabase.from("moment_participants").select("*", { count: "exact", head: true }).eq("moment_id", id),
        supabase.from("moment_media").select("*", { count: "exact", head: true }).eq("moment_id", id),
      ]);
      if (participationResult.error) throw participationResult.error;
      if (mediaResult.error) throw mediaResult.error;

      return {
        venueName: moment.venue_name,
        location: moment.location,
        momentTitle: moment.title,
        participationRecords: participationResult.count ?? 0,
        mediaRecords: mediaResult.count ?? 0,
      };
    },
    enabled: Boolean(id),
    retry: 1,
  });

  if (reportQuery.isLoading) {
    return <div className="min-h-screen bg-background px-6 pb-12 pt-24"><div className="mx-auto max-w-3xl space-y-6"><Skeleton className="h-64 w-full rounded-3xl" /><Skeleton className="h-40 w-full" /></div></div>;
  }

  if (reportQuery.isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-24">
        <SEO title="Venue activity unavailable" description="This venue activity report is temporarily unavailable." />
        <section className="max-w-xl rounded-3xl border border-border bg-card p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-primary" />
          <h1 className="mt-5 font-serif text-3xl font-bold">This report is unavailable.</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">PROMORANG could not verify the source record, so no activity totals are being substituted. Try again shortly.</p>
          <Button className="mt-6" variant="outline" onClick={() => reportQuery.refetch()}>Try again</Button>
        </section>
      </main>
    );
  }

  const report = reportQuery.data;
  if (!report) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-24">
        <SEO title="Venue activity not found" description="No recorded Moment was found for this venue activity report." />
        <section className="max-w-xl rounded-3xl border border-border bg-card p-8 text-center">
          <Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
          <h1 className="mt-5 font-serif text-3xl font-bold">No recorded report found.</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">This link does not match a recorded Moment. Demo events and estimated engagement are not used as a fallback.</p>
          <Button asChild className="mt-6" variant="outline"><Link to="/discover/venues">Explore recorded venues</Link></Button>
        </section>
      </main>
    );
  }

  const venueLabel = report.venueName || "Venue not recorded";
  const claimHref = `/for-merchants?claimVenue=${encodeURIComponent(report.venueName || "")}&momentId=${encodeURIComponent(id || "")}`;

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`Venue activity: ${venueLabel}`} description="Recorded participation and media activity for a PROMORANG Moment." />
      <header className="relative overflow-hidden border-b border-white/10 bg-charcoal pb-20 pt-32 text-cream">
        <div className="pointer-events-none absolute inset-0 opacity-20"><div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary blur-[100px]" /></div>
        <div className="container relative z-10 px-6"><div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Recorded Moment activity</p>
          <h1 className="mt-5 font-serif text-4xl font-bold md:text-5xl">{venueLabel}</h1>
          {report.location ? <p className="mt-3 flex items-center justify-center gap-2 text-sm text-white/60"><MapPin className="h-4 w-4" />{report.location}</p> : <p className="mt-3 text-sm text-white/45">Location not recorded</p>}
        </div></div>
      </header>

      <main className="container relative z-20 -mt-10 px-6 py-12">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-xl">
          <section className="border-b border-border p-8 text-center md:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Source-backed activity</p>
            <h2 className="mt-3 text-2xl font-bold">{report.momentTitle}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">These totals reflect recorded platform rows. Participation records are not automatically verified attendance, and media records are not a sentiment or conversion claim.</p>
          </section>
          <section className="grid grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Users className="h-6 w-6" /></div>
              <h3 className="mt-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">Participation records</h3>
              <p className="mt-2 text-5xl font-black text-foreground">{report.participationRecords}</p>
              <p className="mt-3 text-xs text-muted-foreground">Recorded joins or participant rows; not proof of attendance.</p>
            </div>
            <div className="p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"><Camera className="h-6 w-6" /></div>
              <h3 className="mt-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">Media records</h3>
              <p className="mt-2 text-5xl font-black text-foreground">{report.mediaRecords}</p>
              <p className="mt-3 text-xs text-muted-foreground">Recorded Moment media only; no estimated photos are added.</p>
            </div>
          </section>
          <section className="border-t border-border bg-charcoal p-8 text-center text-white md:p-12">
            <h2 className="font-serif text-2xl">Operate this venue with recorded data.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/55">Continue to the merchant path to verify ownership and manage a venue. Claim status, attendance, customer intent, and performance remain separate records.</p>
            <Button variant="hero" size="xl" className="mt-7 h-16 px-10 text-lg" asChild><Link to={claimHref}>Continue as a merchant<ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
          </section>
        </div>
      </main>
    </div>
  );
}

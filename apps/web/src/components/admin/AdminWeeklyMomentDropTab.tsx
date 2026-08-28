import { CalendarDays, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWeeklyMomentDrop } from "@/hooks/useWeeklyMomentDrop";

function jamaicaDate(value: string) {
  return new Intl.DateTimeFormat("en-JM", {
    timeZone: "America/Jamaica",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function AdminWeeklyMomentDropTab() {
  const { data, isLoading } = useWeeklyMomentDrop();
  const items = data?.items || [];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[.2em] text-primary">Weekly Moment agent</p>
        <h2 className="mt-2 font-serif text-3xl font-bold">90-day calendar drop</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Mondays publish dated events whose calendar date is within 90 days, then announce the new ones on Explore.
        </p>
      </div>

      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : !data?.drop ? (
        <p className="text-sm text-muted-foreground">No weekly drop has run yet. The Monday job or `/api/cron/weekly-moments` will create the first one.</p>
      ) : (
        <div className="space-y-4">
          <article className="rounded-3xl border bg-card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold">{data.drop.title}</h3>
              <Badge variant="outline">Week of {jamaicaDate(data.drop.week_start)}</Badge>
            </div>
            <pre className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{data.drop.announcement}</pre>
            <p className="mt-4 text-xs text-muted-foreground">
              Published {data.drop.published_count} · Announced {data.drop.announced_count} · Horizon through {jamaicaDate(data.drop.horizon_ends_on)}
            </p>
          </article>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {jamaicaDate(item.starts_at)} · {item.city || item.location}
                  </p>
                </div>
                <Badge>{item.role === "new_this_week" ? "New this week" : "90-day horizon"}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

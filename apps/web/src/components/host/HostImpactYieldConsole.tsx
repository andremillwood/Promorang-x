import { currentUiLocale } from "@/i18n/geo-locale";
import { useHostedMoments } from "@/hooks/useMoments";
import { useRoleSuccessProgress } from "@/hooks/useRoleSuccessProgress";
import { Button } from "@/components/ui/button";

export function HostImpactYieldConsole() {
  const moments = useHostedMoments();
  const progress = useRoleSuccessProgress("host");
  const unavailable = moments.isError || progress.isError;
  const count = (value: number | undefined, pending: boolean) => pending ? "—" : Number(value || 0).toLocaleString(currentUiLocale());

  return (
    <section className="min-w-0 space-y-5">
      <header>
        <h2 className="font-sans text-2xl font-semibold tracking-tight">Event results</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Recorded events and verified participation. Use the participation target to track progress toward your next milestone.</p>
      </header>
      {unavailable ? <div role="alert" className="rounded-sm border border-destructive/30 p-4 text-sm"><p>Some event results could not be loaded.</p><Button variant="outline" className="mt-3" disabled={moments.isFetching || progress.isFetching} onClick={() => void Promise.allSettled([moments.refetch(), progress.refetch()])}>Try again</Button></div> : null}
      <dl className="grid gap-3 sm:grid-cols-3" aria-busy={moments.isLoading || progress.isLoading}>
        {[
          ["Recorded events", count(moments.data?.length, moments.isLoading || moments.isError)],
          ["Verified participants", count(progress.data?.current, progress.isLoading || progress.isError)],
          ["Participation target", progress.isLoading || progress.isError || !progress.data?.target ? "—" : progress.data.target.toLocaleString(currentUiLocale())],
        ].map(([label, value]) => <div key={label} className="min-w-0 rounded-sm  bg-card p-5"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="mt-3 break-words text-3xl font-semibold tabular-nums">{value}</dd></div>)}
      </dl>
      <p className="text-sm leading-6 text-muted-foreground">{progress.data?.sourceLabel || "Participation reflects verified records. Repeat attendance and financial return are not measured here."}</p>
    </section>
  );
}

export default HostImpactYieldConsole;

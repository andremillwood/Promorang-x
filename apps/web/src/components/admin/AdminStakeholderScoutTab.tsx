import { useEffect, useState } from "react";
import { Copy, Loader2, RefreshCw, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  approveScoutCandidate,
  draftScoutInvite,
  ingestScoutCatalog,
  listScoutQueue,
  nominateScoutCandidate,
  recordScoutHumanSend,
  rejectScoutCandidate,
  suppressScoutCandidate,
  type ScoutCandidate,
} from "@/lib/stakeholder-scout";

const HUBS = ["all", "kingston", "montego-bay"];
const STATUSES = ["queued", "watch", "approved", "invite_ready", "sent_by_human", "rejected", "suppressed", "all"];

export function AdminStakeholderScoutTab() {
  const [hub, setHub] = useState("kingston");
  const [status, setStatus] = useState("queued");
  const [rows, setRows] = useState<ScoutCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
  const [note, setNote] = useState("");
  const [nomination, setNomination] = useState({
    displayName: "",
    kind: "venue",
    hubId: "kingston",
    job: "",
    sourceName: "",
    sourceUrl: "",
  });

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listScoutQueue({ hub, status });
      setRows(data.candidates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the scout queue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [hub, status]);

  async function run(id: string, action: () => Promise<unknown>) {
    setBusy(id);
    setError(null);
    try {
      await action();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[.2em] text-primary">Stakeholder scout</p>
        <h2 className="mt-2 font-serif text-3xl font-bold">Research, score, and queue. Never auto-send.</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          The agent finds restaurants, stores, brands, and products that fit a live hub and a dated Moment.
          A steward approves the shortlist, copies a claim-page invite, then walks it in or records a human send.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {HUBS.map((value) => (
          <Button key={value} size="sm" variant={hub === value ? "default" : "outline"} onClick={() => setHub(value)}>
            {value}
          </Button>
        ))}
        <span className="mx-2 h-4 w-px bg-border" />
        {STATUSES.map((value) => (
          <Button key={value} size="sm" variant={status === value ? "default" : "outline"} onClick={() => setStatus(value)}>
            {value.replace("_", " ")}
          </Button>
        ))}
        <Button size="sm" variant="outline" onClick={refresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button
          size="sm"
          onClick={() => run("ingest", () => ingestScoutCatalog())}
          disabled={busy === "ingest"}
        >
          {busy === "ingest" ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
          Score founding catalog
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading ? (
        <Loader2 className="animate-spin" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing in this queue yet. Score the founding Kingston catalog after the weekly Moment drop, or nominate one place.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <article key={row.id} className="rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold">{row.display_name}</h3>
                    <Badge variant="outline">{row.kind}</Badge>
                    <Badge>{row.status.replace("_", " ")}</Badge>
                    <Badge variant="outline">{row.score}/100</Badge>
                    <Badge variant="outline">{row.preferred_channel.replace("_", " ")}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {row.job || "Needs a concrete Moment job"}
                    {row.moment_title ? ` · ${row.moment_title}` : ""}
                    {row.neighborhood ? ` · ${row.neighborhood}` : ""}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {(row.reasons || []).join(" · ") || (row.blockers || []).join(" · ")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {row.status === "queued" || row.status === "watch" ? (
                    <>
                      <Button size="sm" disabled={busy === row.id} onClick={() => run(row.id, () => approveScoutCandidate(row.id, note))}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy === row.id} onClick={() => run(row.id, () => rejectScoutCandidate(row.id, note))}>
                        Reject
                      </Button>
                    </>
                  ) : null}
                  {row.status === "approved" || row.status === "invite_ready" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy === row.id}
                      onClick={() => run(row.id, async () => {
                        const result = await draftScoutInvite(row.id);
                        setDraft({ subject: result.draft.subject, body: result.draft.body });
                      })}
                    >
                      Draft invite
                    </Button>
                  ) : null}
                  {row.status === "invite_ready" ? (
                    <Button
                      size="sm"
                      disabled={busy === row.id}
                      onClick={() => run(row.id, () => recordScoutHumanSend(row.id, row.preferred_channel, note))}
                    >
                      I walked this in
                    </Button>
                  ) : null}
                  {row.status !== "suppressed" && row.status !== "sent_by_human" ? (
                    <Button size="sm" variant="ghost" disabled={busy === row.id} onClick={() => run(row.id, () => suppressScoutCandidate(row.id, note))}>
                      Do not contact
                    </Button>
                  ) : null}
                </div>
              </div>
              {row.invite_body ? (
                <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-muted/40 p-4 text-sm leading-6">{row.invite_body}</pre>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {draft ? (
        <article className="rounded-2xl border p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold">Invite draft — copy only. There is no send.</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}`)}
            >
              <Copy className="mr-2 h-3.5 w-3.5" />
              Copy draft
            </Button>
          </div>
          <p className="mt-2 text-sm font-medium">{draft.subject}</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{draft.body}</pre>
        </article>
      ) : null}

      <article className="rounded-2xl border p-5">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" />
          <h3 className="font-bold">Nominate one place</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Steward nominations land on watch. A second person still has to approve before any draft is copied.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Place, brand, or product name"
            value={nomination.displayName}
            onChange={(event) => setNomination((current) => ({ ...current, displayName: event.target.value }))}
          />
          <Input
            placeholder="Concrete job — e.g. dessert stop"
            value={nomination.job}
            onChange={(event) => setNomination((current) => ({ ...current, job: event.target.value }))}
          />
          <Input
            placeholder="Public source name"
            value={nomination.sourceName}
            onChange={(event) => setNomination((current) => ({ ...current, sourceName: event.target.value }))}
          />
          <Input
            placeholder="Public source URL"
            value={nomination.sourceUrl}
            onChange={(event) => setNomination((current) => ({ ...current, sourceUrl: event.target.value }))}
          />
        </div>
        <Textarea
          className="mt-3"
          placeholder="Optional steward note. Do not paste harvested email lists."
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {(["venue", "merchant", "brand", "product"] as const).map((kind) => (
            <Button key={kind} size="sm" variant={nomination.kind === kind ? "default" : "outline"} onClick={() => setNomination((current) => ({ ...current, kind }))}>
              {kind}
            </Button>
          ))}
          <Button
            disabled={busy === "nominate"}
            onClick={() => run("nominate", () => nominateScoutCandidate(nomination))}
          >
            Add to watch list
          </Button>
        </div>
      </article>
    </section>
  );
}

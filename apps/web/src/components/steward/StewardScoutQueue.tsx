import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  approveScoutCandidate,
  listScoutQueue,
  rejectScoutCandidate,
  type ScoutCandidate,
} from "@/lib/stakeholder-scout";

export function StewardScoutQueue({ hubId = "kingston" }: { hubId?: string }) {
  const [rows, setRows] = useState<ScoutCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listScoutQueue({ hub: hubId, status: "queued" });
      setRows(data.candidates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Queue unavailable");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [hubId]);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300">Steward shortlist</p>
          <h2 className="mt-1 text-xl font-bold text-white">This week’s places to invite</h2>
          <p className="mt-1 max-w-xl text-xs text-slate-400">
            Approve only if you can walk the invite in or already know the owner. The agent does not email anyone.
          </p>
        </div>
        <Badge className="bg-amber-500/20 text-amber-200 border-amber-500/30">Cap 10 / hub</Badge>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking the queue…
        </div>
      ) : error ? (
        <p className="mt-6 text-sm text-slate-400">
          {error}. Admins score the catalog from <span className="text-amber-200">/admin?tab=scout</span>.
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">No queued invites for this hub. Score the founding catalog after the Monday drop.</p>
      ) : (
        <div className="mt-5 divide-y divide-slate-800">
          {rows.map((row) => (
            <div key={row.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-white">{row.display_name}</p>
                  <Badge variant="outline" className="border-slate-700 text-slate-300">{row.kind}</Badge>
                  <Badge variant="outline" className="border-slate-700 text-slate-300">{row.score}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {row.job} {row.moment_title ? `· ${row.moment_title}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                  disabled={busy === row.id}
                  onClick={async () => {
                    setBusy(row.id);
                    try {
                      await approveScoutCandidate(row.id);
                      await refresh();
                    } finally {
                      setBusy(null);
                    }
                  }}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-700 text-slate-200"
                  disabled={busy === row.id}
                  onClick={async () => {
                    setBusy(row.id);
                    try {
                      await rejectScoutCandidate(row.id);
                      await refresh();
                    } finally {
                      setBusy(null);
                    }
                  }}
                >
                  Pass
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

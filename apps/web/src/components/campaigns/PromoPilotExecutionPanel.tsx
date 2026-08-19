import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Check, CircleDashed, Loader2, Play, RotateCcw, ShieldCheck, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePromoPilotExecution, type PromoPilotExecutionJob } from "@/hooks/usePromoPilotExecution";
import { toast } from "sonner";

const statusTone: Record<string, string> = {
  blocked: "bg-red-100 text-red-800",
  ready: "bg-emerald-100 text-emerald-800",
  queued: "bg-blue-100 text-blue-800",
  running: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-700 text-white",
  failed: "bg-red-700 text-white",
  draft: "bg-black/10 text-black/55",
};

const groups = [
  { id: "distribution", label: "Reach" },
  { id: "fulfillment", label: "Fulfillment" },
  { id: "value", label: "Shared value" },
  { id: "relationship", label: "Return" },
  { id: "measurement", label: "Impact" },
] as const;

export function PromoPilotExecutionPanel({ campaignId }: { campaignId: string }) {
  const { manifest, prepare, launch, process, retryJob } = usePromoPilotExecution(campaignId);
  const [confirming, setConfirming] = useState(false);
  const data = manifest.data;
  const jobs = data?.jobs || [];
  const requiredBlocked = jobs.some((job) => job.required && job.status === "blocked");
  const launchable = jobs.length > 0 && !requiredBlocked && jobs.some((job) => job.status === "ready");
  const processable = jobs.some((job) => job.status === "queued");

  const handlePrepare = async () => {
    try {
      await prepare.mutateAsync();
      toast.success("PromoPilot prepared the execution manifest.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "PromoPilot could not prepare the campaign.");
    }
  };

  const handleLaunch = async () => {
    try {
      await launch.mutateAsync();
      setConfirming(false);
      toast.success("Launch jobs are queued. PromoPilot will report each system separately.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "PromoPilot could not queue launch.");
    }
  };

  const handleProcess = async () => {
    try {
      await process.mutateAsync();
      toast.success("PromoPilot processed the queued systems and exposed anything still waiting.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "PromoPilot could not process queued work.");
    }
  };

  return (
    <section className="mt-10 overflow-hidden border border-black/15 bg-[#faf7f0]" aria-labelledby="promopilot-execution-title">
      <header className="grid gap-6 border-b border-black/15 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#d85b24]">PromoPilot execution</p>
          <h2 id="promopilot-execution-title" className="mt-3 text-4xl font-black leading-[.95] tracking-[-.045em]">See every system before it moves.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-black/50">Prepare creates an auditable manifest. Queueing launch requires a second explicit action and never hides blocked work.</p>
        </div>
        <div className="grid grid-cols-3 gap-px bg-black/10 text-center">
          {[['Ready', data?.summary.ready || 0], ['Blocked', data?.summary.blocked || 0], ['Queued', data?.summary.queued || 0]].map(([label, value]) => <div key={String(label)} className="bg-[#f2eee5] px-3 py-4"><p className="text-2xl font-black">{value}</p><p className="text-[9px] font-black uppercase tracking-wider text-black/40">{label}</p></div>)}
        </div>
      </header>

      {manifest.isLoading ? <div className="flex items-center gap-3 p-8 text-sm text-black/50"><Loader2 className="h-4 w-4 animate-spin" />Loading PromoPilot execution…</div> : jobs.length === 0 ? (
        <div className="grid gap-7 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
          <div><CircleDashed className="h-7 w-7 text-[#d85b24]" /><h3 className="mt-4 text-2xl font-black">The campaign has a plan, but no execution manifest yet.</h3><p className="mt-3 max-w-2xl text-sm leading-6 text-black/50">PromoPilot will translate selected channels, shared value, proof, reviews, referrals, and Impact measurement into separate jobs.</p></div>
          <Button onClick={handlePrepare} disabled={prepare.isPending} className="h-14 rounded-full bg-[#191816] font-black text-white hover:bg-[#d85b24]">{prepare.isPending ? "Preparing…" : "Prepare execution"}<ArrowRight className="ml-2 h-4 w-4" /></Button>
        </div>
      ) : (
        <div>
          <div className="divide-y divide-black/10">
            {groups.map((group) => {
              const groupJobs = jobs.filter((job) => job.job_type === group.id);
              if (!groupJobs.length) return null;
              return <div key={group.id} className="grid gap-4 p-7 sm:p-10 lg:grid-cols-[150px_minmax(0,1fr)]"><p className="text-[10px] font-black uppercase tracking-[.2em] text-black/35">{group.label}</p><div className="grid gap-2">{groupJobs.map((job) => <JobRow key={job.id} job={job} retrying={retryJob.isPending} onRetry={() => retryJob.mutate(job.id)} />)}</div></div>;
            })}
          </div>

          <footer className="flex flex-col gap-5 border-t border-black/15 bg-[#191816] p-7 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>{requiredBlocked ? <p className="flex items-center gap-2 text-sm font-bold text-red-300"><AlertTriangle className="h-4 w-4" />Resolve required blockers before launch.</p> : <p className="flex items-center gap-2 text-sm font-bold text-emerald-300"><ShieldCheck className="h-4 w-4" />Required execution jobs are ready.</p>}<p className="mt-2 text-xs text-white/40">Preparing again safely refreshes non-running jobs from the latest plan.</p></div>
            <div className="flex flex-col gap-3 sm:flex-row"><Button onClick={handlePrepare} disabled={prepare.isPending} variant="outline" className="h-12 rounded-full border-white/20 bg-transparent px-5 text-white hover:bg-white/10"><RotateCcw className="mr-2 h-4 w-4" />Refresh manifest</Button>{processable && <Button onClick={handleProcess} disabled={process.isPending} className="h-12 rounded-full bg-white px-5 font-black text-black hover:bg-orange-100"><Workflow className="mr-2 h-4 w-4" />{process.isPending ? "Processing…" : "Process queue"}</Button>}<Button onClick={() => setConfirming(true)} disabled={!launchable} className="h-12 rounded-full bg-[#d85b24] px-6 font-black text-white hover:bg-[#ba4618]"><Play className="mr-2 h-4 w-4" />Review launch</Button></div>
          </footer>
        </div>
      )}

      <AnimatePresence>
        {confirming && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="launch-confirm-title"><motion.div initial={{ y: 30 }} animate={{ y: 0 }} exit={{ y: 30 }} className="w-full max-w-xl bg-[#f2eee5] p-7 text-[#191816] shadow-2xl sm:p-9"><p className="text-[10px] font-black uppercase tracking-[.22em] text-[#d85b24]">Explicit confirmation</p><h2 id="launch-confirm-title" className="mt-3 text-3xl font-black">Queue {data?.summary.ready || 0} ready execution jobs?</h2><p className="mt-4 text-sm leading-6 text-black/55">This marks the PromoPilot plan active and queues each ready system independently. Blocked optional jobs remain blocked. Payments, external messages, Pieces, and public publishing must still succeed in their authoritative systems.</p><div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button variant="outline" onClick={() => setConfirming(false)} className="h-12 rounded-full border-black/20 bg-transparent">Not yet</Button><Button onClick={handleLaunch} disabled={launch.isPending} className="h-12 rounded-full bg-[#d85b24] px-6 font-black text-white">{launch.isPending ? "Queueing…" : "Confirm and queue"}</Button></div></motion.div></motion.div>}
      </AnimatePresence>
    </section>
  );
}

function JobRow({ job, retrying, onRetry }: { job: PromoPilotExecutionJob; retrying: boolean; onRetry: () => void }) {
  const waitingFor = typeof job.result?.waiting_for === "string" ? job.result.waiting_for.replaceAll("_", " ") : null;
  const publicPath = typeof job.result?.public_path === "string" ? job.result.public_path : null;
  return <article className="flex flex-col gap-3 border border-black/10 bg-white/45 p-4 sm:flex-row sm:items-center"><span className={`w-fit rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${statusTone[job.status] || statusTone.draft}`}>{job.status}</span><div className="min-w-0 flex-1"><p className="text-sm font-black">{job.label}</p>{job.blocker && <p className="mt-1 text-xs text-red-700">{job.blocker}</p>}{waitingFor && <p className="mt-1 text-xs text-amber-700">Waiting for {waitingFor}</p>}{publicPath && <a href={publicPath} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-bold text-[#b54c1c] underline underline-offset-2">Open generated path</a>}</div>{job.required && <span className="text-[9px] font-black uppercase tracking-wider text-black/35">Required</span>}{['failed', 'blocked'].includes(job.status) && <button type="button" disabled={retrying} onClick={onRetry} className="min-h-10 rounded-full border border-black/15 px-3 text-xs font-black hover:border-[#d85b24]">Retry</button>}{job.status === "completed" && <Check className="h-4 w-4 text-emerald-700" />}</article>;
}

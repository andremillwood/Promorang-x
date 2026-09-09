import { FormEvent, useState } from "react";
import SEO from "@/components/SEO";
import { useAftrHrsDoor } from "@/hooks/useAftrHrs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AftrHrsDoor() {
  const { user } = useAuth();
  const redeem = useAftrHrsDoor();
  const [code, setCode] = useState("");
  const [last, setLast] = useState<{ unique_code?: string; status?: string; user_id?: string } | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const pass = await redeem.mutateAsync(code);
      setLast(pass as { unique_code?: string; status?: string; user_id?: string });
      setCode("");
      toast.success("Pass validated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not validate this pass.");
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white">
      <SEO title="AftrHrs door validation" description="Scan or type an AftrHrs pass at Sea Deck." />
      <div className="mx-auto max-w-lg">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Sea Deck door</p>
        <h1 className="mt-3 text-4xl font-black uppercase">Validate AftrHrs</h1>
        {!user ? <p className="mt-6 text-white/60">Staff must sign in to record attendance.</p> : null}
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="AH-XXXXXXXX or scanned QR"
            className="h-14 w-full rounded-2xl border border-white/15 bg-zinc-950 px-4 font-mono uppercase tracking-widest"
          />
          <button type="submit" disabled={!user || redeem.isPending} className="h-12 w-full rounded-full bg-white text-sm font-black uppercase tracking-[0.16em] text-black disabled:opacity-50">
            {redeem.isPending ? "Checking…" : "Validate pass"}
          </button>
        </form>
        {last ? (
          <div className="mt-8 rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-200">Checked in</p>
            <p className="mt-2 font-mono text-xl">{last.unique_code}</p>
            <p className="mt-1 text-sm text-white/60">{last.status}</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}

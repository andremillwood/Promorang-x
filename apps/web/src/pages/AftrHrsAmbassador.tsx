import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { AFTRHRS_PATHS, authPathForAftrHrsClaim } from "@promorang/shared";
import { useAftrHrsAmbassador } from "@/hooks/useAftrHrs";
import { useAuth } from "@/contexts/AuthContext";
import { persistPostAuthNext } from "@/lib/post-auth-next";
import { toast } from "sonner";

export default function AftrHrsAmbassador() {
  const { user } = useAuth();
  const { data, isError, fulfill, isLoading } = useAftrHrsAmbassador();
  const [userId, setUserId] = useState("");
  const [phone, setPhone] = useState("");
  const [requestId, setRequestId] = useState("");
  const [uniqueCode, setUniqueCode] = useState("");

  if (!user) {
    return (
      <main className="min-h-screen bg-black px-4 py-20 text-center text-white">
        <h1 className="text-3xl font-black uppercase">Ambassador desk</h1>
        <button
          type="button"
          className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-black uppercase text-black"
          onClick={() => {
            persistPostAuthNext(AFTRHRS_PATHS.ambassador);
            window.location.assign(authPathForAftrHrsClaim(AFTRHRS_PATHS.ambassador));
          }}
        >
          Sign in
        </button>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-black px-4 py-20 text-center text-white">
        <h1 className="text-3xl font-black uppercase">Not an approved ambassador</h1>
        <p className="mt-4 text-white/60">Ask an administrator to allocate physical invitations to this account.</p>
        <Link to={AFTRHRS_PATHS.moment} className="mt-6 inline-block text-sm uppercase tracking-[0.16em] text-cyan-300">Back to AftrHrs</Link>
      </main>
    );
  }

  const allocation = (data?.allocation || {}) as {
    name?: string;
    allocation?: number;
    distributed?: number;
    remaining?: number;
    tracking_code?: string;
    sharePath?: string;
  };
  const requests = (data?.requests || []) as Array<{ id: string; status: string; note?: string; user_id?: string }>;
  const passes = (data?.passes || []) as Array<{ id: string; unique_code: string; status: string; pass_type: string }>;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await fulfill.mutateAsync({
        userId: userId || undefined,
        phone: phone || undefined,
        requestId: requestId || undefined,
        uniqueCode: uniqueCode || undefined,
      });
      toast.success("Physical invitation recorded.");
      setUserId("");
      setPhone("");
      setUniqueCode("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not record this handoff.");
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white">
      <SEO title="AftrHrs Ambassador desk" description="Record physical invitation handoffs for AftrHrs." />
      <div className="mx-auto max-w-4xl">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Ambassador</p>
        <h1 className="mt-3 text-4xl font-black uppercase">{allocation.name || "AftrHrs desk"}</h1>
        {isLoading ? <p className="mt-6 text-white/50">Loading allocation…</p> : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Allocated", allocation.allocation || 0],
            ["Distributed", allocation.distributed || 0],
            ["Remaining", allocation.remaining || 0],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/40">{label}</p>
              <p className="mt-2 text-3xl font-black">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-white/50">Share link: {allocation.sharePath} · Code {allocation.tracking_code}</p>

        <form onSubmit={submit} className="mt-10 space-y-3 rounded-3xl border border-white/10 p-5">
          <h2 className="text-lg font-black uppercase">Record a handoff</h2>
          <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="Promorang user ID (optional)" className="h-11 w-full rounded-xl border border-white/15 bg-black px-3 text-sm" />
          <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Telephone (stored privately)" className="h-11 w-full rounded-xl border border-white/15 bg-black px-3 text-sm" />
          <input value={requestId} onChange={(event) => setRequestId(event.target.value)} placeholder="Request ID to mark fulfilled" className="h-11 w-full rounded-xl border border-white/15 bg-black px-3 text-sm" />
          <input value={uniqueCode} onChange={(event) => setUniqueCode(event.target.value)} placeholder="Optional unique code" className="h-11 w-full rounded-xl border border-white/15 bg-black px-3 text-sm" />
          <button type="submit" className="rounded-full bg-white px-5 py-2 text-xs font-black uppercase tracking-[0.16em] text-black">Fulfill invitation</button>
        </form>

        <section className="mt-10">
          <h2 className="text-lg font-black uppercase">Requests</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {requests.map((request) => (
              <li key={request.id} className="rounded-xl border border-white/10 px-4 py-3">
                <p className="font-mono text-xs text-white/40">{request.id}</p>
                <p>{request.note || "No note"} · {request.status}</p>
                <button type="button" className="mt-2 text-xs uppercase tracking-[0.16em] text-cyan-300" onClick={() => setRequestId(request.id)}>Use this request</button>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-black uppercase">Distributed invitations</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {passes.map((pass) => (
              <li key={pass.id} className="rounded-xl border border-white/10 px-4 py-3 font-mono">
                {pass.unique_code} · {pass.status}
              </li>
            ))}
          </ul>
        </section>
        <Link to={AFTRHRS_PATHS.moment} className="mt-10 inline-block text-sm uppercase tracking-[0.16em] text-white/40">Back to AftrHrs</Link>
      </div>
    </main>
  );
}

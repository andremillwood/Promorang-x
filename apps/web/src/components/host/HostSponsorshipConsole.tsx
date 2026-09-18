import { Handshake, ShieldCheck } from "lucide-react";
import { HostSponsorshipRequests } from "@/components/host/SponsorshipRequests";

export function HostSponsorshipConsole() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-amber-500/25 bg-[linear-gradient(135deg,rgba(245,158,11,.10),rgba(0,0,0,.85))] p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-amber-300">
              <Handshake className="h-4 w-4" />
              Host · Sponsorships
            </div>
            <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">Review real partner requests.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
              A sponsorship request is not funded value until the authoritative request and funding state say so.
              Review the offer, respond, and keep funding, activation and payout states separate.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-white/50">
            <ShieldCheck className="h-4 w-4 text-amber-300" />
            Accepted ≠ funded · funded ≠ paid
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0e1015] p-5 shadow-xl sm:p-6">
        <HostSponsorshipRequests />
      </section>
    </div>
  );
}

export default HostSponsorshipConsole;

import { HostSponsorshipRequests } from "@/components/host/SponsorshipRequests";

export function HostSponsorshipConsole() {
  return (
    <div className="min-w-0 space-y-5">
      <header>
        <h2 className="font-sans text-2xl font-semibold tracking-tight">Sponsorship requests</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Review offers and respond to partners. Accepted, funded and paid remain separate statuses.</p>
      </header>
      <HostSponsorshipRequests />
    </div>
  );
}

export default HostSponsorshipConsole;

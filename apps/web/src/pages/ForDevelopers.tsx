import { Link } from "react-router-dom";
import { ArrowRight, Braces, Code2, KeyRound, Network, ShieldCheck, Terminal } from "lucide-react";
import SEO from "@/components/SEO";
import { PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";

const surfaces = [
  {
    icon: Braces,
    title: "TypeScript SDK",
    status: "Repository package",
    path: "packages/sdk",
    copy: "The codebase contains @promorang/sdk with a build and test contract. This page does not imply the package is published to a public registry unless that distribution is separately confirmed.",
  },
  {
    icon: Network,
    title: "MCP server",
    status: "Repository package",
    path: "packages/mcp-server",
    copy: "The codebase contains an MCP server wired to the local SDK. External installation or hosted availability depends on the artifact and environment actually deployed.",
  },
  {
    icon: KeyRound,
    title: "Developer console",
    status: "Product surface",
    path: "/developers/keys",
    copy: "Use the authenticated developer console to inspect key-management capability available to your account. A marketing page should not manufacture a key or successful API response.",
  },
];

export default function ForDevelopers() {
  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <SEO title="PROMORANG for Developers" description="Build against PROMORANG objects without collapsing Discovery, Demand, response, proof, and retained history into synthetic API success." />

      <section className="border-b border-white/10 px-5 pb-16 pt-24 sm:px-6 md:pb-24 md:pt-32">
        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-primary">Developer surface · capability before hype</p>
            <h1 className="mt-5 max-w-5xl font-serif text-5xl font-bold leading-[.92] tracking-[-.055em] sm:text-7xl">Build on the same object truth the product uses.</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/60">PROMORANG has SDK and MCP code in the repository, plus authenticated developer surfaces. Integrations should preserve the same market-state boundaries as the web product rather than returning simulated success because a developer demo needs to look complete.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/developers/keys" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-black text-black">Open Developer Console <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/what-is-promorang" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black">Understand the object system</Link>
            </div>
          </div>
          <PaperReceipt heading="Integration law" lines={[
            { label: "Read", value: "source-backed" },
            { label: "Mutation", value: "authoritative write", strong: true },
            { label: "Failed write", value: "≠ success" },
            { label: "Demand", value: "≠ supply" },
            { label: "Claim", value: "≠ verification" },
          ]} footer="An API should not be less truthful than the UI." />
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">What exists in the codebase</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-.045em] sm:text-5xl">Capability status, not a simulated playground.</h2>
          <div className="mt-9 divide-y divide-white/10 border-y border-white/10">
            {surfaces.map(({ icon: Icon, title, status, path, copy }) => (
              <article key={title} className="grid gap-5 py-6 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                <div className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/[0.03]"><Icon className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">{status}</p>
                  <h3 className="mt-1 font-serif text-2xl font-bold">{title}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">{copy}</p>
                </div>
                <code className="max-w-[230px] overflow-hidden text-ellipsis rounded-full border border-white/10 px-3 py-1.5 font-mono text-[10px] text-white/40">{path}</code>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">Canonical API behavior</p>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.04em]">The integration should expose states, not erase them.</h2>
          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <TicketPass kicker="Discovery" title="Approved knowledge" detail="A proposal or candidate does not become public Discovery until the review boundary is crossed." stub="READ" stubLabel="Truth" />
            <TicketPass kicker="Demand" title="Recorded signal" detail="Questions, votes and asks can inform a response. Threshold is not automatic inventory." stub="SIGNAL" stubLabel="Want" />
            <TicketPass kicker="Response" title="Distinct supply" detail="Moment, offer or inventory creation is a separate authoritative mutation, not a derived demand state." stub="WRITE" stubLabel="Respond" />
            <TicketPass kicker="Proof" title="Claim before verification" detail="Evidence submission remains pending until the review path advances the state." stub="PROVE" stubLabel="Verify" />
            <TicketPass kicker="PromoCard" title="Relationship + issued access" detail="Watching, issued access and used/kept history remain different classes of state." stub="KEEP" stubLabel="Return" />
            <TicketPass kicker="Failure" title="Fail closed" detail="A failed write or missing production object must not be reinterpreted as success by the SDK, agent or UI." stub="NO" stubLabel="Guard" />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">Local development</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.04em]">Build what is actually in the repository.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/50">The SDK and MCP packages are workspace code. Their package manifests define local build/test commands. Public registry installation, hosted MCP availability, rate limits and production scopes should be documented only after those deployment facts are verified.</p>
            <div className="mt-6 grid gap-3 font-mono text-xs text-white/60">
              <div className="rounded-[1.2rem] border border-white/10 bg-black/30 p-4"><Terminal className="mb-3 h-4 w-4 text-primary" />npm run build --workspace packages/sdk</div>
              <div className="rounded-[1.2rem] border border-white/10 bg-black/30 p-4"><Terminal className="mb-3 h-4 w-4 text-primary" />npm run build --workspace packages/mcp-server</div>
            </div>
          </div>
          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-6">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <p className="mt-4 font-serif text-2xl font-bold">No fake API responses.</p>
            <p className="mt-3 text-sm leading-6 text-white/45">The previous marketing playground used timers and hard-coded JSON to imitate feed, claim and operator responses. That presentation has been removed. Test real endpoints from an authenticated environment instead.</p>
            <Link to="/developers/keys" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary"><Code2 className="h-4 w-4" />Open console <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}

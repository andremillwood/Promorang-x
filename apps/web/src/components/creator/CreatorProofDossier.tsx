import CreatorReleaseWorkspaceBridge from "@/components/creator/CreatorReleaseWorkspaceBridge";
import CreatorAttributionMap from "@/components/creator/CreatorAttributionMap";
import CreatorEarningsVault from "@/components/creator/CreatorEarningsVault";

export function CreatorProofDossier() {
  return (
    <div className="min-w-0 space-y-8" data-proof-family="creator-proof-dossier">
      <header>
        <h2 className="font-sans text-2xl font-semibold tracking-tight">Work, attribution and earnings</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Review your published work, the activity linked to it and its earnings. Each record keeps its own approval and settlement status.</p>
        <nav aria-label="Proof sections" className="mt-3 flex flex-wrap gap-2">
          {[["work", "Work records"], ["attribution", "Attribution"], ["earnings", "Earnings"]].map(([id, label]) => <a key={id} href={`#creator-proof-${id}`} className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm hover:bg-muted">{label}</a>)}
        </nav>
      </header>
      <section id="creator-proof-work" className="scroll-mt-24"><CreatorReleaseWorkspaceBridge mode="work" /></section>
      <section id="creator-proof-attribution" className="scroll-mt-24"><CreatorAttributionMap /></section>
      <section id="creator-proof-earnings" className="scroll-mt-24"><CreatorEarningsVault /></section>
    </div>
  );
}

export default CreatorProofDossier;

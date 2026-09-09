import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Download, Share2 } from "lucide-react";
import SEO from "@/components/SEO";
import { AFTRHRS_COPY, AFTRHRS_PATHS } from "@promorang/shared";
import { useAftrHrs } from "@/hooks/useAftrHrs";
import { getSiteUrl } from "@/lib/discovery";

export default function AftrHrsPass() {
  const { data, user } = useAftrHrs();
  const pass = data.pass;

  const download = () => {
    const svg = document.querySelector("#aftrhrs-pass-qr svg");
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${pass?.unique_code || "aftrhrs-pass"}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    const url = getSiteUrl(AFTRHRS_PATHS.pass);
    if (navigator.share) await navigator.share({ title: "AftrHrs Digital Free Pass", url });
    else await navigator.clipboard.writeText(url);
  };

  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white">
      <SEO title="Your AftrHrs Digital Free Pass" description={AFTRHRS_COPY.confirmation} image={getSiteUrl("/og/aftrhrs.jpg")} />
      <div className="mx-auto max-w-md">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Promorang wallet</p>
        <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em]">AftrHrs pass</h1>
        {!user ? (
          <p className="mt-6 text-white/65">Sign in to open the pass stored on your Promorang profile.</p>
        ) : !pass ? (
          <p className="mt-6 text-white/65">No AftrHrs pass is attached to this account yet.</p>
        ) : (
          <article className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
            <img src="/campaigns/aftrhrs/logo.jpg" alt="AftrHrs" className="h-40 w-full object-cover" />
            <div className="p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">Digital Free Pass</p>
              <p className="mt-2 font-mono text-2xl font-black tracking-[0.16em]">{pass.unique_code}</p>
              <div id="aftrhrs-pass-qr" className="mt-6 flex justify-center rounded-2xl bg-white p-4">
                <QRCodeSVG value={pass.qr_payload} size={200} />
              </div>
              <p className="mt-5 text-sm leading-6 text-white/70">{AFTRHRS_COPY.confirmation}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/40">Status · {pass.status}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={download} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-black">
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
                <button type="button" onClick={share} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
              </div>
            </div>
          </article>
        )}
        <div className="mt-8 flex gap-3">
          <Link to={AFTRHRS_PATHS.moment} className="text-sm uppercase tracking-[0.16em] text-white/50">Back to AftrHrs</Link>
          <Link to="/wallet" className="text-sm uppercase tracking-[0.16em] text-cyan-300">Wallet</Link>
        </div>
      </div>
    </main>
  );
}

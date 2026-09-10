import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Download, Share2 } from "lucide-react";
import SEO from "@/components/SEO";
import { AFTRHRS_COPY, AFTRHRS_OG_IMAGE, AFTRHRS_PATHS, authPathForAftrHrsPass, guestPassStatus } from "@promorang/shared";
import { useAftrHrs } from "@/hooks/useAftrHrs";
import { getSiteUrl } from "@/lib/discovery";
import { persistPostAuthNext } from "@/lib/post-auth-next";
import promorangLogo from "@/assets/promorang-logo-full.png";

export default function AftrHrsPass() {
  const { data, user } = useAftrHrs();
  const pass = data.pass;
  const signInHref = authPathForAftrHrsPass();

  const openSignIn = () => {
    persistPostAuthNext(AFTRHRS_PATHS.passAlias);
    window.location.assign(signInHref);
  };

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
    const url = getSiteUrl(AFTRHRS_PATHS.passAlias);
    if (navigator.share) await navigator.share({ title: "AftrHrs Digital Free Pass", url });
    else await navigator.clipboard.writeText(url);
  };

  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white">
      <SEO
        title="Your AftrHrs Digital Free Pass"
        description={AFTRHRS_COPY.confirmation}
        image={getSiteUrl(AFTRHRS_OG_IMAGE.path)}
        imageAlt={AFTRHRS_OG_IMAGE.alt}
        imageType={AFTRHRS_OG_IMAGE.type}
        imageWidth={AFTRHRS_OG_IMAGE.width}
        imageHeight={AFTRHRS_OG_IMAGE.height}
        url={getSiteUrl(AFTRHRS_PATHS.passAlias)}
      />
      <div className="mx-auto max-w-md">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">AftrHrs · {AFTRHRS_COPY.when}</p>
        <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em]">Your pass</h1>
        {!user ? (
          <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-white/70">
              Sign in with the same Promorang account you used to claim. Your QR stays on that profile.
            </p>
            <p className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-fuchsia-300">{AFTRHRS_COPY.arrivalRule}</p>
            <button
              type="button"
              onClick={openSignIn}
              className="mt-6 w-full rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-black"
            >
              Sign in to open my pass
            </button>
            <Link
              to={AFTRHRS_PATHS.landing}
              className="mt-4 block text-center text-sm uppercase tracking-[0.16em] text-white/50"
            >
              Back to AftrHrs
            </Link>
          </div>
        ) : !pass ? (
          <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-white/70">No AftrHrs pass is attached to this account yet.</p>
            <Link
              to={AFTRHRS_PATHS.claimReturn}
              className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-black"
            >
              Claim a free pass
            </Link>
          </div>
        ) : (
          <article className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
            <img src="/campaigns/aftrhrs/logo.jpg" alt="AftrHrs" className="h-40 w-full object-cover" />
            <div className="p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">Digital Free Pass · {AFTRHRS_COPY.when}</p>
              <p className="mt-2 font-mono text-2xl font-black tracking-[0.16em]">{pass.unique_code}</p>
              <div id="aftrhrs-pass-qr" className="mt-6 flex justify-center rounded-2xl bg-white p-4">
                <QRCodeSVG value={pass.qr_payload} size={200} />
              </div>
              <p className="mt-5 text-sm leading-6 text-white/70">{AFTRHRS_COPY.confirmation}</p>
              <p className="mt-3 text-sm font-bold uppercase tracking-[0.14em] text-fuchsia-300">{AFTRHRS_COPY.arrivalRule}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/40">{guestPassStatus(pass.status)}</p>
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
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={AFTRHRS_PATHS.landing} className="text-sm uppercase tracking-[0.16em] text-white/50">Back to AftrHrs</Link>
            {user ? (
              <Link to="/wallet" className="text-sm uppercase tracking-[0.16em] text-cyan-300">Promorang wallet</Link>
            ) : null}
          </div>
          <div className="flex flex-col items-center gap-2">
            <img src={promorangLogo} alt="PROMORANG" className="h-7 w-auto object-contain" />
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/55">{AFTRHRS_COPY.poweredBy}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

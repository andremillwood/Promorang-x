import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { AFTRHRS_COPY, AFTRHRS_PATHS, guestPassStatus } from "@promorang/shared";
import { useAftrHrs, useAftrHrsAutoClaim } from "@/hooks/useAftrHrs";

export function AftrHrsWalletPass() {
  const { data, passLoadFailed, refetch } = useAftrHrs();
  const { autoClaiming } = useAftrHrsAutoClaim({ redirectToPass: false });
  const pass = data.pass;

  if (passLoadFailed) {
    return (
      <button
        type="button"
        onClick={() => refetch()}
        className="w-full max-w-[420px] rounded-[1.75rem] border border-amber-300/40 bg-amber-300/10 px-4 py-4 text-left text-white"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">AftrHrs pass</p>
        <p className="mt-2 text-sm leading-6 text-white/80">{AFTRHRS_COPY.walletLoadError}</p>
      </button>
    );
  }

  if (autoClaiming) {
    return (
      <div className="w-full max-w-[420px] rounded-[1.75rem] border border-cyan-300/30 bg-cyan-300/10 px-4 py-4 text-white">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">AftrHrs</p>
        <p className="mt-2 text-sm font-bold">Opening your Digital Free Pass…</p>
      </div>
    );
  }

  if (!pass) {
    return (
      <Link
        to={AFTRHRS_PATHS.claimReturn}
        className="w-full max-w-[420px] rounded-[1.75rem] border border-fuchsia-300/35 bg-fuchsia-400/10 px-4 py-4 text-left text-white"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-200">AftrHrs door pass</p>
        <p className="mt-2 text-lg font-black uppercase tracking-[-0.04em]">Not in this wallet yet</p>
        <p className="mt-2 text-sm leading-6 text-white/75">{AFTRHRS_COPY.walletNeedClaim}</p>
        <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-white">Claim my AftrHrs pass →</p>
      </Link>
    );
  }

  return (
    <Link
      to={AFTRHRS_PATHS.passAlias}
      className="w-full max-w-[420px] overflow-hidden rounded-[1.75rem] border border-cyan-300/35 bg-black/60 text-left text-white"
    >
      <div className="px-4 pt-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">AftrHrs Digital Free Pass</p>
        <p className="mt-1 font-mono text-xl font-black tracking-[0.14em]">{pass.unique_code}</p>
        <p className="mt-1 text-xs text-white/65">{AFTRHRS_COPY.walletHavePass}</p>
      </div>
      <div className="m-4 flex justify-center rounded-2xl bg-white p-3">
        <QRCodeSVG value={pass.qr_payload} size={168} />
      </div>
      <p className="px-4 pb-4 text-xs uppercase tracking-[0.16em] text-white/45">
        Arrive before 11:30 PM · {guestPassStatus(pass.status)}
      </p>
    </Link>
  );
}

export function AftrHrsHomePassBanner() {
  const { data, user } = useAftrHrs();
  if (!user) return null;
  const pass = data.pass;
  return (
    <Link
      to={pass ? AFTRHRS_PATHS.passAlias : AFTRHRS_PATHS.claimReturn}
      className="flex items-center justify-between gap-3 rounded-3xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-white"
    >
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">AftrHrs tonight</p>
        <p className="mt-1 text-sm font-bold">
          {pass ? `Your door pass ${pass.unique_code} is ready` : "Your AftrHrs pass is not in the wallet yet"}
        </p>
      </div>
      <span className="shrink-0 text-xs font-black uppercase tracking-[0.14em] text-white">
        {pass ? "Open pass" : "Get pass"}
      </span>
    </Link>
  );
}

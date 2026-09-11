import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import SEO from "@/components/SEO";
import { getSiteUrl } from "@/lib/discovery";
import { AFTRHRS_COPY, AFTRHRS_OG_IMAGE, AFTRHRS_PATHS, guestPassStatus, guestPassType } from "@promorang/shared";
import { useAftrHrsGuestTicket } from "@/hooks/useAftrHrs";

export default function AftrHrsGuestTicket() {
  const { code } = useParams();
  const ticket = useAftrHrsGuestTicket(code);
  const data = ticket.data;

  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white">
      <SEO
        title="AftrHrs ticket"
        description={AFTRHRS_COPY.guestSuccessPass}
        image={getSiteUrl(AFTRHRS_OG_IMAGE.path)}
        imageAlt={AFTRHRS_OG_IMAGE.alt}
        url={getSiteUrl(`${AFTRHRS_PATHS.ticket}/${code || ""}`)}
      />
      <div className="mx-auto max-w-md">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">AftrHrs · Sea Deck</p>
        <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em]">Door ticket</h1>
        {ticket.isError ? (
          <p className="mt-8 text-white/65">This ticket was not found. Check the email we sent, or RSVP again on the AftrHrs page.</p>
        ) : !data ? (
          <p className="mt-8 text-white/65">Opening your ticket…</p>
        ) : (
          <article className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-200">{guestPassType(data.kind)}</p>
            <p className="mt-2 text-2xl font-black">{data.name}</p>
            <p className="mt-1 text-sm text-white/55">{guestPassStatus(data.status)}</p>
            <div className="mt-6 flex justify-center rounded-2xl bg-white p-4">
              <QRCodeSVG value={data.qrPayload} size={180} />
            </div>
            <p className="mt-4 text-center font-mono text-lg font-black tracking-[0.18em]">{data.code}</p>
            <p className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-cyan-200">{AFTRHRS_COPY.arrivalRule}</p>
            {data.kind === "digital-pass" ? (
              <p className="mt-3 text-sm leading-6 text-white/60">This works like a physical invite for the month. Show it at Sea Deck.</p>
            ) : (
              <p className="mt-3 text-sm leading-6 text-white/60">This Friday’s list. Give your name at the door.</p>
            )}
          </article>
        )}
        <Link to={AFTRHRS_PATHS.landing} className="mt-8 block text-center text-sm uppercase tracking-[0.16em] text-white/50">
          Back to AftrHrs
        </Link>
      </div>
    </main>
  );
}

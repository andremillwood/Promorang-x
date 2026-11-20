import { TicketPass } from "@/components/promorang/SignatureObjects";

type CappedDropTicketProps = {
  kicker: string;
  title: string;
  detail: string;
  stub: string;
  stubLabel: string;
  almostGoneLabel?: string | null;
  soldOutDetail?: string | null;
};

export function CappedDropTicket({
  kicker,
  title,
  detail,
  stub,
  stubLabel,
  almostGoneLabel,
  soldOutDetail,
}: CappedDropTicketProps) {
  return (
    <div className="mx-auto w-full max-w-md">
      <TicketPass kicker={kicker} title={title} detail={detail} stub={stub} stubLabel={stubLabel} />
      {soldOutDetail ? <p className="mt-4 text-center text-sm text-white/70">{soldOutDetail}</p> : null}
      {almostGoneLabel ? <p className="mt-3 text-center text-sm font-semibold text-orange-300">{almostGoneLabel}</p> : null}
    </div>
  );
}

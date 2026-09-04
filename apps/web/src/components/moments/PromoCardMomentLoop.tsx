import { LivingPromoCard } from "@/components/promorang/LivingPromoCard";
import { usePromoCardLife } from "@/hooks/usePromoCardLife";
import { lineForMark, stampFromPlace } from "@/lib/promocard/life";

type Props = {
  isJoined: boolean;
  isCheckedIn?: boolean;
  isHost: boolean;
  place: string;
};

export function PromoCardMomentLoop({ isJoined, isCheckedIn, isHost, place }: Props) {
  const stamp = stampFromPlace(place);
  const life = usePromoCardLife(
    isJoined
      ? null
      : {
          stamp,
          place,
          line: lineForMark("held", place),
        },
  );

  const caption = isHost
    ? "Guests carry this. When they reserve or arrive, the mark lands on their plastic — not in a dashboard cell."
    : isCheckedIn
      ? `${place} is on the card now. The night already wrote.`
      : isJoined
        ? `This night is held. Arrive and ${stamp} burns in.`
        : `If you go, this card gets a ${stamp} stamp. That is the reason to bring it.`;

  return (
    <section className="rounded-3xl border border-amber-300/20 bg-[#121215] p-5 sm:p-7">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">PromoCard × this Moment</p>
      <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">
        {isJoined ? "This night is writing on your card." : "Tonight would write on this."}
      </h2>
      <div className="mt-5">
        <LivingPromoCard
          holder={life.holder}
          last4={life.last4}
          available={life.available}
          limit={life.limit}
          marks={life.marks}
          imminent={life.imminent}
          writingMark={life.writingMark}
          caption={caption}
        />
      </div>
    </section>
  );
}

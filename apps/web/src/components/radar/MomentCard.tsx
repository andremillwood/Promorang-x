import React from 'react';
import { Clock, MapPin, Key, Users, ArrowRight, ShieldCheck } from 'lucide-react';

export type IntentType = 'ATTEND' | 'TRY' | 'GET' | 'LEARN' | 'CONNECT' | 'WATCH' | 'CONTRIBUTE';
export type MomentOwnership = 'PROMORANG ORIGINAL' | 'PROMORANG PRESENTS' | 'PARTNER MOMENT' | 'FEATURED MOMENT' | 'COMMUNITY MOMENT' | 'EMERGING MOMENT' | 'EDITORIAL DISCOVERY';

export interface MomentProps {
  id: string;
  title: string;
  description: string;
  intentType: IntentType;
  ownership: MomentOwnership;
  venueName: string;
  location: string;
  dateDisplay: string;
  image: string;
  promoKeysAvailable: number;
  subMomentsCount: number;
  attendeesCount: number;
  pointsReward: number;
  isClaimed?: boolean;
  onClaimKey?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onClaimListing?: (id: string, venueName: string) => void;
}

const intentCopy: Record<IntentType, string> = {
  ATTEND: 'Go',
  TRY: 'Try',
  GET: 'Get',
  LEARN: 'Learn',
  CONNECT: 'Meet',
  WATCH: 'Watch',
  CONTRIBUTE: 'Contribute',
};

export const MomentCard: React.FC<MomentProps> = ({
  id,
  title,
  description,
  intentType,
  ownership,
  venueName,
  location,
  dateDisplay,
  image,
  promoKeysAvailable,
  attendeesCount,
  isClaimed = false,
  onClaimKey,
  onViewDetails,
  onClaimListing,
}) => {
  const editorial = ownership === 'EDITORIAL DISCOVERY' && !isClaimed;

  return (
    <article className="pr-world-object group flex min-h-[430px] flex-col overflow-hidden bg-[#101012]">
      <button type="button" onClick={() => onViewDetails?.(id)} className="relative block h-[260px] w-full overflow-hidden text-left">
        {image ? <img src={image} alt={title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]" /> : <div className="h-full w-full bg-[radial-gradient(circle_at_80%_0%,rgba(255,90,31,.28),transparent_40%),#171719]" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101012] via-black/12 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.18em] text-white backdrop-blur-md">{intentCopy[intentType]}</span>
          <span className="rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-white/60 backdrop-blur-md">{editorial ? 'Discovery' : ownership.replace('PROMORANG ', '')}</span>
        </div>
        {promoKeysAvailable > 0 ? <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-[#f4c66c]/35 bg-black/55 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.12em] text-[#f4c66c] backdrop-blur-md"><Key className="h-3 w-3" />{promoKeysAvailable} available</span> : null}
      </button>

      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-[.12em] text-white/42">
            <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-[#ff5a1f]" />{dateDisplay}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#ff5a1f]" />{venueName || location}</span>
          </div>
          <button type="button" onClick={() => onViewDetails?.(id)} className="mt-4 block text-left">
            <h3 className="font-serif text-[2rem] font-bold leading-[.96] tracking-[-.045em] text-white transition group-hover:text-[#f4c66c]">{title}</h3>
          </button>
          {description ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/48">{description}</p> : null}
        </div>

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[.15em] text-white/30">Recorded interest</p>
            <p className="mt-1 inline-flex items-center gap-1.5 font-serif text-xl font-bold text-white"><Users className="h-4 w-4 text-white/45" />{attendeesCount}</p>
          </div>

          {editorial ? (
            <button type="button" onClick={() => onClaimListing ? onClaimListing(id, venueName) : (window.location.href = `/join/venue?venue=${encodeURIComponent(venueName)}`)} className="pr-world-chip border-amber-300/30 text-amber-200"><ShieldCheck className="h-3.5 w-3.5" />Claim listing</button>
          ) : promoKeysAvailable > 0 && onClaimKey ? (
            <button type="button" onClick={() => onClaimKey(id)} className="pr-world-primary min-h-10 px-4 text-xs"><Key className="h-3.5 w-3.5" />Open access</button>
          ) : (
            <button type="button" onClick={() => onViewDetails?.(id)} className="pr-world-link inline-flex items-center gap-1">Enter Moment <ArrowRight className="h-3.5 w-3.5" /></button>
          )}
        </div>
      </div>
    </article>
  );
};

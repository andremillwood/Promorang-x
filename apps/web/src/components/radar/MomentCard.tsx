import React from 'react';
import { Calendar, MapPin, Key, Users, Clock, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

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

const intentColors: Record<IntentType, string> = {
  ATTEND: 'bg-orange-500 text-white',
  TRY: 'bg-emerald-600 text-white',
  GET: 'bg-purple-600 text-white',
  LEARN: 'bg-blue-600 text-white',
  CONNECT: 'bg-pink-600 text-white',
  WATCH: 'bg-indigo-600 text-white',
  CONTRIBUTE: 'bg-amber-600 text-white'
};

const ownershipBadgeStyles: Record<MomentOwnership, string> = {
  'PROMORANG ORIGINAL': 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black',
  'PROMORANG PRESENTS': 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold',
  'PARTNER MOMENT': 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold',
  'FEATURED MOMENT': 'bg-blue-100 text-blue-800 border border-blue-300 font-semibold',
  'COMMUNITY MOMENT': 'bg-gray-100 text-gray-800 border border-gray-300 font-medium',
  'EMERGING MOMENT': 'bg-pink-100 text-pink-800 border border-pink-300 font-bold',
  'EDITORIAL DISCOVERY': 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
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
  subMomentsCount,
  attendeesCount,
  pointsReward,
  isClaimed = false,
  onClaimKey,
  onViewDetails,
  onClaimListing
}) => {
  return (
    <div className="group rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* Cover Header */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-900">
        <img
          src={image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800"}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />

        {/* Intent Badge */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          <span className={`px-2.5 py-1 text-[11px] font-black rounded-lg uppercase tracking-wider shadow-md ${intentColors[intentType]}`}>
            {intentType}
          </span>
          <span className={`px-2.5 py-1 text-[10px] rounded-lg tracking-wide shadow-sm ${ownershipBadgeStyles[ownership]}`}>
            {ownership}
          </span>
        </div>

        {/* PromoKeys Count Tag */}
        {promoKeysAvailable > 0 && (
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-amber-500/90 backdrop-blur-md text-white text-xs font-bold rounded-lg flex items-center shadow-lg animate-pulse">
            <Key className="w-3 h-3 mr-1" />
            <span>{promoKeysAvailable} Keys Left</span>
          </div>
        )}

        {/* Date & Location Overlay */}
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <div className="flex items-center text-xs text-amber-300 font-medium mb-1 space-x-3">
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {dateDisplay}
            </span>
            <span className="flex items-center text-gray-200">
              <MapPin className="w-3 h-3 mr-1 text-orange-400" />
              {venueName}
            </span>
          </div>
          <h3 className="text-lg font-bold line-clamp-1 leading-snug drop-shadow-sm text-white">
            {title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <p className="text-gray-600 text-xs line-clamp-2 mb-4 leading-relaxed">
          {description}
        </p>

        {/* Sub-moments & Proof row */}
        <div className="flex items-center justify-between py-2 border-y border-gray-100 mb-4 text-xs">
          <div className="flex items-center text-gray-500 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 mr-1" />
            <span>{subMomentsCount} Sub-Moments</span>
          </div>
          <div className="flex items-center text-gray-500 font-medium">
            <Users className="w-3.5 h-3.5 text-blue-600 mr-1" />
            <span>{attendeesCount} RSVPs</span>
          </div>
          <div className="flex items-center text-orange-600 font-bold">
            +{pointsReward} Points
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewDetails && onViewDetails(id)}
            className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl flex items-center justify-center transition-colors"
          >
            <span>View Details</span>
          </button>

          {ownership === 'EDITORIAL DISCOVERY' && !isClaimed ? (
            <button
              onClick={() => onClaimListing ? onClaimListing(id, venueName) : (window.location.href = `/join/venue?venue=${encodeURIComponent(venueName)}`)}
              className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-gray-950 text-xs font-black rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-gray-950" />
              <span>Claim Listing</span>
            </button>
          ) : (
            <button
              onClick={() => onClaimKey && onClaimKey(id)}
              className="w-full py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02]"
            >
              <Key className="w-3.5 h-3.5 mr-1" />
              <span>Unlock Key</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

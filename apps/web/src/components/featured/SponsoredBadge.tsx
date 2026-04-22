/**
 * SPONSORED BADGE
 * 
 * Premium badge display for PromoShare pools that have purchased
 * the sponsored badge placement.
 */

import React from 'react';
import { Sparkles, Crown, Star, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SponsoredBadgeProps {
  tier?: 'sponsored' | 'premium' | 'exclusive';
  sponsorName?: string;
  className?: string;
}

const BADGE_CONFIG = {
  sponsored: {
    icon: Sparkles,
    label: 'Sponsored',
    className: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0',
    tooltip: 'This pool is sponsored for premium visibility',
  },
  premium: {
    icon: Crown,
    label: 'Premium',
    className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0',
    tooltip: 'Premium sponsored pool with maximum visibility',
  },
  exclusive: {
    icon: Star,
    label: 'Exclusive',
    className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0',
    tooltip: 'Exclusive featured pool - limited spots available',
  },
};

export default function SponsoredBadge({ 
  tier = 'sponsored', 
  sponsorName,
  className = '' 
}: SponsoredBadgeProps) {
  const config = BADGE_CONFIG[tier];
  const Icon = config.icon;

  const badge = (
    <Badge 
      className={`${config.className} px-2 py-0.5 text-xs font-medium shadow-lg ${className}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-medium">{config.tooltip}</p>
          {sponsorName && (
            <p className="text-xs text-muted-foreground mt-1">
              Sponsored by {sponsorName}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * SPONSORED POOL CARD
 * 
 * Enhanced pool card with sponsored styling and animations
 */
export function SponsoredPoolCard({ 
  pool,
  onClick 
}: { 
  pool: {
    id: string;
    name: string;
    description?: string;
    prize_pool: number;
    sponsor_name?: string;
    sponsor_logo?: string;
    end_date?: string;
    participant_count?: number;
    tier?: 'sponsored' | 'premium' | 'exclusive';
  };
  onClick?: () => void;
}) {
  const tier = pool.tier || 'sponsored';
  const config = BADGE_CONFIG[tier];
  const Icon = config.icon;

  return (
    <div 
      onClick={onClick}
      className="relative rounded-xl overflow-hidden cursor-pointer group animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      {/* Animated Gradient Border */}
      <div className={`absolute inset-0 bg-gradient-to-r ${config.className.replace('text-white border-0', '')} opacity-20 group-hover:opacity-30 transition-opacity`} />
      
      {/* Card Content */}
      <div className="relative p-5 bg-card border-2 border-transparent group-hover:border-primary/50 rounded-xl transition-all">
        {/* Badge */}
        <div className="flex items-center justify-between mb-3">
          <SponsoredBadge tier={tier} sponsorName={pool.sponsor_name} />
          
          {/* Time remaining (if end_date provided) */}
          {pool.end_date && (
            <span className="text-xs text-muted-foreground">
              {new Date(pool.end_date) > new Date() 
                ? `${Math.ceil((new Date(pool.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left`
                : 'Ended'
              }
            </span>
          )}
        </div>

        {/* Pool Info */}
        <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
          {pool.name}
        </h3>
        
        {pool.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {pool.description}
          </p>
        )}

        {/* Prize Pool */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-yellow-500/20">
              <Icon className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Prize Pool</p>
              <p className="font-bold text-lg">${pool.prize_pool.toLocaleString()}</p>
            </div>
          </div>
          
          {pool.participant_count !== undefined && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Participants</p>
              <p className="font-semibold">{pool.participant_count.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Sponsor Info */}
        {pool.sponsor_name && (
          <div className="mt-4 pt-3 border-t flex items-center gap-2">
            {pool.sponsor_logo ? (
              <img 
                src={pool.sponsor_logo} 
                alt={pool.sponsor_name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {pool.sponsor_name[0]}
                </span>
              </div>
            )}
            <span className="text-sm text-muted-foreground">
              Sponsored by <span className="font-medium text-foreground">{pool.sponsor_name}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * SPONSORED POOL BANNER
 * 
 * Large banner for top placement in PromoShare section
 */
export function SponsoredPoolBanner({ 
  pool,
  onClick 
}: { 
  pool: {
    id: string;
    name: string;
    description?: string;
    prize_pool: number;
    sponsor_name: string;
    sponsor_logo?: string;
    banner_image?: string;
    end_date?: string;
    participant_count?: number;
  };
  onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
    >
      {/* Background Image or Gradient */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: pool.banner_image 
            ? `url(${pool.banner_image})` 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          {/* Badge */}
          <div className="mb-3">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Zap className="w-3 h-3 mr-1" />
              Featured Pool
            </Badge>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {pool.name}
          </h2>
          
          {pool.description && (
            <p className="text-white/80 max-w-xl mb-4 line-clamp-2">
              {pool.description}
            </p>
          )}

          {/* Sponsor */}
          <div className="flex items-center gap-2 text-white/70">
            {pool.sponsor_logo ? (
              <img 
                src={pool.sponsor_logo} 
                alt={pool.sponsor_name}
                className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                <span className="text-sm font-bold text-white">
                  {pool.sponsor_name[0]}
                </span>
              </div>
            )}
            <span>Sponsored by {pool.sponsor_name}</span>
          </div>
        </div>

        {/* Prize Pool CTA */}
        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="text-white/70 text-sm">Grand Prize</div>
          <div className="text-3xl md:text-4xl font-bold text-white">
            ${pool.prize_pool.toLocaleString()}
          </div>
          {pool.participant_count !== undefined && (
            <div className="text-white/60 text-sm">
              {pool.participant_count.toLocaleString()} participants joined
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

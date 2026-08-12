/**
 * FEATURED MOMENT CARD
 * 
 * Enhanced moment card with featured styling for moment discovery pages.
 * Includes impression tracking and visual distinction from regular moments.
 */

import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Users, Star, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFeaturedImpression, useFeaturedClick } from '@/hooks/useFeaturedImpression';
import { useInView } from '@/hooks/useInView';

interface Moment {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  participant_count?: number;
  max_participants?: number;
  status?: 'upcoming' | 'active' | 'closed';
  sponsor_name?: string;
  sponsor_logo?: string;
  featured_placement_id?: string;
  prize_pool?: number;
}

interface FeaturedMomentCardProps {
  moment: Moment;
  variant?: 'default' | 'compact' | 'hero';
  onClick?: () => void;
}

export default function FeaturedMomentCard({ 
  moment, 
  variant = 'default',
  onClick 
}: FeaturedMomentCardProps) {
  const { trackImpression } = useFeaturedImpression();
  const { trackClick } = useFeaturedClick();
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });

  // Track impression when card comes into view
  React.useEffect(() => {
    if (inView && moment.featured_placement_id) {
      trackImpression(moment.featured_placement_id);
    }
  }, [inView, moment.featured_placement_id, trackImpression]);

  const handleClick = useCallback(() => {
    if (moment.featured_placement_id) {
      trackClick(moment.featured_placement_id);
    }
    onClick?.();
  }, [moment.featured_placement_id, trackClick, onClick]);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Get time remaining
  const getTimeRemaining = () => {
    if (!moment.end_date) return '';
    const end = new Date(moment.end_date);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  // Calculate progress
  const getProgress = () => {
    if (!moment.participant_count || !moment.max_participants) return 0;
    return Math.min(100, (moment.participant_count / moment.max_participants) * 100);
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <Link
        ref={ref}
        to={`/moments/${moment.id}`}
        onClick={handleClick}
        className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/40 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] group"
      >
        {/* Image */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={moment.image_url || '/default-moment.jpg'}
            alt={moment.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 p-1">
            <Badge className="bg-primary text-white text-[10px] px-1 py-0">
              <Star className="w-2 h-2 mr-0.5" />
              Featured
            </Badge>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
            {moment.name}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            {moment.location && (
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {moment.location}
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {getTimeRemaining()}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </Link>
    );
  }

  // Hero variant (large featured card)
  if (variant === 'hero') {
    return (
      <Link
        ref={ref}
        to={`/moments/${moment.id}`}
        onClick={handleClick}
        className="relative block rounded-2xl overflow-hidden group"
      >
        {/* Background Image */}
        <div className="aspect-[21/9] relative">
          <img
            src={moment.image_url || '/default-moment.jpg'}
            alt={moment.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          {/* Badge Row */}
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-primary text-white border-0">
              <Star className="w-3 h-3 mr-1" />
              Featured Moment
            </Badge>
            {moment.prize_pool && (
              <Badge className="bg-yellow-500/90 text-white border-0">
                ${moment.prize_pool.toLocaleString()} Prize
              </Badge>
            )}
            {moment.sponsor_name && (
              <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
                {moment.sponsor_name}
              </Badge>
            )}
          </div>

          {/* Title & Description */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 line-clamp-1">
            {moment.name}
          </h2>
          <p className="text-white/80 text-sm md:text-base line-clamp-2 max-w-2xl mb-4">
            {moment.description}
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
            {moment.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {moment.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {getTimeRemaining()}
            </span>
            {moment.participant_count !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {moment.participant_count.toLocaleString()} joined
              </span>
            )}
            {moment.max_participants && (
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${getProgress()}%` }}
                  />
                </div>
                <span>{Math.round(getProgress())}% full</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      ref={ref}
      to={`/moments/${moment.id}`}
      onClick={handleClick}
      className="relative block rounded-xl overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] group bg-card"
    >
      {/* Image */}
      <div className="aspect-video relative">
        <img
          src={moment.image_url || '/default-moment.jpg'}
          alt={moment.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Featured Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-primary text-white border-0 shadow-lg">
            <TrendingUp className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        </div>

        {/* Time Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-black/50 text-white border-0 backdrop-blur-sm">
            <Clock className="w-3 h-3 mr-1" />
            {getTimeRemaining()}
          </Badge>
        </div>

        {/* Prize Pool Overlay */}
        {moment.prize_pool && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-yellow-500/90 text-white border-0">
              ${moment.prize_pool.toLocaleString()} Pool
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {moment.name}
        </h3>

        {/* Description */}
        {moment.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {moment.description}
          </p>
        )}

        {/* Footer Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            {moment.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {moment.location}
              </span>
            )}
            {moment.participant_count !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {moment.participant_count.toLocaleString()}
              </span>
            )}
          </div>

          {moment.sponsor_name && (
            <div className="flex items-center gap-1.5 text-xs">
              {moment.sponsor_logo ? (
                <img 
                  src={moment.sponsor_logo} 
                  alt="" 
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">
                    {moment.sponsor_name[0]}
                  </span>
                </div>
              )}
              <span className="text-muted-foreground">{moment.sponsor_name}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Button className="w-full mt-4" size="sm">
          Join Moment
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Link>
  );
}

/**
 * FEATURED MOMENT GRID
 * 
 * Grid layout for displaying multiple featured moments
 */
export function FeaturedMomentGrid({ 
  moments,
  limit = 4 
}: { 
  moments: Moment[];
  limit?: number;
}) {
  const displayMoments = moments.slice(0, limit);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Featured Moments</h3>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayMoments.map((moment) => (
          <FeaturedMomentCard key={moment.id} moment={moment} />
        ))}
      </div>
    </div>
  );
}

/**
 * FEATURED HERO BANNER
 * 
 * Premium placement at the top of the homepage.
 * Rotates through active featured content, moments, and pools.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronLeft, ChevronRight, Clock, Users, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFeaturedImpression } from '@/hooks/useFeaturedImpression';
import { API_BASE_URL } from '@/lib/api';

interface FeaturedPlacement {
  id: string;
  placement_type: string;
  entity_type: 'content' | 'moment' | 'promoshare_pool';
  entity_id: string;
  entity_data?: {
    title?: string;
    description?: string;
    image_url?: string;
    sponsor_name?: string;
    participant_count?: number;
    prize_pool?: number;
  };
  user?: {
    username: string;
    display_name: string;
    profile_image?: string;
  };
}

export default function FeaturedHeroBanner() {
  const [placements, setPlacements] = useState<FeaturedPlacement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { trackImpression } = useFeaturedImpression();

  useEffect(() => {
    fetchFeaturedPlacements();
  }, []);

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (placements.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % placements.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [placements.length]);

  // Track impression when banner changes
  useEffect(() => {
    if (placements[currentIndex]) {
      trackImpression(placements[currentIndex].id);
    }
  }, [currentIndex, placements, trackImpression]);

  const fetchFeaturedPlacements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/featured-marketplace/active?placement_type=homepage_hero&limit=5`);
      if (!response.ok) {
        throw new Error(`Featured hero request failed with ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.placements.length > 0) {
        setPlacements(data.placements);
      }
    } catch (error) {
      console.error('Error fetching hero placements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % placements.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + placements.length) % placements.length);
  };

  const getEntityUrl = (placement: FeaturedPlacement) => {
    switch (placement.entity_type) {
      case 'moment':
        return `/moments/${placement.entity_id}`;
      case 'promoshare_pool':
        return `/promoshare`;
      case 'content':
        return `/watch-unlock/${placement.entity_id}`;
      default:
        return '#';
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'moment':
        return <Clock className="w-4 h-4" />;
      case 'promoshare_pool':
        return <Trophy className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[400px] bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl animate-pulse" />
    );
  }

  if (placements.length === 0) {
    return null; // Don't render if no featured content
  }

  const current = placements[currentIndex];
  const entity = current.entity_data;

  return (
    <div className="relative w-full">
      {/* Main Banner */}
      <div className="relative w-full h-[400px] rounded-xl overflow-hidden group">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-700"
          style={{ 
            backgroundImage: `url(${entity?.image_url || '/default-banner.jpg'})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>

        {/* Sponsored Badge */}
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-primary/90 text-white border-0 px-3 py-1">
            <Sparkles className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
          <div className="max-w-3xl">
            {/* Entity Type */}
            <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
              {getEntityIcon(current.entity_type)}
              <span className="capitalize">{current.entity_type.replace('_', ' ')}</span>
              {current.user && (
                <>
                  <span className="mx-1">•</span>
                  <span>by {current.user.display_name}</span>
                </>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 line-clamp-2">
              {entity?.title || 'Featured Content'}
            </h2>

            {/* Description */}
            <p className="text-white/80 text-sm md:text-base mb-4 line-clamp-2 max-w-2xl">
              {entity?.description || 'Check out this featured content!'}
            </p>

            {/* Stats & CTA */}
            <div className="flex items-center gap-4">
              <Link to={getEntityUrl(current)}>
                <Button size="lg" className="bg-white text-black hover:bg-white/90">
                  View Details
                </Button>
              </Link>
              
              {entity?.participant_count && (
                <div className="flex items-center gap-1 text-white/80 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{entity.participant_count} participants</span>
                </div>
              )}
              
              {entity?.prize_pool && (
                <div className="flex items-center gap-1 text-yellow-400 text-sm font-medium">
                  <Trophy className="w-4 h-4" />
                  <span>${entity.prize_pool} prize pool</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {placements.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots */}
      {placements.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {placements.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] ${
                index === currentIndex 
                  ? 'bg-primary w-6' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

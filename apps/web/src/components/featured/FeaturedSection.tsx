/**
 * FEATURED SECTION
 * 
 * Grid display of featured content below the hero banner.
 * Shows 6 featured items in a responsive grid.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Clock, Eye, Trophy, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useFeaturedImpression } from '@/hooks/useFeaturedImpression';
import { useInView } from '@/hooks/useInView';
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

export default function FeaturedSection() {
  const [placements, setPlacements] = useState<FeaturedPlacement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { trackImpression } = useFeaturedImpression();
  const { ref, inView } = useInView({ threshold: 0.5 });

  useEffect(() => {
    fetchFeaturedPlacements();
  }, []);

  // Track impressions when section comes into view
  useEffect(() => {
    if (inView && placements.length > 0) {
      placements.forEach(placement => {
        trackImpression(placement.id);
      });
    }
  }, [inView, placements, trackImpression]);

  const fetchFeaturedPlacements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/featured-marketplace/active?placement_type=homepage_featured&limit=6`);
      if (!response.ok) {
        throw new Error(`Featured section request failed with ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.placements.length > 0) {
        setPlacements(data.placements);
      }
    } catch (error) {
      console.error('Error fetching featured placements:', error);
    } finally {
      setIsLoading(false);
    }
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
        return <Clock className="w-3 h-3" />;
      case 'promoshare_pool':
        return <Trophy className="w-3 h-3" />;
      default:
        return <Eye className="w-3 h-3" />;
    }
  };

  const getEntityLabel = (type: string) => {
    switch (type) {
      case 'moment':
        return 'Moment';
      case 'promoshare_pool':
        return 'Giveaway';
      case 'content':
        return 'Content';
      default:
        return 'Featured';
    }
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (placements.length === 0) {
    return null;
  }

  return (
    <div ref={ref} className="py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Featured</h3>
        </div>
        <Link 
          to="/explore/moments" 
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Featured Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {placements.map((placement) => {
          const entity = placement.entity_data;
          
          return (
            <Link
              key={placement.id}
              to={getEntityUrl(placement)}
              className="group relative h-48 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ 
                  backgroundImage: `url(${entity?.image_url || '/default-card.jpg'})`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>

              {/* Featured Badge */}
              <div className="absolute top-3 left-3 z-10">
                <Badge 
                  variant="secondary" 
                  className="bg-white/90 text-black text-xs border-0"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {getEntityLabel(placement.entity_type)}
                </Badge>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">
                  {entity?.title || 'Featured Content'}
                </h4>
                
                <div className="flex items-center gap-2 text-white/70 text-xs">
                  {getEntityIcon(placement.entity_type)}
                  <span>{placement.user?.display_name || 'Promorang'}</span>
                  
                  {entity?.prize_pool && (
                    <>
                      <span className="mx-1">•</span>
                      <span className="text-yellow-400">${entity.prize_pool} pool</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

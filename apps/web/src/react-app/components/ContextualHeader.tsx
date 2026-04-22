import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Cake, 
  Heart, 
  Gift, 
  Calendar, 
  Music, 
  Trophy, 
  Sun, 
  Snowflake, 
  Leaf,
  Flower,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface UserContext {
  current_season: string;
  age_group?: string;
  upcoming_personal_events: Array<{
    type: string;
    title: string;
    days_until: number;
  }>;
  global_context?: {
    next_holiday?: {
      name: string;
      start_date: string;
    };
    days_until_holiday?: number;
    active_sports_events?: Array<{
      name: string;
      short_name: string;
      sport_type: string;
    }>;
    active_music_events?: Array<{
      name: string;
      short_name: string;
      genre: string;
    }>;
  };
}

interface ContextualBanner {
  id: string;
  type: 'birthday' | 'anniversary' | 'holiday' | 'event' | 'seasonal' | 'personal';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    link: string;
  };
  color: string;
  dismissible?: boolean;
}

export function ContextualHeader() {
  const [context, setContext] = useState<UserContext | null>(null);
  const [banners, setBanners] = useState<ContextualBanner[]>([]);
  const [dismissedBanners, setDismissedBanners] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserContext();
    // Refresh every hour
    const interval = setInterval(fetchUserContext, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (context) {
      generateBanners(context);
    }
  }, [context]);

  const fetchUserContext = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/users/me/context');
      if (response.data?.context) {
        setContext(response.data.context);
      }
    } catch (error) {
      console.error('Failed to fetch user context:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateBanners = (ctx: UserContext) => {
    const newBanners: ContextualBanner[] = [];

    // Personal events (birthdays, anniversaries)
    ctx.upcoming_personal_events?.forEach(event => {
      if (event.days_until <= 7) {
        if (event.type === 'my_birthday') {
          newBanners.push({
            id: `birthday-${event.days_until}`,
            type: 'birthday',
            title: event.days_until === 0 
              ? '🎉 Happy Birthday!' 
              : `🎂 Your birthday is in ${event.days_until} days!`,
            subtitle: event.days_until === 0 
              ? 'Claim your special birthday reward'
              : 'Get ready for exclusive birthday experiences',
            icon: <Cake className="w-5 h-5" />,
            action: {
              label: event.days_until === 0 ? 'Claim Reward' : 'See Previews',
              link: '/calendar'
            },
            color: 'bg-gradient-to-r from-pink-100 to-purple-100 border-pink-200',
            dismissible: true
          });
        } else if (event.type === 'anniversary') {
          newBanners.push({
            id: `anniversary-${event.days_until}`,
            type: 'anniversary',
            title: `💕 ${event.title} ${event.days_until === 0 ? 'is today!' : `in ${event.days_until} days`}`,
            subtitle: event.days_until === 0 
              ? 'Celebrate your special day'
              : 'Plan something memorable',
            icon: <Heart className="w-5 h-5" />,
            action: {
              label: event.days_until === 0 ? 'Celebrate' : 'Plan Experience',
              link: '/experiences?filter=couples'
            },
            color: 'bg-gradient-to-r from-red-100 to-pink-100 border-red-200',
            dismissible: true
          });
        } else if (event.type === 'partner_birthday') {
          newBanners.push({
            id: `partner-bday-${event.days_until}`,
            type: 'personal',
            title: `${event.title} ${event.days_until === 0 ? 'is today!' : `in ${event.days_until} days`}`,
            subtitle: event.days_until === 0 
              ? 'Make today unforgettable'
              : 'Find the perfect gift',
            icon: <Gift className="w-5 h-5" />,
            action: {
              label: event.days_until === 0 ? 'Celebrate' : 'Find Gifts',
              link: '/gifts'
            },
            color: 'bg-gradient-to-r from-blue-100 to-purple-100 border-blue-200',
            dismissible: true
          });
        }
      }
    });

    // Holiday alerts
    if (ctx.global_context?.next_holiday && ctx.global_context.days_until_holiday !== undefined) {
      const daysUntil = ctx.global_context.days_until_holiday;
      if (daysUntil <= 14) {
        const holiday = ctx.global_context.next_holiday;
        newBanners.push({
          id: `holiday-${holiday.name}`,
          type: 'holiday',
          title: `${getHolidayEmoji(holiday.name)} ${holiday.name} ${daysUntil === 0 ? 'is today!' : `in ${daysUntil} days`}`,
          subtitle: daysUntil <= 3 
            ? 'Last-minute opportunities available!'
            : 'Seasonal content opportunities are live',
          icon: <Calendar className="w-5 h-5" />,
          action: {
            label: 'See Opportunities',
            link: '/drops?seasonal=true'
          },
          color: getHolidayColor(holiday.name),
          dismissible: true
        });
      }
    }

    // Active sports events
    ctx.global_context?.active_sports_events?.slice(0, 1).forEach(event => {
      newBanners.push({
        id: `sports-${event.name}`,
        type: 'event',
        title: `🏆 ${event.short_name || event.name}`,
        subtitle: `Get paid to create ${event.sport_type} content!`,
        icon: <Trophy className="w-5 h-5" />,
        action: {
          label: 'See Content Ops',
          link: '/drops?category=sports'
        },
        color: 'bg-gradient-to-r from-orange-100 to-yellow-100 border-orange-200',
        dismissible: true
      });
    });

    // Active music events
    ctx.global_context?.active_music_events?.slice(0, 1).forEach(event => {
      newBanners.push({
        id: `music-${event.name}`,
        type: 'event',
        title: `🎵 ${event.short_name || event.name}`,
        subtitle: 'Music content opportunities trending now',
        icon: <Music className="w-5 h-5" />,
        action: {
          label: 'Explore',
          link: '/drops?category=music'
        },
        color: 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200',
        dismissible: true
      });
    });

    // Seasonal context (if no other banners)
    if (newBanners.length === 0 && ctx.current_season) {
      const seasonData = getSeasonalData(ctx.current_season);
      newBanners.push({
        id: `season-${ctx.current_season}`,
        type: 'seasonal',
        title: `${seasonData.emoji} ${seasonData.greeting}`,
        subtitle: seasonData.subtitle,
        icon: seasonData.icon,
        action: {
          label: 'See What\'s Hot',
          link: `/drops?season=${ctx.current_season}`
        },
        color: seasonData.color,
        dismissible: true
      });
    }

    setBanners(newBanners);
  };

  const getHolidayEmoji = (name: string): string => {
    const emojis: Record<string, string> = {
      'Christmas': '🎄',
      'New Year': '🎆',
      'Valentine': '💕',
      'Halloween': '🎃',
      'Thanksgiving': '🦃',
      'Diwali': '🪔',
      'Lunar New Year': '🧧',
      'Eid': '🌙',
      'Easter': '🐰',
      'Super Bowl': '🏈',
      'World Cup': '⚽'
    };
    return Object.entries(emojis).find(([key]) => name.includes(key))?.[1] || '🎉';
  };

  const getHolidayColor = (name: string): string => {
    if (name.includes('Christmas') || name.includes('Valentine')) {
      return 'bg-gradient-to-r from-red-100 to-green-100 border-red-200';
    }
    if (name.includes('Halloween')) {
      return 'bg-gradient-to-r from-orange-100 to-purple-100 border-orange-200';
    }
    if (name.includes('New Year')) {
      return 'bg-gradient-to-r from-blue-100 to-purple-100 border-blue-200';
    }
    return 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-200';
  };

  const getSeasonalData = (season: string) => {
    switch (season) {
      case 'spring':
        return {
          emoji: '🌸',
          greeting: 'Spring is here!',
          subtitle: 'Fresh opportunities blooming everywhere',
          icon: <Flower className="w-5 h-5" />,
          color: 'bg-gradient-to-r from-green-100 to-pink-100 border-green-200'
        };
      case 'summer':
        return {
          emoji: '☀️',
          greeting: 'Summer vibes!',
          subtitle: 'Outdoor adventures and festival season',
          icon: <Sun className="w-5 h-5" />,
          color: 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-200'
        };
      case 'fall':
        return {
          emoji: '🍂',
          greeting: 'Fall into opportunities',
          subtitle: 'Cozy content and holiday prep',
          icon: <Leaf className="w-5 h-5" />,
          color: 'bg-gradient-to-r from-orange-100 to-yellow-100 border-orange-200'
        };
      case 'winter':
        return {
          emoji: '❄️',
          greeting: 'Winter wonderland',
          subtitle: 'Holiday season opportunities',
          icon: <Snowflake className="w-5 h-5" />,
          color: 'bg-gradient-to-r from-blue-100 to-purple-100 border-blue-200'
        };
      default:
        return {
          emoji: '✨',
          greeting: 'New opportunities await',
          subtitle: 'Check out today\'s featured drops',
          icon: <Sparkles className="w-5 h-5" />,
          color: 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200'
        };
    }
  };

  const dismissBanner = (id: string) => {
    setDismissedBanners(prev => [...prev, id]);
    // Store in localStorage to persist dismissal
    const dismissed = JSON.parse(localStorage.getItem('dismissedBanners') || '[]');
    dismissed.push({ id, timestamp: Date.now() });
    localStorage.setItem('dismissedBanners', JSON.stringify(dismissed));
  };

  // Filter out dismissed banners
  const visibleBanners = banners.filter(banner => {
    if (!banner.dismissible) return true;
    
    // Check if dismissed in current session
    if (dismissedBanners.includes(banner.id)) return false;
    
    // Check localStorage for dismissal (expire after 24 hours)
    const dismissed = JSON.parse(localStorage.getItem('dismissedBanners') || '[]');
    const wasDismissed = dismissed.find((d: any) => d.id === banner.id);
    if (wasDismissed) {
      const hoursSince = (Date.now() - wasDismissed.timestamp) / (1000 * 60 * 60);
      return hoursSince > 24; // Show again after 24 hours
    }
    
    return true;
  });

  if (isLoading || visibleBanners.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {visibleBanners.map((banner) => (
        <Card 
          key={banner.id} 
          className={`${banner.color} border-l-4 overflow-hidden`}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 p-2 bg-white/50 rounded-full">
                {banner.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{banner.title}</p>
                <p className="text-xs text-muted-foreground truncate">{banner.subtitle}</p>
              </div>
              
              {banner.action && (
                <Link to={banner.action.link}>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="flex-shrink-0 text-xs h-8 whitespace-nowrap"
                  >
                    {banner.action.label}
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              )}
              
              {banner.dismissible && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-shrink-0 h-8 w-8 p-0"
                  onClick={() => dismissBanner(banner.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Simplified inline version for use in other pages
export function InlineContextBanner({ 
  type, 
  title, 
  subtitle, 
  action 
}: { 
  type: 'birthday' | 'holiday' | 'event' | 'seasonal';
  title: string;
  subtitle: string;
  action?: { label: string; onClick: () => void };
}) {
  const styles = {
    birthday: 'bg-gradient-to-r from-pink-100 to-purple-100 border-pink-200',
    holiday: 'bg-gradient-to-r from-green-100 to-red-100 border-green-200',
    event: 'bg-gradient-to-r from-orange-100 to-yellow-100 border-orange-200',
    seasonal: 'bg-gradient-to-r from-blue-100 to-purple-100 border-blue-200'
  };

  return (
    <Card className={`${styles[type]} border-l-4`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          {action && (
            <Button size="sm" variant="secondary" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ContextualHeader;

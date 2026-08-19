import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Sparkles, 
  ArrowRight,
  Navigation,
  Clock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays } from "date-fns";

interface SuggestedMoment {
  id: string;
  title: string;
  description: string | null;
  location: string;
  starts_at: string;
  image_url: string | null;
  category: string;
  host_name: string;
  host_avatar: string | null;
  participant_count: number;
  max_participants: number | null;
  distance_km?: number;
  reason: string;
}

interface SuggestedMomentsProps {
  limit?: number;
  onDismiss?: () => void;
}

export function SuggestedMoments({ limit = 3, onDismiss }: SuggestedMomentsProps) {
  const { user, profile } = useAuth();
  const [moments, setMoments] = useState<SuggestedMoment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchSuggestedMoments = async () => {
      setLoading(true);
      try {
        // Get user's location if available
        const userCity = profile?.city || profile?.location;
        
        // Build query - prioritize upcoming moments
        let query = supabase
          .from('moments')
          .select(`
            id, title, description, location, starts_at, image_url, category,
            max_participants,
            host:host_id(display_name, username, avatar_url)
          `)
          .eq('is_active', true)
          .gte('starts_at', new Date().toISOString())
          .order('starts_at', { ascending: true })
          .limit(limit * 2);

        // If user has location, try to prioritize local moments
        if (userCity) {
          query = query.ilike('location', `%${userCity}%`);
        }

        const { data: momentsData, error } = await query;

        if (error) throw error;

        // Get participant counts and enhance data
        const momentsWithCounts = await Promise.all(
          (momentsData || []).map(async (m: any) => {
            const { count } = await supabase
              .from('moment_participants')
              .select('*', { count: 'exact', head: true })
              .eq('moment_id', m.id);

            // Determine reason for suggestion
            const daysUntil = differenceInDays(new Date(m.starts_at), new Date());
            let reason = "Recommended for you";
            if (daysUntil <= 3) {
              reason = "Happening soon";
            } else if ((count || 0) > 10) {
              reason = "Popular right now";
            } else if (m.category === 'social' || m.category === 'networking') {
              reason = "Great for meeting people";
            }

            return {
              id: m.id,
              title: m.title,
              description: m.description,
              location: m.location,
              starts_at: m.starts_at,
              image_url: m.image_url,
              category: m.category,
              host_name: m.host?.display_name || m.host?.username || 'Unknown Host',
              host_avatar: m.host?.avatar_url,
              participant_count: count || 0,
              max_participants: m.max_participants,
              reason
            };
          })
        );

        // Limit to requested number
        setMoments(momentsWithCounts.slice(0, limit));
      } catch (error) {
        console.error('Error fetching suggested moments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedMoments();
  }, [user, profile, limit]);

  if (dismissed) return null;
  if (!loading && moments.length === 0) return null;

  return (
    <Card className="mb-8 border-accent/20 bg-gradient-to-br from-accent/5 via-background to-primary/5 overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                Explore
              </span>
            </div>
            <h2 className="text-xl font-bold font-serif">Moments for You</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {loading ? "Finding experiences near you..." : "Based on your interests and location"}
            </p>
          </div>
          {onDismiss && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setDismissed(true); onDismiss(); }}
            >
              Hide
            </Button>
          )}
        </div>

        {/* Moments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden border border-border">
                <Skeleton className="w-full h-32" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : (
            moments.map((moment) => {
              const daysUntil = differenceInDays(new Date(moment.starts_at), new Date());
              
              return (
                <Link
                  key={moment.id}
                  to={`/moments/${moment.id}`}
                  className="group block bg-card rounded-xl overflow-hidden border border-border hover:border-accent/50 hover:shadow-lg transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]"
                >
                  {/* Image */}
                  <div className="relative h-32 overflow-hidden">
                    {moment.image_url ? (
                      <img
                        src={moment.image_url}
                        alt={moment.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge 
                        variant="secondary" 
                        className="bg-black/60 text-white border-0 text-[10px] backdrop-blur-sm"
                      >
                        {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
                      </Badge>
                    </div>
                    
                    {/* Category */}
                    <div className="absolute bottom-2 right-2">
                      <Badge 
                        variant="outline" 
                        className="bg-white/90 text-foreground border-0 text-[10px] capitalize"
                      >
                        {moment.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-medium text-sm line-clamp-1 group-hover:text-accent transition-colors">
                      {moment.title}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{moment.location}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{moment.participant_count} joined</span>
                      </div>
                      
                      <span className="text-[10px] text-accent font-medium">
                        {moment.reason}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {moments.length} {moments.length === 1 ? "experience" : "experiences"} found near you
          </p>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/explore/moments" className="group">
              Browse All
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SuggestedMoments;

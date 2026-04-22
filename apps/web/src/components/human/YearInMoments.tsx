import { useState } from 'react';
import { Sparkles, MapPin, Users, Calendar, Award, TrendingUp, Heart, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useStakeholderLeverage, UserYearlyMoments, getJourneyTypeMeta } from '@/hooks/useStakeholderLeverage';
import { toast } from 'sonner';

interface YearInMomentsProps {
  year?: number;
}

export function YearInMoments({ year }: YearInMomentsProps) {
  const targetYear = year || new Date().getFullYear();
  const { useUserYearlyMoments } = useStakeholderLeverage();
  const { data: yearlyData, isLoading } = useUserYearlyMoments(targetYear);
  const [showReflection, setShowReflection] = useState(false);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }

  if (!yearlyData) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-serif text-xl font-semibold mb-2">Your {targetYear} Journey</h3>
          <p className="text-muted-foreground mb-4">
            Start attending moments and your year in review will come alive with insights about your growth, connections, and experiences.
          </p>
          <Button variant="hero">Discover Moments</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Your Year in Moments
          </span>
        </div>
        <h2 className="font-serif text-3xl font-bold">{targetYear}</h2>
        {yearlyData.ai_generated_summary && (
          <p className="text-muted-foreground max-w-lg mx-auto">
            {yearlyData.ai_generated_summary}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          value={yearlyData.total_moments}
          label="Moments"
          color="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          value={yearlyData.new_connections}
          label="New Connections"
          color="bg-green-500/10 text-green-600"
        />
        <StatCard
          icon={<MapPin className="w-5 h-5" />}
          value={yearlyData.cities_visited}
          label="Cities"
          color="bg-purple-500/10 text-purple-600"
        />
        <StatCard
          icon={<Award className="w-5 h-5" />}
          value={yearlyData.skills_started + yearlyData.skills_advanced}
          label="Skills"
          color="bg-amber-500/10 text-amber-600"
        />
      </div>

      {/* The Story of Your Year */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            The Story of Your Year
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Categories & Archetypes */}
          {yearlyData.unique_categories.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">What you explored</p>
              <div className="flex flex-wrap gap-2">
                {yearlyData.unique_categories.map((cat) => (
                  <Badge key={cat} variant="secondary">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Neighborhoods */}
          {yearlyData.neighborhoods_explored.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Neighborhoods discovered</p>
              <div className="flex flex-wrap gap-2">
                {yearlyData.neighborhoods_explored.map((hood) => (
                  <Badge key={hood} variant="outline" className="gap-1">
                    <MapPin className="w-3 h-3" />
                    {hood}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Community Impact */}
          {yearlyData.community_hours > 0 && (
            <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
              <Heart className="w-5 h-5 text-rose-500" />
              <div>
                <p className="font-medium">Community Builder</p>
                <p className="text-sm text-muted-foreground">
                  You spent {yearlyData.community_hours} hours building community
                </p>
              </div>
            </div>
          )}

          {/* Featured Photo */}
          {yearlyData.featured_photo_url && (
            <div className="relative">
              <img
                src={yearlyData.featured_photo_url}
                alt="Year highlight"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-sm font-medium flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Your Year in Photos
                </p>
              </div>
            </div>
          )}

          {/* User's Written Story */}
          {showReflection || yearlyData.year_in_review_story ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Your reflection</p>
              <p className="text-foreground leading-relaxed">
                {yearlyData.year_in_review_story || 
                  "Write your own story of this year—what did these moments mean to you?"}
              </p>
              <Button variant="outline" size="sm" onClick={() => setShowReflection(true)}>
                {yearlyData.year_in_review_story ? 'Edit' : 'Write'} Your Story
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowReflection(true)}
            >
              Write Your {targetYear} Story
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Highlight Reel */}
      {yearlyData.highlight_reel_urls && yearlyData.highlight_reel_urls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Highlight Reel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {yearlyData.highlight_reel_urls.map((url, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-md bg-cover bg-center"
                  style={{ backgroundImage: `url(${url})` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ 
  icon, 
  value, 
  label, 
  color 
}: { 
  icon: React.ReactNode; 
  value: number; 
  label: string; 
  color: string;
}) {
  return (
    <div className="bg-card border rounded-lg p-4 text-center">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2", color)}>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

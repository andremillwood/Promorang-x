import { useEffect } from 'react';
import { Sparkles, UserPlus, X, RefreshCw, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserDiscovery } from '@/hooks/useUserDiscovery';

export function UserRecommendationsList() {
  const { 
    useUserRecommendations, 
    followUser, 
    dismissRecommendation, 
    generateRecommendations 
  } = useUserDiscovery();
  
  const { data: recommendations, isLoading } = useUserRecommendations();

  // Generate recommendations on first load if none exist
  useEffect(() => {
    if (!isLoading && recommendations?.length === 0) {
      generateRecommendations.mutate();
    }
  }, [isLoading, recommendations]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            We need more data about your moments to generate personalized recommendations.
          </p>
          <Button onClick={() => generateRecommendations.mutate()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate Recommendations
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Based on your moment patterns and interests
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => generateRecommendations.mutate()}
          className="gap-1"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {recommendations.map((rec) => (
        <Card key={rec.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">Recommended for You</h3>
                    {rec.recommendation_reason && (
                      <p className="text-sm text-muted-foreground">{rec.recommendation_reason}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => followUser.mutate({ 
                        userId: rec.recommended_user_id, 
                        source: 'recommendation' 
                      })}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Follow
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissRecommendation.mutate(rec.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Similarity Score */}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {Math.round((rec.similarity_score || 0) * 100)}% match
                  </Badge>
                  {rec.shared_moments_count > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      {rec.shared_moments_count} shared moments
                    </Badge>
                  )}
                </div>

                {/* Shared Categories */}
                {rec.shared_moment_categories && rec.shared_moment_categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rec.shared_moment_categories.map((cat) => (
                      <Badge key={cat} variant="outline" className="text-xs capitalize">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import { UserPlus, MapPin, Star, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserDiscovery } from '@/hooks/useUserDiscovery';

interface UserSearchResultsProps {
  results: Array<{
    user_id: string;
    display_name: string;
    headline: string | null;
    location: string | null;
    interests: string[];
    rank: number;
  }>;
  isLoading: boolean;
}

export function UserSearchResults({ results, isLoading }: UserSearchResultsProps) {
  const { followUser } = useUserDiscovery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No users found matching your search</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((user) => (
        <Card key={user.user_id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={undefined} />
                <AvatarFallback>{user.display_name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{user.display_name}</h3>
                    {user.headline && (
                      <p className="text-sm text-muted-foreground">{user.headline}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => followUser.mutate({ userId: user.user_id, source: 'search' })}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Follow
                  </Button>
                </div>

                {user.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    {user.location}
                  </div>
                )}

                {user.interests && user.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.interests.slice(0, 4).map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                    {user.interests.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.interests.length - 4}
                      </Badge>
                    )}
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

import { Users, UserPlus, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserDiscovery } from '@/hooks/useUserDiscovery';

export function MomentOverlapUsers() {
  const { useMomentOverlapUsers, followUser } = useUserDiscovery();
  const { data: users, isLoading } = useMomentOverlapUsers(1);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">No Moment Overlaps Yet</h3>
          <p className="text-sm text-muted-foreground">
            As you attend more moments, you'll discover people who were there with you.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        People who attended the same moments as you
      </p>

      {users.map((user) => (
        <Card key={user.user_id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarFallback>{user.display_name?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                  {user.shared_moments}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{user.display_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {user.shared_moments} shared moment{user.shared_moments !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => followUser.mutate({ 
                      userId: user.user_id, 
                      source: 'moment_overlap' 
                    })}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Connect
                  </Button>
                </div>

                {/* Similarity Score */}
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Moment similarity</span>
                    <div className="flex-1 h-2 bg-secondary rounded-full max-w-[100px]">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(user.similarity_score || 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs">{Math.round((user.similarity_score || 0) * 100)}%</span>
                  </div>
                </div>

                {/* Suggested connection reason */}
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    You might know each other from shared experiences
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

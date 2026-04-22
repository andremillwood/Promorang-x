import { useState } from 'react';
import { MapPin, Link2, Users, Calendar, Award, UserPlus, UserCheck, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useUserDiscovery } from '@/hooks/useUserDiscovery';
import { useStakeholderLeverage } from '@/hooks/useStakeholderLeverage';

interface PublicProfileViewProps {
  userId: string;
}

export function PublicProfileView({ userId }: PublicProfileViewProps) {
  const { usePublicProfile, useMyFollowing, followUser, unfollowUser } = useUserDiscovery();
  const { useUserJourneys, useUserIdentityMarkers } = useStakeholderLeverage();
  
  const { data: profile, isLoading: profileLoading } = usePublicProfile(userId);
  const { data: journeys, isLoading: journeysLoading } = useUserJourneys();
  const { data: identityMarkers, isLoading: markersLoading } = useUserIdentityMarkers();
  const { data: myFollowing } = useMyFollowing();

  const isFollowing = myFollowing?.some((f: any) => f.following_id === userId);
  const userJourneys = journeys?.filter(j => j.user_id === userId) || [];
  const userMarkers = identityMarkers?.filter(m => m.user_id === userId && m.is_user_confirmed) || [];

  if (profileLoading || journeysLoading || markersLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Profile not found or private</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={undefined} />
              <AvatarFallback className="text-2xl">{profile.display_name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{profile.display_name}</h1>
                  {profile.headline && (
                    <p className="text-muted-foreground">{profile.headline}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {isFollowing ? (
                    <Button variant="outline" onClick={() => unfollowUser.mutate(userId)}>
                      <UserCheck className="w-4 h-4 mr-1" />
                      Following
                    </Button>
                  ) : (
                    <Button onClick={() => followUser.mutate({ userId, source: 'profile_visit' })}>
                      <UserPlus className="w-4 h-4 mr-1" />
                      Follow
                    </Button>
                  )}
                  <Button variant="outline" size="icon">
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span><strong>{profile.follower_count}</strong> followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                  <span><strong>{profile.following_count}</strong> following</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span><strong>{profile.total_moments}</strong> moments</span>
                </div>
              </div>

              {/* Location & Links */}
              <div className="flex items-center gap-4 mt-2 text-sm">
                {profile.location && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-foreground leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <Badge key={interest} variant="secondary">
                  {interest}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Journey Types */}
      {profile.journey_types && profile.journey_types.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Journey Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.journey_types.map((type) => (
                <Badge key={type} variant="outline" className="capitalize text-sm">
                  {type}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Identity Dimensions */}
      {profile.identity_dimensions && profile.identity_dimensions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Identity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.identity_dimensions.map((dim) => (
                <Badge key={dim} className="capitalize bg-primary/10 text-primary">
                  {dim}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

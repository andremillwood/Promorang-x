import { Building2, User, Crown, Handshake, Heart, Star, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useUserTier, useVenueRelationship } from '@/hooks/useUserTier';
import { TierBadge, TierDot } from './TierBadge';

interface VenueRelationshipCardProps {
  venueId: string;
  venueName: string;
  venueCategory?: string;
}

export function VenueRelationshipCard({ 
  venueId, 
  venueName,
  venueCategory 
}: VenueRelationshipCardProps) {
  const { data: relationship, isLoading } = useVenueRelationship(venueId);
  
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="h-4 bg-secondary rounded w-3/4" />
        </CardContent>
      </Card>
    );
  }
  
  if (!relationship) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">New Venue</p>
              <p className="text-sm text-muted-foreground">
                No Marks yet. Be the first!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const { markCount, relationship: relType, tier, isRegular, firstMarkDate, lastMarkDate } = relationship;
  
  return (
    <Card className={cn(
      "transition-all",
      isRegular && "border-green-500/20 bg-green-50/30"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isRegular ? "bg-green-100" : "bg-secondary"
            )}>
              <Building2 className={cn(
                "w-5 h-5",
                isRegular ? "text-green-600" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{venueName}</p>
                <TierDot tier={tier} />
              </div>
              <p className="text-sm text-muted-foreground">
                {relType}
              </p>
              {venueCategory && (
                <p className="text-xs text-muted-foreground capitalize">
                  {venueCategory.replace('_', ' ')}
                </p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <Badge variant={isRegular ? "default" : "outline"} className="gap-1">
              <Award className="w-3 h-3" />
              {markCount} {markCount === 1 ? 'Mark' : 'Marks'}
            </Badge>
          </div>
        </div>
        
        {isRegular && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Heart className="w-4 h-4 text-rose-500" />
              <span className="text-green-700">
                You're a Regular here
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              First Mark: {new Date(firstMarkDate).toLocaleDateString()}
              {lastMarkDate && (
                <> • Last: {new Date(lastMarkDate).toLocaleDateString()}</>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Host relationship card
interface HostRelationshipCardProps {
  hostId: string;
  hostName: string;
  hostTier?: 'guest' | 'regular' | 'mover' | 'host';
}

export function HostRelationshipCard({ 
  hostId, 
  hostName,
  hostTier = 'host'
}: HostRelationshipCardProps) {
  const { useTierStatus } = useUserTier();
  const { data: myTier } = useTierStatus();
  
  // This is a simplified version - in reality you'd fetch the relationship
  const hasRelationship = true; // Placeholder
  const marksTogether = 3; // Placeholder
  
  const relationshipEmojis: Record<string, string> = {
    'guest-host': '🤝',
    'regular-host': '🤝',
    'mover-host': '⚡',
    'host-host': '👑',
  };
  
  const relationshipKey = `${myTier?.current_tier || 'guest'}-${hostTier}`;
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{hostName}</p>
              <TierBadge tier={hostTier} size="sm" />
            </div>
            <p className="text-sm text-muted-foreground">
              {hasRelationship ? 'Collaborative Partner' : 'Host'}
            </p>
          </div>
          <div className="text-2xl">
            {relationshipEmojis[relationshipKey] || '🤝'}
          </div>
        </div>
        
        {hasRelationship && marksTogether > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground">
              {marksTogether} shared moments
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Community relationship summary
export function CommunityRelationshipSummary() {
  const { useTierStatus } = useUserTier();
  const { data: status } = useTierStatus();
  
  if (!status) return null;
  
  const { current_tier, venue_relationships, host_relationships } = status;
  const regularVenues = venue_relationships.filter(v => v.marks_count >= 3);
  
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium mb-3">Your Community Standing</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <TierBadge tier={current_tier} />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Home Venues</span>
            <span className="font-medium">{regularVenues.length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Host Relationships</span>
            <span className="font-medium">{host_relationships.length}</span>
          </div>
        </div>
        
        {regularVenues.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Your Regular Spots</p>
            <div className="flex flex-wrap gap-2">
              {regularVenues.slice(0, 3).map(venue => (
                <Badge key={venue.venue_id} variant="secondary" className="text-xs">
                  <Building2 className="w-3 h-3 mr-1" />
                  {venue.venue_name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { Search, Users, Sparkles, MapPin, Compass } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserSearchResults } from './UserSearchResults';
import { UserRecommendationsList } from './UserRecommendationsList';
import { MomentOverlapUsers } from './MomentOverlapUsers';
import { useUserDiscovery } from '@/hooks/useUserDiscovery';

export function UserDiscovery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('discover');
  const { useSearchUsers } = useUserDiscovery();
  const { data: searchResults, isLoading: searchLoading } = useSearchUsers(searchQuery);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Compass className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Discover People
          </span>
        </div>
        <h2 className="font-serif text-3xl font-bold">Find Your People</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Connect with others who share your moments, interests, and journey
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, interest, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchQuery.length >= 2 && (
            <div className="mt-4">
              <UserSearchResults results={searchResults || []} isLoading={searchLoading} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discovery Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover" className="gap-2">
            <Sparkles className="w-4 h-4" />
            For You
          </TabsTrigger>
          <TabsTrigger value="moments" className="gap-2">
            <Users className="w-4 h-4" />
            Shared Moments
          </TabsTrigger>
          <TabsTrigger value="nearby" className="gap-2">
            <MapPin className="w-4 h-4" />
            Nearby
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-4">
          <UserRecommendationsList />
        </TabsContent>

        <TabsContent value="moments" className="mt-4">
          <MomentOverlapUsers />
        </TabsContent>

        <TabsContent value="nearby" className="mt-4">
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Location-based discovery coming soon. Enable location to find people near you.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

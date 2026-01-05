import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, Award, ShoppingBag, Zap, TrendingUp, 
  MapPin, Link as LinkIcon, Calendar, Check, Settings,
  Activity as ActivityIcon, Heart, MessageCircle, ShoppingCart, Trophy, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  profile_image: string;
  website_url: string;
  is_verified: boolean;
  created_at: string;
  
  // Social stats
  followers_count: number;
  following_count: number;
  connections_count: number;
  posts_count: number;
  
  // Activity stats
  drops_completed: number;
  products_sold: number;
  products_bought: number;
  referrals_made: number;
  total_earnings: number;
  
  // Referral tier
  referral_tier: string;
}

interface ProfileActivityEntry {
  id: string;
  activity_type: string;
  title: string;
  description: string;
  created_at: string;
  metadata?: Record<string, any> | null;
}

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [activity, setActivity] = useState<ProfileActivityEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!username) return;

    try {
      const response = await fetch(`/api/users/${username}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.status === 'success') {
        setProfile(data.data.user);
        setIsFollowing(data.data.is_following);
        setIsOwnProfile(data.data.is_own_profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [username]);

  const fetchActivity = useCallback(async (userId: string) => {
    try {
      setActivityLoading(true);
      setActivityError(null);

      const response = await fetch(`/api/users/${userId}/activity`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setActivity(data.data.activities || []);
      } else {
        setActivity([]);
        setActivityError(data.error || 'Unable to load activity timeline');
      }
    } catch (error) {
      console.error('Error fetching user activity:', error);
      setActivityError('Network error while loading activity');
      setActivity([]);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    if (username) {
      void fetchProfile();
    }
  }, [fetchProfile, username]);

  useEffect(() => {
    if (!profile?.id) return;
    fetchActivity(profile.id);
  }, [fetchActivity, profile?.id]);

  const formattedActivity = useMemo(() => {
    return activity.map((entry) => ({
      ...entry,
      timestamp: new Date(entry.created_at),
    })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [activity]);

  const renderActivityIcon = (type: string) => {
    switch (type) {
      case 'drop_completion':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'product_purchase':
        return <ShoppingCart className="w-4 h-4 text-blue-500" />;
      case 'referral':
        return <Users className="w-4 h-4 text-purple-500" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-orange-500" />;
      case 'social_share':
        return <Share2 className="w-4 h-4 text-pink-500" />;
      case 'engagement':
        return <Heart className="w-4 h-4 text-rose-500" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatActivityTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  const renderActivitySkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={`activity-skeleton-${index}`} className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-pr-surface-3 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 bg-pr-surface-3 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-pr-surface-3 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-pr-surface-3 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );

  const handleFollow = async () => {
    if (!profile) return;
    
    try {
      const newIsFollowing = !isFollowing;
      setIsFollowing(newIsFollowing);

      const endpoint = `/api/social/follow/${profile.id}`;
      const method = newIsFollowing ? 'POST' : 'DELETE';

      await fetch(endpoint, {
        method,
        credentials: 'include',
      });

      toast({
        title: newIsFollowing ? 'Following' : 'Unfollowed',
        description: `You ${newIsFollowing ? 'are now following' : 'unfollowed'} ${profile.display_name}`,
        type: 'success',
      });

      // Update follower count
      setProfile(prev => prev ? {
        ...prev,
        followers_count: prev.followers_count + (newIsFollowing ? 1 : -1)
      } : null);
    } catch (error) {
      console.error('Error toggling follow:', error);
      setIsFollowing(!isFollowing);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen-dynamic">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-pr-text-1">User not found</h2>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen-dynamic bg-pr-surface-2">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-48"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-32 mb-8">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <img
                src={profile.profile_image || 'https://via.placeholder.com/120'}
                alt={profile.display_name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />

              <div className="flex-1">
                {/* Name and Actions */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold text-pr-text-1">
                        {profile.display_name || profile.username}
                      </h1>
                      {profile.is_verified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Check className="h-3 w-3 mr-1" />
                          Verified
                        </span>
                      )}
                      {profile.referral_tier && profile.referral_tier !== 'bronze' && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          profile.referral_tier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                          profile.referral_tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-pr-surface-2 text-pr-text-1'
                        }`}>
                          {profile.referral_tier.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-pr-text-2">@{profile.username}</p>
                  </div>

                  <div className="flex gap-2">
                    {isOwnProfile ? (
                      <Button variant="outline" onClick={() => navigate('/settings/profile')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    ) : (
                      <Button
                        onClick={handleFollow}
                        className={isFollowing ? 'bg-pr-surface-3 text-pr-text-1 hover:bg-pr-surface-3' : 'bg-blue-600 hover:bg-blue-700'}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-pr-text-1 mb-4">{profile.bio}</p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-pr-text-2 mb-4">
                  {profile.website_url && (
                    <a
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      <LinkIcon className="h-4 w-4" />
                      {profile.website_url.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>

                {/* Social Stats */}
                <div className="flex gap-6">
                  <button
                    onClick={() => navigate(`/profile/${username}/followers`)}
                    className="hover:underline"
                  >
                    <span className="font-semibold text-pr-text-1">{profile.followers_count}</span>
                    <span className="text-pr-text-2 ml-1">Followers</span>
                  </button>
                  <button
                    onClick={() => navigate(`/profile/${username}/following`)}
                    className="hover:underline"
                  >
                    <span className="font-semibold text-pr-text-1">{profile.following_count}</span>
                    <span className="text-pr-text-2 ml-1">Following</span>
                  </button>
                  <div>
                    <span className="font-semibold text-pr-text-1">{profile.connections_count}</span>
                    <span className="text-pr-text-2 ml-1">Connections</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pr-text-2">Drops Completed</p>
                <p className="text-2xl font-bold text-pr-text-1 mt-2">{profile.drops_completed || 0}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pr-text-2">Products Sold</p>
                <p className="text-2xl font-bold text-pr-text-1 mt-2">{profile.products_sold || 0}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pr-text-2">Referrals Made</p>
                <p className="text-2xl font-bold text-pr-text-1 mt-2">{profile.referrals_made || 0}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pr-text-2">Total Earnings</p>
                <p className="text-2xl font-bold text-pr-text-1 mt-2">${profile.total_earnings || 0}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Tabs */}
        <Tabs defaultValue="activity" className="space-y-6">
          <div className="relative">
            <TabsList className="w-full flex md:inline-flex gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
              <TabsTrigger
                value="activity"
                className="min-w-[120px] justify-center whitespace-nowrap px-4 py-2 text-sm md:text-base"
              >
                Activity
              </TabsTrigger>
              <TabsTrigger
                value="drops"
                className="min-w-[120px] justify-center whitespace-nowrap px-4 py-2 text-sm md:text-base"
              >
                Drops
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="min-w-[120px] justify-center whitespace-nowrap px-4 py-2 text-sm md:text-base"
              >
                Products
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="min-w-[120px] justify-center whitespace-nowrap px-4 py-2 text-sm md:text-base"
              >
                Reviews
              </TabsTrigger>
            </TabsList>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white to-transparent md:hidden" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent md:hidden" />
          </div>

          <TabsContent value="activity">
            <Card className="p-6">
              {activityLoading ? (
                renderActivitySkeleton()
              ) : activityError ? (
                <div className="text-center py-8">
                  <p className="text-sm text-red-500 mb-2">{activityError}</p>
                  <Button variant="outline" size="sm" onClick={() => profile && fetchActivity(profile.id)}>
                    Retry
                  </Button>
                </div>
              ) : formattedActivity.length === 0 ? (
                <div className="text-center py-10">
                  <ActivityIcon className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <h3 className="text-lg font-semibold text-pr-text-1">No activity yet</h3>
                  <p className="text-sm text-pr-text-2 mt-1">
                    When {profile.display_name || profile.username} completes drops, referrals, or purchases, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {formattedActivity.map((entry) => (
                    <div key={entry.id} className="flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-full bg-pr-surface-2 flex items-center justify-center border border-pr-surface-3">
                          {renderActivityIcon(entry.activity_type)}
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-pr-text-1">{entry.title}</h4>
                          <span className="text-xs text-pr-text-2">
                            {formatActivityTimestamp(entry.timestamp)}
                          </span>
                        </div>
                        {entry.description && (
                          <p className="text-sm text-pr-text-2">{entry.description}</p>
                        )}
                        {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-pr-text-2">
                            {Object.entries(entry.metadata).slice(0, 4).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-2">
                                <span className="font-medium text-pr-text-2 capitalize">{key.replace(/_/g, ' ')}:</span>
                                <span className="truncate">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="drops">
            <Card className="p-6">
              <p className="text-pr-text-2 text-center">Completed drops coming soon</p>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="p-6">
              <p className="text-pr-text-2 text-center">Products coming soon</p>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="p-6">
              <p className="text-pr-text-2 text-center">Reviews coming soon</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

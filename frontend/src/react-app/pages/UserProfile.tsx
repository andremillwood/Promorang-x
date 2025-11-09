import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, Award, ShoppingBag, Zap, TrendingUp, 
  MapPin, Link as LinkIcon, Calendar, Check, Settings 
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

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
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
  };

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                      <h1 className="text-2xl font-bold text-gray-900">
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
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {profile.referral_tier.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">@{profile.username}</p>
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
                        className={isFollowing ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-gray-700 mb-4">{profile.bio}</p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
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
                    <span className="font-semibold text-gray-900">{profile.followers_count}</span>
                    <span className="text-gray-600 ml-1">Followers</span>
                  </button>
                  <button
                    onClick={() => navigate(`/profile/${username}/following`)}
                    className="hover:underline"
                  >
                    <span className="font-semibold text-gray-900">{profile.following_count}</span>
                    <span className="text-gray-600 ml-1">Following</span>
                  </button>
                  <div>
                    <span className="font-semibold text-gray-900">{profile.connections_count}</span>
                    <span className="text-gray-600 ml-1">Connections</span>
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
                <p className="text-sm font-medium text-gray-600">Drops Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{profile.drops_completed || 0}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products Sold</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{profile.products_sold || 0}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Referrals Made</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{profile.referrals_made || 0}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">${profile.total_earnings || 0}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Tabs */}
        <Tabs defaultValue="activity">
          <TabsList>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="drops">Drops</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-6">
            <Card className="p-6">
              <p className="text-gray-600 text-center">Activity timeline coming soon</p>
            </Card>
          </TabsContent>

          <TabsContent value="drops" className="mt-6">
            <Card className="p-6">
              <p className="text-gray-600 text-center">Completed drops coming soon</p>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <Card className="p-6">
              <p className="text-gray-600 text-center">Products coming soon</p>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card className="p-6">
              <p className="text-gray-600 text-center">Reviews coming soon</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

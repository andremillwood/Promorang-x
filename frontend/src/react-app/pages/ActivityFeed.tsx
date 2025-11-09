import { useEffect, useState } from 'react';
import { TrendingUp, Users, ShoppingBag, Award, Zap, Heart, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  title: string;
  description: string;
  image_url: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user: {
    username: string;
    display_name: string;
    profile_image: string;
    is_verified: boolean;
  };
}

export default function ActivityFeed() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('following');

  useEffect(() => {
    fetchFeed();
  }, [activeTab]);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'following' ? '/api/social/feed' : '/api/social/feed?type=trending';
      
      const response = await fetch(endpoint, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setActivities(data.data.activities);
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'drop_completion':
        return <Zap className="h-5 w-5 text-yellow-500" />;
      case 'product_purchase':
        return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case 'referral':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'achievement':
        return <Award className="h-5 w-5 text-orange-500" />;
      case 'review':
        return <MessageCircle className="h-5 w-5 text-green-500" />;
      default:
        return <TrendingUp className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'drop_completion':
        return 'bg-yellow-50 border-yellow-200';
      case 'product_purchase':
        return 'bg-blue-50 border-blue-200';
      case 'referral':
        return 'bg-purple-50 border-purple-200';
      case 'achievement':
        return 'bg-orange-50 border-orange-200';
      case 'review':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Feed</h1>
          <p className="text-gray-600">See what's happening in the Promorang community</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="following">Following</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="all">Everyone</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {activities.length === 0 ? (
              <Card className="p-12 text-center">
                <TrendingUp className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'following'
                    ? 'Follow users to see their activities here'
                    : 'Be the first to complete a drop or make a purchase!'}
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <Card
                    key={activity.id}
                    className={`p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 ${getActivityColor(activity.activity_type)}`}
                    onClick={() => {
                      // Navigate based on activity type
                      if (activity.activity_type === 'drop_completion') {
                        navigate('/earn');
                      } else if (activity.activity_type === 'product_purchase') {
                        navigate('/marketplace');
                      }
                    }}
                  >
                    <div className="flex gap-4">
                      {/* User Avatar */}
                      <img
                        src={activity.user.profile_image || 'https://via.placeholder.com/48'}
                        alt={activity.user.display_name}
                        className="w-12 h-12 rounded-full cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${activity.user.username}`);
                        }}
                      />

                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {activity.user.display_name || activity.user.username}
                            </span>
                            {activity.user.is_verified && (
                              <span className="text-blue-500">✓</span>
                            )}
                            <span className="text-gray-500">•</span>
                            <span className="text-sm text-gray-500">
                              {formatTimeAgo(activity.created_at)}
                            </span>
                          </div>
                          {getActivityIcon(activity.activity_type)}
                        </div>

                        {/* Content */}
                        <h3 className="font-medium text-gray-900 mb-1">{activity.title}</h3>
                        {activity.description && (
                          <p className="text-gray-600 text-sm mb-3">{activity.description}</p>
                        )}

                        {/* Image */}
                        {activity.image_url && (
                          <img
                            src={activity.image_url}
                            alt=""
                            className="w-full h-48 object-cover rounded-lg mb-3"
                          />
                        )}

                        {/* Engagement */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <button className="flex items-center gap-1 hover:text-red-600 transition-colors">
                            <Heart className="h-4 w-4" />
                            <span>{activity.likes_count}</span>
                          </button>
                          <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            <span>{activity.comments_count}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

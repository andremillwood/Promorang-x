import { useEffect, useRef, useState, useCallback } from 'react';
import { TrendingUp, Users, ShoppingBag, Award, Zap, Heart, MessageCircle, RefreshCw } from 'lucide-react';
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('following');
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActivities([]);
    setPage(1);
    setHasMore(true);
    fetchFeed(1, true);
  }, [activeTab]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadingMore]);

  const fetchFeed = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const baseEndpoint = activeTab === 'following' ? '/api/social/feed' : '/api/social/feed?type=trending';
      const endpoint = `${baseEndpoint}${baseEndpoint.includes('?') ? '&' : '?'}page=${pageNum}&limit=10`;
      
      const response = await fetch(endpoint, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        const newActivities = data.data.activities || [];
        setActivities((prev) => (reset ? newActivities : [...prev, ...newActivities]));
        setHasMore(newActivities.length === 10);
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage, false);
  }, [page]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchFeed(1, true);
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
        return <TrendingUp className="h-5 w-5 text-pr-text-2" />;
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
        return 'bg-pr-surface-2 border-pr-surface-3';
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

  if (loading && activities.length === 0) {
    return (
      <div className="min-h-screen-dynamic bg-pr-surface-2">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="h-10 w-64 bg-pr-surface-3 rounded-lg animate-pulse" />
          <div className="h-12 w-full bg-pr-surface-3 rounded-lg animate-pulse" />
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="rounded-xl border border-pr-surface-3 bg-pr-surface-card p-6 space-y-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-pr-surface-3 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-pr-surface-3 rounded w-3/4" />
                  <div className="h-4 bg-pr-surface-3 rounded w-full" />
                  <div className="h-4 bg-pr-surface-3 rounded w-2/3" />
                  <div className="h-32 bg-pr-surface-3 rounded-lg" />
                  <div className="flex gap-4">
                    <div className="h-4 w-16 bg-pr-surface-3 rounded" />
                    <div className="h-4 w-16 bg-pr-surface-3 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen-dynamic bg-pr-surface-2">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-pr-text-1 mb-2">Activity Feed</h1>
          <p className="text-pr-text-2">See what's happening in the Promorang community</p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList>
              <TabsTrigger value="following">Following</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="all">Everyone</TabsTrigger>
            </TabsList>
          </Tabs>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-pr-surface-2 transition-colors disabled:opacity-50"
            aria-label="Refresh feed"
          >
            <RefreshCw className={`h-5 w-5 text-pr-text-2 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>

          <TabsContent value={activeTab}>
            {activities.length === 0 ? (
              <Card className="p-12 text-center">
                <TrendingUp className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-pr-text-1 mb-2">No activities yet</h3>
                <p className="text-pr-text-2 mb-6">
                  {activeTab === 'following'
                    ? 'Follow users to see their activities here'
                    : 'Be the first to complete a drop or make a purchase!'}
                </p>
              </Card>
            ) : (
              <>
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
                            <span className="font-semibold text-pr-text-1">
                              {activity.user.display_name || activity.user.username}
                            </span>
                            {activity.user.is_verified && (
                              <span className="text-blue-500">✓</span>
                            )}
                            <span className="text-pr-text-2">•</span>
                            <span className="text-sm text-pr-text-2">
                              {formatTimeAgo(activity.created_at)}
                            </span>
                          </div>
                          {getActivityIcon(activity.activity_type)}
                        </div>

                        {/* Content */}
                        <h3 className="font-medium text-pr-text-1 mb-1">{activity.title}</h3>
                        {activity.description && (
                          <p className="text-pr-text-2 text-sm mb-3">{activity.description}</p>
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
                        <div className="flex items-center gap-4 text-sm text-pr-text-2">
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

                {loadingMore && (
                  <div className="py-8 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}

                {hasMore && !loadingMore && (
                  <div ref={observerTarget} className="h-4" />
                )}

                {!hasMore && activities.length > 0 && (
                  <p className="text-center text-sm text-pr-text-2 py-8">
                    You've reached the end of the feed
                  </p>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

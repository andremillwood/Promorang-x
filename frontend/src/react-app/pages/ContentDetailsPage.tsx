import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Heart, MessageCircle, Share2, ExternalLink, 
  Bookmark, MoreHorizontal, ChevronDown, ChevronUp, Loader2, AlertCircle, Bug
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

// Components
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import ErrorBoundary from '@/components/ErrorBoundary';

// Hooks
import { useApi } from '@/hooks/useApi';

// Services
import contentService, { ContentPieceType } from '@/services/contentService';
import userService from '@/services/userService';

// Utils
import { cn } from '@/lib/utils';

// Debug
const DEBUG = true;
const debugLog = (...args: any[]) => {
  if (DEBUG) {
    console.log('[ContentDetails]', ...args);
  }
};

// Types
type ContentDetailsProps = {
  isModal?: boolean;
  onClose?: () => void;
};

const ContentDetailsPage = ({ isModal = false, onClose }: ContentDetailsProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for content data and UI
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // API hooks
  const {
    data: content,
    isLoading,
    error,
    execute: fetchContent,
  } = useApi<ContentPieceType>(() => {
    debugLog('Fetching content for ID:', id);
    return contentService.getContent(id!);
  }, {
    enabled: !!id,
    onSuccess: (data) => {
      debugLog('Content loaded successfully:', data);
    },
    onError: (error) => {
      debugLog('Error loading content:', error);
      toast({
        title: 'Error loading content',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Debug effect to log state changes
  useEffect(() => {
    debugLog('Content state updated:', { content, isLoading, error });
  }, [content, isLoading, error]);
  
  const { data: user } = useApi(userService.getCurrentUser, {
    enabled: false, // Will be enabled when needed
  });
  
  // Handle like action
  const handleLike = useCallback(async () => {
    try {
      debugLog('Toggling like for content:', id, 'Current state:', isLiked);
      if (isLiked) {
        await contentService.unlikeContent(id!);
        debugLog('Successfully unliked content:', id);
      } else {
        await contentService.likeContent(id!);
        debugLog('Successfully liked content:', id);
      }
      setIsLiked(!isLiked);
      // Optimistic update
      if (content) {
        debugLog('Refreshing content data...');
        fetchContent();
      }
    } catch (error) {
      debugLog('Error toggling like:', error);
      toast({
        title: 'Error',
        description: 'Failed to update like status',
        variant: 'destructive',
      });
    }
  }, [id, isLiked, content, fetchContent, toast]);
  
  // Handle save action
  const handleSave = useCallback(async () => {
    try {
      if (isSaved) {
        await contentService.unsaveContent(id!);
      } else {
        await contentService.saveContent(id!);
      }
      setIsSaved(!isSaved);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update save status',
        variant: 'destructive',
      });
    }
  }, [id, isSaved, toast]);
  
  // Fetch initial data
  useEffect(() => {
    if (id) {
      // Fetch content and user status in parallel
      Promise.all([
        fetchContent(),
        contentService.getUserContentStatus(id).then(({ has_liked, has_saved }) => {
          setIsLiked(has_liked);
          setIsSaved(has_saved);
        }),
      ]).catch(console.error);
    }
  }, [id, fetchContent]);
  
  // Handle back navigation
  const handleBack = useCallback(() => {
    if (isModal && onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  }, [isModal, onClose, navigate]);
  
  // Loading state
  // Debug panel
  const DebugPanel = () => (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg z-50 max-w-md max-h-96 overflow-auto text-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold flex items-center">
          <Bug className="h-4 w-4 mr-2" /> Debug Info
        </h3>
        <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="h-6 px-2 text-xs">
          Refresh
        </Button>
      </div>
      <div className="space-y-2">
        <div><strong>Content ID:</strong> {id || 'N/A'}</div>
        <div><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
        <div><strong>Has Error:</strong> {error ? 'Yes' : 'No'}</div>
        <div><strong>Has Data:</strong> {content ? 'Yes' : 'No'}</div>
        {error && (
          <div className="mt-2 p-2 bg-red-900/50 rounded">
            <div><strong>Error:</strong> {error.message}</div>
            {error.stack && <pre className="whitespace-pre-wrap mt-1">{error.stack}</pre>}
          </div>
        )}
        <div className="mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => {
              console.log('Current state:', { id, content, isLoading, error });
              toast({
                title: 'State logged',
                description: 'Check console for current state',
              });
            }}
          >
            Log State to Console
          </Button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          {/* Header with back button */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Skeleton className="h-8 w-48" />
          </div>
          
          {/* Main content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex space-x-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
            
            {/* Sidebar skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
        {DEBUG && <DebugPanel />}
      </div>
    );
  }
  
  // Error state
  if (error || !content) {
    return (
      <div className="container mx-auto p-4 max-w-4xl text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Content Not Found</h2>
        <p className="text-gray-600 mb-6">
          We couldn't find the content you're looking for. It may have been removed or is temporarily unavailable.
        </p>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }
  
  // Format date
  const formattedDate = content.created_at 
    ? formatDistanceToNow(new Date(content.created_at), { addSuffix: true })
    : 'Unknown date';
  
  return (
    <ErrorBoundary>
      <div className={cn("container mx-auto p-4 max-w-4xl", isModal && "p-0")}>
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Content Details</h1>
        </div>
        
        {/* Content Card */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={content.creator_avatar} />
                  <AvatarFallback>
                    {content.creator_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{content.creator_name || 'Unknown User'}</p>
                  <p className="text-sm text-gray-500">{formattedDate}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4">
            <h2 className="text-xl font-bold mb-2">{content.title}</h2>
            
            <div className="mb-4">
              <p className={cn("text-gray-700", !showMore && "line-clamp-3")}>
                {content.description}
              </p>
              {content.description && content.description.length > 200 && (
                <Button 
                  variant="link" 
                  className="p-0 h-auto" 
                  onClick={() => setShowMore(!showMore)}
                >
                  {showMore ? (
                    <>
                      Show less <ChevronUp className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Read more <ChevronDown className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
            
            {/* Media */}
            <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
              {content.media_url ? (
                <img 
                  src={content.media_url} 
                  alt={content.title} 
                  className="w-full h-auto max-h-[500px] object-cover"
                  onError={(e) => {
                    // Fallback to a placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = `https://via.placeholder.com/800x450?text=${encodeURIComponent(content.title || 'Content')}`;
                  }}
                />
              ) : (
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No media available</span>
                </div>
              )}
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <Heart className={cn("h-4 w-4 mr-1", isLiked && "fill-current text-red-500")} />
                  {content.likes_count || 0}
                </span>
                <span className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {content.comments_count || 0}
                </span>
                <span className="flex items-center">
                  <Share2 className="h-4 w-4 mr-1" />
                  {content.reposts_count || 0}
                </span>
              </div>
              <div>
                <span>{content.views_count || 0} views</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-2 mb-6">
              <Button 
                variant={isLiked ? 'default' : 'outline'} 
                className="flex-1"
                onClick={handleLike}
              >
                <Heart className={cn("h-4 w-4 mr-2", isLiked && "fill-current")} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              <Button variant="outline" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Comment
              </Button>
              <Button 
                variant={isSaved ? 'default' : 'outline'} 
                className="flex-1"
                onClick={handleSave}
              >
                <Bookmark className={cn("h-4 w-4 mr-2", isSaved && "fill-current")} />
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Platform Link */}
            {content.platform_url && (
              <div className="mb-6">
                <a 
                  href={content.platform_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:underline"
                >
                  View on {content.platform || 'platform'} <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>
            )}
            
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Creator</h3>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={content.creator_avatar} />
                        <AvatarFallback>{content.creator_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <span>{content.creator_name || 'Unknown User'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">Platform</h3>
                    <div className="flex items-center">
                      <span className="capitalize">{content.platform || 'Unknown'}</span>
                      {content.platform_url && (
                        <a 
                          href={content.platform_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:underline flex items-center"
                        >
                          View <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">Created</h3>
                    <p>{formattedDate}</p>
                  </div>
                  
                  {content.tags && content.tags.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-1">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {content.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="performance" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard 
                      title="Views" 
                      value={content.views_count || 0} 
                      change={content.performance_metrics?.views_change || 0}
                    />
                    <StatCard 
                      title="Engagement" 
                      value={`${((content.performance_metrics?.engagement_rate || 0) * 100).toFixed(1)}%`} 
                      change={(content.performance_metrics?.engagement_change || 0) * 100}
                    />
                    <StatCard 
                      title="Shares" 
                      value={content.total_shares || 0} 
                      change={content.performance_metrics?.shares_change || 0}
                    />
                    <StatCard 
                      title="Revenue" 
                      value={`$${(content.current_revenue || 0).toLocaleString()}`} 
                      change={content.performance_metrics?.revenue_change || 0}
                      isCurrency
                    />
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Performance Over Time</h3>
                    <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                      Performance chart will be displayed here
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="comments" className="mt-4">
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar_url} />
                      <AvatarFallback>
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <textarea
                        placeholder="Add a comment..."
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                      />
                      <div className="flex justify-end mt-2">
                        <Button size="sm">Post Comment</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex space-x-3">
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback>U{i}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                              <span className="font-medium">User {i}</span>
                              <span className="text-xs text-gray-500">2h ago</span>
                            </div>
                            <p className="mt-1 text-sm">
                              This is a sample comment {i}. Comments will be loaded here.
                            </p>
                          </div>
                          <div className="flex space-x-4 mt-1 text-xs text-gray-500">
                            <button className="hover:text-gray-700">Like</button>
                            <button className="hover:text-gray-700">Reply</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button variant="ghost" className="w-full">
                      Load more comments
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="bg-gray-50 border-t px-6 py-4">
            <div className="w-full flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Last updated {formatDistanceToNow(new Date(content.updated_at), { addSuffix: true })}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" /> Open
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Toast container */}
      <div id="toast-container"></div>
    </ErrorBoundary>
  );
};

// Helper component for stat cards
const StatCard = ({ title, value, change, isCurrency = false }: { 
  title: string; 
  value: string | number; 
  change: number;
  isCurrency?: boolean;
}) => {
  const isPositive = change > 0;
  const isNeutral = change === 0;
  
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-semibold">
            {isCurrency && typeof value === 'number' 
              ? `$${value.toLocaleString()}` 
              : value}
          </span>
          {!isNeutral && (
            <span className={cn(
              "text-xs flex items-center",
              isPositive ? "text-green-600" : "text-red-600"
            )}>
              {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentDetailsPage;

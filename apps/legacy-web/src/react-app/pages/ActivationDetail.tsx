import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from "@/react-app/components/ui/use-toast";
import advertiserService from '@/react-app/services/advertiser';
import {
  ArrowLeft,
  Calendar,
  Edit,
  ExternalLink,
  Pause,
  Play,
  RefreshCw,
  Trash2,
  Users,
  Sparkles,
  Gift,
  Ticket,
  Image,
  Link as LinkIcon,
  Diamond
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import MaturityMilestones from '@/react-app/components/MaturityMilestones';

type ActivationStatus = 'active' | 'paused' | 'draft' | 'completed';

interface ContentItem {
  id: string;
  content_type: string;
  title: string;
  url?: string;
  description?: string;
}

interface DropItem {
  id: string;
  title: string;
  description?: string;
  drop_type: string;
  gem_reward: number;
  keys_cost: number;
  max_participants: number;
  current_participants: number;
  status: string;
}

interface CouponItem {
  id: string;
  title: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  quantity_total: number;
  quantity_remaining: number;
}

interface EventItem {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  is_virtual: boolean;
  virtual_url?: string;
  max_attendees?: number;
}

type ActivationStats = {
  total_drops: number;
  total_applications: number;
  completed_applications: number;
  total_verified_credits_awarded: number;
  total_tickets_awarded: number;
  total_coupons: number;
  coupons_claimed: number;
  total_events: number;
};

type Activation = {
  id: string;
  name: string;
  status: ActivationStatus;
  description?: string;
  start_date: string;
  end_date?: string;
  total_gem_budget: number;
  verified_credits_spent: number;
  promoshare_contribution: number;
  created_at: string;
  updated_at?: string;
  activation_maturity: 'seed' | 'activated' | 'funded' | 'dominant';
  maturity_progress?: number;
  content_items: ContentItem[];
  drops: DropItem[];
  coupons: CouponItem[];
  events: EventItem[];
  stats: ActivationStats;
};

const statusStyles: Record<ActivationStatus, string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-blue-100 text-blue-800',
  completed: 'bg-pr-surface-2 text-pr-text-1',
};

const dropTypeLabels: Record<string, string> = {
  share: 'Share Content',
  create: 'Create Content',
  engage: 'Engage',
  review: 'Write Review'
};

export default function ActivationDetail() {
  const { id, campaignId, activationId } = useParams<{ id?: string; campaignId?: string, activationId?: string }>();
  const resolvedId = id ?? campaignId ?? activationId;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activation, setActivation] = useState<Activation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchActivation = async () => {
      if (!resolvedId) {
        setError('No activation ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await advertiserService.getCampaign(resolvedId);

        if (!data || !data.campaign) {
          setError('Activation not found');
          return;
        }

        setActivation({
          id: data.campaign.id,
          name: data.campaign.name,
          status: data.campaign.status as ActivationStatus,
          description: data.campaign.description || '',
          start_date: data.campaign.start_date,
          end_date: data.campaign.end_date || undefined,
          total_gem_budget: data.campaign.total_gem_budget || 0,
          verified_credits_spent: data.campaign.verified_credits_spent || 0,
          promoshare_contribution: data.campaign.promoshare_contribution || 0,
          created_at: data.campaign.created_at,
          updated_at: data.campaign.updated_at,
          content_items: (data.campaign.content_items || []) as any[],
          drops: (data.campaign.drops || []) as any[],
          coupons: (data.campaign.coupons || []) as any[],
          stats: {
            total_drops: data.campaign.stats?.total_drops || data.campaign.drops?.length || 0,
            total_applications: data.campaign.stats?.total_applications || 0,
            completed_applications: data.campaign.stats?.completed_applications || 0,
            total_verified_credits_awarded: data.campaign.stats?.total_verified_credits_awarded || 0,
            total_tickets_awarded: data.campaign.stats?.total_tickets_awarded || 0,
            total_coupons: data.campaign.stats?.total_coupons || data.campaign.coupons?.length || 0,
            coupons_claimed: data.campaign.stats?.coupons_claimed || 0,
            total_events: data.campaign.stats?.total_events || data.campaign.events?.length || 0
          },
          events: (data.campaign.events || []) as any[],
          activation_maturity: (data.campaign.campaign_maturity as any) || 'seed',
          maturity_progress: data.campaign.maturity_progress || 0
        });
      } catch (err) {
        console.error('Failed to fetch activation:', err);
        setError('Failed to load activation details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivation();
  }, [resolvedId]);

  const handleStatusChange = async (newStatus: ActivationStatus) => {
    if (!activation) return;

    try {
      setIsUpdating(true);
      // Status update API logic would go here
      await new Promise(resolve => setTimeout(resolve, 500));

      setActivation({
        ...activation,
        status: newStatus,
        updated_at: new Date().toISOString(),
      });

      toast({
        title: 'Activation updated',
        description: `Activation status changed to ${newStatus}`,
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to update activation status:', err);
      toast({
        title: 'Update failed',
        description: 'Failed to update activation status',
        type: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefresh = async () => {
    if (!resolvedId) return;

    try {
      toast({
        title: 'Refreshing data',
        description: 'Fetching latest activation metrics...',
        type: 'info',
      });

      const data = await advertiserService.getCampaign(resolvedId);
      if (data && data.campaign) {
        setActivation({
          id: data.campaign.id,
          name: data.campaign.name,
          status: data.campaign.status as ActivationStatus,
          description: data.campaign.description || '',
          start_date: data.campaign.start_date,
          end_date: data.campaign.end_date || undefined,
          total_gem_budget: data.campaign.total_gem_budget || 0,
          verified_credits_spent: data.campaign.verified_credits_spent || 0,
          promoshare_contribution: data.campaign.promoshare_contribution || 0,
          created_at: data.campaign.created_at,
          updated_at: data.campaign.updated_at,
          content_items: (data.campaign.content_items || []) as any[],
          drops: (data.campaign.drops || []) as any[],
          coupons: (data.campaign.coupons || []) as any[],
          stats: {
            total_drops: data.campaign.stats?.total_drops || data.campaign.drops?.length || 0,
            total_applications: data.campaign.stats?.total_applications || 0,
            completed_applications: data.campaign.stats?.completed_applications || 0,
            total_verified_credits_awarded: data.campaign.stats?.total_verified_credits_awarded || 0,
            total_tickets_awarded: data.campaign.stats?.total_tickets_awarded || 0,
            total_coupons: data.campaign.stats?.total_coupons || data.campaign.coupons?.length || 0,
            coupons_claimed: data.campaign.stats?.coupons_claimed || 0,
            total_events: data.campaign.stats?.total_events || data.campaign.events?.length || 0
          },
          events: (data.campaign.events || []) as any[],
          activation_maturity: (data.campaign.campaign_maturity as any) || 'seed',
          maturity_progress: data.campaign.maturity_progress || 0
        });

        toast({
          title: 'Data refreshed',
          description: 'Activation metrics updated successfully',
          type: 'success',
        });
      }
    } catch (err) {
      console.error('Failed to refresh activation:', err);
      toast({
        title: 'Refresh failed',
        description: 'Failed to refresh activation data',
        type: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!activation) return;

    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      toast({
        title: 'Confirm deletion',
        description: 'Click delete again to confirm',
        type: 'warning',
      });
      setTimeout(() => setShowDeleteConfirm(false), 3000);
      return;
    }

    try {
      await advertiserService.deleteCampaign(activation.id);
      toast({
        title: 'Activation deleted',
        description: 'Activation has been deleted successfully',
        type: 'success',
      });
      navigate('/advertiser/activations');
    } catch (err) {
      console.error('Failed to delete activation:', err);
      toast({
        title: 'Delete failed',
        description: 'Failed to delete activation',
        type: 'destructive',
      });
    }
  };


  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!activation) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-pr-text-1">Activation not found</h3>
        <p className="mt-1 text-sm text-pr-text-2">The reactivationed activation could not be found.</p>
        <div className="mt-6">
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="-ml-1 mr-2 h-4 w-4" />
            Back to Activations
          </Button>
        </div>
      </div>
    );
  }

  const daysRemaining = activation.end_date ? getDaysRemaining(activation.end_date) : null;
  const budgetProgress = activation.total_gem_budget > 0
    ? (activation.verified_credits_spent / activation.total_gem_budget) * 100
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-pr-text-1">{activation.name}</h1>
            <div className="flex items-center mt-1 gap-2">
              <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", statusStyles[activation.status])}>
                {activation.status.charAt(0).toUpperCase() + activation.status.slice(1)}
              </span>
              <span className="text-sm text-pr-text-2">
                {formatDate(activation.start_date)}
                {activation.end_date && ` - ${formatDate(activation.end_date)}`}
                {daysRemaining !== null && daysRemaining > 0 && (
                  <span className="ml-1">({daysRemaining} days left)</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {activation.status === 'active' && (
            <Button variant="outline" onClick={() => handleStatusChange('paused')} disabled={isUpdating}>
              <Pause className="mr-2 h-4 w-4" /> Pause
            </Button>
          )}
          {(activation.status === 'paused' || activation.status === 'draft') && (
            <Button onClick={() => handleStatusChange('active')} disabled={isUpdating}>
              <Play className="mr-2 h-4 w-4" /> {activation.status === 'paused' ? 'Resume' : 'Activate'}
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to={`/advertiser/activations/${activation.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Campaign Maturity Lifecycle */}
      <MaturityMilestones
        currentMaturity={activation.activation_maturity || 'seed'}
        verifiedCount={activation.stats.completed_applications || 0}
        targetCount={100}
      />

      {/* Stats Cards - Promorang Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gem Budget */}
        <div className="bg-pr-surface-card rounded-xl p-4 border border-pr-surface-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Diamond className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-pr-text-2">Credit Budget</p>
              <p className="text-xl font-bold text-pr-text-1">{activation.total_gem_budget} CRD</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-pr-text-2 mb-1">
              <span>{activation.verified_credits_spent} spent</span>
              <span>{activation.total_gem_budget - activation.verified_credits_spent} remaining</span>
            </div>
            <div className="w-full bg-pr-surface-3 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(100, budgetProgress)}%` }} />
            </div>
          </div>
        </div>

        {/* Drops */}
        <div className="bg-pr-surface-card rounded-xl p-4 border border-pr-surface-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-pr-text-2">Drops</p>
              <p className="text-xl font-bold text-pr-text-1">{activation.drops.length}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-pr-text-2">
            {activation.stats.completed_applications} / {activation.stats.total_applications} completed
          </p>
        </div>

        {/* Participants */}
        <div className="bg-pr-surface-card rounded-xl p-4 border border-pr-surface-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-pr-text-2">Participants</p>
              <p className="text-xl font-bold text-pr-text-1">{activation.stats.total_applications}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-pr-text-2">
            {activation.stats.total_verified_credits_awarded} CRD awarded
          </p>
        </div>

        {/* PromoShare */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-200 rounded-lg">
              <Ticket className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <p className="text-sm text-purple-700">PromoShare</p>
              <p className="text-xl font-bold text-purple-900">{activation.promoshare_contribution} CRD</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-purple-600">
            {activation.stats.total_tickets_awarded} tickets awarded
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-pr-surface-2 p-1 rounded-lg">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content ({activation.content_items.length})</TabsTrigger>
          <TabsTrigger value="drops">Drops ({activation.drops.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({activation.events.length})</TabsTrigger>
          <TabsTrigger value="coupons">Coupons ({activation.coupons.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3">
            <h3 className="text-lg font-semibold text-pr-text-1 mb-2">Description</h3>
            <p className="text-pr-text-2">{activation.description || 'No description provided.'}</p>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-sm text-pr-text-2">Created</p>
                <p className="font-medium text-pr-text-1">{formatDate(activation.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-pr-text-2">Status</p>
                <p className="font-medium text-pr-text-1 capitalize">{activation.status}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="mt-6 space-y-4">
          {activation.content_items.length === 0 ? (
            <div className="text-center py-12 bg-pr-surface-card rounded-xl border border-pr-surface-3">
              <Image className="w-12 h-12 mx-auto text-pr-text-2 mb-4" />
              <p className="text-pr-text-2">No content items in this activation</p>
            </div>
          ) : (
            activation.content_items.map((item) => (
              <div key={item.id} className="bg-pr-surface-card rounded-xl p-4 border border-pr-surface-3 flex items-center gap-4">
                <div className="p-2 bg-pr-surface-2 rounded-lg">
                  {item.content_type === 'link' && <LinkIcon className="h-5 w-5 text-pr-text-2" />}
                  {item.content_type === 'image' && <Image className="h-5 w-5 text-pr-text-2" />}
                  {item.content_type === 'video' && <Image className="h-5 w-5 text-pr-text-2" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-pr-text-1">{item.title}</p>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                      {item.url.substring(0, 50)}... <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Drops Tab */}
        <TabsContent value="drops" className="mt-6 space-y-4">
          {activation.drops.length === 0 ? (
            <div className="text-center py-12 bg-pr-surface-card rounded-xl border border-pr-surface-3">
              <Sparkles className="w-12 h-12 mx-auto text-pr-text-2 mb-4" />
              <p className="text-pr-text-2">No drops in this activation</p>
            </div>
          ) : (
            activation.drops.map((drop) => (
              <div key={drop.id} className="bg-pr-surface-card rounded-xl p-4 border border-pr-surface-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-pr-text-1">{drop.title}</h4>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs",
                        drop.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      )}>
                        {drop.status}
                      </span>
                    </div>
                    <p className="text-sm text-pr-text-2 mt-1">{drop.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-purple-600">{drop.gem_reward} CRD reward</span>
                      <span className="text-pr-text-2">{drop.keys_cost} 🔑 cost</span>
                      <span className="text-pr-text-2">{dropTypeLabels[drop.drop_type] || drop.drop_type}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-pr-text-1">{drop.current_participants}</p>
                    <p className="text-xs text-pr-text-2">/ {drop.max_participants} participants</p>
                  </div>
                </div>
                <div className="mt-3 w-full bg-pr-surface-3 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(drop.current_participants / drop.max_participants) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="mt-6 space-y-4">
          {activation.events.length === 0 ? (
            <div className="text-center py-12 bg-pr-surface-card rounded-xl border border-pr-surface-3">
              <Calendar className="w-12 h-12 mx-auto text-pr-text-2 mb-4" />
              <p className="text-pr-text-2">No events in this activation</p>
            </div>
          ) : (
            activation.events.map((event) => (
              <div key={event.id} className="bg-pr-surface-card rounded-xl p-4 border border-pr-surface-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-pr-text-1">{event.title}</h4>
                    <p className="text-sm text-pr-text-2 mt-1">{event.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1 text-pr-text-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(event.event_date)}
                      </div>
                      {event.is_virtual ? (
                        <div className="flex items-center gap-1 text-blue-600">
                          <LinkIcon className="h-4 w-4" />
                          <a href={event.virtual_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Virtual Event
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-pr-text-2">
                          <ExternalLink className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                      {event.max_attendees && (
                        <div className="flex items-center gap-1 text-pr-text-2">
                          <Users className="h-4 w-4" />
                          {event.max_attendees} capacity
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Coupons Tab */}
        <TabsContent value="coupons" className="mt-6 space-y-4">
          {activation.coupons.length === 0 ? (
            <div className="text-center py-12 bg-pr-surface-card rounded-xl border border-pr-surface-3">
              <Gift className="w-12 h-12 mx-auto text-pr-text-2 mb-4" />
              <p className="text-pr-text-2">No coupons in this activation</p>
            </div>
          ) : (
            activation.coupons.map((coupon) => (
              <div key={coupon.id} className="bg-pr-surface-card rounded-xl p-4 border border-pr-surface-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-pr-text-1">{coupon.title}</h4>
                    <p className="text-sm text-pr-text-2 mt-1">{coupon.description}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                        {coupon.discount_type === 'percent' && `${coupon.discount_value}% Off`}
                        {coupon.discount_type === 'fixed' && `$${coupon.discount_value} Off`}
                        {coupon.discount_type === 'freebie' && 'Free Item'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-pr-text-1">{coupon.quantity_remaining}</p>
                    <p className="text-xs text-pr-text-2">/ {coupon.quantity_total} remaining</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="flex gap-3 pt-4 border-t border-pr-surface-3">
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
        <Button
          variant="outline"
          className="text-red-600 hover:text-red-700"
          onClick={handleDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" /> {showDeleteConfirm ? 'Confirm Delete?' : 'Delete'}
        </Button>
      </div>
    </div>
  );
}

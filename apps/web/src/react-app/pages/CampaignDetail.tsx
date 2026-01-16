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
  CheckCircle,
  Clock,
  Diamond
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type CampaignStatus = 'active' | 'paused' | 'draft' | 'completed';

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

interface CampaignStats {
  total_drops: number;
  total_applications: number;
  completed_applications: number;
  total_gems_awarded: number;
  total_tickets_awarded: number;
  total_coupons: number;
  coupons_claimed: number;
}

type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  description?: string;
  start_date: string;
  end_date?: string;
  total_gem_budget: number;
  gems_spent: number;
  promoshare_contribution: number;
  created_at: string;
  updated_at?: string;
  content_items: ContentItem[];
  drops: DropItem[];
  coupons: CouponItem[];
  stats: CampaignStats;
};

const statusStyles: Record<CampaignStatus, string> = {
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

export default function CampaignDetail() {
  const { id, campaignId } = useParams<{ id?: string; campaignId?: string }>();
  const resolvedId = id ?? campaignId;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!resolvedId) {
        setError('No campaign ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await advertiserService.getCampaign(resolvedId);
        
        if (!data || !data.campaign) {
          setError('Campaign not found');
          return;
        }

        // New Promorang-style campaign structure
        setCampaign({
          id: data.campaign.id,
          name: data.campaign.name,
          status: data.campaign.status as CampaignStatus,
          description: data.campaign.description || '',
          start_date: data.campaign.start_date,
          end_date: data.campaign.end_date || undefined,
          total_gem_budget: data.campaign.total_gem_budget || 0,
          gems_spent: data.campaign.gems_spent || 0,
          promoshare_contribution: data.campaign.promoshare_contribution || 0,
          created_at: data.campaign.created_at,
          updated_at: data.campaign.updated_at,
          content_items: data.campaign.content_items || [],
          drops: data.campaign.drops || [],
          coupons: data.campaign.coupons || [],
          stats: data.campaign.stats || {
            total_drops: 0,
            total_applications: 0,
            completed_applications: 0,
            total_gems_awarded: 0,
            total_tickets_awarded: 0,
            total_coupons: 0,
            coupons_claimed: 0
          }
        });
      } catch (err) {
        console.error('Failed to fetch campaign:', err);
        setError('Failed to load campaign details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [resolvedId]);

  const handleStatusChange = async (newStatus: CampaignStatus) => {
    if (!campaign) return;
    
    try {
      setIsUpdating(true);
      // TODO: Implement status update API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCampaign({
        ...campaign,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      
      toast({
        title: 'Campaign updated',
        description: `Campaign status changed to ${newStatus}`,
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to update campaign status:', err);
      toast({
        title: 'Update failed',
        description: 'Failed to update campaign status',
        type: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [isAddingContent, setIsAddingContent] = useState(false);

  const handleAddContent = () => {
    setShowAddContentModal(true);
  };

  const handleSubmitContent = async (contentData: any) => {
    if (!campaign) return;

    try {
      setIsAddingContent(true);
      const newContent = await advertiserService.addCampaignContent(campaign.id, contentData);
      setContent([...content, newContent]);
      setShowAddContentModal(false);
      toast({
        title: 'Content added',
        description: 'Campaign content added successfully',
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to add content:', err);
      toast({
        title: 'Add content failed',
        description: 'Failed to add campaign content',
        type: 'destructive',
      });
    } finally {
      setIsAddingContent(false);
    }
  };

  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [isAddingFunds, setIsAddingFunds] = useState(false);

  const handleAddFunds = () => {
    setShowAddFundsModal(true);
  };

  const handleSubmitFunds = async (amount: number) => {
    if (!campaign) return;

    try {
      setIsAddingFunds(true);
      const result = await advertiserService.addCampaignFunds(campaign.id, amount);
      setCampaign({
        ...campaign,
        budget: result.new_total,
        updatedAt: new Date().toISOString(),
      });
      setShowAddFundsModal(false);
      toast({
        title: 'Funds added',
        description: `Successfully added ${formatCurrency(result.amount_added)} to campaign budget`,
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to add funds:', err);
      toast({
        title: 'Add funds failed',
        description: 'Failed to add funds to campaign',
        type: 'destructive',
      });
    } finally {
      setIsAddingFunds(false);
    }
  };

  const handleRefresh = async () => {
    if (!resolvedId) return;

    try {
      toast({
        title: 'Refreshing data',
        description: 'Fetching latest campaign metrics...',
        type: 'info',
      });

      const data = await advertiserService.getCampaign(resolvedId);
      if (data && data.campaign) {
        const mappedCampaign: Campaign = {
          id: data.campaign.id,
          name: data.campaign.name,
          status: data.campaign.status as CampaignStatus,
          objective: data.campaign.objective || '',
          description: '',
          startDate: data.campaign.start_date,
          endDate: data.campaign.end_date || '',
          budget: data.campaign.total_budget,
          spent: data.campaign.budget_spent,
          dailyBudget: 0,
          impressions: data.campaign.performance?.impressions || 0,
          clicks: data.campaign.performance?.clicks || 0,
          ctr: data.campaign.performance?.impressions > 0 
            ? (data.campaign.performance.clicks / data.campaign.performance.impressions) * 100 
            : 0,
          cpc: data.campaign.performance?.clicks > 0
            ? data.campaign.performance.spend / data.campaign.performance.clicks
            : 0,
          drops: 0,
          participants: 0,
          bidStrategy: 'lowest_cost',
          bidAmount: 0,
          targetCtr: 2.0,
          targetCpc: 0.5,
          createdAt: data.campaign.created_at,
          updatedAt: data.campaign.updated_at,
        };
        setCampaign(mappedCampaign);
        setMetrics(data.metrics || []);
        
        toast({
          title: 'Data refreshed',
          description: 'Campaign metrics updated successfully',
          type: 'success',
        });
      }
    } catch (err) {
      console.error('Failed to refresh campaign:', err);
      toast({
        title: 'Refresh failed',
        description: 'Failed to refresh campaign data',
        type: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!campaign) return;
    
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
      await advertiserService.deleteCampaign(campaign.id);
      toast({
        title: 'Campaign deleted',
        description: 'Campaign has been deleted successfully',
        type: 'success',
      });
      navigate('/advertiser/campaigns');
    } catch (err) {
      console.error('Failed to delete campaign:', err);
      toast({
        title: 'Delete failed',
        description: 'Failed to delete campaign',
        type: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
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

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-pr-text-1">Campaign not found</h3>
        <p className="mt-1 text-sm text-pr-text-2">The requested campaign could not be found.</p>
        <div className="mt-6">
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="-ml-1 mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
        </div>
      </div>
    );
  }

  const daysRemaining = campaign.end_date ? getDaysRemaining(campaign.end_date) : null;
  const budgetProgress = campaign.total_gem_budget > 0 
    ? (campaign.gems_spent / campaign.total_gem_budget) * 100 
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-pr-text-1">{campaign.name}</h1>
            <div className="flex items-center mt-1 gap-2">
              <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", statusStyles[campaign.status])}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </span>
              <span className="text-sm text-pr-text-2">
                {formatDate(campaign.start_date)}
                {campaign.end_date && ` - ${formatDate(campaign.end_date)}`}
                {daysRemaining !== null && daysRemaining > 0 && (
                  <span className="ml-1">({daysRemaining} days left)</span>
                )}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {campaign.status === 'active' && (
            <Button variant="outline" onClick={() => handleStatusChange('paused')} disabled={isUpdating}>
              <Pause className="mr-2 h-4 w-4" /> Pause
            </Button>
          )}
          {(campaign.status === 'paused' || campaign.status === 'draft') && (
            <Button onClick={() => handleStatusChange('active')} disabled={isUpdating}>
              <Play className="mr-2 h-4 w-4" /> {campaign.status === 'paused' ? 'Resume' : 'Activate'}
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to={`/advertiser/campaigns/${campaign.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards - Promorang Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gem Budget */}
        <div className="bg-pr-surface-card rounded-xl p-4 border border-pr-surface-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Diamond className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-pr-text-2">Gem Budget</p>
              <p className="text-xl font-bold text-pr-text-1">{campaign.total_gem_budget} 💎</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-pr-text-2 mb-1">
              <span>{campaign.gems_spent} spent</span>
              <span>{campaign.total_gem_budget - campaign.gems_spent} remaining</span>
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
              <p className="text-xl font-bold text-pr-text-1">{campaign.drops.length}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-pr-text-2">
            {campaign.stats.completed_applications} / {campaign.stats.total_applications} completed
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
              <p className="text-xl font-bold text-pr-text-1">{campaign.stats.total_applications}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-pr-text-2">
            {campaign.stats.total_gems_awarded} 💎 awarded
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
              <p className="text-xl font-bold text-purple-900">{campaign.promoshare_contribution} 💎</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-purple-600">
            {campaign.stats.total_tickets_awarded} tickets awarded
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-pr-surface-2 p-1 rounded-lg">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content ({campaign.content_items.length})</TabsTrigger>
          <TabsTrigger value="drops">Drops ({campaign.drops.length})</TabsTrigger>
          <TabsTrigger value="coupons">Coupons ({campaign.coupons.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3">
            <h3 className="text-lg font-semibold text-pr-text-1 mb-2">Description</h3>
            <p className="text-pr-text-2">{campaign.description || 'No description provided.'}</p>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-sm text-pr-text-2">Created</p>
                <p className="font-medium text-pr-text-1">{formatDate(campaign.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-pr-text-2">Status</p>
                <p className="font-medium text-pr-text-1 capitalize">{campaign.status}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="mt-6 space-y-4">
          {campaign.content_items.length === 0 ? (
            <div className="text-center py-12 bg-pr-surface-card rounded-xl border border-pr-surface-3">
              <Image className="w-12 h-12 mx-auto text-pr-text-2 mb-4" />
              <p className="text-pr-text-2">No content items in this campaign</p>
            </div>
          ) : (
            campaign.content_items.map((item) => (
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
          {campaign.drops.length === 0 ? (
            <div className="text-center py-12 bg-pr-surface-card rounded-xl border border-pr-surface-3">
              <Sparkles className="w-12 h-12 mx-auto text-pr-text-2 mb-4" />
              <p className="text-pr-text-2">No drops in this campaign</p>
            </div>
          ) : (
            campaign.drops.map((drop) => (
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
                      <span className="text-purple-600">{drop.gem_reward} 💎 reward</span>
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

        {/* Coupons Tab */}
        <TabsContent value="coupons" className="mt-6 space-y-4">
          {campaign.coupons.length === 0 ? (
            <div className="text-center py-12 bg-pr-surface-card rounded-xl border border-pr-surface-3">
              <Gift className="w-12 h-12 mx-auto text-pr-text-2 mb-4" />
              <p className="text-pr-text-2">No coupons in this campaign</p>
            </div>
          ) : (
            campaign.coupons.map((coupon) => (
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

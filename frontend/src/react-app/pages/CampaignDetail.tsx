import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from "@/react-app/components/ui/use-toast";
import advertiserService from '@/react-app/services/advertiser';
import { 
  ArrowLeft, 
  BarChart2, 
  Calendar, 
  DollarSign, 
  Edit, 
  ExternalLink, 
  MoreVertical, 
  Pause, 
  Play, 
  RefreshCw, 
  Settings, 
  Target, 
  Trash2, 
  Users,
  Plus,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AddFundsModal } from '@/react-app/components/AddFundsModal';
import { AddContentModal } from '@/react-app/components/AddContentModal';

type CampaignStatus = 'active' | 'paused' | 'draft' | 'completed';

type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  objective: string;
  description?: string;
  startDate: string;
  endDate?: string;
  budget: number;
  spent: number;
  dailyBudget: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  drops: number;
  participants: number;
  bidStrategy: string;
  bidAmount: number;
  targetCtr: number;
  targetCpc: number;
  createdAt: string;
  updatedAt: string;
};

type CampaignContent = {
  id: string;
  title: string;
  platform: string;
  creator: string;
  status: 'pending' | 'approved' | 'rejected' | 'live' | 'completed';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  startDate: string;
  endDate?: string;
};

const statusStyles: Record<CampaignStatus, string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
};

export default function CampaignDetail() {
  const { id, campaignId } = useParams<{ id?: string; campaignId?: string }>();
  const resolvedId = id ?? campaignId;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [content, setContent] = useState<CampaignContent[]>([]);
  const [drops, setDrops] = useState<any[]>([]);
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

        // Map backend data to frontend Campaign type
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
        setContent(data.content || []);
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
        <h3 className="text-lg font-medium text-gray-900">Campaign not found</h3>
        <p className="mt-1 text-sm text-gray-500">The requested campaign could not be found.</p>
        <div className="mt-6">
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="-ml-1 mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
        </div>
      </div>
    );
  }

  const daysRemaining = campaign.endDate ? getDaysRemaining(campaign.endDate) : null;
  const progress = (campaign.spent / campaign.budget) * 100;
  const dailySpendRate = campaign.spent / (Math.ceil((new Date().getTime() - new Date(campaign.startDate).getTime()) / (1000 * 60 * 60 * 24)) || 1);
  const estimatedEndDate = campaign.dailyBudget > 0 
    ? new Date(Date.now() + ((campaign.budget - campaign.spent) / campaign.dailyBudget) * 24 * 60 * 60 * 1000)
    : null;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="h-8 w-8 p-0" 
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <div className="flex items-center mt-1 space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[campaign.status]}`}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(campaign.startDate)}
                {campaign.endDate && ` - ${formatDate(campaign.endDate)}`}
                {daysRemaining !== null && (
                  <span className="ml-1">
                    ({daysRemaining > 0 ? `${daysRemaining} days left` : 'Ended'})
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {campaign.status === 'active' && (
            <Button 
              variant="outline" 
              onClick={() => handleStatusChange('paused')}
              disabled={isUpdating}
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          )}
          
          {(campaign.status === 'paused' || campaign.status === 'draft') && (
            <Button 
              onClick={() => handleStatusChange('active')}
              disabled={isUpdating}
            >
              <Play className="mr-2 h-4 w-4" />
              {campaign.status === 'paused' ? 'Resume' : 'Activate'}
            </Button>
          )}
          
          <Button variant="outline" asChild>
            <Link to={`/campaigns/${campaign.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">More</span>
          </Button>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Budget</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(campaign.budget)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">{formatCurrency(campaign.spent)}</span> spent
                <span className="mx-1">•</span>
                <span>{formatCurrency(campaign.budget - campaign.spent)} remaining</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Participants</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatNumber(campaign.participants)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">{campaign.drops}</span> drops
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <BarChart2 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Impressions</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatNumber(campaign.impressions)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">{formatNumber(campaign.clicks)}</span> clicks
                <span className="mx-1">•</span>
                <span>{campaign.ctr}% CTR</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Performance</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(campaign.cpc)}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <span>{(campaign.cpc < campaign.targetCpc ? '↓ ' : '↑ ') + Math.abs(campaign.cpc - campaign.targetCpc).toFixed(2)}</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500">
                <span>Target: {formatCurrency(campaign.targetCpc)} CPC</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200">
            <TabsList className="bg-transparent p-0 rounded-none">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="performance" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none"
              >
                Performance
              </TabsTrigger>
              <TabsTrigger 
                value="content" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none"
              >
                Content ({content.length})
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none"
              >
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="overview">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                  <section className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Summary</h3>
                    <p className="text-gray-700">{campaign.description || 'No description provided.'}</p>

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Objective</h4>
                        <p className="mt-1 text-sm text-gray-900 capitalize">
                          {campaign.objective.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Bid Strategy</h4>
                        <p className="mt-1 text-sm text-gray-900 capitalize">
                          {campaign.bidStrategy === 'lowest_cost'
                            ? 'Lowest Cost'
                            : campaign.bidStrategy === 'cost_cap'
                            ? 'Cost Cap'
                            : 'Bid Cap'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Daily Budget</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatCurrency(campaign.dailyBudget)}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Est. End Date</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {estimatedEndDate ? formatDate(estimatedEndDate.toISOString()) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      <ul className="divide-y divide-gray-200">
                        <li className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-indigo-600 truncate">Campaign created</p>
                            <div className="ml-2 flex-shrink-0">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {formatDate(campaign.createdAt)}
                              </p>
                            </div>
                          </div>
                        </li>
                        <li className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-indigo-600 truncate">Campaign started</p>
                            <div className="ml-2 flex-shrink-0">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {formatDate(campaign.startDate)}
                              </p>
                            </div>
                          </div>
                        </li>
                        {campaign.updatedAt !== campaign.createdAt && (
                          <li className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-indigo-600 truncate">Campaign updated</p>
                              <div className="ml-2 flex-shrink-0">
                                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {formatDate(campaign.updatedAt)}
                                </p>
                              </div>
                            </div>
                          </li>
                        )}
                      </ul>
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={handleRefresh}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh Data
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={handleAddFunds}
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Add Funds
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={handleAddContent}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Content
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-red-600 hover:text-red-600"
                        onClick={handleDelete}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {showDeleteConfirm ? 'Confirm Delete?' : 'Delete Campaign'}
                      </Button>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Summary</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                          <span>Spend</span>
                          <span className="font-medium">
                            {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                          <span>Daily Spend</span>
                          <span className="font-medium">{formatCurrency(dailySpendRate)} / day</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={cn(
                              'h-2 rounded-full',
                              dailySpendRate <= campaign.dailyBudget * 1.1 ? 'bg-green-500' : 'bg-yellow-500'
                            )}
                            style={{ width: `${Math.min(100, (dailySpendRate / campaign.dailyBudget) * 100)}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {dailySpendRate > campaign.dailyBudget * 1.1
                            ? 'Spending faster than daily budget'
                            : dailySpendRate < campaign.dailyBudget * 0.9
                            ? 'Spending slower than daily budget'
                            : 'On track with daily budget'}
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                          <span>CPC</span>
                          <span className="font-medium">
                            {formatCurrency(campaign.cpc)}
                            <span
                              className={cn(
                                'ml-1',
                                campaign.cpc <= campaign.targetCpc * 1.1 ? 'text-green-600' : 'text-red-600'
                              )}
                            >
                              ({campaign.cpc <= campaign.targetCpc ? '↓' : '↑'}
                              {Math.abs(campaign.cpc - campaign.targetCpc).toFixed(2)})
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={cn(
                              'h-2 rounded-full',
                              campaign.cpc <= campaign.targetCpc * 1.1 ? 'bg-green-500' : 'bg-yellow-500'
                            )}
                            style={{ width: `${Math.min(100, (campaign.cpc / (campaign.targetCpc * 2)) * 100)}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Target: {formatCurrency(campaign.targetCpc)}</p>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                          <span>CTR</span>
                          <span className="font-medium">
                            {campaign.ctr}%
                            <span
                              className={cn(
                                'ml-1',
                                campaign.ctr >= campaign.targetCtr * 0.9 ? 'text-green-600' : 'text-red-600'
                              )}
                            >
                              ({campaign.ctr >= campaign.targetCtr ? '↑' : '↓'}
                              {Math.abs(campaign.ctr - campaign.targetCtr).toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={cn(
                              'h-2 rounded-full',
                              campaign.ctr >= campaign.targetCtr * 0.9 ? 'bg-green-500' : 'bg-yellow-500'
                            )}
                            style={{ width: `${Math.min(100, (campaign.ctr / (campaign.targetCtr * 1.5)) * 100)}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Target: {campaign.targetCtr}%</p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </TabsContent>

                  <TabsContent value="performance">
                    <div className="space-y-6">
                      <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Over Time</h3>
                            <div className="bg-gray-50 p-4 rounded-lg h-64 flex items-center justify-center">
                              <p className="text-gray-500">Performance chart will be displayed here</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 mb-2">Top Performing Content</h4>
                              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                <ul className="divide-y divide-gray-200">
                                  {content.slice(0, 3).map((item) => (
                                    <li key={item.id} className="px-4 py-4 sm:px-6">
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-indigo-600 truncate">{item.title}</p>
                                          <div className="flex mt-1">
                                            <p className="text-xs text-gray-500">
                                              {item.platform} • {item.creator}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="ml-4 flex-shrink-0">
                                          <p className="text-sm font-medium text-gray-900">{item.ctr}% CTR</p>
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 mb-2">Performance by Platform</h4>
                              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                <ul className="divide-y divide-gray-200">
                                  {Array.from(new Set(content.map(c => c.platform))).map((platform) => {
                                    const platformContent = content.filter(c => c.platform === platform);
                                    const totalSpent = platformContent.reduce((sum, c) => sum + c.spent, 0);
                                    const totalClicks = platformContent.reduce((sum, c) => sum + c.clicks, 0);
                                    const avgCtr = platformContent.reduce((sum, c) => sum + c.ctr, 0) / platformContent.length;
                                    
                                    return (
                                      <li key={platform} className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">{platform}</p>
                                            <div className="flex mt-1">
                                              <p className="text-xs text-gray-500">
                                                {platformContent.length} {platformContent.length === 1 ? 'item' : 'items'}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="ml-4 flex-shrink-0">
                                            <p className="text-sm text-gray-900">{formatCurrency(totalSpent)}</p>
                                            <p className="text-xs text-gray-500">{totalClicks} clicks • {avgCtr.toFixed(1)}% CTR</p>
                                          </div>
                                        </div>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Recommendations</h4>
                            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                              <ul className="divide-y divide-gray-200">
                                <li className="px-4 py-4 sm:px-6">
                                  <div className="flex items-start">
                                    <div className="flex-shrink-0 pt-0.5">
                                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600">
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    </div>
                                    <div className="ml-3 flex-1">
                                      <p className="text-sm text-gray-700">
                                        Your campaign is performing well! Consider increasing your daily budget to reach more people.
                                      </p>
                                    </div>
                                  </div>
                                </li>
                                <li className="px-4 py-4 sm:px-6">
                                  <div className="flex items-start">
                                    <div className="flex-shrink-0 pt-0.5">
                                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600">
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    </div>
                                    <div className="ml-3 flex-1">
                                      <p className="text-sm text-gray-700">
                                        Try A/B testing different ad creatives to improve your click-through rate.
                                      </p>
                                    </div>
                                  </div>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="content">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Campaign Content</h3>
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Content
                          </Button>
                        </div>
                        
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                          <ul className="divide-y divide-gray-200">
                            {content.map((item) => (
                              <li key={item.id} className="hover:bg-gray-50">
                                <Link to={`/content/${item.id}`} className="block">
                                  <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <p className="text-lg font-medium text-indigo-600 truncate">
                                          {item.title}
                                        </p>
                                        <div className="ml-2">
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            item.status === 'live' ? 'bg-green-100 text-green-800' :
                                            item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            item.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                            item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="ml-2 flex-shrink-0 flex">
                                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                          {formatCurrency(item.spent)} of {formatCurrency(item.budget)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                      <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500">
                                          <span className="font-medium text-gray-900">{item.platform}</span>
                                          <span className="mx-1">•</span>
                                          <span>by @{item.creator}</span>
                                        </p>
                                      </div>
                                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                        <BarChart2 className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                        <p>{formatNumber(item.impressions)} impressions</p>
                                        <span className="mx-1">•</span>
                                        <p>{formatNumber(item.clicks)} clicks</p>
                                        <span className="mx-1">•</span>
                                        <p>{item.ctr}% CTR</p>
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-blue-500 h-2 rounded-full" 
                                          style={{ width: `${Math.min(100, (item.spent / item.budget) * 100)}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            ))}
                            
                            {content.length === 0 && (
                              <div className="text-center py-12">
                                <BarChart2 className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-lg font-medium text-gray-900">No content added yet</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  Get started by adding content to your campaign.
                                </p>
                                <div className="mt-6">
                                  <Button>
                                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                                    Add Content
                                  </Button>
                                </div>
                              </div>
                            )}
                          </ul>
                        </div>
                      </TabsContent>

                      <TabsContent value="settings">
                        <div className="space-y-8">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Settings</h3>
                            
                            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                              <div className="px-4 py-5 sm:px-6">
                                <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
                              </div>
                              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                                  <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Campaign Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{campaign.name}</dd>
                                  </div>
                                  <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[campaign.status]}`}>
                                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                      </span>
                                    </dd>
                                  </div>
                                  <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{formatDate(campaign.startDate)}</dd>
                                  </div>
                                  <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">End Date</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                      {campaign.endDate ? formatDate(campaign.endDate) : 'No end date'}
                                      {campaign.endDate && daysRemaining !== null && (
                                        <span className="ml-2 text-gray-500">
                                          ({daysRemaining > 0 ? `${daysRemaining} days left` : 'Ended'})
                                        </span>
                                      )}
                                    </dd>
                                  </div>
                                  <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                      {campaign.description || 'No description provided.'}
                                    </dd>
                                  </div>
                                </dl>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Budget & Bidding</h3>
                            
                            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                              <div className="px-4 py-5 sm:px-6">
                                <h4 className="text-lg font-medium text-gray-900">Budget Settings</h4>
                              </div>
                              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                                  <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Total Budget</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{formatCurrency(campaign.budget)}</dd>
                                  </div>
                                  <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Daily Budget</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{formatCurrency(campaign.dailyBudget)}</dd>
                                  </div>
                                  <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Amount Spent</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{formatCurrency(campaign.spent)}</dd>
                                  </div>
                                  <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Remaining Budget</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{formatCurrency(campaign.budget - campaign.spent)}</dd>
                                  </div>
                                </dl>
                                
                                <div className="mt-6">
                                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                                    <span>Budget Spent</span>
                                    <span>{Math.round(progress)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full" 
                                      style={{ width: `${Math.min(100, progress)}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                              <div className="px-4 py-5 sm:px-6">
                                <h4 className="text-lg font-medium text-gray-900">Bidding Strategy</h4>
                              </div>
                              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                                  <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Bid Strategy</dt>
                                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                                      {campaign.bidStrategy === 'lowest_cost' ? 'Lowest Cost' : 
                                       campaign.bidStrategy === 'cost_cap' ? 'Cost Cap' : 'Bid Cap'}
                                    </dd>
                                  </div>
                                  {campaign.bidStrategy !== 'lowest_cost' && (
                                    <div className="sm:col-span-1">
                                      <dt className="text-sm font-medium text-gray-500">
                                        {campaign.bidStrategy === 'cost_cap' ? 'Cost Cap' : 'Bid Cap'}
                                      </dt>
                                      <dd className="mt-1 text-sm text-gray-900">
                                        {formatCurrency(campaign.bidAmount)}
                                      </dd>
                                    </div>
                                  )}
                                  <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Target CPC</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                      {formatCurrency(campaign.targetCpc)}
                                    </dd>
                                  </div>
                                  <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Target CTR</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                      {campaign.targetCtr}%
                                    </dd>
                                  </div>
                                </dl>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-5">
                            <div className="flex justify-end space-x-3">
                              <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                                Cancel
                              </Button>
                              <Button type="button" variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Campaign
                              </Button>
                              <Button type="submit">
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </div>

              {/* Modals */}
              <AddFundsModal
                isOpen={showAddFundsModal}
                onClose={() => setShowAddFundsModal(false)}
                onSubmit={handleSubmitFunds}
                isSubmitting={isAddingFunds}
              />
              
              <AddContentModal
                isOpen={showAddContentModal}
                onClose={() => setShowAddContentModal(false)}
                onSubmit={handleSubmitContent}
                isSubmitting={isAddingContent}
              />
            </>
          );
        }

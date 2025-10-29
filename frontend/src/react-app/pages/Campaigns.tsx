import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, BarChart2, Calendar, Users, DollarSign, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Campaign = {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft' | 'completed';
  startDate: string;
  endDate?: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  drops: number;
  participants: number;
};

interface CampaignsProps {
  showHeader?: boolean;
  basePath?: string;
}

export default function Campaigns({ showHeader = true, basePath = '/campaigns' }: CampaignsProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        // Mock data for now
        const mockCampaigns: Campaign[] = [
          {
            id: '1',
            name: 'Summer Collection Launch',
            status: 'active',
            startDate: '2025-06-01',
            endDate: '2025-08-31',
            budget: 5000,
            spent: 1250,
            impressions: 125000,
            clicks: 2500,
            ctr: 2.0,
            cpc: 0.5,
            drops: 12,
            participants: 2450,
          },
          {
            id: '2',
            name: 'Back to School',
            status: 'draft',
            startDate: '2025-08-15',
            endDate: '2025-09-15',
            budget: 3000,
            spent: 0,
            impressions: 0,
            clicks: 0,
            ctr: 0,
            cpc: 0,
            drops: 0,
            participants: 0,
          },
        ];
        setCampaigns(mockCampaigns);
      } catch (err) {
        console.error('Failed to fetch campaigns:', err);
        setError('Failed to load campaigns. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-700`;
      case 'paused':
        return `${baseClasses} bg-yellow-100 text-yellow-700`;
      case 'completed':
        return `${baseClasses} bg-gray-100 text-gray-700`;
      case 'draft':
      default:
        return `${baseClasses} bg-blue-100 text-blue-700`;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
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

  const newCampaignPath = `${basePath}/new`;

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Campaigns</h2>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage your marketing campaigns
            </p>
          </div>
          <Button asChild>
            <Link to={newCampaignPath} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Campaign</span>
            </Link>
          </Button>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <BarChart2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No campaigns</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new campaign.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link to={newCampaignPath} className="inline-flex items-center">
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  New Campaign
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <li key={campaign.id} className="hover:bg-gray-50">
                <Link to={`${basePath}/${campaign.id}`} className="block">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-lg font-medium text-indigo-600 truncate">
                          {campaign.name}
                        </p>
                        <div className="ml-2">
                          <span className={getStatusBadge(campaign.status)}>
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {formatCurrency(campaign.spent)} of {formatCurrency(campaign.budget)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {new Date(campaign.startDate).toLocaleDateString()}
                          {campaign.endDate && (
                            <>
                              <span className="mx-1">-</span>
                              {new Date(campaign.endDate).toLocaleDateString()}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <p>{formatNumber(campaign.participants)} participants</p>
                        <span className="mx-1">•</span>
                        <DollarSign className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <p>CPC: {formatCurrency(campaign.cpc)}</p>
                      </div>
                    </div>
                    {campaign.status !== 'draft' && (
                      <div className="mt-2">
                        <div className="flex justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <Target className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>{formatNumber(campaign.impressions)} impressions</span>
                          </div>
                          <span className="text-sm font-medium">
                            {campaign.ctr.toFixed(1)}% CTR
                          </span>
                        </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, (campaign.spent / campaign.budget) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

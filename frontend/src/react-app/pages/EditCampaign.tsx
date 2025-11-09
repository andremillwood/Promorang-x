import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import advertiserService from '@/react-app/services/advertiser';

export default function EditCampaign() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const [campaignName, setCampaignName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCampaign = async () => {
      if (!campaignId) {
        setLoading(false);
        setError('Missing campaign identifier.');
        return;
      }

      try {
        const data = await advertiserService.getCampaign(campaignId);
        if (!isMounted) return;

        if (!data?.campaign) {
          setError('Campaign not found.');
          setLoading(false);
          return;
        }

        setCampaignName(data.campaign.name ?? 'Campaign');
      } catch (err) {
        console.error('[EditCampaign] Failed to load campaign', err);
        if (isMounted) {
          setError('We were unable to load that campaign.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCampaign();

    return () => {
      isMounted = false;
    };
  }, [campaignId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading campaign details…
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl space-y-6 rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center space-x-3 text-red-700">
          <Megaphone className="h-5 w-5" />
          <span className="font-medium">{error}</span>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to campaigns
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Campaign</h1>
          <p className="text-sm text-gray-500">
            Detailed editing is coming soon. For now, you can review the campaign from the{' '}
            <Link to={`/campaigns/${campaignId}`} className="text-blue-600 underline">
              campaign overview page
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center space-x-3 text-gray-700">
          <Megaphone className="h-5 w-5" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Campaign</p>
            <p className="text-lg font-semibold text-gray-900">{campaignName}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          The editing workflow is actively being built. If you need to change campaign settings, please reach out to
          the Promorang team or duplicate the campaign using the “Create Campaign” flow.
        </p>
      </div>
    </div>
  );
}

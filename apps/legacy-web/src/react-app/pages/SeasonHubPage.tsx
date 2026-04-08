import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Trophy, Rocket, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { apiFetch } from '../lib/api';

interface OperatorSummary {
  handle: string;
  display_name?: string;
}

interface SeasonHub {
  id: string;
  slug: string;
  name: string;
  description?: string;
  status: string;
  access_type: string;
  theme_config?: {
    primaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
  };
  operator?: OperatorSummary;
}

interface HubResponse {
  hub: SeasonHub;
}

export default function SeasonHubPage() {
  const { hubSlug } = useParams<{ hubSlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hub, setHub] = useState<SeasonHub | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hubSlug) {
      void fetchHub();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hubSlug]);

  const fetchHub = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<HubResponse>(`/operator/hubs/${encodeURIComponent(hubSlug as string)}`);
      setHub(data.hub);
    } catch (error) {
      console.error('Failed to load hub', error);
      toast({
        title: 'Hub not found',
        description: 'This season hub may be inactive or does not exist.',
        type: 'destructive',
      });
      setHub(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen-dynamic">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!hub) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-pr-text-1 mb-3">Season hub not found</h1>
          <p className="text-pr-text-2 mb-6">This link may be expired or the hub is not active.</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const primaryColor = hub.theme_config?.primaryColor || '#7C3AED';
  const accentColor = hub.theme_config?.accentColor || '#FBBF24';

  return (
    <div className="min-h-screen-dynamic bg-pr-surface-2">
      {/* Hero */}
      <div
        className="relative py-12"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <div className="h-24 w-24 rounded-3xl bg-pr-surface-card flex items-center justify-center shadow-xl border border-white/20 overflow-hidden">
              {hub.theme_config?.logoUrl ? (
                <img
                  src={hub.theme_config.logoUrl}
                  alt={hub.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Rocket className="h-12 w-12 text-white" />
              )}
            </div>
          </div>
          <div className="flex-1 text-left text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{hub.name}</h1>
            <p className="text-white/90 mb-3">
              {hub.description || 'A creator-led season hub powered by Promorang.'}
            </p>
            {hub.operator && (
              <p className="text-sm text-white/80">
                Operated by <span className="font-semibold">@{hub.operator.handle}</span>
                {hub.operator.display_name ? ` • ${hub.operator.display_name}` : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-pr-text-1 mb-1">Season Overview</h2>
            <p className="text-sm text-pr-text-2">
              This is an early preview of the Season Operator system. Soon, you&apos;ll see active challenges,
              predictions, and leaderboards for this hub.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/earn')}>
              <Users className="mr-2 h-4 w-4" />
              Explore Earn
            </Button>
            <Button variant="outline" onClick={() => navigate('/growth-hub')}>
              <Trophy className="mr-2 h-4 w-4" />
              Growth Hub
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-md font-semibold text-pr-text-1 mb-2">Challenges & Predictions</h3>
          <p className="text-sm text-pr-text-2">
            In future iterations, this section will show live challenges, prediction games, and seasonal tasks
            configured by the operator.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-md font-semibold text-pr-text-1 mb-2">Leaderboard</h3>
          <p className="text-sm text-pr-text-2">
            Players who participate across this hub&apos;s campaigns will appear on a local leaderboard, while still
            contributing to Promorang&apos;s global rankings.
          </p>
        </Card>
      </div>
    </div>
  );
}

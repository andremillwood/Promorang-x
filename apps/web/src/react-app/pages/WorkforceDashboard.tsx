import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  MapPin, 
  Award, 
  CheckCircle, 
  Clock,
  Globe,
  Target,
  Plus
} from 'lucide-react';
import { KPICard, TrendLine, ActivityBreakdown } from '@/components/AnalyticsCharts';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import api from '@/react-app/lib/api';
import { useAuth } from '@/react-app/hooks/useAuth';
import LogActivityModal from '@/react-app/components/workforce/LogActivityModal';

export default function WorkforceDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [region, setRegion] = useState('Kingston, Jamaica'); // Mock region
  const [tier, setTier] = useState<'Tier 1' | 'Tier 2' | 'Tier 3'>('Tier 2');
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  // Mock Data for KPIs
  const kpis = {
    userAcquisition: { current: 45, target: 100, label: 'New Users' },
    creatorAcquisition: { current: 8, target: 10, label: 'Creators' },
    businessAcquisition: { current: 2, target: 5, label: 'Businesses' },
    contentOutput: { current: 124, target: 150, label: 'Content Pieces' },
    activePods: { current: 3, target: 5, label: 'Active Pods' },
    dau: { current: 312, target: 500, label: 'Regional DAU' }
  };

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: 'Onboarded Creator', target: '@music_josh', time: '2 hours ago', points: '+50' },
    { id: 2, action: 'Hosted Pod Session', target: 'Kingston Creative Pod', time: 'Yesterday', points: '+100' },
    { id: 3, action: 'Business Lead', target: 'Island Grill', time: '2 days ago', points: '+75' },
  ]);

  const pods = [
    { id: 1, name: 'Kingston Creative Pod', members: 24, status: 'Active', leader: 'Sarah J.' },
    { id: 2, name: 'UWI Tech Pod', members: 18, status: 'Active', leader: 'Mike T.' },
    { id: 3, name: 'Mobay Music Cluster', members: 12, status: 'Forming', leader: 'Pending' },
  ];

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleActivityLogged = (newActivity: any) => {
    setRecentActivity([newActivity, ...recentActivity]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-pr-text-1 flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-purple-600" />
            Workforce Dashboard
          </h1>
          <div className="flex items-center gap-2 text-pr-text-2 mt-1">
            <MapPin className="w-4 h-4" />
            <span>Region: {region}</span>
            <span className="mx-2">•</span>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              {tier} - Part-Time Operator
            </Badge>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-pr-surface-2 text-pr-text-1 rounded-lg font-medium hover:bg-pr-surface-3 transition-colors">
            View Matrix
          </button>
          <button 
            onClick={() => setShowLogModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Log Activity
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard 
          title="User Acquisition" 
          value={kpis.userAcquisition.current.toString()} 
          change={15} 
          changeType="increase" 
          icon={<Users className="w-5 h-5" />} 
          trend={[30, 35, 38, 40, 42, 45]}
        />
        <KPICard 
          title="Content Output" 
          value={kpis.contentOutput.current.toString()} 
          change={8} 
          changeType="increase" 
          icon={<FileText className="w-5 h-5" />} 
          trend={[100, 110, 115, 118, 120, 124]}
        />
        <KPICard 
          title="Regional DAU" 
          value={kpis.dau.current.toString()} 
          change={22} 
          changeType="increase" 
          icon={<TrendingUp className="w-5 h-5" />} 
          trend={[250, 270, 280, 295, 305, 312]}
        />
      </div>

      {/* Progress & Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-pr-surface-card border border-pr-surface-3 rounded-xl p-6">
          <h3 className="text-lg font-bold text-pr-text-1 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-red-500" />
            Monthly Targets
          </h3>
          <div className="space-y-6">
            {Object.entries(kpis).map(([key, data]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-pr-text-2 font-medium">{data.label}</span>
                  <span className="text-pr-text-1 font-bold">{data.current} / {data.target}</span>
                </div>
                <Progress value={(data.current / data.target) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-pr-surface-card border border-pr-surface-3 rounded-xl p-6">
          <h3 className="text-lg font-bold text-pr-text-1 mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            Active Regional Pods
          </h3>
          <div className="space-y-4">
            {pods.map((pod) => (
              <div 
                key={pod.id} 
                className="flex items-center justify-between p-4 bg-pr-surface-2 rounded-lg cursor-pointer hover:bg-pr-surface-3 transition-all"
                onClick={() => navigate(`/workforce/pods/${pod.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {pod.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-pr-text-1 text-sm">{pod.name}</h4>
                    <p className="text-xs text-pr-text-2">Leader: {pod.leader}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={pod.status === 'Active' ? 'default' : 'secondary'} className="mb-1">
                    {pod.status}
                  </Badge>
                  <p className="text-xs text-pr-text-2">{pod.members} members</p>
                </div>
              </div>
            ))}
            <button className="w-full py-3 border border-dashed border-pr-surface-3 text-pr-text-2 rounded-lg hover:bg-pr-surface-2 transition-colors flex items-center justify-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Initialize New Pod
            </button>
          </div>
        </div>
      </div>

      {/* Recent Workforce Activity */}
      <div className="bg-pr-surface-card border border-pr-surface-3 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-pr-surface-3">
          <h3 className="text-lg font-bold text-pr-text-1 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Recent Activity Log
          </h3>
        </div>
        <div className="divide-y divide-pr-surface-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-pr-surface-2 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-pr-text-1">{activity.action}</p>
                  <p className="text-sm text-pr-text-2">{activity.target}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-green-600 font-bold text-sm block">{activity.points} pts</span>
                <span className="text-xs text-pr-text-3">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <LogActivityModal 
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        onSuccess={handleActivityLogged}
      />
    </div>
  );
}

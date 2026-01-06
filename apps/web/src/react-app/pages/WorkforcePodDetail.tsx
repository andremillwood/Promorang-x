import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Target, 
  TrendingUp, 
  ArrowLeft, 
  MessageSquare,
  Award,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PodMember {
  id: string;
  name: string;
  role: 'Leader' | 'Core' | 'Member';
  performance: number; // 0-100
  tasks_completed: number;
  avatar_url?: string;
}

export default function WorkforcePodDetail() {
  const { podId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Mock Data
  const podData = {
    id: podId,
    name: podId === '1' ? 'Kingston Creative Pod' : 'Regional Pod',
    region: 'Kingston, Jamaica',
    leader: 'Sarah J.',
    status: 'Active',
    description: 'Focused on onboarding music creators and local art businesses.',
    stats: {
      total_members: 24,
      weekly_tasks: 156,
      acquisition_rate: '+12%',
      active_rate: '85%'
    },
    members: [
      { id: '1', name: 'Sarah J.', role: 'Leader', performance: 95, tasks_completed: 42, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
      { id: '2', name: 'Mike T.', role: 'Core', performance: 88, tasks_completed: 35, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
      { id: '3', name: 'Jessica R.', role: 'Member', performance: 72, tasks_completed: 18, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jess' },
      { id: '4', name: 'David K.', role: 'Member', performance: 65, tasks_completed: 12, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dave' },
    ] as PodMember[]
  };

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen-dynamic bg-pr-surface-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen-dynamic bg-pr-surface-background pb-20">
      {/* Header */}
      <div className="bg-pr-surface-card border-b border-pr-surface-border px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4 pl-0 hover:bg-transparent text-pr-text-2 hover:text-pr-text-1"
            onClick={() => navigate('/workforce')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-pr-text-1">{podData.name}</h1>
                <Badge className="bg-green-100 text-green-700">{podData.status}</Badge>
              </div>
              <p className="text-pr-text-2 max-w-xl">{podData.description}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <MessageSquare className="w-4 h-4" /> Message Pod
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                <UserPlus className="w-4 h-4" /> Add Member
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-pr-surface-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-pr-text-2 font-medium">Members</span>
            </div>
            <p className="text-2xl font-bold text-pr-text-1">{podData.stats.total_members}</p>
          </Card>
          
          <Card className="p-6 bg-pr-surface-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-pr-text-2 font-medium">Weekly Tasks</span>
            </div>
            <p className="text-2xl font-bold text-pr-text-1">{podData.stats.weekly_tasks}</p>
          </Card>

          <Card className="p-6 bg-pr-surface-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-pr-text-2 font-medium">Acquisition</span>
            </div>
            <p className="text-2xl font-bold text-pr-text-1">{podData.stats.acquisition_rate}</p>
          </Card>

          <Card className="p-6 bg-pr-surface-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-pr-text-2 font-medium">Active Rate</span>
            </div>
            <p className="text-2xl font-bold text-pr-text-1">{podData.stats.active_rate}</p>
          </Card>
        </div>

        {/* Members List */}
        <div>
          <h2 className="text-xl font-bold text-pr-text-1 mb-4">Pod Members</h2>
          <div className="bg-pr-surface-card border border-pr-surface-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-pr-surface-2 border-b border-pr-surface-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-pr-text-2 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-pr-text-2 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-pr-text-2 uppercase tracking-wider">Performance</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-pr-text-2 uppercase tracking-wider">Tasks</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-pr-text-2 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pr-surface-border">
                  {podData.members.map((member) => (
                    <tr key={member.id} className="hover:bg-pr-surface-2/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage src={member.avatar_url} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-pr-text-1">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className={
                          member.role === 'Leader' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          member.role === 'Core' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                          'text-pr-text-2'
                        }>
                          {member.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Progress value={member.performance} className="w-24 h-2" />
                          <span className="text-sm text-pr-text-2">{member.performance}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-pr-text-1">
                        {member.tasks_completed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900">
                          View Profile
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

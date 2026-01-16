import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  Megaphone, 
  Users, 
  ArrowLeft, 
  Save, 
  Globe, 
  Lock,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { apiFetch } from '../lib/api';

interface Hub {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  access_type: 'open' | 'invite_only';
  theme_config: {
    primaryColor: string;
    accentColor: string;
    logoUrl?: string;
  };
}

export default function OperatorHubManager() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hub, setHub] = useState<Hub | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (slug) {
      void fetchHubDetails();
    }
  }, [slug]);

  const fetchHubDetails = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ hub: Hub }>(`/operator/hubs/${slug}`);
      setHub(data.hub);
    } catch (error) {
      console.error('Failed to load hub details', error);
      toast({
        title: 'Error',
        description: 'Failed to load hub management dashboard',
        type: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHub = async (updates: Partial<Hub>) => {
    if (!hub) return;
    try {
      setSaving(true);
      const data = await apiFetch<{ hub: Hub }>(`/operator/hubs/${hub.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      setHub(data.hub);
      toast({
        title: 'Success',
        description: 'Hub updated successfully',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to update hub', error);
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        type: 'destructive',
      });
    } finally {
      setSaving(false);
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
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Hub not found</h2>
        <Button onClick={() => navigate('/operator/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen-dynamic bg-pr-surface-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumbs / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/operator/dashboard')}
              className="text-pr-text-2 hover:text-pr-text-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-pr-text-1">{hub.name}</h1>
              <p className="text-sm text-pr-text-2">Manage your creator ecosystem and campaigns</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/club/${hub.slug}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Public Page
            </Button>
            <Button
              variant={hub.status === 'active' ? 'outline' : 'default'}
              size="sm"
              onClick={() => handleUpdateHub({ status: hub.status === 'active' ? 'draft' : 'active' })}
              className={hub.status !== 'active' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              {hub.status === 'active' ? 'Unpublish' : 'Publish Hub'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-2">
              <Megaphone className="h-4 w-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="participants" className="gap-2">
              <Users className="h-4 w-4" />
              Participants
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-sm font-medium text-pr-text-2">Active Campaigns</h3>
                <p className="text-3xl font-bold text-pr-text-1 mt-2">12</p>
                <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  All systems operational
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-pr-text-2">Total Participants</h3>
                <p className="text-3xl font-bold text-pr-text-1 mt-2">1,248</p>
                <div className="mt-4 flex items-center text-xs text-blue-600 font-medium">
                  <Users className="h-3 w-3 mr-1" />
                  +12% this week
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-pr-text-2">Total Payouts</h3>
                <p className="text-3xl font-bold text-pr-text-1 mt-2">$4,850</p>
                <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
                  <Globe className="h-3 w-3 mr-1" />
                  Paid through platform
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-pr-text-1 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-pr-surface-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pr-surface-3 flex items-center justify-center text-xs font-bold">
                        JD
                      </div>
                      <div>
                        <p className="text-sm font-medium text-pr-text-1">Jane Doe completed a challenge</p>
                        <p className="text-xs text-pr-text-2">2 hours ago • "Share Summer Jam"</p>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-emerald-600">+$5.00</div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-pr-text-1">Hub Campaigns</h2>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Campaign
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Megaphone className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-pr-text-1">Summer Jam Promotion #{i}</h4>
                      <p className="text-sm text-pr-text-2">Active • 124 participants • $500 budget</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">Manage</Button>
                    <Button variant="ghost" size="sm" className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="participants" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-pr-text-1">Creators & Users</h2>
              <div className="flex gap-2">
                <Input placeholder="Search participants..." className="w-64" />
                <Button size="sm" variant="outline">Filter</Button>
              </div>
            </div>

            <Card className="overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-pr-surface-3">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-pr-text-2 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-xs font-medium text-pr-text-2 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-pr-text-2 uppercase tracking-wider">Total Earned</th>
                    <th className="px-6 py-3 text-xs font-medium text-pr-text-2 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pr-surface-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="hover:bg-pr-surface-1/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-pr-surface-3 flex items-center justify-center text-xs font-bold">U{i}</div>
                          <div className="text-sm">
                            <p className="font-medium text-pr-text-1">User Name {i}</p>
                            <p className="text-pr-text-2">@handle_{i}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Active</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-pr-text-1">$120.00</td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm">View Profile</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-pr-text-1 mb-6">General Settings</h3>
              <div className="space-y-4 max-w-2xl">
                <div className="grid gap-2">
                  <Label htmlFor="name">Hub Name</Label>
                  <Input 
                    id="name" 
                    value={hub.name} 
                    onChange={(e) => setHub({ ...hub, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input 
                    id="slug" 
                    value={hub.slug} 
                    onChange={(e) => setHub({ ...hub, slug: e.target.value })}
                  />
                  <p className="text-xs text-pr-text-2">Public URL: promorang.co/club/{hub.slug}</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    value={hub.description} 
                    onChange={(e) => setHub({ ...hub, description: e.target.value })}
                  />
                </div>
                
                <div className="pt-4 space-y-4">
                  <h4 className="font-medium text-pr-text-1">Access Control</h4>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleUpdateHub({ access_type: 'open' })}
                      className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${
                        hub.access_type === 'open' 
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' 
                          : 'border-pr-surface-3 hover:border-pr-text-2'
                      }`}
                    >
                      <Globe className={`h-5 w-5 mb-2 ${hub.access_type === 'open' ? 'text-purple-600' : 'text-pr-text-2'}`} />
                      <p className="font-medium text-pr-text-1 text-sm">Open Access</p>
                      <p className="text-xs text-pr-text-2 mt-1">Anyone can join your hub and view content.</p>
                    </button>
                    <button
                      onClick={() => handleUpdateHub({ access_type: 'invite_only' })}
                      className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${
                        hub.access_type === 'invite_only' 
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' 
                          : 'border-pr-surface-3 hover:border-pr-text-2'
                      }`}
                    >
                      <Lock className={`h-5 w-5 mb-2 ${hub.access_type === 'invite_only' ? 'text-purple-600' : 'text-pr-text-2'}`} />
                      <p className="font-medium text-pr-text-1 text-sm">Invite Only</p>
                      <p className="text-xs text-pr-text-2 mt-1">Users need an invitation code to join.</p>
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-pr-surface-3">
                  <Button 
                    disabled={saving}
                    onClick={() => handleUpdateHub(hub)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {saving ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-red-200 dark:border-red-900/30">
              <h3 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h3>
              <p className="text-sm text-pr-text-2 mb-4">
                Once you delete a hub, there is no going back. Please be certain.
              </p>
              <Button variant="destructive" size="sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                Delete Hub
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

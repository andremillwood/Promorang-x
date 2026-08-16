import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  Users, 
  Store, 
  Video, 
  Briefcase, 
  TrendingUp, 
  Filter, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';

export type CRMStage = 'LEAD' | 'DIAGNOSTIC' | 'PILOT_PROPOSED' | 'ACTIVE' | 'REPORTING' | 'RENEWAL';

export interface CRMLead {
  id: string;
  name: string;
  category: 'VENUE' | 'MOMENT_OWNER' | 'CREATOR' | 'BRAND';
  contactPerson: string;
  phone: string;
  stage: CRMStage;
  sceneAffinity: string;
  offPeakCapacityPerk?: string;
  lastContactDate: string;
}

const SAMPLE_LEADS: CRMLead[] = [
  {
    id: 'lead-1',
    name: 'Marketplace Bistro & Lounge',
    category: 'VENUE',
    contactPerson: 'Marcus Brown',
    phone: '+1 (876) 555-0192',
    stage: 'PILOT_PROPOSED',
    sceneAffinity: 'Food & Taste Jamaica',
    offPeakCapacityPerk: '35% off Tuesday Chef Tasting Menu',
    lastContactDate: 'Today'
  },
  {
    id: 'lead-2',
    name: 'Artisans Clay Studio',
    category: 'VENUE',
    contactPerson: 'Sarah Chen',
    phone: '+1 (876) 555-0144',
    stage: 'ACTIVE',
    sceneAffinity: 'Move & Fitness Jamaica',
    offPeakCapacityPerk: 'Pottery & Sip Weekend Workshop',
    lastContactDate: 'Yesterday'
  },
  {
    id: 'lead-3',
    name: 'Encore Nightlife Group',
    category: 'MOMENT_OWNER',
    contactPerson: 'David Miller',
    phone: '+1 (876) 555-0881',
    stage: 'ACTIVE',
    sceneAffinity: 'Kingston After Dark',
    offPeakCapacityPerk: '5 Free VIP Wristbands per Brunch',
    lastContactDate: '2 days ago'
  },
  {
    id: 'lead-4',
    name: 'Red Stripe Culture Lab',
    category: 'BRAND',
    contactPerson: 'Karen Watson',
    phone: '+1 (876) 555-0912',
    stage: 'DIAGNOSTIC',
    sceneAffinity: 'Kingston After Dark',
    offPeakCapacityPerk: 'Sponsored Discovery & Creator Challenge',
    lastContactDate: '3 days ago'
  }
];

const stageBadgeStyles: Record<CRMStage, string> = {
  LEAD: 'bg-gray-800 text-gray-300 border-gray-700',
  DIAGNOSTIC: 'bg-blue-950 text-blue-300 border-blue-800',
  PILOT_PROPOSED: 'bg-amber-950 text-amber-300 border-amber-800',
  ACTIVE: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  REPORTING: 'bg-purple-950 text-purple-300 border-purple-800',
  RENEWAL: 'bg-pink-950 text-pink-300 border-pink-800'
};

export default function AdminMarketplaceCRM() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<CRMLead[]>(SAMPLE_LEADS);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'VENUE' | 'MOMENT_OWNER' | 'CREATOR' | 'BRAND'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const handleStageAdvance = (leadId: string) => {
    const stageOrder: CRMStage[] = ['LEAD', 'DIAGNOSTIC', 'PILOT_PROPOSED', 'ACTIVE', 'REPORTING', 'RENEWAL'];
    setLeads(prev =>
      prev.map(l => {
        if (l.id === leadId) {
          const currentIndex = stageOrder.indexOf(l.stage);
          const nextIndex = Math.min(stageOrder.length - 1, currentIndex + 1);
          return { ...l, stage: stageOrder[nextIndex], lastContactDate: 'Just now' };
        }
        return l;
      })
    );
  };

  const filteredLeads = leads.filter(l => {
    const matchesCat = selectedCategory === 'ALL' || l.category === selectedCategory;
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-black uppercase tracking-wider">
                Ops Control Center
              </span>
              <span className="text-xs text-gray-400">Marketplace Supply Pipeline</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Marketplace Acquisition CRM
            </h1>
          </div>

          <button
            onClick={() => navigate('/join')}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20 flex items-center space-x-1.5 self-start md:self-auto"
          >
            <Users className="w-4 h-4" />
            <span>Open Public Onboarding Funnels</span>
          </button>
        </div>

        {/* Pipeline Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl">
            <span className="text-xs text-gray-400 font-medium">Total Pipeline Leads</span>
            <div className="text-2xl font-black text-white mt-1">{leads.length}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl">
            <span className="text-xs text-amber-400 font-medium">Active Pilots</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {leads.filter(l => l.stage === 'PILOT_PROPOSED' || l.stage === 'ACTIVE').length}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl">
            <span className="text-xs text-emerald-400 font-medium">Active Venues / Hosts</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {leads.filter(l => l.stage === 'ACTIVE').length}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl">
            <span className="text-xs text-purple-400 font-medium">Reporting & Renewal</span>
            <div className="text-2xl font-black text-purple-400 mt-1">
              {leads.filter(l => l.stage === 'REPORTING' || l.stage === 'RENEWAL').length}
            </div>
          </div>
        </div>

        {/* Controls & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {(['ALL', 'VENUE', 'MOMENT_OWNER', 'CREATOR', 'BRAND'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search partner or contact..."
              className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Lead Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-950 text-gray-400 uppercase tracking-wider font-bold border-b border-gray-800">
                <tr>
                  <th className="p-4">Partner Organization</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Scene Affinity</th>
                  <th className="p-4">Perk / Capacity Asset</th>
                  <th className="p-4">CRM Stage</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center space-x-2">
                      <Store className="w-4 h-4 text-orange-400" />
                      <span>{lead.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-gray-800 rounded font-semibold text-[10px]">
                        {lead.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>{lead.contactPerson}</div>
                      <div className="text-[10px] text-gray-500">{lead.phone}</div>
                    </td>
                    <td className="p-4 text-gray-400">{lead.sceneAffinity}</td>
                    <td className="p-4 text-amber-300 font-medium">{lead.offPeakCapacityPerk || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${stageBadgeStyles[lead.stage]}`}>
                        {lead.stage}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleStageAdvance(lead.id)}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-orange-500 text-white font-bold text-[10px] rounded-lg transition-colors inline-flex items-center space-x-1"
                      >
                        <span>Advance Stage</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

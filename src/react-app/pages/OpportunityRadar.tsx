import { useEffect, useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import {
  Compass,
  Calendar,
  Sparkles,
  Key,
  Flame,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  MapPin,
  Users
} from 'lucide-react';

import { SceneCard, SceneProps } from '@/react-app/components/SceneCard';
import { MomentCard, MomentProps, IntentType } from '@/react-app/components/MomentCard';
import { DiscoveryWidget, DiscoveryProps } from '@/react-app/components/DiscoveryWidget';
import { PromoKeyModal } from '@/react-app/components/PromoKeyModal';

// Sample Seed Data for Demonstration & Verification
const SAMPLE_SCENES: SceneProps[] = [
  {
    id: 'scene-1',
    slug: 'kingston-after-dark',
    name: 'Kingston After Dark',
    description: 'The definitive lens for nightlife, late-night food spots, live music, and party culture in Kingston.',
    category: 'Nightlife & Music',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
    activeMomentsCount: 12,
    activeDiscoveriesCount: 4,
    activeParticipantsCount: 1420,
    creatorsCount: 8,
    isJoined: true
  },
  {
    id: 'scene-2',
    slug: 'food-and-taste',
    name: 'Food & Taste Jamaica',
    description: 'Discover underrated breakfast joints, street vendors, chef popups, and signature dining experiences.',
    category: 'Food & Dining',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
    activeMomentsCount: 9,
    activeDiscoveriesCount: 6,
    activeParticipantsCount: 980,
    creatorsCount: 12,
    isJoined: false
  },
  {
    id: 'scene-3',
    slug: 'move-jamaica',
    name: 'Move & Fitness Jamaica',
    description: 'Active lifestyle, outdoor runs, fitness popups, wellness retreats, and beach workouts.',
    category: 'Fitness & Health',
    coverImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
    activeMomentsCount: 5,
    activeDiscoveriesCount: 3,
    activeParticipantsCount: 450,
    creatorsCount: 4,
    isJoined: false
  }
];

const SAMPLE_MOMENTS: MomentProps[] = [
  {
    id: 'moment-1',
    title: 'Encore R&B Brunch & Daytime Party',
    description: 'Recurring anchor experience featuring Kingston\'s top DJs, gourmet brunch menu, and complimentary cocktail pairing.',
    intentType: 'ATTEND',
    ownership: 'PROMORANG ORIGINAL',
    venueName: 'The Terrace Kingston',
    location: 'Liguanea, Kingston',
    dateDisplay: 'Today at 2:00 PM',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 5,
    subMomentsCount: 4,
    attendeesCount: 184,
    pointsReward: 250
  },
  {
    id: 'moment-2',
    title: 'Secret Off-Peak Tasting Menu',
    description: 'Exclusive 3-course chef tasting experience with first 20 PromoKeys receiving 35% discount on signature dishes.',
    intentType: 'TRY',
    ownership: 'PARTNER MOMENT',
    venueName: 'Marketplace Bistro',
    location: 'Constant Spring Rd',
    dateDisplay: 'Tonight at 7:00 PM',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 3,
    subMomentsCount: 2,
    attendeesCount: 42,
    pointsReward: 150
  },
  {
    id: 'moment-3',
    title: 'Clay & Sip Creative Workshop',
    description: 'Demand-triggered hands-on pottery class hosted in response to community votes on Promorang Discoveries.',
    intentType: 'LEARN',
    ownership: 'EMERGING MOMENT',
    venueName: 'Artisans Corner',
    location: 'New Kingston',
    dateDisplay: 'This Sat at 4:00 PM',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 8,
    subMomentsCount: 3,
    attendeesCount: 65,
    pointsReward: 300
  }
];

const SAMPLE_DISCOVERY: DiscoveryProps = {
  id: 'disc-1',
  question: 'Which restaurant in Kingston has the best late-night food after 1:00 AM?',
  category: 'Food & Taste',
  authorName: 'Jamaican Eats Scout',
  totalVotes: 84,
  thresholdForMoment: 100,
  options: [
    { id: 'opt-1', text: 'Truck Stop Jerk (Constant Spring)', votes: 34 },
    { id: 'opt-2', text: 'Sweetwood Jerk Joint', votes: 28 },
    { id: 'opt-3', text: 'Chillers Sports Bar', votes: 14 },
    { id: 'opt-4', text: 'Island Grill 24h Drive-thru', votes: 8 }
  ]
};

export default function OpportunityRadar() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'NOW' | 'DISCOVER' | 'UNLOCK' | 'SCENES'>('NOW');
  const [selectedIntent, setSelectedIntent] = useState<IntentType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // PromoKey Modal State
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [activeKeyMoment, setActiveKeyMoment] = useState<MomentProps | null>(null);

  const handleClaimKey = (momentId: string) => {
    const target = SAMPLE_MOMENTS.find(m => m.id === momentId) || SAMPLE_MOMENTS[0];
    setActiveKeyMoment(target);
    setKeyModalOpen(true);
  };

  const filteredMoments = SAMPLE_MOMENTS.filter(moment => {
    const matchesIntent = selectedIntent === 'ALL' || moment.intentType === selectedIntent;
    const matchesSearch = moment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          moment.venueName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesIntent && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-gray-950 via-gray-900 to-gray-900 text-white pt-8 pb-12 px-4 border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2.5 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-black uppercase tracking-wider">
                  Participation Network
                </span>
                <span className="text-xs text-gray-400 font-medium">Kingston, Jamaica</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Scenes & Moments Radar
              </h1>
              <p className="text-gray-400 text-xs md:text-sm mt-1 max-w-xl">
                Discover what's worth doing, experiencing, and unlocking. Connect with active scenes and claim exclusive PromoKeys.
              </p>
            </div>

            {/* Quick Stakeholder Navigation Link */}
            <div className="flex items-center space-x-2">
              <a
                href="/join/participant"
                className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20 flex items-center space-x-1.5 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Founding Member Access</span>
              </a>
              <a
                href="/join/venue"
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs rounded-xl border border-gray-700 transition-colors"
              >
                For Venues
              </a>
            </div>
          </div>

          {/* Navigation Mode Tabs */}
          <div className="flex items-center space-x-2 border-b border-gray-800 pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('NOW')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
                activeTab === 'NOW' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>NOW & Imminent</span>
            </button>
            
            <button
              onClick={() => setActiveTab('SCENES')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
                activeTab === 'SCENES' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Scenes Lens</span>
            </button>

            <button
              onClick={() => setActiveTab('DISCOVER')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
                activeTab === 'DISCOVER' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Discoveries</span>
            </button>

            <button
              onClick={() => setActiveTab('UNLOCK')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
                activeTab === 'UNLOCK' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Unlock PromoKeys</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Body Content */}
      <div className="max-w-6xl mx-auto px-4 pt-8">

        {/* Intent Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Intent Filters */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 md:pb-0">
            <span className="text-xs font-bold text-gray-500 mr-2 flex items-center">
              <Filter className="w-3.5 h-3.5 mr-1" /> Intent:
            </span>
            {(['ALL', 'ATTEND', 'TRY', 'GET', 'LEARN', 'CONNECT'] as const).map(intent => (
              <button
                key={intent}
                onClick={() => setSelectedIntent(intent)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  selectedIntent === intent
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {intent}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search moments, venues..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500 shadow-sm"
            />
          </div>
        </div>

        {/* Dynamic Tab Rendering */}
        {activeTab === 'SCENES' ? (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Active Persistent Scenes</h2>
              <p className="text-xs text-gray-500">
                Persistent networks of people, interests, and places around things you care about.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SAMPLE_SCENES.map(scene => (
                <SceneCard key={scene.id} {...scene} />
              ))}
            </div>
          </div>
        ) : activeTab === 'DISCOVER' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Active Market Intelligence</h2>
                <p className="text-xs text-gray-500">
                  Vote on discoveries to stimulate new supply and trigger Promorang Moments.
                </p>
              </div>
              <DiscoveryWidget {...SAMPLE_DISCOVERY} />
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-md">
                  Demand-to-Supply Engine
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-2">
                  Have a suggestion for your city?
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  When 100 people vote for a discovery, Promorang approaches local studio owners, venues, and hosts to create a real-world Moment.
                </p>
              </div>
              <button className="w-full mt-6 py-2.5 bg-gray-900 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-colors">
                Submit New Discovery Question
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Featured Moments Section */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Active Moments</h2>
                <p className="text-xs text-gray-500">
                  Time-bounded opportunities worth acting on in Kingston today.
                </p>
              </div>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                {filteredMoments.length} Opportunities Live
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {filteredMoments.map(moment => (
                <MomentCard
                  key={moment.id}
                  {...moment}
                  onClaimKey={handleClaimKey}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* PromoKey Redemption Modal */}
      {activeKeyMoment && (
        <PromoKeyModal
          isOpen={keyModalOpen}
          onClose={() => setKeyModalOpen(false)}
          momentTitle={activeKeyMoment.title}
          perkDescription="Free complimentary cocktail + VIP expedited entry"
          venueName={activeKeyMoment.venueName}
          location={activeKeyMoment.location}
          keysRemaining={activeKeyMoment.promoKeysAvailable}
        />
      )}
    </div>
  );
}

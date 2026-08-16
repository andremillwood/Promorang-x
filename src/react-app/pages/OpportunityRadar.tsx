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
  },
  {
    id: 'moment-4',
    title: 'Kingston Dub Club Sunday Roots Session',
    description: 'Legendary weekly hilltop sound system gathering overlooking city lights. Authentic dub plates and strictly conscious vibes.',
    intentType: 'ATTEND',
    ownership: 'EDITORIAL DISCOVERY',
    venueName: 'Kingston Dub Club',
    location: 'Skyline Drive, Jack\'s Hill',
    dateDisplay: 'Every Sunday at 8:00 PM',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 0,
    subMomentsCount: 3,
    attendeesCount: 215,
    pointsReward: 100,
    isClaimed: false
  },
  {
    id: 'moment-5',
    title: 'Devon House Gourmet Bakery & Ice Cream Crawl',
    description: 'Historic estate culinary exploration featuring world-famous gourmet patties and authentic Devon House I Scream.',
    intentType: 'TRY',
    ownership: 'EDITORIAL DISCOVERY',
    venueName: 'Devon House Gourmet Court',
    location: 'Hope Rd, Kingston',
    dateDisplay: 'Daily 10:00 AM – 9:00 PM',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 0,
    subMomentsCount: 4,
    attendeesCount: 148,
    pointsReward: 100,
    isClaimed: false
  },
  {
    id: 'moment-6',
    title: 'Live Acoustic & Grill at Janga\'s',
    description: 'Relaxed open-air courtyard sessions with acoustic live bands, craft cocktails, and authentic Jamaican grilled bites.',
    intentType: 'CONNECT',
    ownership: 'EDITORIAL DISCOVERY',
    venueName: 'Janga\'s Soundbar & Grill',
    location: 'Belmont Rd, New Kingston',
    dateDisplay: 'Every Thursday at 7:30 PM',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 0,
    subMomentsCount: 2,
    attendeesCount: 88,
    pointsReward: 100,
    isClaimed: false
  },
  {
    id: 'moment-7',
    title: 'Port Royal Fried Fish & Bammy Sunset Run',
    description: 'Harbourfront fresh catch dining at Gloria\'s with sunset views across Kingston Harbour to the historic naval town.',
    intentType: 'TRY',
    ownership: 'EDITORIAL DISCOVERY',
    venueName: 'Gloria\'s Seafood City',
    location: 'Port Royal, Kingston Harbour',
    dateDisplay: 'Weekends from 1:00 PM',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 0,
    subMomentsCount: 3,
    attendeesCount: 172,
    pointsReward: 100,
    isClaimed: false
  },
  {
    id: 'moment-8',
    title: 'Tracks & Records Game Night & Live Jam',
    description: 'Premier sports lounge and cultural entertainment hub featuring authentic Jamaican fusion cuisine and live DJ sets.',
    intentType: 'ATTEND',
    ownership: 'EDITORIAL DISCOVERY',
    venueName: 'Usain Bolt\'s Tracks & Records',
    location: 'Marketplace, Constant Spring Rd',
    dateDisplay: 'Every Wednesday & Friday 8:00 PM',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 0,
    subMomentsCount: 3,
    attendeesCount: 134,
    pointsReward: 100,
    isClaimed: false
  },
  {
    id: 'moment-9',
    title: 'Blue Mountain High Mountain Tea & Sunset Views',
    description: 'Historic mountaintop retreat above Kingston with colonial architecture, coffee tasting, and breathtaking valley vistas.',
    intentType: 'CONNECT',
    ownership: 'EDITORIAL DISCOVERY',
    venueName: 'Strawberry Hill Estate',
    location: 'Irish Town, Blue Mountains',
    dateDisplay: 'Saturday & Sunday 3:00 PM',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 0,
    subMomentsCount: 2,
    attendeesCount: 95,
    pointsReward: 100,
    isClaimed: false
  },
  {
    id: 'moment-10',
    title: 'Kingston Night Market Artisan & Food Fair',
    description: 'Vibrant weekly evening market with local artisan fashion, wellness popups, live acoustic music, and pan-island street cuisine.',
    intentType: 'GET',
    ownership: 'EDITORIAL DISCOVERY',
    venueName: 'Kingston Night Market',
    location: '8 Hillcrest Ave, Kingston 6',
    dateDisplay: 'Every Tuesday 5:00 PM – 11:00 PM',
    image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 0,
    subMomentsCount: 4,
    attendeesCount: 165,
    pointsReward: 100,
    isClaimed: false
  },
  {
    id: 'moment-11',
    title: 'Weddy Weddy (Stone Love Movement Sound System)',
    description: 'Iconic dancehall institution since 1972. World-famous selector sets, heavy dub basslines, and quintessential sound-system culture.',
    intentType: 'ATTEND',
    ownership: 'EDITORIAL DISCOVERY',
    venueName: 'Stone Love HQ',
    location: '41 Burlington Ave, Kingston 10',
    dateDisplay: 'Every Wednesday 9:00 PM – Late',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 0,
    subMomentsCount: 3,
    attendeesCount: 280,
    pointsReward: 100,
    isClaimed: false
  },
  {
    id: 'moment-12',
    title: 'Uptown Mondays Authentic Street Dance',
    description: 'High-energy open-air street celebration in Half Way Tree featuring Jamaica\'s premier sound systems and guest artists.',
    intentType: 'ATTEND',
    ownership: 'EDITORIAL DISCOVERY',
    venueName: 'Savannah Plaza',
    location: 'Constant Spring Rd, Half Way Tree',
    dateDisplay: 'Every Monday 10:00 PM – 2:00 AM',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 0,
    subMomentsCount: 2,
    attendeesCount: 310,
    pointsReward: 100,
    isClaimed: false
  },
  {
    id: 'moment-13',
    title: 'Redbones Jazz & Caribbean Fusion Friday',
    description: 'Sophisticated bohemian courtyard dining with live jazz, spoken word poetry, and signature Caribbean tapas pairings.',
    intentType: 'CONNECT',
    ownership: 'EDITORIAL DISCOVERY',
    venueName: 'Redbones Blues Café',
    location: '1 Argyle Rd, New Kingston',
    dateDisplay: 'Friday from 7:00 PM',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 0,
    subMomentsCount: 3,
    attendeesCount: 112,
    pointsReward: 100,
    isClaimed: false
  },
  {
    id: 'moment-14',
    title: 'Rub-A-Dub & Roots Session at Dubwise',
    description: 'Conscious reggae hub and plant-based café hosting vinyl selectors, herbal brews, and relaxed cultural conversation.',
    intentType: 'CONNECT',
    ownership: 'EDITORIAL DISCOVERY',
    venueName: 'Dubwise Café',
    location: '82 Lady Musgrave Rd, Kingston',
    dateDisplay: 'Every Tuesday 6:00 PM – 11:00 PM',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 0,
    subMomentsCount: 2,
    attendeesCount: 78,
    pointsReward: 100,
    isClaimed: false
  },
  {
    id: 'moment-15',
    title: 'Downtown Kingston Creative Artwalk & Mural Tour',
    description: 'Free public cultural festival celebrating street murals, live performances, local crafts, and historic lane tours.',
    intentType: 'LEARN',
    ownership: 'EDITORIAL DISCOVERY',
    venueName: 'Downtown Art District',
    location: 'Water Lane & Church St, Downtown KGN',
    dateDisplay: 'Last Sunday of Month 11:00 AM – 6:00 PM',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 0,
    subMomentsCount: 4,
    attendeesCount: 245,
    pointsReward: 150,
    isClaimed: false
  },
  {
    id: 'moment-16',
    title: 'Broken Plate Rooftop Dining & Sunset Cocktails',
    description: 'Premier rooftop fusion dining overlooking Kingston skyline. Seasonal modern Jamaican plates with curated wine pairings.',
    intentType: 'TRY',
    ownership: 'EDITORIAL DISCOVERY',
    venueName: 'Broken Plate',
    location: '24 Barbican Rd, Kingston',
    dateDisplay: 'Daily 5:00 PM – 11:00 PM',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 0,
    subMomentsCount: 3,
    attendeesCount: 188,
    pointsReward: 100,
    isClaimed: false
  },
  {
    id: 'moment-17',
    title: 'Tacos & Reggae Jam at Chilitos JaMexican',
    description: 'Lively courtyard fiesta blending authentic Mexican tacos, burritos, and tequila cocktails with bold Jamaican spices.',
    intentType: 'TRY',
    ownership: 'EDITORIAL DISCOVERY',
    venueName: 'Chilitos JaMexican',
    location: '88 Hope Rd, Kingston 6',
    dateDisplay: 'Taco Tuesday & Weekends from 12:00 PM',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 0,
    subMomentsCount: 3,
    attendeesCount: 142,
    pointsReward: 100,
    isClaimed: false
  },
  {
    id: 'moment-18',
    title: 'AC Lounge Tapas & Craft Mixology Evenings',
    description: 'Chic European-inspired lounge with Spanish tapas, signature rum cocktails, and cosmopolitan weekend DJ sets.',
    intentType: 'CONNECT',
    ownership: 'EDITORIAL DISCOVERY',
    venueName: 'AC Lounge (AC Hotel Kingston)',
    location: '38-42 Lady Musgrave Rd, Kingston',
    dateDisplay: 'Thursdays – Saturdays from 6:00 PM',
    image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 0,
    subMomentsCount: 2,
    attendeesCount: 160,
    pointsReward: 100,
    isClaimed: false
  },
  {
    id: 'moment-19',
    title: 'Blue Mountain Coffee Cupping at Cafe Blue',
    description: 'Serene mountain morning brew session featuring 100% Grade 1 Jamaica Blue Mountain Coffee and artisan pastries.',
    intentType: 'TRY',
    ownership: 'EDITORIAL DISCOVERY',
    venueName: 'Cafe Blue Irish Town',
    location: 'Irish Town, St. Andrew Hills',
    dateDisplay: 'Weekends 8:00 AM – 4:00 PM',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 0,
    subMomentsCount: 3,
    attendeesCount: 118,
    pointsReward: 100,
    isClaimed: false
  },
  {
    id: 'moment-20',
    title: 'Bob Marley Legend Home & Exhibition Tour',
    description: 'Iconic Hope Road heritage tour through Bob Marley\'s personal home, recording studio, and private artifact galleries.',
    intentType: 'LEARN',
    ownership: 'EDITORIAL DISCOVERY',
    venueName: 'Bob Marley Museum',
    location: '56 Hope Rd, Kingston 6',
    dateDisplay: 'Monday – Saturday 9:30 AM – 4:00 PM',
    image: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 0,
    subMomentsCount: 4,
    attendeesCount: 320,
    pointsReward: 150,
    isClaimed: false
  },
  {
    id: 'moment-21',
    title: 'Trench Town Culture Yard Roots & History Walk',
    description: 'Historic guided walk through the birthplace of reggae and rocksteady, visiting Casbah Bar and the original communal rooms.',
    intentType: 'LEARN',
    ownership: 'EDITORIAL DISCOVERY',
    venueName: 'Trench Town Culture Yard',
    location: 'Lower 1st St, Trench Town, Kingston',
    dateDisplay: 'Daily 9:00 AM – 5:00 PM',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=800',
    promoKeysAvailable: 0,
    subMomentsCount: 3,
    attendeesCount: 205,
    pointsReward: 150,
    isClaimed: false
  }
];

const SAMPLE_DISCOVERIES: DiscoveryProps[] = [
  {
    id: 'disc-demand-001',
    question: 'What should Promorang make happen in Kingston next?',
    category: 'Demand Construction',
    authorName: 'Promorang Community Scout',
    totalVotes: 44,
    thresholdForMoment: 50,
    options: [
      { id: 'opt-1', text: 'Secret Jamaican Food Crawl (Barbican)', votes: 22 },
      { id: 'opt-2', text: 'Clay & Sip Pottery Workshop (New Kingston)', votes: 12 },
      { id: 'opt-3', text: 'Sunset Vinyl Listening Night (Hope Rd)', votes: 6 },
      { id: 'opt-4', text: 'Beginner Boxing & Coffee Morning', votes: 4 }
    ]
  },
  {
    id: 'disc-food-002',
    question: 'Who serves the undisputed best escovitch fish in Kingston & St. Andrew?',
    category: 'Food & Taste Lens',
    authorName: 'Chef Andre (Food Scout)',
    totalVotes: 86,
    thresholdForMoment: 100,
    options: [
      { id: 'opt-f1', text: 'Gloria\'s Seafood City (Port Royal)', votes: 41 },
      { id: 'opt-f2', text: 'Prendy\'s on the Beach (Hellshire)', votes: 26 },
      { id: 'opt-f3', text: 'Fish Pot Fry Table (Downtown Waterfront)', votes: 12 },
      { id: 'opt-f4', text: 'Ocean Style (Liguanea)', votes: 7 }
    ]
  },
  {
    id: 'disc-culture-003',
    question: 'Which creative Kingston experience should get exclusive PromoKey perks next?',
    category: 'Music & Culture Lens',
    authorName: 'Trench Town Guild Steward',
    totalVotes: 61,
    thresholdForMoment: 75,
    options: [
      { id: 'opt-c1', text: 'Downtown Artwalk & Mural Tour Access', votes: 28 },
      { id: 'opt-c2', text: 'Tuff Gong Record Pressing Behind-The-Scenes', votes: 19 },
      { id: 'opt-c3', text: 'National Gallery After-Hours Wine & Tour', votes: 14 }
    ]
  },
  {
    id: 'disc-wellness-004',
    question: 'What Sunday morning wellness recharge would you actually attend?',
    category: 'Move & Wellness Lens',
    authorName: 'Kingston Wellness Collective',
    totalVotes: 37,
    thresholdForMoment: 50,
    options: [
      { id: 'opt-w1', text: 'Sunrise Yoga at Hope Botanical Gardens', votes: 18 },
      { id: 'opt-w2', text: 'Blue Mountain Coffee Hike & Cool Off', votes: 11 },
      { id: 'opt-w3', text: 'Pilates in the Park (Emancipation Park)', votes: 8 }
    ]
  }
];

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
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Active Kingston Market Intelligence</h2>
                <p className="text-xs text-gray-500">
                  Vote on discoveries across Kingston lenses to stimulate new supply and trigger exclusive PromoKeys.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                {SAMPLE_DISCOVERIES.length} Active Polls
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {SAMPLE_DISCOVERIES.map(discovery => (
                <DiscoveryWidget key={discovery.id} {...discovery} />
              ))}
            </div>

            {/* Demand to Supply Banner */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-950 to-gray-900 text-white p-8 rounded-3xl border border-gray-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-xl">
                <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase tracking-wider rounded-lg">
                  Demand-to-Supply Engine
                </span>
                <h3 className="text-xl font-black mt-2">Have a venue, experience, or dish Kingston needs to know?</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  When 50+ participants vote for an experience, Promorang approaches local business owners and hosts to unlock exclusive perks and convert community curiosity into verified Moments.
                </p>
              </div>
              <button 
                onClick={() => window.location.href = '/join/participant'}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20 whitespace-nowrap"
              >
                Submit Discovery & Earn +25 Points
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

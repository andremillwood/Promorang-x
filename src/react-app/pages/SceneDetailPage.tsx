import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  Users, 
  Calendar, 
  Sparkles, 
  Key, 
  MapPin, 
  ArrowLeft, 
  Filter, 
  PlusCircle, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Award,
  Flame
} from 'lucide-react';

import { MomentCard, MomentProps } from '@/react-app/components/MomentCard';
import { DiscoveryWidget, DiscoveryProps } from '@/react-app/components/DiscoveryWidget';
import { PromoKeyModal } from '@/react-app/components/PromoKeyModal';

export default function SceneDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const sceneName = slug === 'food-and-taste' 
    ? 'Food & Taste Jamaica' 
    : slug === 'move-jamaica' 
    ? 'Move & Fitness Jamaica' 
    : 'Kingston After Dark';

  const [isJoined, setIsJoined] = useState(true);
  const [activeTab, setActiveTab] = useState<'MOMENTS' | 'DISCOVERIES' | 'CREATORS' | 'SCHEDULE'>('MOMENTS');

  // PromoKey modal state
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [activeMomentTitle, setActiveMomentTitle] = useState('');

  const handleClaimKey = (title: string) => {
    setActiveMomentTitle(title);
    setKeyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Scene Cover Hero */}
      <div className="relative h-64 md:h-80 w-full bg-gray-950 overflow-hidden text-white">
        <img
          src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200"
          alt={sceneName}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

        {/* Top Back Navigation */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => navigate('/radar')}
            className="px-3 py-1.5 bg-gray-900/80 backdrop-blur-md hover:bg-gray-900 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 border border-gray-700 shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Scenes</span>
          </button>
        </div>

        {/* Scene Info Banner Overlay */}
        <div className="absolute bottom-6 left-4 right-4 max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-0.5 bg-orange-500 text-white font-black text-xs rounded-full uppercase tracking-wider">
                Persistent Scene Lens
              </span>
              <span className="text-xs text-amber-300 font-semibold flex items-center">
                <Flame className="w-3.5 h-3.5 mr-1" /> Trending #1 in Kingston
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
              {sceneName}
            </h1>
            <p className="text-gray-300 text-xs md:text-sm mt-2 max-w-xl line-clamp-2">
              The persistent network connecting creators, party hosts, hidden gems, and night owls across Kingston.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsJoined(!isJoined)}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-lg transition-all ${
                isJoined
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-white text-gray-950 hover:bg-gray-100'
              }`}
            >
              {isJoined ? 'Joined Scene ✓' : '+ Join Scene'}
            </button>
            <button
              onClick={() => navigate('/join/host')}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-orange-500/20"
            >
              Post a Moment
            </button>
          </div>
        </div>
      </div>

      {/* Main Section Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center space-x-6 overflow-x-auto text-xs font-bold text-gray-500">
          <button
            onClick={() => setActiveTab('MOMENTS')}
            className={`py-3.5 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'MOMENTS' ? 'border-orange-500 text-orange-600 font-extrabold' : 'border-transparent hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Active Moments (12)</span>
          </button>

          <button
            onClick={() => setActiveTab('DISCOVERIES')}
            className={`py-3.5 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'DISCOVERIES' ? 'border-orange-500 text-orange-600 font-extrabold' : 'border-transparent hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Scene Discoveries (4)</span>
          </button>

          <button
            onClick={() => setActiveTab('CREATORS')}
            className={`py-3.5 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'CREATORS' ? 'border-orange-500 text-orange-600 font-extrabold' : 'border-transparent hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Participating Creators (8)</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        
        {activeTab === 'MOMENTS' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Happening Soon in {sceneName}</h2>
              <span className="text-xs text-gray-500 font-medium">Sorted by Imminent Time</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MomentCard
                id="m1"
                title="Encore Daytime Party"
                description="Kingston's premier R&B brunch experience featuring top local DJs and complimentary drinks."
                intentType="ATTEND"
                ownership="PROMORANG ORIGINAL"
                venueName="The Terrace"
                location="Liguanea"
                dateDisplay="Today at 2:00 PM"
                image="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800"
                promoKeysAvailable={5}
                subMomentsCount={3}
                attendeesCount={140}
                pointsReward={250}
                onClaimKey={() => handleClaimKey("Encore Daytime Party")}
              />

              <MomentCard
                id="m2"
                title="Secret Off-Peak Tasting Menu"
                description="Special 3-course tasting menu at 35% discount for PromoKey holders."
                intentType="TRY"
                ownership="PARTNER MOMENT"
                venueName="Marketplace Bistro"
                location="Constant Spring Rd"
                dateDisplay="Tonight at 7:00 PM"
                image="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800"
                promoKeysAvailable={2}
                subMomentsCount={2}
                attendeesCount={38}
                pointsReward={150}
                onClaimKey={() => handleClaimKey("Secret Off-Peak Tasting Menu")}
              />
            </div>
          </div>
        )}

        {activeTab === 'DISCOVERIES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DiscoveryWidget
              id="disc-scene"
              question="What is the #1 underrated late night spot in Kingston for post-party eats?"
              category="Nightlife"
              authorName="Kingston Scene Host"
              totalVotes={72}
              thresholdForMoment={100}
              options={[
                { id: '1', text: 'Truck Stop Jerk (Constant Spring)', votes: 30 },
                { id: '2', text: 'Chillers Sports Bar', votes: 24 },
                { id: '3', text: 'Sweetwood Jerk Joint', votes: 18 }
              ]}
            />
          </div>
        )}

      </div>

      {/* Modal */}
      {keyModalOpen && (
        <PromoKeyModal
          isOpen={keyModalOpen}
          onClose={() => setKeyModalOpen(false)}
          momentTitle={activeMomentTitle}
          perkDescription="Free VIP Entry Pass + Complimentary Pairing"
          venueName="Partner Venue"
          location="Kingston, Jamaica"
        />
      )}
    </div>
  );
}

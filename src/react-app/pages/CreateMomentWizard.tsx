import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  PlusCircle, 
  Calendar, 
  MapPin, 
  Key, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock,
  Layers,
  Store
} from 'lucide-react';

import { IntentType, MomentOwnership } from '@/react-app/components/MomentCard';

export default function CreateMomentWizard() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    intentType: 'ATTEND' as IntentType,
    ownership: 'PARTNER MOMENT' as MomentOwnership,
    venueName: '',
    location: '',
    dateDisplay: '',
    promoKeysAvailable: 10,
    perkDescription: '',
    subMomentsText: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans py-12 px-4">
      <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-2xl">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
              Partner Self-Serve Creator Wizard
            </span>
            <h1 className="text-2xl font-black text-white">Create a Time-Bounded Moment</h1>
          </div>
        </div>

        {submitted ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Moment Created & Submitted!</h2>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Your Moment has been submitted for Scene distribution. Promorang participants will now see your activation and unlock PromoKeys.
            </p>
            <button
              onClick={() => navigate('/radar')}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 font-bold text-xs rounded-xl shadow-lg"
            >
              View on Scenes Radar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Moment Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Secret Friday Chef Tasting Night"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Action Intent</label>
                <select
                  value={formData.intentType}
                  onChange={e => setFormData({ ...formData, intentType: e.target.value as IntentType })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="ATTEND">ATTEND (Party / Event)</option>
                  <option value="TRY">TRY (Menu / Product)</option>
                  <option value="GET">GET (Sale / Drop / PromoKey)</option>
                  <option value="LEARN">LEARN (Workshop / Class)</option>
                  <option value="CONNECT">CONNECT (Meetup / Social)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Ownership Model</label>
                <select
                  value={formData.ownership}
                  onChange={e => setFormData({ ...formData, ownership: e.target.value as MomentOwnership })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="PARTNER MOMENT">Partner Moment</option>
                  <option value="PROMORANG PRESENTS">Promorang Presents</option>
                  <option value="COMMUNITY MOMENT">Community Moment</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Venue / Host Name</label>
                <input
                  type="text"
                  required
                  value={formData.venueName}
                  onChange={e => setFormData({ ...formData, venueName: e.target.value })}
                  placeholder="e.g. Marketplace Bistro"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Date & Time Display</label>
                <input
                  type="text"
                  required
                  value={formData.dateDisplay}
                  onChange={e => setFormData({ ...formData, dateDisplay: e.target.value })}
                  placeholder="e.g. Tonight at 8:00 PM"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Exclusive PromoKey Perk Description</label>
              <input
                type="text"
                required
                value={formData.perkDescription}
                onChange={e => setFormData({ ...formData, perkDescription: e.target.value })}
                placeholder="e.g. Free complimentary dessert with main dish order"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Description</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe why participants should act on this moment..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <span>Publish Moment & Issue PromoKeys</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

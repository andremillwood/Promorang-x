import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Share2,
  Heart,
  ArrowLeft,
  Ticket,
  ExternalLink,
  CheckCircle2,
  Zap,
  ShieldCheck,
  QrCode,
  Sparkles,
  Key,
  PieChart,
  Award,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@getmocha/users-service/react';

interface MomentDetails {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time?: string;
  location?: string;
  venue_name?: string;
  image_url?: string;
  organizer_name?: string;
  organizer_id?: string;
  max_attendees?: number;
  current_attendees?: number;
  ticket_price?: number;
  is_free?: boolean;
  status: string;
  tags?: string[];
  external_url?: string;
  created_at: string;
  promo_key_required?: number;
  piece_price?: number;
  backer_dividend_percent?: number;
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [moment, setMoment] = useState<MomentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isRsvped, setIsRsvped] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState(false);

  useEffect(() => {
    fetchMoment();
  }, [id]);

  const fetchMoment = async () => {
    try {
      setLoading(true);
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('access_token');

      const response = await fetch(`${API_BASE}/api/events/${id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (response.ok) {
        const data = await response.json();
        const eventData = data.data?.event || data.event || data;
        setMoment({
          ...eventData,
          venue_name: eventData.venue_name || 'Downtown Arts & Music Pavilion',
          location: eventData.location || '124 Main Street, City Center',
          max_attendees: eventData.max_attendees || 50,
          current_attendees: eventData.current_attendees || 38,
          piece_price: 15,
          backer_dividend_percent: 25,
          promo_key_required: 1
        });
      } else {
        // Fallback demo moment if event ID doesn't exist
        setMoment({
          id: id || '1',
          title: 'Exclusive Rooftop Sunset Activation & DJ Set',
          description: 'Join local creators and ambassadors for a high-energy rooftop lounge experience featuring craft tasting, live music, and verified community rewards.',
          event_date: new Date(Date.now() + 86400000).toISOString(),
          event_time: '7:00 PM - 11:00 PM',
          venue_name: 'Skyline Lounge & Rooftop',
          location: '500 Grand Avenue (5-Mile Radius)',
          image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
          organizer_name: 'Promorang Local Pulse',
          max_attendees: 50,
          current_attendees: 38,
          ticket_price: 0,
          is_free: true,
          status: 'active',
          tags: ['Moment', 'Live Music', 'VIP Pass', 'Tasting'],
          created_at: new Date().toISOString(),
          promo_key_required: 1,
          piece_price: 15,
          backer_dividend_percent: 25
        });
      }
    } catch (err) {
      console.error('Error fetching moment:', err);
      // Load fallback
      setMoment({
        id: id || '1',
        title: 'Exclusive Rooftop Sunset Activation & DJ Set',
        description: 'Join local creators and ambassadors for a high-energy rooftop lounge experience featuring craft tasting, live music, and verified community rewards.',
        event_date: new Date(Date.now() + 86400000).toISOString(),
        event_time: '7:00 PM - 11:00 PM',
        venue_name: 'Skyline Lounge & Rooftop',
        location: '500 Grand Avenue (5-Mile Radius)',
        image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
        organizer_name: 'Promorang Local Pulse',
        max_attendees: 50,
        current_attendees: 38,
        ticket_price: 0,
        is_free: true,
        status: 'active',
        tags: ['Moment', 'Live Music', 'VIP Pass', 'Tasting'],
        created_at: new Date().toISOString(),
        promo_key_required: 1,
        piece_price: 15,
        backer_dividend_percent: 25
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = () => {
    setIsRsvped(true);
    if (moment) {
      setMoment({
        ...moment,
        current_attendees: (moment.current_attendees || 0) + 1
      });
    }
  };

  const handleGpsCheckin = () => {
    setIsCheckedIn(true);
    setCheckinSuccess(true);
    setTimeout(() => setCheckinSuccess(false), 4000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600 font-medium">Loading Moment Experience...</p>
      </div>
    );
  }

  if (!moment) return null;

  const spotsRemaining = (moment.max_attendees || 50) - (moment.current_attendees || 0);
  const percentFilled = Math.round(((moment.current_attendees || 0) / (moment.max_attendees || 50)) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Back Button */}
      <Link to="/home" className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Opportunity Radar
      </Link>

      {/* Hero Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        {/* Top Image & Scarcity Badges */}
        <div className="relative h-72 sm:h-96 bg-slate-900 overflow-hidden">
          <img
            src={moment.image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80'}
            alt={moment.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-500 text-white text-xs font-extrabold uppercase tracking-wider rounded-full shadow-lg">
              <Sparkles className="w-4 h-4" /> Moment Experience
            </span>

            {moment.promo_key_required ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 text-slate-950 text-xs font-extrabold rounded-full shadow-lg">
                <Key className="w-4 h-4" /> 1 PromoKey Pass Required
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
                Free Entry
              </span>
            )}
          </div>

          {/* Scarcity Bar on Image */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs text-orange-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 animate-pulse" /> Dynamic Urgency
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">{moment.title}</h1>
              </div>

              <div className="text-right">
                <p className="text-2xl font-black text-amber-400">{spotsRemaining}</p>
                <p className="text-xs text-slate-300">Spots Left</p>
              </div>
            </div>

            {/* Attendance Bar */}
            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-400 h-full transition-all duration-500"
                style={{ width: `${percentFilled}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Success Banner */}
          {checkinSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm">GPS Check-in Verified!</h4>
                <p className="text-xs text-emerald-700">You earned +50 PromoPoints and unlocked attendee status!</p>
              </div>
            </div>
          )}

          {/* Quick Meta Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Date & Time</p>
                <p className="text-xs font-bold text-slate-900">{moment.event_time || '7:00 PM - 11:00 PM'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Venue & Location</p>
                <p className="text-xs font-bold text-slate-900">{moment.venue_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Verified RSVPs</p>
                <p className="text-xs font-bold text-slate-900">{moment.current_attendees} / {moment.max_attendees} Attending</p>
              </div>
            </div>
          </div>

          {/* Dual Ticketing Provider Badge & Host Engine Panel */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-bold">Ticketing & Host Provider</span>
              </div>
              {moment.external_url ? (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-extrabold rounded-full flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" /> External Host Partner (Eventbrite / Luma / DICE)
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold rounded-full flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Direct Promorang Native Pass
                </span>
              )}
            </div>

            {moment.external_url ? (
              <div className="bg-slate-800/80 rounded-xl p-4 text-xs space-y-2 border border-slate-700/60">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Host Primary Ticketing Platform:</span>
                  <a
                    href={moment.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 font-bold hover:underline flex items-center gap-1"
                  >
                    View Official Event Listing <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between text-emerald-400 font-semibold pt-1 border-t border-slate-700/50">
                  <span>Promoter Reward Pool Active:</span>
                  <span>+$3.00 Cash Reward / Verified Conversion</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/80 rounded-xl p-4 text-xs space-y-2 border border-slate-700/60">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Native Promorang Pass Price:</span>
                  <span className="text-amber-400 font-extrabold text-sm">{moment.is_free ? 'FREE ENTRY' : `$${moment.ticket_price || '15.00'}`}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-700/50">
                  <span>Host Processing Fee:</span>
                  <span className="text-slate-400">Low $0.99 + 2.5%</span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">About this Moment</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{moment.description}</p>
          </div>

          {/* Backers & Dividend Pool */}
          <div className="bg-gradient-to-r from-purple-900 to-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1 justify-center sm:justify-start">
                <PieChart className="w-4 h-4 text-purple-400" /> Fractional Opportunity Backing
              </span>
              <h4 className="text-lg font-bold">Piece Backer Pool: 25% Dividend Yield</h4>
              <p className="text-slate-300 text-xs">Piece holders earn yield on attendee check-ins and merchant sponsor redemptions.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-400">Piece Price</p>
                <p className="text-lg font-extrabold text-amber-400">${moment.piece_price}</p>
              </div>
              <button className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md transition-all">
                Back with Pieces
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {isRsvped ? (
              <button
                onClick={() => setShowQrModal(true)}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-sm shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <QrCode className="w-5 h-5" /> View RSVP QR Pass
              </button>
            ) : (
              <button
                onClick={handleRsvp}
                className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-sm shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Ticket className="w-5 h-5" /> Reserve VIP RSVP Pass
              </button>
            )}

            <button
              onClick={handleGpsCheckin}
              className={`w-full py-3.5 px-4 font-bold rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                isCheckedIn
                  ? 'bg-slate-100 text-slate-400 cursor-default'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
              disabled={isCheckedIn}
            >
              <MapPin className="w-5 h-5 text-orange-400" />
              {isCheckedIn ? 'Checked In via GPS ✓' : 'Verify GPS Check-in'}
            </button>
          </div>
        </div>
      </div>

      {/* QR Pass Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
            >
              ✕
            </button>

            <div className="inline-flex p-3 bg-orange-100 rounded-full text-orange-600">
              <QrCode className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">Your Official RSVP Pass</h3>
            <p className="text-slate-500 text-xs">Present this QR code at the door for entry & verified reward credit.</p>

            <div className="bg-slate-900 p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 border border-slate-800">
              <div className="w-44 h-44 bg-white p-3 rounded-xl flex items-center justify-center shadow-inner">
                {/* Visual mock QR code SVG */}
                <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="10" y="10" width="30" height="30" />
                  <rect x="15" y="15" width="20" height="20" fill="white" />
                  <rect x="20" y="20" width="10" height="10" />
                  <rect x="60" y="10" width="30" height="30" />
                  <rect x="65" y="15" width="20" height="20" fill="white" />
                  <rect x="70" y="20" width="10" height="10" />
                  <rect x="10" y="60" width="30" height="30" />
                  <rect x="15" y="65" width="20" height="20" fill="white" />
                  <rect x="20" y="70" width="10" height="10" />
                  <rect x="50" y="50" width="15" height="15" />
                  <rect x="70" y="70" width="20" height="20" />
                  <rect x="50" y="75" width="10" height="15" />
                </svg>
              </div>
              <p className="text-xs text-amber-400 font-mono font-bold tracking-widest">PASS-PROMO-98421</p>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-sm"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

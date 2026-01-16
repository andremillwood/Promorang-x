/**
 * Events Entry Page
 * 
 * Entry surface for discovering and RSVPing to events.
 * Simple, action-first interface for new users.
 * 
 * This is a NEW route at /events-entry - does not replace existing /events page.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useMaturity } from '@/react-app/context/MaturityContext';
import { EntryLayout } from '@/react-app/components/entry';
import { Calendar, MapPin, Users, ChevronRight, Sparkles, Shield, Tag, Ticket, Trophy, ArrowRight } from 'lucide-react';
import { markCompleted, STORAGE_KEYS } from '@/react-app/hooks/useWhatsNext';

interface Event {
  id: string;
  title: string;
  organizer: string;
  organizer_logo?: string;
  description: string;
  date: string;
  time: string;
  location: string;
  is_virtual: boolean;
  attendees_count: number;
  max_attendees?: number;
  reward_amount?: number;
  image_url?: string;
  category: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Mock events for demo
const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Creator Meetup: Content Strategy 101',
    organizer: 'Promorang Community',
    description: 'Learn content strategies from top creators. Network and earn rewards!',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    time: '7:00 PM EST',
    location: 'Virtual Event',
    is_virtual: true,
    attendees_count: 156,
    max_attendees: 300,
    reward_amount: 25,
    category: 'Workshop'
  },
  {
    id: 'e2',
    title: 'Local Business Showcase',
    organizer: 'Downtown District',
    description: 'Discover local businesses and exclusive deals. Free entry!',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    time: '2:00 PM',
    location: 'Main Street Plaza',
    is_virtual: false,
    attendees_count: 89,
    max_attendees: 200,
    reward_amount: 50,
    category: 'Networking'
  },
  {
    id: 'e3',
    title: 'Brand Partnership Workshop',
    organizer: 'Creator Academy',
    description: 'How to land your first brand deal. Live Q&A included.',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    time: '6:00 PM EST',
    location: 'Virtual Event',
    is_virtual: true,
    attendees_count: 234,
    max_attendees: 500,
    reward_amount: 30,
    category: 'Education'
  },
  {
    id: 'e4',
    title: 'Summer Music Festival',
    organizer: 'City Events',
    description: 'Live music, food trucks, and exclusive brand activations.',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    time: '12:00 PM',
    location: 'Central Park',
    is_virtual: false,
    attendees_count: 1250,
    max_attendees: 5000,
    reward_amount: 100,
    category: 'Festival'
  }
];

function EventCard({ event, onRSVP, onViewEvent }: { event: Event; onRSVP: (id: string) => void; onViewEvent: (id: string) => void }) {
  const eventDate = new Date(event.date);
  const isToday = eventDate.toDateString() === new Date().toDateString();
  const isTomorrow = eventDate.toDateString() === new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();

  const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const spotsLeft = event.max_attendees
    ? event.max_attendees - event.attendees_count
    : null;

  const categoryColors: Record<string, string> = {
    Workshop: 'bg-blue-100 text-blue-700',
    Networking: 'bg-green-100 text-green-700',
    Education: 'bg-purple-100 text-purple-700',
    Festival: 'bg-pink-100 text-pink-700',
    default: 'bg-gray-100 text-gray-700'
  };

  return (
    <div
      className="bg-pr-surface-1 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-pr-surface-3/50 cursor-pointer hover:scale-[1.01]"
      onClick={() => onViewEvent(event.id)}
    >
      {/* Date Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">{dateLabel}</span>
          <span className="opacity-80">• {event.time}</span>
        </div>
        {event.is_virtual && (
          <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white">
            Virtual
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[event.category] || categoryColors.default}`}>
              {event.category}
            </span>
            <h3 className="font-semibold text-pr-text-1 mt-2 line-clamp-2">{event.title}</h3>
            <p className="text-sm text-pr-text-2 mt-1">{event.organizer}</p>
          </div>
        </div>

        <p className="text-sm text-pr-text-2 line-clamp-2 mb-3">
          {event.description}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-pr-text-2 mb-3">
          <MapPin className="w-4 h-4" />
          <span>{event.location}</span>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs text-pr-text-2">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {event.attendees_count} going
          </span>
          {spotsLeft !== null && spotsLeft < 100 && (
            <span className="text-amber-600 font-medium">
              {spotsLeft} spots left!
            </span>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-pr-surface-2/50 flex items-center justify-between">
        {event.reward_amount ? (
          <div className="flex items-center gap-1.5">
            <Ticket className="w-4 h-4 text-purple-500" />
            <span className="font-bold text-pr-text-1">+{event.reward_amount}</span>
            <span className="text-sm text-pr-text-2">Gems for attending</span>
          </div>
        ) : (
          <span className="text-sm text-pr-text-2">Free entry</span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click
            onRSVP(event.id);
          }}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1"
        >
          RSVP <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function EventsEntryPage() {
  const { user } = useAuth();
  const { recordAction, visibility, maturityState } = useMaturity();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [filter, setFilter] = useState<'all' | 'virtual' | 'in-person'>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch events from API using the same service as /events page
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // Use eventsService like the /events page does
        const { default: eventsService } = await import('@/react-app/services/events');
        const apiEvents = await eventsService.listEvents({ limit: 20 });

        if (apiEvents.length > 0) {
          const mappedEvents = apiEvents.map((evt: any) => ({
            id: evt.id,
            title: evt.title || evt.name,
            organizer: evt.organizer_name || 'Promorang',
            description: evt.description || '',
            date: evt.event_date || evt.start_date || evt.date,
            time: evt.start_time || (evt.event_date ? new Date(evt.event_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '7:00 PM'),
            location: evt.location_name || evt.location || (evt.is_virtual ? 'Virtual Event' : 'TBA'),
            is_virtual: evt.is_virtual || false,
            attendees_count: evt.total_rsvps || evt.attendees_count || 0,
            max_attendees: evt.max_attendees,
            reward_amount: evt.total_gems_pool || evt.total_rewards_pool || evt.reward_gems,
            category: evt.category || 'Event'
          }));
          // Show real events first, then add mock events as fallback if needed
          setEvents([...mappedEvents, ...MOCK_EVENTS.slice(0, Math.max(0, 4 - mappedEvents.length))]);
        } else {
          // No real events, show mock events
          setEvents(MOCK_EVENTS);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Network error, fall back to mock events
        setEvents(MOCK_EVENTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleRSVP = async (eventId: string) => {
    if (!user) {
      navigate('/auth', { state: { from: `/events`, action: 'rsvp', eventId } });
      return;
    }

    // Record the action
    await recordAction('event_rsvp', { event_id: eventId });

    // Mark as completed for What's Next
    markCompleted(STORAGE_KEYS.rsvpedEvent);

    // Navigate to event detail
    navigate(`/e/${eventId}`);
  };

  const filteredEvents = filter === 'all'
    ? events
    : filter === 'virtual'
      ? events.filter(e => e.is_virtual)
      : events.filter(e => !e.is_virtual);

  return (
    <EntryLayout>
      <div className="min-h-screen bg-pr-surface-2">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">Discover experiences near you</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Upcoming Events
            </h1>
            <p className="text-lg opacity-90 max-w-xl">
              Join events, meet creators, and earn rewards just for showing up.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 mt-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{events.length}</p>
                  <p className="text-sm opacity-80">Upcoming Events</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">500+</p>
                  <p className="text-sm opacity-80">Gems to Earn</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Row */}
        <div className="bg-pr-surface-1 border-b border-pr-surface-3">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-pr-text-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>{visibility.labels.verified}</span>
              </div>
              <div className="flex items-center gap-1.5 text-pr-text-2">
                <Tag className="w-4 h-4 text-amber-500" />
                <span>{visibility.labels.weeklyWins}</span>
              </div>
              {!user && (
                <Link to="/auth" className="ml-auto text-blue-500 hover:text-blue-600 font-medium">
                  Sign in to RSVP →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Rank Progress Banner - Only for State 0/1 */}
          {maturityState <= 1 && (
            <>
              <div className="mb-6 bg-purple-50 border border-purple-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-purple-900">Your current rank: {maturityState === 0 ? 'Rank 0 (New)' : 'Rank 1 (Explorer)'}</h2>
                    <p className="text-sm text-purple-700">Attend events and meet the community to increase your Access Rank and unlock exclusive perks.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold uppercase">Rank Up!</div>
                  <ArrowRight className="w-4 h-4 text-purple-600" />
                </div>
              </div>

              {/* Host Your Own Event - State 0/1 Simplified Experience */}
              <div className="mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-emerald-900">Want to Host Your Own Event?</h2>
                      <p className="text-sm text-emerald-700 mt-1">
                        Bring people together! Create a meetup, workshop, or community gathering.
                        Earn <span className="font-semibold">bonus Gems</span> when attendees RSVP.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                          ✓ Free to create
                        </span>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                          ✓ Virtual or in-person
                        </span>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                          ✓ Earn rewards
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/events/create-simple')}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
                  >
                    Create Event
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {(['all', 'virtual', 'in-person'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f
                  ? 'bg-pr-text-1 text-pr-surface-1'
                  : 'bg-pr-surface-1 text-pr-text-2 hover:bg-pr-surface-3'
                  }`}
              >
                {f === 'all' ? 'All Events' : f === 'virtual' ? 'Virtual' : 'In-Person'}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRSVP={handleRSVP}
                  onViewEvent={(id) => navigate(`/e/${id}`)}
                />
              ))}
            </div>
          )}

          {filteredEvents.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-pr-text-2">No events found for this filter.</p>
            </div>
          )}
        </div>
      </div>
    </EntryLayout>
  );
}

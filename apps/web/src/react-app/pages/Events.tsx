import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Calendar, MapPin, Users, Grid, List } from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';
import EventCard from '@/react-app/components/EventCard';
import eventsService from '@/react-app/services/events';
import type { EventType } from '../../shared/types';

type ViewMode = 'grid' | 'list';
type FilterTab = 'all' | 'upcoming' | 'featured' | 'my-events';

export default function Events() {
    const { user, isLoading: authLoading } = useAuth(); // Use isLoading from auth
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [events, setEvents] = useState<EventType[]>([]);
    const [myEvents, setMyEvents] = useState<EventType[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [activeTab, setActiveTab] = useState<FilterTab>(
        (searchParams.get('tab') as FilterTab) || 'upcoming'
    );
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // If trying to access protected tab without user, default to 'all'
        if (activeTab === 'my-events' && !user && !authLoading) {
            setActiveTab('all');
        }
        fetchEvents();
    }, [activeTab, user, authLoading]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            if (activeTab === 'my-events') {
                if (!user) {
                    setMyEvents([]);
                    setEvents([]);
                    return;
                }
                const [created, rsvps] = await Promise.all([
                    eventsService.getMyCreatedEvents(),
                    eventsService.getMyRsvps(),
                ]);
                // Combine and dedupe
                const combined = [...created, ...rsvps.filter(e => !created.find(c => c.id === e.id))];
                setMyEvents(combined);
                setEvents([]);
            } else {
                const params: Parameters<typeof eventsService.listEvents>[0] = {
                    limit: 20,
                };

                if (activeTab === 'upcoming') {
                    params.upcoming = true;
                } else if (activeTab === 'featured') {
                    params.featured = true;
                }

                const fetchedEvents = await eventsService.listEvents(params);
                setEvents(fetchedEvents);
                setMyEvents([]);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab: FilterTab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const filteredEvents = (activeTab === 'my-events' ? myEvents : events).filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const tabs = [
        { key: 'upcoming', label: 'Upcoming', icon: <Calendar className="w-4 h-4" /> },
        { key: 'featured', label: 'Featured', icon: <MapPin className="w-4 h-4" /> },
        { key: 'all', label: 'All Events', icon: <Grid className="w-4 h-4" /> },
        ...(user ? [{ key: 'my-events', label: 'My Events', icon: <Users className="w-4 h-4" /> }] : []),
    ];

    return (
        <div className="min-h-screen bg-pr-surface-2">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 py-16 px-4">
                <div className="max-w-6xl mx-auto text-center text-white">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Discover Events
                    </h1>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Find exciting events, connect with creators, and earn rewards by promoting events you love.
                    </p>

                    {/* Search */}
                    <div className="max-w-xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search events by name, location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    {/* Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => handleTabChange(tab.key as FilterTab)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${activeTab === tab.key
                                    ? 'bg-purple-500 text-white shadow-lg'
                                    : 'bg-pr-surface-card text-pr-text-2 hover:bg-pr-surface-3'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* View Toggle & Create */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-pr-surface-card rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-pr-text-2'}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-pr-text-2'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        {user ? (
                            <button
                                onClick={() => navigate('/events/create')}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Create Event
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/auth?redirect=/events/create')}
                                className="flex items-center gap-2 px-4 py-2 bg-pr-surface-card text-pr-text-1 border border-pr-border rounded-lg font-medium hover:bg-pr-surface-3 transition-all"
                            >
                                Sign In to Create
                            </button>
                        )}
                    </div>
                </div>

                {/* Events Grid/List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-pr-surface-3 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-12 h-12 text-purple-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-pr-text-1 mb-2">
                            {activeTab === 'my-events' ? 'No events yet' : 'No events found'}
                        </h3>
                        <p className="text-pr-text-2 mb-6">
                            {activeTab === 'my-events'
                                ? "You haven't created or RSVP'd to any events yet."
                                : searchQuery
                                    ? 'Try adjusting your search terms.'
                                    : 'Check back later for new events!'}
                        </p>
                        {user && (
                            <button
                                onClick={() => navigate('/events/create')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Create Your First Event
                            </button>
                        )}
                    </div>
                ) : (
                    <div
                        className={
                            viewMode === 'grid'
                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                                : 'space-y-4'
                        }
                    >
                        {filteredEvents.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                compact={viewMode === 'list'}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

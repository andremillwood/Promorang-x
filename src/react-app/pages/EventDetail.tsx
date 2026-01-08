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
    Globe
} from 'lucide-react';

interface EventDetails {
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
}

export default function EventDetail() {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<EventDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            setLoading(true);
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const token = localStorage.getItem('access_token');

            const response = await fetch(`${API_BASE}/api/events/${id}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Handle nested response structure: data.data.event or data.event or data
                const eventData = data.data?.event || data.event || data;
                setEvent(eventData);
            } else {
                setError('Event not found');
            }
        } catch (err) {
            console.error('Error fetching event:', err);
            setError('Failed to load event');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString?: string) => {
        if (!timeString) return null;
        return timeString;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading event...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <Link to="/home" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Home
                </Link>
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                    <h2 className="text-xl font-semibold text-red-900 mb-2">Event Not Found</h2>
                    <p className="text-red-700">{error || 'This event may have been removed or doesn\'t exist.'}</p>
                </div>
            </div>
        );
    }

    const isUpcoming = new Date(event.event_date) > new Date();
    const spotsRemaining = event.max_attendees ? event.max_attendees - (event.current_attendees || 0) : null;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Back Button */}
            <Link to="/home" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
            </Link>

            {/* Event Header */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                {/* Event Image */}
                {event.image_url && (
                    <div className="h-64 bg-gradient-to-br from-purple-500 to-pink-500 relative">
                        <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                )}

                {/* Event Info */}
                <div className="p-6">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${isUpcoming
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                            }`}>
                            {isUpcoming ? 'Upcoming' : 'Past Event'}
                        </span>
                        {event.is_free && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                Free Event
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

                    {/* Key Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center text-gray-600">
                            <Calendar className="w-5 h-5 mr-3 text-purple-500" />
                            <div>
                                <p className="font-medium">{formatDate(event.event_date)}</p>
                                {event.event_time && (
                                    <p className="text-sm text-gray-500">{formatTime(event.event_time)}</p>
                                )}
                            </div>
                        </div>

                        {event.location && (
                            <div className="flex items-center text-gray-600">
                                <MapPin className="w-5 h-5 mr-3 text-purple-500" />
                                <div>
                                    {event.venue_name && <p className="font-medium">{event.venue_name}</p>}
                                    <p className="text-sm text-gray-500">{event.location}</p>
                                </div>
                            </div>
                        )}

                        {event.max_attendees && (
                            <div className="flex items-center text-gray-600">
                                <Users className="w-5 h-5 mr-3 text-purple-500" />
                                <div>
                                    <p className="font-medium">{event.current_attendees || 0} / {event.max_attendees} attending</p>
                                    {spotsRemaining !== null && spotsRemaining > 0 && (
                                        <p className="text-sm text-green-600">{spotsRemaining} spots left</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {event.organizer_name && (
                            <div className="flex items-center text-gray-600">
                                <Globe className="w-5 h-5 mr-3 text-purple-500" />
                                <p className="font-medium">Hosted by {event.organizer_name}</p>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">About This Event</h2>
                        <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
                    </div>

                    {/* Tags */}
                    {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {event.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                        {isUpcoming && (
                            <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                <Ticket className="w-5 h-5" />
                                {event.is_free ? 'RSVP Free' : `Get Tickets - $${event.ticket_price}`}
                            </button>
                        )}

                        <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                            <Heart className="w-5 h-5" />
                        </button>

                        <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>

                        {event.external_url && (
                            <a
                                href={event.external_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                            >
                                <ExternalLink className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

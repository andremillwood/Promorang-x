import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, MapPin, QrCode, ChevronRight, Loader2, TicketX } from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';

interface EventTicket {
    id: string;
    activation_code: string;
    status: 'valid' | 'used' | 'expired';
    activated_at: string | null;
    created_at: string;
    tier: {
        id: string;
        name: string;
        price_gems: number;
        price_gold: number;
        perks_json: any;
        event: {
            id: string;
            title: string;
            event_date: string;
            event_end_date?: string;
            location_name?: string;
            location_address?: string;
            banner_url?: string;
            flyer_url?: string;
            is_virtual?: boolean;
        };
    };
}

export default function MyTickets() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<EventTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'valid' | 'used'>('all');

    useEffect(() => {
        if (user) {
            fetchTickets();
        }
    }, [user]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/users/me/tickets', {
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();
            if (result.status === 'success') {
                setTickets(result.data.tickets || []);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'valid':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'used':
                return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'expired':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        if (activeFilter === 'all') return true;
        return ticket.status === activeFilter;
    });

    const upcomingTickets = filteredTickets.filter(t => 
        t.status === 'valid' && new Date(t.tier.event.event_date) > new Date()
    );
    const pastTickets = filteredTickets.filter(t => 
        t.status !== 'valid' || new Date(t.tier.event.event_date) <= new Date()
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-purple-100 rounded-xl">
                        <Ticket className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-pr-text-1">My Tickets</h1>
                        <p className="text-pr-text-2">Your event access passes and activation codes</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {(['all', 'valid', 'used'] as const).map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                            activeFilter === filter
                                ? 'bg-purple-500 text-white'
                                : 'bg-pr-surface-2 text-pr-text-2 hover:bg-pr-surface-3'
                        }`}
                    >
                        {filter}
                        {filter === 'valid' && ` (${tickets.filter(t => t.status === 'valid').length})`}
                    </button>
                ))}
            </div>

            {tickets.length === 0 ? (
                <div className="text-center py-20 bg-pr-surface-card border border-pr-border rounded-2xl">
                    <TicketX className="w-16 h-16 text-pr-text-3 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-pr-text-1 mb-2">No Tickets Yet</h2>
                    <p className="text-pr-text-2 mb-6">Purchase tickets to events to see them here.</p>
                    <Link
                        to="/events"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-colors"
                    >
                        Browse Events
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Upcoming Events */}
                    {upcomingTickets.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-pr-text-1 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                Upcoming Events
                            </h2>
                            <div className="space-y-4">
                                {upcomingTickets.map((ticket) => (
                                    <Link
                                        key={ticket.id}
                                        to={`/tickets/${ticket.id}`}
                                        className="block bg-pr-surface-card border border-pr-border rounded-2xl overflow-hidden hover:border-purple-300 hover:shadow-lg transition-all group"
                                    >
                                        <div className="flex">
                                            {/* Event Image */}
                                            <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
                                                {(ticket.tier.event.banner_url || ticket.tier.event.flyer_url) && (
                                                    <img
                                                        src={ticket.tier.event.banner_url || ticket.tier.event.flyer_url}
                                                        alt={ticket.tier.event.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>

                                            {/* Ticket Info */}
                                            <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <h3 className="text-lg font-bold text-pr-text-1 group-hover:text-purple-600 transition-colors">
                                                            {ticket.tier.event.title}
                                                        </h3>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusBadge(ticket.status)}`}>
                                                            {ticket.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-purple-600 mb-3">{ticket.tier.name}</p>
                                                    <div className="flex flex-wrap gap-4 text-sm text-pr-text-2">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{formatDate(ticket.tier.event.event_date)}</span>
                                                        </div>
                                                        {ticket.tier.event.location_name && (
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4" />
                                                                <span>{ticket.tier.event.location_name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-pr-border">
                                                    <div className="flex items-center gap-2 text-sm text-pr-text-3">
                                                        <QrCode className="w-4 h-4" />
                                                        <span className="font-mono">{ticket.activation_code}</span>
                                                    </div>
                                                    <span className="text-purple-500 text-sm font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                                        View Ticket <ChevronRight className="w-4 h-4" />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Past Events */}
                    {pastTickets.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-pr-text-2 mb-4">Past Events</h2>
                            <div className="space-y-3">
                                {pastTickets.map((ticket) => (
                                    <Link
                                        key={ticket.id}
                                        to={`/tickets/${ticket.id}`}
                                        className="block bg-pr-surface-2 border border-pr-border rounded-xl p-4 hover:bg-pr-surface-3 transition-colors opacity-70 hover:opacity-100"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-pr-text-1">{ticket.tier.event.title}</h3>
                                                <p className="text-sm text-pr-text-3">{ticket.tier.name} • {formatDate(ticket.tier.event.event_date)}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusBadge(ticket.status)}`}>
                                                {ticket.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

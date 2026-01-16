import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Ticket,
    ShieldCheck,
    CheckCircle2,
    Clock,
    Info,
    Share2,
    Download,
    Loader2
} from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';

interface TicketData {
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
            organizer_name?: string;
        };
    };
}

export default function TicketDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ticket, setTicket] = useState<TicketData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchTicket();
        }
    }, [id]);

    const fetchTicket = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/tickets/${id}`, {
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();
            if (result.status === 'success') {
                setTicket(result.data.ticket);
            }
        } catch (error) {
            console.error('Error fetching ticket:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
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

    const handleShare = async () => {
        if (!ticket) return;
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({
                title: `Ticket for ${ticket.tier.event.title}`,
                text: `My ticket for ${ticket.tier.event.title}`,
                url,
            });
        } else {
            await navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        }
    };

    const qrValue = ticket ? JSON.stringify({
        type: 'event_ticket',
        code: ticket.activation_code,
        ticket_id: ticket.id,
        event_id: ticket.tier.event.id
    }) : '';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-2xl font-bold text-pr-text-1 mb-4">Ticket not found</h1>
                <button
                    onClick={() => navigate('/tickets')}
                    className="text-purple-500 hover:underline"
                >
                    Back to My Tickets
                </button>
            </div>
        );
    }

    const isUsed = ticket.status === 'used';
    const isExpired = ticket.status === 'expired';
    const eventDate = new Date(ticket.tier.event.event_date);
    const isPast = eventDate < new Date();

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-20">
            {/* Header */}
            <div className="bg-white border-b border-pr-border sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/tickets')}
                        className="flex items-center gap-2 text-pr-text-2 hover:text-pr-text-1 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">My Tickets</span>
                    </button>
                    <button
                        onClick={handleShare}
                        className="p-2 hover:bg-pr-surface-2 rounded-lg transition-colors"
                    >
                        <Share2 className="w-5 h-5 text-pr-text-2" />
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Ticket Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-purple-100">
                    {/* Event Banner */}
                    <div className="relative h-40 bg-gradient-to-br from-purple-600 to-pink-500">
                        {(ticket.tier.event.banner_url || ticket.tier.event.flyer_url) && (
                            <img
                                src={ticket.tier.event.banner_url || ticket.tier.event.flyer_url}
                                alt={ticket.tier.event.title}
                                className="w-full h-full object-cover"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        
                        {/* Status Badge */}
                        <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold ${
                            isUsed ? 'bg-gray-500 text-white' :
                            isExpired ? 'bg-red-500 text-white' :
                            'bg-green-500 text-white'
                        }`}>
                            {isUsed ? '✓ USED' : isExpired ? 'EXPIRED' : '✓ VALID'}
                        </div>

                        {/* Event Title */}
                        <div className="absolute bottom-4 left-4 right-4">
                            <h1 className="text-2xl font-bold text-white mb-1">{ticket.tier.event.title}</h1>
                            <p className="text-white/80 text-sm">by {ticket.tier.event.organizer_name || 'Event Organizer'}</p>
                        </div>
                    </div>

                    {/* Ticket Details */}
                    <div className="p-6">
                        {/* Tier Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-bold mb-6">
                            <Ticket className="w-4 h-4" />
                            {ticket.tier.name}
                        </div>

                        {/* Event Info */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <Calendar className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-pr-text-3 font-semibold uppercase">When</p>
                                    <p className="text-sm font-semibold text-pr-text-1">{formatDate(ticket.tier.event.event_date)}</p>
                                    <p className="text-xs text-pr-text-2">{formatTime(ticket.tier.event.event_date)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-pink-50 rounded-lg">
                                    <MapPin className="w-5 h-5 text-pink-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-pr-text-3 font-semibold uppercase">Where</p>
                                    <p className="text-sm font-semibold text-pr-text-1">
                                        {ticket.tier.event.location_name || 'Virtual Event'}
                                    </p>
                                    {ticket.tier.event.location_address && (
                                        <p className="text-xs text-pr-text-2">{ticket.tier.event.location_address}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Divider with scissors */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-dashed border-gray-200" />
                            </div>
                            <div className="relative flex justify-between">
                                <div className="w-6 h-6 bg-purple-50 rounded-full -ml-3" />
                                <div className="w-6 h-6 bg-purple-50 rounded-full -mr-3" />
                            </div>
                        </div>

                        {/* QR Code Section */}
                        <div className="text-center">
                            <h2 className="text-lg font-bold text-pr-text-1 mb-2">Your Entry Pass</h2>
                            <p className="text-sm text-pr-text-2 mb-6">Show this QR code at the venue entrance</p>

                            <div className={`inline-block p-6 bg-white rounded-2xl border-4 ${
                                isUsed || isExpired ? 'border-gray-300 opacity-50' : 'border-purple-500'
                            } shadow-inner mb-6`}>
                                <QRCodeSVG
                                    value={qrValue}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                    imageSettings={{
                                        src: "/favicon.png",
                                        x: undefined,
                                        y: undefined,
                                        height: 40,
                                        width: 40,
                                        excavate: true,
                                    }}
                                />
                                {(isUsed || isExpired) && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-4xl font-black text-gray-400 rotate-[-15deg]">
                                            {isUsed ? 'USED' : 'EXPIRED'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Activation Code */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <p className="text-xs text-pr-text-3 font-semibold uppercase mb-2">Activation Code</p>
                                <p className="text-3xl font-mono font-bold text-pr-text-1 tracking-widest">
                                    {ticket.activation_code}
                                </p>
                            </div>

                            {/* Info Messages */}
                            <div className="space-y-3 text-left">
                                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
                                    <ShieldCheck className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-purple-700">
                                        This ticket is personal and linked to your account. Do not share your activation code.
                                    </p>
                                </div>

                                {ticket.tier.event.is_virtual && (
                                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-blue-700">
                                            For virtual events, check-in may be automatic upon joining the stream.
                                        </p>
                                    </div>
                                )}

                                {isUsed && ticket.activated_at && (
                                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-green-700">
                                            Checked in on {formatDate(ticket.activated_at)} at {formatTime(ticket.activated_at)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-pr-text-3">
                            <span>Ticket ID: {ticket.id.slice(0, 8)}...</span>
                            <span>Purchased {formatDate(ticket.created_at)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-4">
                    <Link
                        to={`/events/${ticket.tier.event.id}`}
                        className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-bold text-center hover:bg-purple-600 transition-colors"
                    >
                        View Event Details
                    </Link>
                </div>
            </div>
        </div>
    );
}

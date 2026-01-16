import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Calendar,
    MapPin,
    Users,
    Ticket,
    Globe,
    Share2,
    ArrowLeft,
    CheckCircle2,
    Megaphone,
    Loader2,
    Info,
    LayoutDashboard,
    Image as ImageIcon,
    Target,
    Edit
} from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';
import eventsService from '@/react-app/services/events';
import type { EventDetailResponse } from '@/react-app/services/events';
import { Button } from '@/components/ui/button';

// New Components
import CheckInQR from '../components/events/CheckInQR';
import TaskSubmissionModal from '../components/events/TaskSubmissionModal';
import EventGallery from '../components/events/EventGallery';
import OrganizerDashboard from '../components/events/OrganizerDashboard';

export default function EventDetail() {
    const { eventCode: id } = useParams<{ eventCode: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Determine where to go back to
    const getBackPath = () => {
        // Check if we came from events-entry
        if (location.state?.from?.includes('events-entry') || document.referrer.includes('events-entry')) {
            return '/events-entry';
        }
        return '/events';
    };

    const [data, setData] = useState<EventDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasRsvp, setHasRsvp] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // UI State
    const [activeTab, setActiveTab] = useState<'about' | 'tasks' | 'gallery' | 'dashboard'>('about');
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [tiers, setTiers] = useState<any[]>([]);

    useEffect(() => {
        if (id) {
            fetchEvent();
            fetchTiers();
        }
    }, [id]);

    const fetchTiers = async () => {
        try {
            const response = await fetch(`/api/events/${id}/ticket-tiers`);
            const result = await response.json();
            if (result.status === 'success') {
                setTiers(result.data.tiers);
            }
        } catch (error) {
            console.error('Error fetching tiers:', error);
        }
    };

    const handlePurchase = async (tierId: string) => {
        if (!user) {
            navigate(`/auth?redirect=/events/${id}`);
            return;
        }

        try {
            setActionLoading(true);
            const response = await fetch(`/api/events/${id}/tickets/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier_id: tierId }),
            });
            const result = await response.json();
            if (result.status === 'success') {
                alert('Ticket purchased successfully!');
                fetchTiers(); // Refresh tiers to show updated quantity
            } else {
                alert(result.error || 'Failed to purchase ticket');
            }
        } catch (error) {
            console.error('Error purchasing ticket:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const fetchEvent = async () => {
        try {
            setLoading(true);
            const eventData = await eventsService.getEvent(id!);
            setData(eventData);
            setHasRsvp(eventData.hasRsvp);
        } catch (error) {
            console.error('Error fetching event:', error);
            setData(null); // Ensure we show "Event not found"
        } finally {
            setLoading(false);
        }
    };

    const handleRsvp = async () => {
        if (!user) {
            navigate(`/auth?redirect=/events/${id}`);
            return;
        }

        try {
            setActionLoading(true);
            if (hasRsvp) {
                await eventsService.cancelRsvp(id!);
                setHasRsvp(false);
            } else {
                await eventsService.rsvpEvent(id!);
                setHasRsvp(true);
            }
            fetchEvent(); // Refresh to get updated count
        } catch (error) {
            console.error('Error updating RSVP:', error);
            alert(error instanceof Error ? error.message : 'Failed to update RSVP');
        } finally {
            setActionLoading(false);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({
                title: data?.event.title,
                text: data?.event.description || 'Check out this event!',
                url,
            });
        } else {
            await navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-pr-surface-background">
                <div className="text-6xl mb-4">📅</div>
                <h1 className="text-2xl font-bold text-pr-text-1 mb-2">Event not found</h1>
                <p className="text-pr-text-2 mb-6">This event may have ended or doesn't exist.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
                >
                    ← Go Back
                </button>
            </div>
        );
    }

    const { event, tasks, sponsors } = data;
    const isCreator = user?.id === event.creator_id;
    const isHappeningNow = eventsService.isHappeningNow(event.event_date, event.event_end_date);

    // Dynamic Tab Logic
    const tabs = [
        { id: 'about', label: 'About', icon: Info },
        { id: 'tasks', label: 'Tasks', icon: Target, count: tasks.length },
        { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    ];

    if (isCreator) {
        tabs.push({ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard });
    }

    return (
        <div className="min-h-screen bg-pr-surface-2">
            {/* Cover Image */}
            <div className="relative h-64 md:h-96 bg-gradient-to-br from-purple-600 to-pink-500">
                {(event.banner_url || event.flyer_url) && (
                    <img
                        src={event.banner_url || event.flyer_url || ''}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Back Button */}
                <button
                    onClick={() => navigate('/events')}
                    className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Status Badge */}
                {isHappeningNow && (
                    <div className="absolute top-4 right-4 px-4 py-2 bg-green-500 text-white rounded-full font-bold animate-pulse z-20">
                        🔴 HAPPENING NOW
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10 pb-20">
                {/* Main Header Card */}
                <div className="bg-pr-surface-card border border-pr-border rounded-2xl shadow-xl overflow-hidden mb-6">
                    <div className="p-6 md:p-8">
                        {/* Highlights */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            {event.category && (
                                <span className="px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {eventsService.getCategoryLabel(event.category).split(' ')[1]}
                                </span>
                            )}
                            {event.is_virtual && (
                                <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Virtual
                                </span>
                            )}
                            {event.is_featured && (
                                <span className="px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Featured
                                </span>
                            )}
                        </div>

                        {/* Title & Stats */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-extrabold text-pr-text-1 mb-2 tracking-tight">
                                    {event.title}
                                </h1>
                                <div className="flex items-center gap-3">
                                    {event.organizer_avatar ? (
                                        <img src={event.organizer_avatar} className="w-6 h-6 rounded-full" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center">
                                            {event.organizer_name?.[0]}
                                        </div>
                                    )}
                                    <span className="text-sm text-pr-text-2">by <span className="text-pr-text-1 font-semibold">{event.organizer_name}</span></span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="text-center px-4 py-2 bg-pr-surface-2 rounded-xl border border-pr-border">
                                    <p className="text-xl font-bold text-pr-text-1">{event.total_rsvps || 0}</p>
                                    <p className="text-[10px] text-pr-text-3 font-bold uppercase">RSVPs</p>
                                </div>
                                {(event.total_rewards_pool > 0 || event.total_gems_pool > 0) && (
                                    <div className="text-center px-4 py-2 bg-green-500/10 rounded-xl border border-green-500/20">
                                        <p className="text-xl font-bold text-green-600">
                                            {event.total_rewards_pool > 0 ? event.total_rewards_pool : event.total_gems_pool}
                                        </p>
                                        <p className="text-[10px] text-green-600 font-bold uppercase">Reward</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="flex flex-wrap gap-3 pt-6 border-t border-pr-border">
                            {isCreator ? (
                                <>
                                    <button
                                        onClick={() => navigate(`/events/${id}/edit`)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-sm"
                                    >
                                        <Edit className="w-5 h-5" />
                                        Edit Event
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('dashboard')}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-pr-text-1 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-sm"
                                    >
                                        <LayoutDashboard className="w-5 h-5" />
                                        Organizer Dashboard
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleRsvp}
                                        disabled={actionLoading}
                                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-md ${hasRsvp
                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                                            }`}
                                    >
                                        {actionLoading ? (
                                            <Loader2 className="animate-spin h-5 w-5" />
                                        ) : hasRsvp ? (
                                            <>
                                                <CheckCircle2 className="w-5 h-5" />
                                                Entry Secured
                                            </>
                                        ) : (
                                            <>
                                                <Users className="w-5 h-5" />
                                                Join Now
                                            </>
                                        )}
                                    </button>
                                    {event.is_virtual && event.virtual_url && (
                                        <a
                                            href={event.virtual_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors shadow-sm"
                                        >
                                            <Globe className="w-5 h-5" />
                                            Join Room
                                        </a>
                                    )}
                                </>
                            )}

                            {event.ticketing_url && (
                                <a
                                    href={event.ticketing_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
                                >
                                    <Ticket className="w-5 h-5" />
                                    {event.ticket_price_range || 'Buy Tickets'}
                                </a>
                            )}

                            <button
                                onClick={handleShare}
                                className="p-3 bg-pr-surface-2 text-pr-text-1 rounded-xl hover:bg-pr-surface-3 transition-colors border border-pr-border"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex border-t border-pr-border px-4 bg-pr-surface-card overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold min-w-fit transition-colors border-b-2 ${activeTab === tab.id
                                    ? 'text-purple-500 border-purple-500'
                                    : 'text-pr-text-3 border-transparent hover:text-pr-text-1'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-purple-500 text-white' : 'bg-pr-surface-3 text-pr-text-2'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Main Tab Content) */}
                    <div className="lg:col-span-2 space-y-6">
                        {activeTab === 'about' && (
                            <div className="bg-pr-surface-card border border-pr-border rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="p-6 md:p-8">
                                    <h2 className="text-2xl font-bold text-pr-text-1 mb-6">Experience Details</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                        <div className="space-y-4">
                                            <div className="flex gap-4">
                                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                                    <Calendar className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-pr-text-3 font-bold uppercase">When</p>
                                                    <p className="text-pr-text-1 font-semibold">{eventsService.formatEventDate(event.event_date, event.event_end_date)}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="p-2 bg-pink-500/10 rounded-lg text-pink-500">
                                                    <MapPin className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-pr-text-3 font-bold uppercase">Where</p>
                                                    <p className="text-pr-text-1 font-semibold">{event.location_name || 'Virtual Event'}</p>
                                                    {event.location_address && <p className="text-sm text-pr-text-2">{event.location_address}</p>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex gap-4">
                                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                                    <Users className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-pr-text-3 font-bold uppercase">Who's Coming</p>
                                                    <p className="text-pr-text-1 font-semibold">{event.total_rsvps || 0} attending</p>
                                                    <p className="text-sm text-pr-text-2">Join the crowd!</p>
                                                </div>
                                            </div>
                                            {event.ticketing_url && (
                                                <div className="flex gap-4">
                                                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                                                        <Ticket className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-pr-text-3 font-bold uppercase">Entry</p>
                                                        <p className="text-pr-text-1 font-semibold">{event.ticket_price_range || 'Ticketed Event'}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="prose max-w-none text-pr-text-2">
                                        <p className="whitespace-pre-wrap leading-relaxed">{event.description}</p>
                                    </div>

                                    {event.tags && event.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-10">
                                            {event.tags.map(tag => (
                                                <span key={tag} className="px-3 py-1 bg-pr-surface-2 text-pr-text-3 rounded-lg text-xs font-bold border border-pr-border">#{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'tasks' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white shadow-lg">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Target className="w-8 h-8" />
                                        <h2 className="text-2xl font-extrabold tracking-tight">Earning Opportunities</h2>
                                    </div>
                                    <p className="text-white/80 font-medium">Complete these specific missions to unlock special rewards and reputation points.</p>
                                </div>

                                {tasks.length === 0 ? (
                                    <div className="p-12 text-center bg-pr-surface-card border border-dashed border-pr-border rounded-2xl">
                                        <p className="text-pr-text-3 font-bold">No active tasks for this event.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {tasks.map(task => (
                                            <div key={task.id} className="group p-6 bg-pr-surface-card border border-pr-border rounded-2xl hover:border-purple-500 transition-all hover:shadow-md">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-pr-text-1">{task.title}</h3>
                                                        <p className="text-sm text-pr-text-2 mt-1">{task.description}</p>
                                                    </div>
                                                    <div className="px-3 py-1 bg-green-500/10 text-green-600 rounded-lg text-xs font-bold">
                                                        {task.points_reward} PTS
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (!hasRsvp) {
                                                            alert('You must RSVP to complete tasks!');
                                                            return;
                                                        }
                                                        setSelectedTask(task);
                                                        setShowTaskModal(true);
                                                    }}
                                                    className="w-full py-3 bg-pr-surface-2 group-hover:bg-purple-500 group-hover:text-white text-pr-text-1 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Megaphone className="w-4 h-4" />
                                                    Submit Proof
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'gallery' && (
                            <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <EventGallery eventId={id!} hasRsvp={hasRsvp} />
                            </div>
                        )}

                        {activeTab === 'dashboard' && isCreator && (
                            <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <OrganizerDashboard eventId={id!} event={event} />
                            </div>
                        )}
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="space-y-6">
                        {/* Tickets Section */}
                        {tiers.length > 0 && (
                            <div className="bg-pr-surface-card border-2 border-purple-500 rounded-2xl p-6 shadow-lg overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <Ticket size={80} />
                                </div>
                                <h3 className="text-xl font-black text-pr-text-1 mb-4 flex items-center gap-2">
                                    <Ticket className="text-purple-500" />
                                    Get Your Access
                                </h3>
                                <div className="space-y-4">
                                    {tiers.map(tier => (
                                        <div key={tier.id} className="p-4 bg-pr-surface-2 rounded-xl border border-pr-border hover:border-purple-300 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-pr-text-1">{tier.name}</h4>
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-purple-600">{tier.price_gems} Gems</p>
                                                    {tier.price_gold > 0 && <p className="text-[10px] font-bold text-orange-500">{tier.price_gold} Gold</p>}
                                                </div>
                                            </div>
                                            <p className="text-xs text-pr-text-2 mb-3 leading-tight opacity-80">
                                                {tier.perks_json?.description || 'Exclusive access and multipliers.'}
                                            </p>
                                            <Button
                                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg h-10"
                                                disabled={actionLoading || tier.sold_quantity >= tier.max_quantity}
                                                onClick={() => handlePurchase(tier.id)}
                                            >
                                                {tier.sold_quantity >= tier.max_quantity ? 'Sold Out' : 'Purchase Access'}
                                            </Button>
                                            <div className="mt-2 text-[10px] text-center font-bold text-pr-text-3 uppercase">
                                                {tier.max_quantity - tier.sold_quantity} Left
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Entry Pass Card (Attendee Only) */}
                        {hasRsvp && !isCreator && (
                            <CheckInQR
                                checkInCode={event.id.replace(/-/g, '').slice(0, 12)}
                                eventName={event.title}
                                isVirtual={event.is_virtual}
                            />
                        )}

                        {/* Event Stats Quick View */}
                        <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-pr-text-1 mb-4">Event Pulse</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-pr-text-2">
                                        <Users className="w-4 h-4" />
                                        <span className="text-sm font-medium">Attendence</span>
                                    </div>
                                    <span className="text-sm font-bold text-pr-text-1">{event.total_check_ins || 0} checked in</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-pr-text-2">
                                        <ImageIcon className="w-4 h-4" />
                                        <span className="text-sm font-medium">UGC Shares</span>
                                    </div>
                                    <span className="text-sm font-bold text-pr-text-1">{event.total_ugc_submissions || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-pr-text-2">
                                        <Target className="w-4 h-4" />
                                        <span className="text-sm font-medium">Tasks Closed</span>
                                    </div>
                                    <span className="text-sm font-bold text-pr-text-1">{event.total_tasks_completed || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Sponsors Bar */}
                        {sponsors.length > 0 && (
                            <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-pr-text-1 mb-4">Our Partners</h3>
                                <div className="space-y-3">
                                    {sponsors.map(sponsor => (
                                        <div key={sponsor.id} className="flex items-center gap-3 p-3 bg-pr-surface-2 rounded-xl transition-all hover:translate-x-1">
                                            {sponsor.sponsor_logo ? (
                                                <img src={sponsor.sponsor_logo} className="w-8 h-8 rounded-lg" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-lg bg-black text-white text-[10px] font-bold flex items-center justify-center">
                                                    {sponsor.sponsor_name?.[0]}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-bold text-pr-text-1">{sponsor.sponsor_name}</p>
                                                <p className="text-[10px] text-pr-text-3 font-bold uppercase">{sponsor.tier} Partner</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {selectedTask && (
                <TaskSubmissionModal
                    isOpen={showTaskModal}
                    onClose={() => setShowTaskModal(false)}
                    task={selectedTask}
                    eventId={id!}
                    onSuccess={() => {
                        fetchEvent();
                        setSelectedTask(null);
                    }}
                />
            )}
        </div>
    );
}

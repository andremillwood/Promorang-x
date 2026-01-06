import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar,
    MapPin,
    Users,
    Ticket,
    Globe,
    Share2,
    ArrowLeft,
    Edit,
    Trash2,
    CheckCircle,
    ExternalLink,
    Gift,
    Star,
    Target,
} from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';
import eventsService from '@/react-app/services/events';
import type { EventDetailResponse } from '@/react-app/services/events';

export default function EventDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [data, setData] = useState<EventDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasRsvp, setHasRsvp] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchEvent();
        }
    }, [id]);

    const fetchEvent = async () => {
        try {
            setLoading(true);
            const eventData = await eventsService.getEvent(id!);
            setData(eventData);
            setHasRsvp(eventData.hasRsvp);
        } catch (error) {
            console.error('Error fetching event:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRsvp = async () => {
        if (!user) {
            navigate('/auth?redirect=/events/' + id);
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

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            await eventsService.deleteEvent(id!);
            navigate('/events');
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event');
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
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold text-pr-text-1 mb-4">Event not found</h1>
                <button
                    onClick={() => navigate('/events')}
                    className="text-purple-500 hover:underline"
                >
                    Back to Events
                </button>
            </div>
        );
    }

    const { event, tasks, sponsors } = data;
    const isCreator = user?.id === event.creator_id;
    const isUpcoming = eventsService.isUpcoming(event.event_date);
    const isHappeningNow = eventsService.isHappeningNow(event.event_date, event.event_end_date);

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
                    <div className="absolute top-4 right-4 px-4 py-2 bg-green-500 text-white rounded-full font-bold animate-pulse">
                        🔴 HAPPENING NOW
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
                {/* Main Card */}
                <div className="bg-pr-surface-card border border-pr-border rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-6 md:p-8">
                        {/* Category & Rating */}
                        <div className="flex items-center gap-3 mb-4">
                            {event.category && (
                                <span className="px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-sm font-medium">
                                    {eventsService.getCategoryLabel(event.category)}
                                </span>
                            )}
                            {event.is_virtual && (
                                <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
                                    <Globe className="w-3 h-3 inline mr-1" />
                                    Virtual
                                </span>
                            )}
                            {event.average_rating > 0 && (
                                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-sm font-medium">
                                    <Star className="w-3 h-3 fill-current" />
                                    {event.average_rating.toFixed(1)} ({event.total_reviews} reviews)
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-4">
                            {event.title}
                        </h1>

                        {/* Organizer Info */}
                        <div className="flex items-center gap-3 mb-6">
                            {event.organizer_avatar ? (
                                <img
                                    src={event.organizer_avatar}
                                    alt={event.organizer_name}
                                    className="w-10 h-10 rounded-full"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                    {event.organizer_name?.[0] || '?'}
                                </div>
                            )}
                            <div>
                                <p className="font-medium text-pr-text-1">
                                    Hosted by {event.organizer_name || 'Unknown'}
                                </p>
                                <p className="text-sm text-pr-text-2">Event Organizer</p>
                            </div>
                        </div>

                        {/* Key Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-start gap-3 p-4 bg-pr-surface-2 rounded-xl">
                                <Calendar className="w-6 h-6 text-purple-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-pr-text-1">Date & Time</p>
                                    <p className="text-sm text-pr-text-2">
                                        {eventsService.formatEventDate(event.event_date, event.event_end_date)}
                                    </p>
                                </div>
                            </div>

                            {event.location_name && (
                                <div className="flex items-start gap-3 p-4 bg-pr-surface-2 rounded-xl">
                                    <MapPin className="w-6 h-6 text-pink-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-pr-text-1">Location</p>
                                        <p className="text-sm text-pr-text-2">
                                            {event.location_name}
                                            {event.location_address && `, ${event.location_address}`}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3 p-4 bg-pr-surface-2 rounded-xl">
                                <Users className="w-6 h-6 text-blue-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-pr-text-1">Attendance</p>
                                    <p className="text-sm text-pr-text-2">
                                        {event.total_rsvps || 0} RSVP'd
                                        {event.max_attendees && ` / ${event.max_attendees} max`}
                                    </p>
                                    {event.max_attendees && (
                                        <div className="w-full bg-pr-surface-3 rounded-full h-2 mt-2">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min(((event.total_rsvps || 0) / event.max_attendees) * 100, 100)}%`,
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {event.is_virtual && event.virtual_url && (
                                <div className="flex items-start gap-3 p-4 bg-pr-surface-2 rounded-xl">
                                    <Globe className="w-6 h-6 text-green-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-pr-text-1">Online Event</p>
                                        <a
                                            href={event.virtual_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-purple-500 hover:underline flex items-center gap-1"
                                        >
                                            Join virtual event <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Rewards Pool */}
                            {(event.total_rewards_pool > 0 || event.total_gems_pool > 0) && (
                                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                                    <Gift className="w-6 h-6 text-green-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-pr-text-1">Rewards Pool</p>
                                        <p className="text-sm text-green-600">
                                            {event.total_rewards_pool > 0 && `${event.total_rewards_pool} Points`}
                                            {event.total_rewards_pool > 0 && event.total_gems_pool > 0 && ' + '}
                                            {event.total_gems_pool > 0 && `${event.total_gems_pool} Gems`}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 mb-8">
                            {isUpcoming && !isCreator && (
                                <button
                                    onClick={handleRsvp}
                                    disabled={actionLoading}
                                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${hasRsvp
                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                                        }`}
                                >
                                    {actionLoading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                    ) : hasRsvp ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            RSVP'd
                                        </>
                                    ) : (
                                        <>
                                            <Users className="w-5 h-5" />
                                            RSVP
                                        </>
                                    )}
                                </button>
                            )}

                            {event.ticketing_url && (
                                <a
                                    href={event.ticketing_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                                >
                                    <Ticket className="w-5 h-5" />
                                    {event.ticket_price_range || 'Get Tickets'}
                                </a>
                            )}

                            <button
                                onClick={handleShare}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-pr-surface-2 text-pr-text-1 rounded-xl font-medium hover:bg-pr-surface-3 transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                                Share
                            </button>

                            {isCreator && (
                                <>
                                    <button
                                        onClick={() => navigate(`/events/${id}/edit`)}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                                    >
                                        <Edit className="w-5 h-5" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Description */}
                        {event.description && (
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-pr-text-1 mb-3">About This Event</h2>
                                <p className="text-pr-text-2 whitespace-pre-wrap">{event.description}</p>
                            </div>
                        )}

                        {/* Tags */}
                        {event.tags && event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-8">
                                {event.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 bg-pr-surface-2 text-pr-text-2 rounded-full text-sm"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Event Tasks Section */}
                {tasks.length > 0 && (
                    <div className="mt-8 bg-pr-surface-card border border-pr-border rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="w-6 h-6 text-purple-500" />
                            <h2 className="text-xl font-bold text-pr-text-1">Event Tasks</h2>
                        </div>
                        <p className="text-pr-text-2 mb-4">
                            Complete tasks to earn rewards!
                        </p>
                        <div className="space-y-4">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="p-4 bg-pr-surface-2 rounded-xl border border-pr-border"
                                >
                                    <h3 className="font-semibold text-pr-text-1 mb-2">{task.title}</h3>
                                    {task.description && (
                                        <p className="text-sm text-pr-text-2 mb-3">{task.description}</p>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-purple-500 font-medium">
                                            {task.points_reward > 0 && `${task.points_reward} Points`}
                                            {task.points_reward > 0 && task.gems_reward > 0 && ' + '}
                                            {task.gems_reward > 0 && `${task.gems_reward} Gems`}
                                        </span>
                                        <button className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors">
                                            Start Task
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sponsors Section */}
                {sponsors.length > 0 && (
                    <div className="mt-8 bg-pr-surface-card border border-pr-border rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Gift className="w-6 h-6 text-orange-500" />
                            <h2 className="text-xl font-bold text-pr-text-1">Event Sponsors</h2>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {sponsors.map((sponsor) => (
                                <div
                                    key={sponsor.id}
                                    className="flex items-center gap-3 px-4 py-2 bg-pr-surface-2 rounded-xl"
                                >
                                    {sponsor.sponsor_logo ? (
                                        <img
                                            src={sponsor.sponsor_logo}
                                            alt={sponsor.sponsor_name}
                                            className="w-8 h-8 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-bold">
                                            {sponsor.sponsor_name?.[0] || '?'}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-pr-text-1 text-sm">
                                            {sponsor.sponsor_name}
                                        </p>
                                        <p className="text-xs text-pr-text-2 capitalize">
                                            {sponsor.tier} Sponsor
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Engagement Stats */}
                {(event.total_check_ins > 0 || event.total_tasks_completed > 0 || event.total_ugc_submissions > 0) && (
                    <div className="mt-8 bg-pr-surface-card border border-pr-border rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-pr-text-1 mb-4">Event Stats</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-pr-surface-2 rounded-xl">
                                <p className="text-2xl font-bold text-purple-500">{event.total_check_ins}</p>
                                <p className="text-sm text-pr-text-2">Check-ins</p>
                            </div>
                            <div className="text-center p-4 bg-pr-surface-2 rounded-xl">
                                <p className="text-2xl font-bold text-pink-500">{event.total_tasks_completed}</p>
                                <p className="text-sm text-pr-text-2">Tasks Done</p>
                            </div>
                            <div className="text-center p-4 bg-pr-surface-2 rounded-xl">
                                <p className="text-2xl font-bold text-blue-500">{event.total_ugc_submissions}</p>
                                <p className="text-sm text-pr-text-2">UGC Submissions</p>
                            </div>
                            <div className="text-center p-4 bg-pr-surface-2 rounded-xl">
                                <p className="text-2xl font-bold text-green-500">{event.engagement_score}</p>
                                <p className="text-sm text-pr-text-2">Engagement</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Spacer */}
                <div className="h-12" />
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    Check,
    Clock,
    Copy,
    DollarSign,
    Globe,
    Loader2,
    MapPin,
    Repeat,
} from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';
import eventsService from '@/react-app/services/events';
import type { CreateEventPayload, EventRecurrencePayload } from '@/react-app/services/events';
import type { EventType } from '../../shared/types';

const EVENT_CATEGORIES = [
    { value: 'concert', label: 'Concert', emoji: '🎵' },
    { value: 'conference', label: 'Conference', emoji: '🎤' },
    { value: 'meetup', label: 'Meetup', emoji: '🤝' },
    { value: 'festival', label: 'Festival', emoji: '🎉' },
    { value: 'workshop', label: 'Workshop', emoji: '🛠️' },
    { value: 'party', label: 'Party', emoji: '🎊' },
    { value: 'sports', label: 'Sports', emoji: '⚽' },
    { value: 'art', label: 'Art', emoji: '🎨' },
    { value: 'food', label: 'Food & Drink', emoji: '🍔' },
    { value: 'nightlife', label: 'Nightlife', emoji: '🌙' },
    { value: 'other', label: 'Other', emoji: '📅' },
];

const WEEKDAY_OPTIONS = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
];

type RecurrenceFormState = EventRecurrencePayload;

function getDefaultTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

function toDateTimeLocalInput(value?: string | null) {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const local = new Date(date.getTime() - offsetMs);
    return local.toISOString().slice(0, 16);
}

function fromDateTimeLocalInput(value?: string) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function getDefaultWeeklyRecurrence(eventDate?: string | null): RecurrenceFormState {
    const start = eventDate ? new Date(eventDate) : new Date();
    const weekday = Number.isNaN(start.getTime()) ? new Date().getDay() : start.getDay();

    return {
        enabled: true,
        frequency: 'weekly',
        interval: 1,
        byWeekday: [weekday],
        dayOfMonth: null,
        timezone: getDefaultTimezone(),
        until: '',
        count: null,
        generationHorizonDays: 90,
    };
}

function getDisabledRecurrence(eventDate?: string | null): RecurrenceFormState {
    return {
        ...getDefaultWeeklyRecurrence(eventDate),
        enabled: false,
    };
}

function getEmptyForm(): CreateEventPayload {
    return {
        title: '',
        description: '',
        category: 'other',
        event_date: '',
        event_end_date: '',
        location_name: '',
        location_address: '',
        is_virtual: false,
        virtual_url: '',
        ticketing_url: '',
        ticketing_platform: '',
        ticket_price_range: '',
        max_attendees: undefined,
        flyer_url: '',
        banner_url: '',
        is_public: true,
        is_featured: false,
        status: 'draft',
        tags: [],
        total_rewards_pool: 0,
        total_verified_credits_pool: 0,
        recurrence: null,
    };
}

function shiftDatesForClone(event: EventType) {
    const start = new Date(event.event_date);
    if (Number.isNaN(start.getTime())) {
        return {
            event_date: '',
            event_end_date: '',
        };
    }

    const end = event.event_end_date ? new Date(event.event_end_date) : null;
    const duration = end && !Number.isNaN(end.getTime()) ? Math.max(0, end.getTime() - start.getTime()) : null;
    const now = new Date();
    const nextStart = start > now ? start : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
        event_date: toDateTimeLocalInput(nextStart.toISOString()),
        event_end_date: duration != null ? toDateTimeLocalInput(new Date(nextStart.getTime() + duration).toISOString()) : '',
    };
}

function mapEventToForm(event: EventType, mode: 'edit' | 'clone' | 'convert'): CreateEventPayload {
    const shiftedDates = mode === 'clone' ? shiftDatesForClone(event) : null;

    return {
        title: mode === 'clone' ? `${event.title}${event.title.toLowerCase().includes('copy') ? '' : ' Copy'}` : event.title,
        description: event.description || '',
        category: event.category || 'other',
        event_date: shiftedDates?.event_date || toDateTimeLocalInput(event.event_date),
        event_end_date: shiftedDates?.event_end_date || toDateTimeLocalInput(event.event_end_date),
        location_name: event.location_name || '',
        location_address: event.location_address || '',
        is_virtual: Boolean(event.is_virtual),
        virtual_url: event.virtual_url || '',
        ticketing_url: event.ticketing_url || '',
        ticketing_platform: event.ticketing_platform || '',
        ticket_price_range: event.ticket_price_range || '',
        max_attendees: event.max_attendees || undefined,
        flyer_url: event.flyer_url || '',
        banner_url: event.banner_url || '',
        is_public: event.is_public,
        is_featured: event.is_featured,
        status: mode === 'edit' && event.status === 'published' ? 'published' : 'draft',
        tags: event.tags || [],
        total_rewards_pool: event.total_rewards_pool || 0,
        total_verified_credits_pool: event.total_verified_credits_pool || 0,
        recurrence: null,
    };
}

function mapEventToRecurrence(event: EventType, fallbackEventDate?: string): RecurrenceFormState {
    if (event.recurrence_enabled && event.recurrence_frequency) {
        return {
            enabled: true,
            frequency: event.recurrence_frequency,
            interval: event.recurrence_interval || 1,
            byWeekday: event.recurrence_by_weekday || [],
            dayOfMonth: event.recurrence_day_of_month || null,
            timezone: event.recurrence_timezone || getDefaultTimezone(),
            until: toDateTimeLocalInput(event.recurrence_until || ''),
            count: event.recurrence_count || null,
            generationHorizonDays: event.generation_horizon_days || 90,
        };
    }

    return getDefaultWeeklyRecurrence(fallbackEventDate || event.event_date);
}

export default function CreateEvent() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { id } = useParams<{ id?: string }>();
    const [searchParams] = useSearchParams();
    const cloneFromId = searchParams.get('cloneFrom');
    const convertFromId = searchParams.get('convertFrom');
    const isEditMode = Boolean(id);
    const mode = isEditMode ? 'edit' : convertFromId ? 'convert' : cloneFromId ? 'clone' : 'create';
    const sourceEventId = id || convertFromId || cloneFromId || null;

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingSource, setLoadingSource] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sourceEvent, setSourceEvent] = useState<EventType | null>(null);
    const [formData, setFormData] = useState<CreateEventPayload>(getEmptyForm());
    const [recurrence, setRecurrence] = useState<RecurrenceFormState>(getDisabledRecurrence());
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (!sourceEventId) return;

        let cancelled = false;

        const loadSourceEvent = async () => {
            try {
                setLoadingSource(true);
                setError(null);
                const data = await eventsService.getEvent(sourceEventId);
                if (cancelled) return;

                const event = data.event;
                setSourceEvent(event);
                setFormData(mapEventToForm(event, mode));
                if (mode === 'convert') {
                    setRecurrence({
                        ...mapEventToRecurrence(event),
                        enabled: true,
                    });
                } else if (mode === 'edit' && event.recurrence_enabled) {
                    setRecurrence(mapEventToRecurrence(event));
                } else {
                    setRecurrence(getDisabledRecurrence(event.event_date));
                }
            } catch (err) {
                console.error('Error loading source event:', err);
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Failed to load event');
                }
            } finally {
                if (!cancelled) {
                    setLoadingSource(false);
                }
            }
        };

        loadSourceEvent();

        return () => {
            cancelled = true;
        };
    }, [sourceEventId, mode]);

    const updateForm = (field: keyof CreateEventPayload, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const updateRecurrence = <K extends keyof RecurrenceFormState>(field: K, value: RecurrenceFormState[K]) => {
        setRecurrence((prev) => ({ ...prev, [field]: value }));
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
            updateForm('tags', [...(formData.tags || []), tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        updateForm('tags', formData.tags?.filter((t) => t !== tag) || []);
    };

    const toggleWeekday = (weekday: number) => {
        const current = new Set(recurrence.byWeekday);
        if (current.has(weekday)) {
            current.delete(weekday);
        } else {
            current.add(weekday);
        }

        updateRecurrence('byWeekday', Array.from(current).sort((a, b) => a - b));
    };

    const buildPayload = (publish: boolean): CreateEventPayload => ({
        ...formData,
        event_date: fromDateTimeLocalInput(formData.event_date),
        event_end_date: formData.event_end_date ? fromDateTimeLocalInput(formData.event_end_date) : undefined,
        status: publish ? 'published' : 'draft',
        clone_from_event_id: !isEditMode && mode === 'clone' ? cloneFromId || undefined : undefined,
        convert_to_series_from_event_id: !isEditMode && mode === 'convert' ? convertFromId || undefined : undefined,
        recurrence: recurrence.enabled
            ? {
                ...recurrence,
                until: recurrence.until ? fromDateTimeLocalInput(recurrence.until) : null,
                dayOfMonth: recurrence.frequency === 'monthly'
                    ? recurrence.dayOfMonth || null
                    : null,
            }
            : null,
    });

    const handleSubmit = async (publish = false) => {
        if (!user) {
            navigate('/auth?redirect=/events/create');
            return;
        }

        if (!formData.title.trim()) {
            setError('Event title is required');
            return;
        }

        if (!formData.event_date) {
            setError('Event date is required');
            return;
        }

        if (recurrence.enabled && recurrence.frequency === 'weekly' && recurrence.byWeekday.length === 0) {
            setError('Choose at least one day of the week for a recurring event');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const payload = buildPayload(publish);
            const event = isEditMode
                ? await eventsService.updateEvent(id!, payload)
                : await eventsService.createEvent(payload);

            navigate(`/e/${event.id}`);
        } catch (err) {
            console.error('Error saving event:', err);
            setError(err instanceof Error ? err.message : 'Failed to save event');
        } finally {
            setLoading(false);
        }
    };

    const renderModeBanner = () => {
        if (mode === 'create') return null;

        const sourceTitle = sourceEvent?.title || 'this event';
        const bannerClasses = mode === 'edit'
            ? 'bg-blue-500/10 border-blue-500/20 text-blue-600'
            : mode === 'convert'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-600';

        const icon = mode === 'edit'
            ? <Calendar className="w-5 h-5" />
            : mode === 'convert'
                ? <Repeat className="w-5 h-5" />
                : <Copy className="w-5 h-5" />;

        const title = mode === 'edit'
            ? 'Editing existing event'
            : mode === 'convert'
                ? 'Converting to a recurring series'
                : 'Cloning an older event';

        const description = mode === 'edit'
            ? `You are updating ${sourceTitle}.`
            : mode === 'convert'
                ? `You are using ${sourceTitle} as the first occurrence of a recurring series.`
                : `You are using ${sourceTitle} as the template for a new draft.`;

        return (
            <div className={`mb-6 p-4 rounded-2xl border ${bannerClasses}`}>
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">{icon}</div>
                    <div>
                        <p className="font-bold">{title}</p>
                        <p className="text-sm opacity-80">{description}</p>
                    </div>
                </div>
            </div>
        );
    };

    const renderStep1 = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-pr-text-1 mb-2">
                    Event Title *
                </label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateForm('title', e.target.value)}
                    placeholder="Give your event a catchy name"
                    className="w-full px-4 py-3 bg-pr-surface-2 border border-pr-border rounded-xl text-pr-text-1 placeholder-pr-text-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-pr-text-1 mb-2">
                    Category *
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {EVENT_CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            type="button"
                            onClick={() => updateForm('category', cat.value)}
                            className={`p-3 rounded-xl border text-center transition-all ${formData.category === cat.value
                                ? 'border-purple-500 bg-purple-500/10 text-purple-500'
                                : 'border-pr-border bg-pr-surface-2 text-pr-text-2 hover:border-purple-500/50'
                                }`}
                        >
                            <span className="text-xl block mb-1">{cat.emoji}</span>
                            <span className="text-xs font-medium">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-pr-text-1 mb-2">
                    Description
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    placeholder="Tell people what your event is about..."
                    rows={5}
                    className="w-full px-4 py-3 bg-pr-surface-2 border border-pr-border rounded-xl text-pr-text-1 placeholder-pr-text-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-2">
                        Flyer Image URL
                    </label>
                    <input
                        type="url"
                        value={formData.flyer_url}
                        onChange={(e) => updateForm('flyer_url', e.target.value)}
                        placeholder="https://example.com/flyer.jpg"
                        className="w-full px-4 py-3 bg-pr-surface-2 border border-pr-border rounded-xl text-pr-text-1 placeholder-pr-text-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-2">
                        Banner Image URL
                    </label>
                    <input
                        type="url"
                        value={formData.banner_url}
                        onChange={(e) => updateForm('banner_url', e.target.value)}
                        placeholder="https://example.com/banner.jpg"
                        className="w-full px-4 py-3 bg-pr-surface-2 border border-pr-border rounded-xl text-pr-text-1 placeholder-pr-text-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>
        </div>
    );

    const renderRecurringControls = () => (
        <div className="space-y-4 p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
            <label className="flex items-start gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={recurrence.enabled}
                    onChange={(e) => updateRecurrence('enabled', e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded border-pr-border text-purple-500 focus:ring-purple-500"
                />
                <div>
                    <div className="flex items-center gap-2 text-pr-text-1 font-medium">
                        <Repeat className="w-5 h-5 text-purple-500" />
                        Make this a recurring event
                    </div>
                    <p className="text-sm text-pr-text-2 mt-1">
                        Use this event as a repeatable format and let hosts clone the next occurrences automatically.
                    </p>
                </div>
            </label>

            {recurrence.enabled && (
                <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-pr-text-1 mb-2">Frequency</label>
                            <select
                                value={recurrence.frequency}
                                onChange={(e) => updateRecurrence('frequency', e.target.value as RecurrenceFormState['frequency'])}
                                className="w-full px-4 py-3 bg-pr-surface-card border border-pr-border rounded-xl text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-pr-text-1 mb-2">Repeat every</label>
                            <input
                                type="number"
                                min={1}
                                value={recurrence.interval}
                                onChange={(e) => updateRecurrence('interval', Math.max(1, parseInt(e.target.value || '1', 10)))}
                                className="w-full px-4 py-3 bg-pr-surface-card border border-pr-border rounded-xl text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    {recurrence.frequency === 'weekly' && (
                        <div>
                            <label className="block text-sm font-medium text-pr-text-1 mb-2">Repeat on</label>
                            <div className="flex flex-wrap gap-2">
                                {WEEKDAY_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => toggleWeekday(option.value)}
                                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${recurrence.byWeekday.includes(option.value)
                                            ? 'border-purple-500 bg-purple-500 text-white'
                                            : 'border-pr-border bg-pr-surface-card text-pr-text-2 hover:border-purple-500/50'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {recurrence.frequency === 'monthly' && (
                        <div>
                            <label className="block text-sm font-medium text-pr-text-1 mb-2">Day of month</label>
                            <input
                                type="number"
                                min={1}
                                max={31}
                                value={recurrence.dayOfMonth || ''}
                                onChange={(e) => updateRecurrence('dayOfMonth', e.target.value ? Math.min(31, Math.max(1, parseInt(e.target.value, 10))) : null)}
                                className="w-full px-4 py-3 bg-pr-surface-card border border-pr-border rounded-xl text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-pr-text-1 mb-2">Timezone</label>
                            <input
                                type="text"
                                value={recurrence.timezone}
                                onChange={(e) => updateRecurrence('timezone', e.target.value)}
                                className="w-full px-4 py-3 bg-pr-surface-card border border-pr-border rounded-xl text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-pr-text-1 mb-2">Stop after date</label>
                            <input
                                type="datetime-local"
                                value={recurrence.until || ''}
                                onChange={(e) => updateRecurrence('until', e.target.value)}
                                className="w-full px-4 py-3 bg-pr-surface-card border border-pr-border rounded-xl text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-pr-text-1 mb-2">Or stop after occurrences</label>
                            <input
                                type="number"
                                min={1}
                                value={recurrence.count || ''}
                                onChange={(e) => updateRecurrence('count', e.target.value ? Math.max(1, parseInt(e.target.value, 10)) : null)}
                                className="w-full px-4 py-3 bg-pr-surface-card border border-pr-border rounded-xl text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-pr-text-1 mb-2">Auto-generate upcoming occurrences for</label>
                        <input
                            type="number"
                            min={7}
                            max={365}
                            value={recurrence.generationHorizonDays || 90}
                            onChange={(e) => updateRecurrence('generationHorizonDays', Math.min(365, Math.max(7, parseInt(e.target.value || '90', 10))))}
                            className="w-full px-4 py-3 bg-pr-surface-card border border-pr-border rounded-xl text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <p className="text-xs text-pr-text-3 mt-2">Days of upcoming events to materialize from the series template.</p>
                    </div>
                </div>
            )}
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-2">
                        <Calendar className="inline w-4 h-4 mr-2" />
                        Event Date & Time *
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.event_date}
                        onChange={(e) => updateForm('event_date', e.target.value)}
                        className="w-full px-4 py-3 bg-pr-surface-2 border border-pr-border rounded-xl text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-2">
                        <Clock className="inline w-4 h-4 mr-2" />
                        End Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.event_end_date}
                        onChange={(e) => updateForm('event_end_date', e.target.value)}
                        className="w-full px-4 py-3 bg-pr-surface-2 border border-pr-border rounded-xl text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>

            {renderRecurringControls()}

            <div className="flex items-center gap-4 p-4 bg-pr-surface-2 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={Boolean(formData.is_virtual)}
                        onChange={(e) => updateForm('is_virtual', e.target.checked)}
                        className="w-5 h-5 rounded border-pr-border text-purple-500 focus:ring-purple-500"
                    />
                    <span className="flex items-center gap-2 text-pr-text-1">
                        <Globe className="w-5 h-5" />
                        This is a virtual/online event
                    </span>
                </label>
            </div>

            {formData.is_virtual ? (
                <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-2">
                        Virtual Event URL
                    </label>
                    <input
                        type="url"
                        value={formData.virtual_url}
                        onChange={(e) => updateForm('virtual_url', e.target.value)}
                        placeholder="https://zoom.us/j/..."
                        className="w-full px-4 py-3 bg-pr-surface-2 border border-pr-border rounded-xl text-pr-text-1 placeholder-pr-text-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            ) : (
                <>
                    <div>
                        <label className="block text-sm font-medium text-pr-text-1 mb-2">
                            <MapPin className="inline w-4 h-4 mr-2" />
                            Venue Name
                        </label>
                        <input
                            type="text"
                            value={formData.location_name}
                            onChange={(e) => updateForm('location_name', e.target.value)}
                            placeholder="e.g., The Grand Hall"
                            className="w-full px-4 py-3 bg-pr-surface-2 border border-pr-border rounded-xl text-pr-text-1 placeholder-pr-text-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-pr-text-1 mb-2">
                            Address
                        </label>
                        <input
                            type="text"
                            value={formData.location_address}
                            onChange={(e) => updateForm('location_address', e.target.value)}
                            placeholder="123 Main St, City, Country"
                            className="w-full px-4 py-3 bg-pr-surface-2 border border-pr-border rounded-xl text-pr-text-1 placeholder-pr-text-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-2">
                        Ticketing Platform
                    </label>
                    <input
                        type="text"
                        value={formData.ticketing_platform}
                        onChange={(e) => updateForm('ticketing_platform', e.target.value)}
                        placeholder="e.g., Eventbrite, Ticketmaster"
                        className="w-full px-4 py-3 bg-pr-surface-2 border border-pr-border rounded-xl text-pr-text-1 placeholder-pr-text-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-2">
                        Ticket URL
                    </label>
                    <input
                        type="url"
                        value={formData.ticketing_url}
                        onChange={(e) => updateForm('ticketing_url', e.target.value)}
                        placeholder="https://tickets.example.com/..."
                        className="w-full px-4 py-3 bg-pr-surface-2 border border-pr-border rounded-xl text-pr-text-1 placeholder-pr-text-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-2">
                        Ticket Price Range
                    </label>
                    <input
                        type="text"
                        value={formData.ticket_price_range}
                        onChange={(e) => updateForm('ticket_price_range', e.target.value)}
                        placeholder="e.g., $20 - $50, Free"
                        className="w-full px-4 py-3 bg-pr-surface-2 border border-pr-border rounded-xl text-pr-text-1 placeholder-pr-text-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-2">
                        Max Attendees
                    </label>
                    <input
                        type="number"
                        value={formData.max_attendees || ''}
                        onChange={(e) => updateForm('max_attendees', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                        placeholder="Leave empty for unlimited"
                        min={1}
                        className="w-full px-4 py-3 bg-pr-surface-2 border border-pr-border rounded-xl text-pr-text-1 placeholder-pr-text-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <h3 className="font-medium text-pr-text-1">Rewards Pool (Optional)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-pr-text-2 mb-2">Points Pool</label>
                        <input
                            type="number"
                            value={formData.total_rewards_pool || ''}
                            onChange={(e) => updateForm('total_rewards_pool', e.target.value ? parseFloat(e.target.value) : 0)}
                            placeholder="0"
                            min={0}
                            className="w-full px-4 py-3 bg-pr-surface-card border border-pr-border rounded-xl text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-pr-text-2 mb-2">Outcome Credits Pool</label>
                        <input
                            type="number"
                            value={formData.total_verified_credits_pool || ''}
                            onChange={(e) => updateForm('total_verified_credits_pool', e.target.value ? parseFloat(e.target.value) : 0)}
                            placeholder="0"
                            min={0}
                            className="w-full px-4 py-3 bg-pr-surface-card border border-pr-border rounded-xl text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-pr-text-1 mb-2">Tags</label>
                <div className="flex items-center gap-2 mb-3">
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add a tag and press Enter"
                        className="flex-1 px-4 py-3 bg-pr-surface-2 border border-pr-border rounded-xl text-pr-text-1 placeholder-pr-text-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
                    >
                        Add
                    </button>
                </div>
                {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-sm"
                            >
                                #{tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="ml-1 hover:text-purple-700"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 bg-pr-surface-2 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={Boolean(formData.is_public)}
                        onChange={(e) => updateForm('is_public', e.target.checked)}
                        className="w-5 h-5 rounded border-pr-border text-purple-500 focus:ring-purple-500"
                    />
                    <div>
                        <span className="text-pr-text-1 font-medium">Public Event</span>
                        <p className="text-sm text-pr-text-2">Anyone can discover and RSVP</p>
                    </div>
                </label>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
                <h3 className="text-lg font-bold text-pr-text-1 mb-4">Event Summary</h3>
                <div className="space-y-3 text-sm">
                    <p>
                        <span className="text-pr-text-2">Title:</span>{' '}
                        <span className="text-pr-text-1 font-medium">{formData.title || 'Untitled'}</span>
                    </p>
                    <p>
                        <span className="text-pr-text-2">Category:</span>{' '}
                        <span className="text-pr-text-1 font-medium capitalize">{formData.category}</span>
                    </p>
                    <p>
                        <span className="text-pr-text-2">Date:</span>{' '}
                        <span className="text-pr-text-1 font-medium">
                            {formData.event_date ? new Date(formData.event_date).toLocaleString() : 'Not set'}
                        </span>
                    </p>
                    <p>
                        <span className="text-pr-text-2">Location:</span>{' '}
                        <span className="text-pr-text-1 font-medium">
                            {formData.is_virtual ? 'Virtual Event' : formData.location_name || 'Not set'}
                        </span>
                    </p>
                    {recurrence.enabled && (
                        <p>
                            <span className="text-pr-text-2">Recurrence:</span>{' '}
                            <span className="text-pr-text-1 font-medium">
                                {recurrence.frequency} every {recurrence.interval} {recurrence.frequency === 'daily' ? 'day(s)' : recurrence.frequency === 'weekly' ? 'week(s)' : 'month(s)'}
                            </span>
                        </p>
                    )}
                    {(formData.total_rewards_pool || formData.total_verified_credits_pool) ? (
                        <p>
                            <span className="text-pr-text-2">Rewards:</span>{' '}
                            <span className="text-green-600 font-medium">
                                {formData.total_rewards_pool || 0} Points + {formData.total_verified_credits_pool || 0} Outcome Credits
                            </span>
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );

    if (loadingSource) {
        return (
            <div className="min-h-screen bg-pr-surface-2 py-8 px-4">
                <div className="max-w-2xl mx-auto bg-pr-surface-card border border-pr-border rounded-2xl p-8 flex items-center justify-center gap-3 text-pr-text-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading event details...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-pr-surface-2 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(sourceEventId ? `/e/${sourceEventId}` : '/moments')}
                        className="p-2 bg-pr-surface-card border border-pr-border rounded-xl hover:bg-pr-surface-3 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-pr-text-1" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-pr-text-1">
                            {mode === 'edit' ? 'Edit Event' : mode === 'convert' ? 'Convert to Recurring' : mode === 'clone' ? 'Clone Event' : 'Create Event'}
                        </h1>
                        <p className="text-pr-text-2">
                            {mode === 'edit'
                                ? 'Reopen and update this event'
                                : mode === 'convert'
                                    ? 'Turn a proven format into a recurring series'
                                    : mode === 'clone'
                                        ? 'Reuse an old event as a fresh draft'
                                        : 'Host an event and connect with your community'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStep(s)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step === s
                                ? 'bg-purple-500 text-white'
                                : step > s
                                    ? 'bg-green-500 text-white'
                                    : 'bg-pr-surface-3 text-pr-text-2'
                                }`}
                        >
                            {step > s ? <Check className="w-5 h-5" /> : s}
                        </button>
                    ))}
                </div>

                <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-6 md:p-8">
                    {renderModeBanner()}

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    <div className="flex justify-between mt-8 pt-6 border-t border-pr-border">
                        <button
                            onClick={() => step > 1 ? setStep(step - 1) : navigate(sourceEventId ? `/e/${sourceEventId}` : '/moments')}
                            className="px-6 py-3 bg-pr-surface-2 text-pr-text-1 rounded-xl font-medium hover:bg-pr-surface-3 transition-colors"
                        >
                            {step > 1 ? 'Previous' : 'Cancel'}
                        </button>

                        <div className="flex gap-3">
                            {step < 3 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    className="px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
                                >
                                    Next
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => handleSubmit(false)}
                                        disabled={loading}
                                        className="px-6 py-3 bg-pr-surface-2 text-pr-text-1 rounded-xl font-medium hover:bg-pr-surface-3 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : mode === 'edit' ? 'Save Draft Changes' : 'Save Draft'}
                                    </button>
                                    <button
                                        onClick={() => handleSubmit(true)}
                                        disabled={loading}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {mode === 'edit' ? 'Update & Publish' : mode === 'convert' ? 'Convert & Publish' : 'Publish Event'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

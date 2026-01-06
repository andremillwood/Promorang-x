import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    MapPin,
    Clock,
    Globe,
    ArrowLeft,
    Check,
    DollarSign,
} from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';
import eventsService from '@/react-app/services/events';
import type { CreateEventPayload } from '@/react-app/services/events';

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

export default function CreateEvent() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateEventPayload>({
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
        total_gems_pool: 0,
    });

    const [tagInput, setTagInput] = useState('');

    const updateForm = (field: keyof CreateEventPayload, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
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

    const handleSubmit = async (publish: boolean = false) => {
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

        try {
            setLoading(true);
            setError(null);

            const eventPayload = {
                ...formData,
                status: publish ? 'published' : 'draft',
            } as CreateEventPayload;

            const event = await eventsService.createEvent(eventPayload);
            navigate(`/events/${event.id}`);
        } catch (err) {
            console.error('Error creating event:', err);
            setError(err instanceof Error ? err.message : 'Failed to create event');
        } finally {
            setLoading(false);
        }
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

            <div className="flex items-center gap-4 p-4 bg-pr-surface-2 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.is_virtual}
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
                        onChange={(e) =>
                            updateForm('max_attendees', e.target.value ? parseInt(e.target.value) : undefined)
                        }
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
            {/* Rewards Pool */}
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
                            onChange={(e) =>
                                updateForm('total_rewards_pool', e.target.value ? parseFloat(e.target.value) : 0)
                            }
                            placeholder="0"
                            min={0}
                            className="w-full px-4 py-3 bg-pr-surface-card border border-pr-border rounded-xl text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-pr-text-2 mb-2">Gems Pool</label>
                        <input
                            type="number"
                            value={formData.total_gems_pool || ''}
                            onChange={(e) =>
                                updateForm('total_gems_pool', e.target.value ? parseFloat(e.target.value) : 0)
                            }
                            placeholder="0"
                            min={0}
                            className="w-full px-4 py-3 bg-pr-surface-card border border-pr-border rounded-xl text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>
            </div>

            {/* Tags */}
            <div>
                <label className="block text-sm font-medium text-pr-text-1 mb-2">Tags</label>
                <div className="flex items-center gap-2 mb-3">
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
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

            {/* Visibility */}
            <div className="p-4 bg-pr-surface-2 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.is_public}
                        onChange={(e) => updateForm('is_public', e.target.checked)}
                        className="w-5 h-5 rounded border-pr-border text-purple-500 focus:ring-purple-500"
                    />
                    <div>
                        <span className="text-pr-text-1 font-medium">Public Event</span>
                        <p className="text-sm text-pr-text-2">Anyone can discover and RSVP</p>
                    </div>
                </label>
            </div>

            {/* Summary */}
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
                    {(formData.total_rewards_pool || formData.total_gems_pool) ? (
                        <p>
                            <span className="text-pr-text-2">Rewards:</span>{' '}
                            <span className="text-green-600 font-medium">
                                {formData.total_rewards_pool || 0} Points + {formData.total_gems_pool || 0} Gems
                            </span>
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-pr-surface-2 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/events')}
                        className="p-2 bg-pr-surface-card border border-pr-border rounded-xl hover:bg-pr-surface-3 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-pr-text-1" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-pr-text-1">Create Event</h1>
                        <p className="text-pr-text-2">Host an event and connect with your community</p>
                    </div>
                </div>

                {/* Progress Steps */}
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

                {/* Form */}
                <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-6 md:p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-pr-border">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="px-6 py-3 text-pr-text-2 hover:text-pr-text-1 transition-colors"
                            >
                                Back
                            </button>
                        ) : (
                            <div />
                        )}

                        <div className="flex items-center gap-3">
                            {step === 3 && (
                                <button
                                    onClick={() => handleSubmit(false)}
                                    disabled={loading}
                                    className="px-6 py-3 bg-pr-surface-2 text-pr-text-1 rounded-xl font-medium hover:bg-pr-surface-3 transition-colors"
                                >
                                    Save Draft
                                </button>
                            )}

                            <button
                                onClick={() => (step < 3 ? setStep(step + 1) : handleSubmit(true))}
                                disabled={loading}
                                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto" />
                                ) : step < 3 ? (
                                    'Continue'
                                ) : (
                                    'Publish Event'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

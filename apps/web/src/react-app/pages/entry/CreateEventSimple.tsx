/**
 * CreateEventSimple - Simplified Event Creation for State 0/1 Users
 * 
 * A minimal, welcoming event creation flow for new users.
 * Focuses on essential fields only - no overwhelming options.
 * 
 * This is a NEW route at /events/create-simple for early-state users.
 * Advanced users use /events/create which has full options.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useMaturity } from '@/react-app/context/MaturityContext';
import { EntryLayout } from '@/react-app/components/entry';
import { Calendar, MapPin, Clock, Users, ArrowRight, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';
import api from '@/react-app/lib/api';

interface SimpleEventForm {
    title: string;
    description: string;
    date: string;
    time: string;
    eventType: 'virtual' | 'in-person';
    location: string;
    maxAttendees: number;
}

export default function CreateEventSimple() {
    const { user } = useAuth();
    const { recordAction, maturityState } = useMaturity();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<SimpleEventForm>({
        title: '',
        description: '',
        date: '',
        time: '',
        eventType: 'virtual',
        location: '',
        maxAttendees: 50
    });

    const updateForm = (field: keyof SimpleEventForm, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleSubmit = async () => {
        if (!user) {
            navigate('/auth', { state: { from: '/events/create-simple' } });
            return;
        }

        // Basic validation
        if (!formData.title.trim()) {
            setError('Please enter an event title');
            return;
        }
        if (!formData.date) {
            setError('Please select a date');
            return;
        }
        if (!formData.time) {
            setError('Please select a time');
            return;
        }
        if (formData.eventType === 'in-person' && !formData.location.trim()) {
            setError('Please enter a location for in-person events');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const eventData = {
                title: formData.title.trim(),
                description: formData.description.trim() || `Join us for ${formData.title}!`,
                start_date: formData.date,
                start_time: formData.time,
                event_type: formData.eventType,
                location: formData.eventType === 'virtual' ? 'Virtual Event' : formData.location.trim(),
                is_virtual: formData.eventType === 'virtual',
                max_attendees: formData.maxAttendees,
                status: 'published',
                category: 'Community'
            };

            const response = await api.post<{ data: { event: { id: string } } }>('/events', eventData);

            // Record the action for maturity progression
            await recordAction('content_created', {
                type: 'event',
                event_id: response.data?.event?.id
            });

            setSuccess(true);
        } catch (err: any) {
            console.error('Error creating event:', err);
            setError(err.message || 'Failed to create event. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success screen
    if (success) {
        return (
            <EntryLayout>
                <div className="min-h-screen bg-pr-surface-2 flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-pr-surface-1 rounded-2xl p-8 text-center shadow-lg">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-pr-text-1 mb-2">Event Created! 🎉</h1>
                        <p className="text-pr-text-2 mb-6">
                            Your event is now live. Share it with your community and watch the RSVPs roll in!
                        </p>
                        <div className="bg-emerald-50 rounded-xl p-4 mb-6">
                            <p className="text-sm text-emerald-700">
                                <span className="font-semibold">+10 Gems</span> earned for creating your first event!
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => navigate('/events-entry')}
                                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                            >
                                View All Events
                            </button>
                            <button
                                onClick={() => navigate('/today')}
                                className="w-full py-3 bg-pr-surface-2 text-pr-text-1 font-medium rounded-xl hover:bg-pr-surface-3 transition-colors"
                            >
                                Back to Today
                            </button>
                        </div>
                    </div>
                </div>
            </EntryLayout>
        );
    }

    return (
        <EntryLayout>
            <div className="min-h-screen bg-pr-surface-2">
                {/* Header */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <div className="max-w-2xl mx-auto px-4 py-8">
                        <button
                            onClick={() => step === 1 ? navigate('/events-entry') : setStep(step - 1)}
                            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {step === 1 ? 'Back to Events' : 'Back'}
                        </button>
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-5 h-5" />
                            <span className="text-sm font-medium opacity-90">Create Your First Event</span>
                        </div>
                        <h1 className="text-2xl font-bold">Host a Gathering</h1>
                        <p className="text-white/80 mt-2">
                            Bring people together! It only takes a minute.
                        </p>

                        {/* Progress indicator */}
                        <div className="flex gap-2 mt-6">
                            {[1, 2].map(s => (
                                <div
                                    key={s}
                                    className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-white' : 'bg-white/30'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="max-w-2xl mx-auto px-4 py-8">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="bg-pr-surface-1 rounded-2xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-pr-text-1 mb-4">What's the event?</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-pr-text-2 mb-2">
                                            Event Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => updateForm('title', e.target.value)}
                                            placeholder="e.g., Creator Coffee Chat, Networking Lunch..."
                                            className="w-full px-4 py-3 border border-pr-surface-3 rounded-xl bg-pr-surface-1 text-pr-text-1 placeholder:text-pr-text-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-pr-text-2 mb-2">
                                            Description (optional)
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => updateForm('description', e.target.value)}
                                            placeholder="Tell people what to expect..."
                                            rows={3}
                                            className="w-full px-4 py-3 border border-pr-surface-3 rounded-xl bg-pr-surface-1 text-pr-text-1 placeholder:text-pr-text-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-pr-surface-1 rounded-2xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-pr-text-1 mb-4">Virtual or In-Person?</h2>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => updateForm('eventType', 'virtual')}
                                        className={`p-4 rounded-xl border-2 transition-all ${formData.eventType === 'virtual'
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : 'border-pr-surface-3 hover:border-pr-surface-4'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">💻</div>
                                        <span className="font-medium text-pr-text-1">Virtual</span>
                                        <p className="text-xs text-pr-text-2 mt-1">Online meetup</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateForm('eventType', 'in-person')}
                                        className={`p-4 rounded-xl border-2 transition-all ${formData.eventType === 'in-person'
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : 'border-pr-surface-3 hover:border-pr-surface-4'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">📍</div>
                                        <span className="font-medium text-pr-text-1">In-Person</span>
                                        <p className="text-xs text-pr-text-2 mt-1">Physical location</p>
                                    </button>
                                </div>

                                {formData.eventType === 'in-person' && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-pr-text-2 mb-2">
                                            <MapPin className="w-4 h-4 inline mr-1" />
                                            Location *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => updateForm('location', e.target.value)}
                                            placeholder="e.g., Central Park, Coffee Shop on Main St..."
                                            className="w-full px-4 py-3 border border-pr-surface-3 rounded-xl bg-pr-surface-1 text-pr-text-1 placeholder:text-pr-text-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!formData.title.trim()}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                Continue
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="bg-pr-surface-1 rounded-2xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-pr-text-1 mb-4">When is it happening?</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-pr-text-2 mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => updateForm('date', e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 border border-pr-surface-3 rounded-xl bg-pr-surface-1 text-pr-text-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-pr-text-2 mb-2">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            Time *
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.time}
                                            onChange={(e) => updateForm('time', e.target.value)}
                                            className="w-full px-4 py-3 border border-pr-surface-3 rounded-xl bg-pr-surface-1 text-pr-text-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-pr-surface-1 rounded-2xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-pr-text-1 mb-4">How many people?</h2>
                                <div>
                                    <label className="block text-sm font-medium text-pr-text-2 mb-2">
                                        <Users className="w-4 h-4 inline mr-1" />
                                        Max Attendees
                                    </label>
                                    <select
                                        value={formData.maxAttendees}
                                        onChange={(e) => updateForm('maxAttendees', parseInt(e.target.value))}
                                        className="w-full px-4 py-3 border border-pr-surface-3 rounded-xl bg-pr-surface-1 text-pr-text-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value={10}>Up to 10 people</option>
                                        <option value={25}>Up to 25 people</option>
                                        <option value={50}>Up to 50 people</option>
                                        <option value={100}>Up to 100 people</option>
                                        <option value={500}>Up to 500 people</option>
                                    </select>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                                <h3 className="font-bold text-emerald-900 mb-3">Event Summary</h3>
                                <div className="space-y-2 text-sm text-emerald-700">
                                    <p><span className="font-medium">Title:</span> {formData.title}</p>
                                    <p><span className="font-medium">Type:</span> {formData.eventType === 'virtual' ? 'Virtual Event' : `In-Person at ${formData.location}`}</p>
                                    {formData.date && formData.time && (
                                        <p><span className="font-medium">When:</span> {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at {formData.time}</p>
                                    )}
                                    <p><span className="font-medium">Capacity:</span> {formData.maxAttendees} people</p>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.date || !formData.time}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        Create Event
                                        <Sparkles className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </EntryLayout>
    );
}

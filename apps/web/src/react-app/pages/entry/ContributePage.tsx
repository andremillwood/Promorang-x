/**
 * Contribute Page - Growth-Focused Education + Action Hub
 * 
 * Transforms the contribute experience for early-stage users into:
 * 1. Referral Tools - Code, link, QR, stats
 * 2. Creator Education - Value props + contribution paths
 * 3. Event Planner Section - Event creation + attendee referrals
 * 4. Growth Benefits - Commission tiers + network effects
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useMaturity } from '@/react-app/context/MaturityContext';
import { EntryLayout } from '@/react-app/components/entry';
import { apiFetch } from '@/react-app/utils/api';
import {
    MessageSquare, Camera, Palette, ChevronRight, Sparkles,
    Check, ArrowRight, X, Send, Copy, Share2, QrCode, Users,
    DollarSign, TrendingUp, Calendar, Gift, Zap, Star
} from 'lucide-react';
import { useCelebration } from '@/react-app/components/ui/Celebrate';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ThoughtFormData {
    title: string;
    content: string;
}

interface ReferralData {
    referral_code: string;
    total_referrals: number;
    total_earnings: {
        gems: number;
        points: number;
    };
    commission_rate: number;
}

export default function ContributePage() {
    const { user } = useAuth();
    const { recordAction } = useMaturity();
    const navigate = useNavigate();

    const [activeCard, setActiveCard] = useState<'thought' | null>(null);
    const [formData, setFormData] = useState<ThoughtFormData>({
        title: '',
        content: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [copied, setCopied] = useState(false);
    const [referralData, setReferralData] = useState<ReferralData | null>(null);
    const { celebrate } = useCelebration();

    // Fetch referral data for logged-in users
    useEffect(() => {
        const fetchReferralData = async () => {
            if (!user) return;
            try {
                const response = await apiFetch('/api/referrals/stats');
                const data = await response.json();
                if (data.status === 'success' && data.data?.summary) {
                    setReferralData({
                        referral_code: data.data.summary.referral_code,
                        total_referrals: data.data.summary.total_referrals || 0,
                        total_earnings: data.data.summary.total_earnings || { gems: 0, points: 0 },
                        commission_rate: data.data.summary.tier?.commission_rate || 0.05
                    });
                }
            } catch (err) {
                console.error('Error fetching referral data:', err);
            }
        };
        fetchReferralData();
    }, [user]);

    const handleSubmitThought = async () => {
        if (!user) {
            navigate('/auth', { state: { from: '/contribute' } });
            return;
        }

        if (!formData.content.trim()) {
            setError('Please share your thought');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/api/content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content_type: 'thought',
                    title: formData.title || 'Quick Thought',
                    description: formData.content,
                    platform: 'promorang',
                    platform_url: '',
                    total_shares: 100,
                    share_price: 0
                })
            });

            if (response.ok) {
                await recordAction('thought_shared', { type: 'quick_thought' });
                celebrate('sparkles');
                setSuccess(true);
            } else {
                const result = await response.json();
                setError(result.error || 'Failed to share your thought');
            }
        } catch (err) {
            console.error('Error submitting thought:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyReferralLink = async () => {
        if (!referralData?.referral_code) return;
        const shareUrl = `${window.location.origin}/auth?ref=${referralData.referral_code}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Error copying:', err);
        }
    };

    const shareReferralLink = async () => {
        if (!referralData?.referral_code) return;
        const shareUrl = `${window.location.origin}/auth?ref=${referralData.referral_code}`;
        const shareText = `Join Promorang and earn rewards! Use my referral code: ${referralData.referral_code}`;

        if (navigator.share) {
            try {
                await navigator.share({ title: 'Join Promorang', text: shareText, url: shareUrl });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            copyReferralLink();
        }
    };

    const resetForm = () => {
        setActiveCard(null);
        setFormData({ title: '', content: '' });
        setSuccess(false);
        setError(null);
    };

    // Success State
    if (success) {
        return (
            <EntryLayout>
                <div className="min-h-screen bg-pr-surface-2">
                    <div className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 text-white">
                        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5" />
                                <span className="text-sm font-medium opacity-90">Your voice matters</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-3">Voice Added!</h1>
                        </div>
                    </div>

                    <div className="max-w-2xl mx-auto px-4 py-8">
                        <div className="bg-pr-surface-1 rounded-2xl p-8 shadow-sm text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-pr-text-1 mb-2">Thanks for Contributing!</h2>
                            <p className="text-pr-text-2 mb-6">Your voice adds to the community. Keep it up!</p>

                            <div className="flex flex-col gap-3">
                                <Link
                                    to="/today"
                                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity text-center"
                                >
                                    Back to Today
                                </Link>
                                <button
                                    onClick={resetForm}
                                    className="w-full py-3 bg-pr-surface-2 text-pr-text-1 font-medium rounded-xl hover:bg-pr-surface-3 transition-colors"
                                >
                                    Share Another Thought
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </EntryLayout>
        );
    }

    return (
        <EntryLayout>
            <div className="min-h-screen bg-pr-surface-2">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 text-white">
                    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5" />
                            <span className="text-sm font-medium opacity-90">Your voice matters</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-3">Add Your Voice to Promorang</h1>
                        <p className="text-lg opacity-90 max-w-xl">
                            Create content, grow your audience, and earn rewards. Every contribution unlocks new opportunities.
                        </p>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

                    {/* YOUR REFERRAL TOOLS (if logged in) */}
                    {user && referralData && (
                        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Gift className="w-5 h-5" />
                                Your Growth Tools
                            </h2>

                            {/* Referral Code */}
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
                                <div className="text-sm opacity-80 mb-1">Your Referral Code</div>
                                <div className="flex items-center gap-3">
                                    <code className="text-xl font-mono font-bold flex-1">
                                        {referralData.referral_code || 'Loading...'}
                                    </code>
                                    <button
                                        onClick={copyReferralLink}
                                        className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                                        title="Copy link"
                                    >
                                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={shareReferralLink}
                                        className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                                        title="Share"
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="bg-white/10 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold">{referralData.total_referrals}</div>
                                    <div className="text-xs opacity-80">Referrals</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold">{(referralData.commission_rate * 100).toFixed(0)}%</div>
                                    <div className="text-xs opacity-80">Commission</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold">{referralData.total_earnings.gems}</div>
                                    <div className="text-xs opacity-80">Gems Earned</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Link
                                    to="/venue-qr"
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/20 rounded-lg font-medium hover:bg-white/30 transition-colors text-sm"
                                >
                                    <QrCode className="w-4 h-4" />
                                    Get QR Poster
                                </Link>
                                <Link
                                    to="/referrals"
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors text-sm"
                                >
                                    <Users className="w-4 h-4" />
                                    Full Dashboard
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* GROW AS A CREATOR */}
                    <div>
                        <h2 className="text-sm font-bold text-pr-text-2 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            Grow as a Creator
                        </h2>

                        {/* Value Props */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {[
                                { icon: <Zap className="w-4 h-4" />, text: 'Earn from Day 1', color: 'text-yellow-500' },
                                { icon: <DollarSign className="w-4 h-4" />, text: 'Keep 95%', color: 'text-green-500' },
                                { icon: <TrendingUp className="w-4 h-4" />, text: 'Build Equity', color: 'text-blue-500' },
                                { icon: <Users className="w-4 h-4" />, text: 'No Followers Required', color: 'text-purple-500' },
                            ].map((prop, i) => (
                                <div key={i} className="bg-pr-surface-1 rounded-xl p-3 flex items-center gap-2">
                                    <span className={prop.color}>{prop.icon}</span>
                                    <span className="text-sm font-medium text-pr-text-1">{prop.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Contribution Cards */}
                        <div className="space-y-3">
                            {/* Quick Thought Card */}
                            <div className="bg-pr-surface-1 rounded-2xl shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setActiveCard(activeCard === 'thought' ? null : 'thought')}
                                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-pr-surface-2 transition-colors"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                                        <MessageSquare className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-pr-text-1 text-lg">Share a Quick Thought</h3>
                                        <p className="text-sm text-pr-text-2">Share an opinion, tip, or reaction</p>
                                    </div>
                                    <ChevronRight className={`w-5 h-5 text-pr-text-2 transition-transform ${activeCard === 'thought' ? 'rotate-90' : ''}`} />
                                </button>

                                {/* Expanded Form */}
                                {activeCard === 'thought' && (
                                    <div className="px-5 pb-5 border-t border-pr-surface-3">
                                        <div className="pt-4 space-y-4">
                                            {error && (
                                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                                                    <X className="w-4 h-4" />
                                                    {error}
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-medium text-pr-text-1 mb-2">Title (optional)</label>
                                                <input
                                                    type="text"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                    placeholder="Give your thought a title..."
                                                    className="w-full px-4 py-3 rounded-xl border border-pr-surface-3 bg-pr-surface-2 text-pr-text-1 placeholder-pr-text-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-pr-text-1 mb-2">Your Thought</label>
                                                <textarea
                                                    value={formData.content}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                                    placeholder="What's on your mind?"
                                                    rows={4}
                                                    className="w-full px-4 py-3 rounded-xl border border-pr-surface-3 bg-pr-surface-2 text-pr-text-1 placeholder-pr-text-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                                />
                                            </div>

                                            <button
                                                onClick={handleSubmitThought}
                                                disabled={isSubmitting || !formData.content.trim()}
                                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Sharing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="w-5 h-5" />
                                                        Share Thought
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Review Experience Card */}
                            <Link to="/post" className="block bg-pr-surface-1 rounded-2xl shadow-sm overflow-hidden hover:bg-pr-surface-2 transition-colors">
                                <div className="flex items-center gap-4 p-5">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                                        <Camera className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-pr-text-1 text-lg">Review an Experience</h3>
                                        <p className="text-sm text-pr-text-2">Share proof of a deal or product you tried</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-pr-text-2" />
                                </div>
                            </Link>

                            {/* Full Create Card */}
                            <Link to="/create" className="block bg-pr-surface-1 rounded-2xl shadow-sm overflow-hidden hover:bg-pr-surface-2 transition-colors">
                                <div className="flex items-center gap-4 p-5">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                                        <Palette className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-pr-text-1 text-lg">Create Full Content</h3>
                                        <p className="text-sm text-pr-text-2">Advanced creation with shares & investment options</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-pr-text-2" />
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* HOST EVENTS & GROW */}
                    <div>
                        <h2 className="text-sm font-bold text-pr-text-2 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            Host Events & Grow
                        </h2>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-900 mb-1">Create an Event</h3>
                                    <p className="text-sm text-blue-700">
                                        Host events and earn when attendees sign up through you.
                                        Get QR codes for check-ins and track your impact.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                                <div className="bg-white/60 rounded-lg py-2 px-3">
                                    <div className="text-lg font-bold text-blue-900">Up to 10%</div>
                                    <div className="text-xs text-blue-600">Affiliate Sales</div>
                                </div>
                                <div className="bg-white/60 rounded-lg py-2 px-3">
                                    <div className="text-lg font-bold text-blue-900">∞</div>
                                    <div className="text-xs text-blue-600">Attendees</div>
                                </div>
                                <div className="bg-white/60 rounded-lg py-2 px-3">
                                    <div className="text-lg font-bold text-blue-900">QR</div>
                                    <div className="text-xs text-blue-600">Check-ins</div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Link
                                    to="/events/create-simple"
                                    className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl text-center hover:bg-blue-700 transition-colors"
                                >
                                    Create Event
                                </Link>
                                <Link
                                    to="/venue-qr"
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-colors"
                                >
                                    <QrCode className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* WHY BRING PEOPLE? */}
                    <div>
                        <h2 className="text-sm font-bold text-pr-text-2 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4 text-green-500" />
                            Why Bring People to Promorang?
                        </h2>

                        <div className="bg-pr-surface-1 rounded-2xl p-5 space-y-4">
                            {[
                                {
                                    icon: <DollarSign className="w-5 h-5 text-green-500" />,
                                    title: 'Earn up to 5% of what they earn',
                                    desc: 'When your referrals complete tasks and earn, you get a percentage—ongoing.'
                                },
                                {
                                    icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
                                    title: 'Unlock higher tier benefits',
                                    desc: 'More referrals = higher commission rates and exclusive perks.'
                                },
                                {
                                    icon: <Users className="w-5 h-5 text-purple-500" />,
                                    title: 'Build your influence network',
                                    desc: 'Your network is your net worth. Watch it grow on Promorang.'
                                },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-pr-surface-2 flex items-center justify-center flex-shrink-0">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-pr-text-1">{item.title}</h4>
                                        <p className="text-sm text-pr-text-2">{item.desc}</p>
                                    </div>
                                </div>
                            ))}

                            <Link
                                to="/referral-program"
                                className="block text-center py-3 bg-pr-surface-2 text-pr-text-1 font-medium rounded-xl hover:bg-pr-surface-3 transition-colors"
                            >
                                Learn More About Referrals →
                            </Link>
                        </div>
                    </div>

                    {/* Back to Today Link */}
                    <div className="text-center pt-4">
                        <Link
                            to="/today"
                            className="text-sm text-pr-text-2 hover:text-purple-500 transition-colors"
                        >
                            ← Back to Today
                        </Link>
                    </div>
                </div>
            </div>
        </EntryLayout>
    );
}

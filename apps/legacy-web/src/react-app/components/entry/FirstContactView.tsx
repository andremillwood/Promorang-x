/**
 * FirstContactView
 * 
 * Ultra-simplified first experience for brand new users.
 * Focuses on ONE primary action: Connect Instagram OR browse a deal.
 * User can click "See all options" to reveal the full hub experience.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Instagram, Gift, ArrowRight, ChevronDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import InstagramConnectModal from '../InstagramConnectModal';

interface FirstContactViewProps {
    onExpandHub: () => void;
    userName?: string;
}

export default function FirstContactView({ onExpandHub, userName }: FirstContactViewProps) {
    const navigate = useNavigate();
    const [showInstagramModal, setShowInstagramModal] = useState(false);

    return (
        <div className="min-h-screen bg-pr-surface-background flex flex-col">
            {/* Minimal Header */}
            <header className="py-4 px-6">
                <img
                    src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_FULL-02.png"
                    alt="Promorang"
                    className="h-8 w-auto mx-auto"
                />
            </header>

            {/* Main Content - Centered */}
            <main className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="max-w-lg w-full space-y-8 text-center">

                    {/* Greeting */}
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-full border border-orange-500/20">
                            <Sparkles className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium text-pr-text-1">
                                {userName ? `Welcome, ${userName}!` : 'Welcome to Promorang'}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-pr-text-1">
                            Get paid for<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                                stuff you already do
                            </span>
                        </h1>

                        <p className="text-pr-text-2 max-w-md mx-auto">
                            Like posts, visit places, share discoveries. We turn that into real money.
                        </p>
                    </div>

                    {/* Primary Action Cards */}
                    <div className="space-y-3">
                        {/* Instagram Connect - Primary */}
                        <button
                            onClick={() => setShowInstagramModal(true)}
                            className="w-full group"
                        >
                            <Card className="p-5 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 border-none text-white hover:shadow-xl transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <Instagram className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="font-bold text-lg">Verify Instagram & Start</h3>
                                        <p className="text-white/80 text-sm">Takes 30 seconds • No posting</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Card>
                        </button>

                        <div className="text-xs text-pr-text-3">or</div>

                        {/* Browse Deals - Secondary */}
                        <Link to="/deals" className="block group">
                            <Card className="p-5 bg-pr-surface-card border border-emerald-500/30 hover:border-emerald-500/50 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                        <Gift className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="font-bold text-pr-text-1">Browse Deals First</h3>
                                        <p className="text-pr-text-2 text-sm">See what rewards are available</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-pr-text-3 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Card>
                        </Link>
                    </div>

                    {/* Social Proof */}
                    <div className="pt-4">
                        <p className="text-xs text-pr-text-3">
                            Join 10,000+ people earning from their social presence
                        </p>
                    </div>
                </div>
            </main>

            {/* Expand Hub Button - Fixed Bottom */}
            <footer className="py-6 px-4 text-center border-t border-pr-border/50">
                <button
                    onClick={onExpandHub}
                    className="inline-flex items-center gap-2 text-sm text-pr-text-2 hover:text-pr-text-1 transition-colors"
                >
                    <span>Explore all options</span>
                    <ChevronDown className="w-4 h-4" />
                </button>
            </footer>

            {/* Instagram Connect Modal */}
            <InstagramConnectModal
                isOpen={showInstagramModal}
                onClose={() => setShowInstagramModal(false)}
            />
        </div>
    );
}

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    MapPin,
    Star,
    BarChart3,
    Gift,
    ArrowRight,
    Camera,
    Users
} from 'lucide-react';
import type { OnboardingIntent } from './IntentOrientation';

interface ValuePreviewProps {
    intent: OnboardingIntent;
    onContinue: () => void;
}

export default function ValuePreview({ intent, onContinue }: ValuePreviewProps) {
    const getContent = () => {
        switch (intent) {
            case 'participant':
                return {
                    title: "Moments are happening near you.",
                    subtitle: "This is how it works in real life: you find the energy, join in, and become part of the story.",
                    card: {
                        type: 'moment',
                        title: "Sunrise Coffee & Connection",
                        location: "Brooklyn Waterfront",
                        participants: "42 people joined",
                        image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1000&auto=format&fit=crop",
                        icon: MapPin,
                        badge: "See what's possible"
                    }
                };
            case 'creator':
                return {
                    title: "Your community, your energy.",
                    subtitle: "Here's what you can do: gather your people, host unforgettable experiences, and see the impact immediately.",
                    card: {
                        type: 'recap',
                        title: "Community Book Swap",
                        location: "Hosted by @theliteraryclub",
                        participants: "215 people joined",
                        image: "https://images.unsplash.com/photo-1529148482759-b35b25c5f217?q=80&w=1000&auto=format&fit=crop",
                        icon: Star,
                        badge: "See what's possible"
                    }
                };
            case 'brand':
                return {
                    title: "Authentic connections at scale.",
                    subtitle: "This is how it works: host moments that people actually remember, and reward real participation.",
                    card: {
                        type: 'metrics',
                        title: "Eco-Friendly Pop-up",
                        location: "San Francisco Artisan Alley",
                        participants: "890 Social Shares",
                        image: "https://images.unsplash.com/photo-1534452285072-c4cfe559b2ad?q=80&w=1000&auto=format&fit=crop",
                        icon: BarChart3,
                        badge: "See what's possible"
                    }
                };
            case 'merchant':
                return {
                    title: "Tangible foot traffic.",
                    subtitle: "Here's what you can do: turn digital energy into physical visits and loyal customers.",
                    card: {
                        type: 'merchant',
                        title: "The Coffee Lab",
                        location: "123 Main St, Austin",
                        participants: "45 Check-ins Today",
                        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop",
                        icon: MapPin,
                        badge: "See what's possible"
                    }
                };
            case 'invited':
                return {
                    title: "You've been invited.",
                    subtitle: "Someone invited you to experience something real. Here's a glimpse of what's inside.",
                    card: {
                        type: 'invitation',
                        title: "Exclusive Product Drop",
                        location: "Secret Location",
                        participants: "Limited Access",
                        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
                        icon: Gift,
                        badge: "See what's possible"
                    }
                };
            default:
                return null;
        }
    };

    const content = getContent();
    if (!content) return null;

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full"
            >
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold mb-3">{content.title}</h2>
                    <p className="text-zinc-400">{content.subtitle}</p>
                </div>

                {/* Preview Card */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="relative bg-zinc-900 rounded-[2.5rem] border border-zinc-800 p-4 shadow-2xl overflow-hidden mb-12"
                >
                    <div className="aspect-[4/3] rounded-[2rem] overflow-hidden mb-6 relative">
                        <img
                            src={content.card.image}
                            alt={content.card.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold border border-white/10 uppercase tracking-wider">
                            {content.card.badge}
                        </div>
                    </div>

                    <div className="px-4 pb-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-2xl font-bold mb-1">{content.card.title}</h3>
                                <div className="flex items-center text-zinc-400 text-sm">
                                    <MapPin className="w-4 h-4 mr-1 text-orange-500" />
                                    {content.card.location}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 pt-4 border-t border-zinc-800">
                            <div className="flex items-center text-zinc-300">
                                <Users className="w-4 h-4 mr-2 text-zinc-500" />
                                <span className="font-medium">{content.card.participants}</span>
                            </div>
                            <div className="flex items-center text-zinc-300 ml-auto">
                                <Camera className="w-4 h-4 mr-2 text-zinc-500" />
                                <span className="font-medium text-orange-400 font-mono">LIVE</span>
                            </div>
                        </div>
                    </div>

                    {/* Aesthetic overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-500/5 to-transparent pointer-events-none" />
                </motion.div>

                <div className="flex flex-col items-center gap-4">
                    <Button
                        size="lg"
                        onClick={onContinue}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-xl font-bold py-8 rounded-2xl shadow-xl shadow-orange-500/20 group"
                    >
                        This is what I want
                        <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <p className="text-zinc-500 text-xs text-center">
                        Answers the question: "Oh — this is what this is."
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

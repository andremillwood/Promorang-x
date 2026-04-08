import { motion } from 'framer-motion';
import {
    Users,
    Zap,
    Building2,
    UserPlus,
    ChevronRight
} from 'lucide-react';

export type OnboardingIntent = 'participant' | 'creator' | 'brand' | 'merchant' | 'invited';

interface IntentOrientationProps {
    onSelect: (intent: OnboardingIntent) => void;
}

const INTENTS = [
    {
        id: 'participant' as const,
        label: "I'm here to join moments",
        description: "Discover nearby events, join challenges, and be part of the story.",
        icon: Users,
        color: "bg-blue-500/10 text-blue-400",
        hoverBorder: "hover:border-blue-500/50"
    },
    {
        id: 'creator' as const,
        label: "I want to create moments",
        description: "Host events, gather people, and build your own community energy.",
        icon: Zap,
        color: "bg-orange-500/10 text-orange-400",
        hoverBorder: "hover:border-orange-500/50"
    },
    {
        id: 'brand' as const,
        label: "I'm exploring for a brand or business",
        description: "Connect with real people through authentic activations and rewards.",
        icon: Building2,
        color: "bg-purple-500/10 text-purple-400",
        hoverBorder: "hover:border-purple-500/50"
    },
    {
        id: 'merchant' as const,
        label: "I'm a destination or merchant",
        description: "Verify your location, host check-ins, and drive foot traffic.",
        icon: UserPlus,
        color: "bg-green-500/10 text-green-400",
        hoverBorder: "hover:border-green-500/50"
    },
    {
        id: 'invited' as const,
        label: "I was invited here",
        description: "Someone invited you to a specific moment or activation.",
        icon: UserPlus,
        color: "bg-emerald-500/10 text-emerald-400",
        hoverBorder: "hover:border-emerald-500/50"
    }
];

export default function IntentOrientation({ onSelect }: IntentOrientationProps) {
    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl w-full"
            >
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                        What brings you here today?
                    </h2>
                    <p className="text-zinc-400 text-lg">
                        This helps us tailor your experience to what matters most to you.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {INTENTS.map((intent, index) => (
                        <motion.button
                            key={intent.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onSelect(intent.id)}
                            className={`group relative p-8 rounded-[2rem] bg-zinc-900 border border-zinc-800 text-left transition-all duration-300 ${intent.hoverBorder} hover:bg-zinc-800/50 shadow-lg hover:shadow-2xl overflow-hidden`}
                        >
                            <div className={`w-14 h-14 rounded-2xl ${intent.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <intent.icon className="w-8 h-8" />
                            </div>

                            <h3 className="text-2xl font-bold mb-3 group-hover:text-white transition-colors">
                                {intent.label}
                            </h3>
                            <p className="text-zinc-400 leading-relaxed mb-4">
                                {intent.description}
                            </p>

                            <div className="flex items-center text-sm font-semibold text-zinc-500 group-hover:text-zinc-200 transition-colors">
                                Select <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>

                            {/* Decorative background glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

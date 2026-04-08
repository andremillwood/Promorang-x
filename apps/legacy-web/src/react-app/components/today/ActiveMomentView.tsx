import { MapPin, Clock } from 'lucide-react';

interface ActiveMomentViewProps {
    moment: {
        title: string;
        hostName: string;
        timeRemaining?: string;
        actionRequired?: string;
        status: 'joined' | 'checked_in' | 'completed';
    };
    onAction?: () => void;
}

export default function ActiveMomentView({ moment, onAction }: ActiveMomentViewProps) {
    return (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-950/20 border border-indigo-500/20 p-8 shadow-2xl animate-in zoom-in duration-500">
            {/* Pulsing Aura */}
            <div className="absolute inset-0 bg-indigo-500/5 animate-pulse" />

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        Live Moment
                    </div>

                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter lowercase italic">You're part of this</h2>
                        <p className="text-sm text-indigo-200/40 font-medium italic">"{moment.title}" with {moment.hostName}</p>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <div className="flex items-center gap-2 text-white/40">
                            <Clock className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{moment.timeRemaining || '2h 15m remaining'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/40">
                            <MapPin className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Local Presence</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                    <button
                        onClick={onAction}
                        className="w-full md:w-auto px-10 py-4 bg-white text-[#08060a] rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                        {moment.actionRequired || 'Check In'}
                    </button>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] lowercase">intentional participation</p>
                </div>
            </div>
        </div>
    );
}

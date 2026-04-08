import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Play, Pause, TrendingUp, Sparkles, ChevronRight, Award, Headphones } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Sound {
    id: string;
    title: string;
    audio_url: string;
    usage_count: number;
    is_verified: boolean;
    creator?: {
        display_name: string;
        username: string;
    };
}

export default function SoundDiscovery() {
    const [sounds, setSounds] = useState<Sound[]>([]);
    const [loading, setLoading] = useState(true);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSounds();
    }, []);

    const fetchSounds = async () => {
        try {
            const response = await fetch('/api/sounds');
            const result = await response.json();
            if (result.status === 'success') {
                setSounds(result.data.sounds);
            }
        } catch (error) {
            console.error('Error fetching sounds:', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePlay = (id: string) => {
        setPlayingId(playingId === id ? null : id);
        // In a real app, this would control an <audio> element or waveform player
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-pr-text-1 tracking-tight flex items-center gap-3">
                        <Music className="text-blue-600 h-10 w-10" />
                        Sound Discovery
                    </h1>
                    <p className="text-pr-text-2 mt-2 text-lg">Pick a sound. Drop content. Get rewards.</p>
                </div>
                <div className="flex gap-3">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-4 py-1 text-sm border-blue-200">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Trending Now
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 px-4 py-1 text-sm border-purple-200">
                        <Sparkles className="mr-2 h-4 w-4" />
                        New Arrivals
                    </Badge>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Card key={i} className="h-48 bg-pr-surface-2 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sounds.map((sound) => (
                        <Card
                            key={sound.id}
                            className="group relative overflow-hidden bg-white border-2 border-transparent hover:border-blue-500/20 transition-all duration-300 rounded-2xl shadow-sm hover:shadow-xl"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-transform"
                                        onClick={() => togglePlay(sound.id)}
                                    >
                                        {playingId === sound.id ? (
                                            <Pause className="text-white h-8 w-8" />
                                        ) : (
                                            <Play className="text-white h-8 w-8 ml-1" />
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-pr-text-1">{sound.usage_count.toLocaleString()}</span>
                                        <p className="text-xs font-bold text-pr-text-2 uppercase tracking-widest">Usages</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-pr-text-1 truncate">{sound.title}</h3>
                                    <p className="text-blue-600 font-medium text-sm">
                                        {sound.creator?.display_name || 'Verified Artist'}
                                    </p>
                                </div>

                                <div className="flex gap-2 mt-auto">
                                    <Button
                                        className="flex-1 bg-pr-text-1 text-white hover:bg-black font-bold h-12 rounded-xl group-hover:bg-blue-600 transition-colors"
                                        onClick={() => navigate(`/sounds/${sound.id}`)}
                                    >
                                        Use Sound
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-12 w-12 p-0 rounded-xl border-2 hover:bg-gray-50 flex items-center justify-center"
                                    >
                                        <Headphones className="h-5 w-5 text-pr-text-2" />
                                    </Button>
                                </div>
                            </div>

                            {/* Background Decoration */}
                            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                <Music size={120} />
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Featured Artist Banner */}
            <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10 md:flex items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <Badge className="bg-white/20 text-white mb-4">Creator Spotlight</Badge>
                        <h2 className="text-4xl font-black mb-4 tracking-tight">Activate your audience.</h2>
                        <p className="text-blue-50 text-lg opacity-90 mb-6">
                            Artists and labels: Upload your sounds here and create drops to drive verified social distribution.
                        </p>
                        <Button size="lg" variant="secondary" className="font-bold rounded-xl px-8">
                            Become a Verified Artist
                        </Button>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-48 h-48 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-3xl animate-pulse">
                            <Award size={80} className="text-white/50" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

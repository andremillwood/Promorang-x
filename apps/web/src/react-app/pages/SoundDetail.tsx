import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Music, Play, Award, Zap, ChevronLeft, ShieldCheck, Share2, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SoundDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sound, setSound] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSound();
    }, [id]);

    const fetchSound = async () => {
        try {
            const response = await fetch(`/api/sounds/${id}`);
            const result = await response.json();
            if (result.status === 'success') {
                setSound(result.data.sound);
            }
        } catch (error) {
            console.error('Error fetching sound:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Sound Activation...</div>;
    if (!sound) return <div className="p-8 text-center text-red-500 font-bold">Sound not found.</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Button
                variant="ghost"
                onClick={() => navigate('/sounds')}
                className="mb-6 hover:bg-gray-100 rounded-full"
            >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Sounds
            </Button>

            <div className="grid md:grid-cols-5 gap-8">
                {/* Left Column: Sound Identity */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="aspect-square bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col items-center justify-center p-8 text-white rounded-[2rem] shadow-2xl relative overflow-hidden group">
                        <Music size={120} className="mb-4 group-hover:scale-110 transition-transform duration-500" />
                        <Button className="h-16 w-16 p-0 rounded-full bg-white text-blue-600 hover:bg-blue-50 shadow-xl active:scale-95 transition-all">
                            <Play fill="currentColor" size={32} />
                        </Button>
                        <div className="absolute top-4 left-4">
                            <Badge className="bg-white/20 backdrop-blur-md text-white border-0">
                                <ShieldCheck className="mr-1 h-3 w-3" />
                                Verified
                            </Badge>
                        </div>
                    </Card>

                    <div className="flex justify-between items-center px-2">
                        <div>
                            <p className="text-3xl font-black text-pr-text-1">{sound.usage_count.toLocaleString()}</p>
                            <p className="text-xs font-bold text-pr-text-2 uppercase tracking-widest">Executions</p>
                        </div>
                        <Button variant="outline" className="rounded-full h-12 w-12 p-0">
                            <Share2 size={20} />
                        </Button>
                    </div>
                </div>

                {/* Right Column: Activation Details */}
                <div className="md:col-span-3 space-y-8">
                    <div>
                        <h1 className="text-5xl font-black text-pr-text-1 tracking-tight leading-none mb-2">{sound.title}</h1>
                        <p className="text-blue-600 text-xl font-bold">{sound.creator?.display_name || 'Official Sound'}</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-pr-text-2 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Zap size={14} className="text-yellow-500" />
                            Available Activation Drops
                        </h3>

                        <Card className="p-5 border-2 border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 transition-colors cursor-pointer rounded-2xl group">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center overflow-hidden">
                                    <Award className="text-blue-600 h-8 w-8" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-pr-text-1 group-hover:text-blue-600 transition-colors">Official Launch Drop</h4>
                                    <p className="text-sm text-pr-text-2">Earn 500 Gems for verified usage.</p>
                                </div>
                                <Badge className="bg-green-100 text-green-700">Active</Badge>
                            </div>
                        </Card>

                        <Card className="p-5 border border-dashed border-gray-300 bg-gray-50 opacity-60 rounded-2xl text-center">
                            <p className="text-sm font-bold text-pr-text-2 italic">More drops being unlocked by sponsors...</p>
                        </Card>
                    </div>

                    <div className="pt-4">
                        <Button className="w-full h-20 bg-pr-text-1 hover:bg-black text-white rounded-3xl text-2xl font-black shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                            <Award size={28} />
                            ACTIVATE NOW
                        </Button>
                        <p className="text-center text-xs text-pr-text-2 mt-4 font-medium flex items-center justify-center gap-1">
                            <Info size={12} />
                            Requires verified Drop participation
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { Camera, MapPin, CheckCircle2, Search, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

export interface EvidenceItem {
    id: string;
    type: 'photo' | 'video' | 'check_in' | 'referral';
    user_name: string;
    action_description: string;
    verification_status: 'verified' | 'pending';
    timestamp: string;
    media_url?: string;
    location?: string;
    reward_issued: string;
}

// Mock data generator to show what a vibrant feed looks like
const generateMockEvidence = (): EvidenceItem[] => {
    return [
        {
            id: '1',
            type: 'photo',
            user_name: '@sarahj_creates',
            action_description: 'First Experience Post',
            verification_status: 'verified',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
            media_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop', // vibrant food
            location: 'Downtown Carnival Hub',
            reward_issued: '50 Keys',
        },
        {
            id: '2',
            type: 'check_in',
            user_name: '@miketravels',
            action_description: 'Venue Arrival',
            verification_status: 'verified',
            timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
            location: 'Main Stage VIP',
            reward_issued: '20 Keys',
        },
        {
            id: '3',
            type: 'referral',
            user_name: '@alexander_t',
            action_description: 'Referred 3 Friends',
            verification_status: 'verified',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            reward_issued: '150 Keys',
        },
        {
            id: '4',
            type: 'photo',
            user_name: '@emily_style',
            action_description: 'Product Showcase',
            verification_status: 'verified',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            media_url: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=400&auto=format&fit=crop', // drinks
            location: 'Festival Grounds',
            reward_issued: '50 Keys',
        }
    ];
};

interface EvidenceFeedProps {
    brandId: string;
    campaignId?: string;
    maxItems?: number;
}

export function EvidenceFeed({ brandId, campaignId, maxItems = 10 }: EvidenceFeedProps) {
    const [items, setItems] = useState<EvidenceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // In a real implementation, we would fetch from `brand_campaign_analytics` 
        // or a dedicated `verified_actions` view joined with `moment_media`.
        // For now, we seed with highly visual mock data to demonstrate the PLG value.
        setTimeout(() => {
            setItems(generateMockEvidence().slice(0, maxItems));
            setIsLoading(false);
        }, 1000);
    }, [brandId, campaignId, maxItems]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'photo':
            case 'video':
                return <Camera className="w-4 h-4 text-purple-500" />;
            case 'check_in':
                return <MapPin className="w-4 h-4 text-emerald-500" />;
            case 'referral':
                return <Search className="w-4 h-4 text-blue-500" />;
            default:
                return <CheckCircle2 className="w-4 h-4 text-primary" />;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-muted/50 rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">Live Verified Actions</h3>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Streaming Evidence</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                {items.map((item) => (
                    <div 
                        key={item.id} 
                        className="bg-card border border-border/60 hover:border-border rounded-xl p-4 flex gap-4 transition-all hover:shadow-soft"
                    >
                        {/* Media or Icon Area */}
                        <div className="flex-shrink-0">
                            {item.media_url ? (
                                <div className="w-20 h-20 rounded-lg overflow-hidden relative group">
                                    <img src={item.media_url} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            ) : (
                                <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                                    {getIcon(item.type)}
                                </div>
                            )}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 min-w-0 py-1">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-bold text-foreground truncate">
                                    {item.user_name}
                                </h4>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                </span>
                            </div>
                            
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                                {item.action_description}
                            </p>

                            <div className="flex items-center gap-2 mt-auto">
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none rounded-sm px-1.5 py-0">
                                    <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                                    GPS Verified
                                </Badge>
                                {item.location && (
                                    <span className="text-xs font-medium text-muted-foreground truncate">
                                        @ {item.location}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Cost/Reward Area */}
                        <div className="flex-shrink-0 text-right py-1">
                            <div className="text-sm font-black text-primary">
                                -{item.reward_issued}
                            </div>
                            <div className="text-[10px] uppercase font-bold text-muted-foreground mt-1">
                                Issued
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="text-center pt-2">
                <button className="text-sm font-bold text-primary hover:underline">
                    View Complete Audit Trail &rarr;
                </button>
            </div>
        </div>
    );
}

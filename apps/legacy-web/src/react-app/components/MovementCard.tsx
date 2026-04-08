import { Share2, TrendingUp, Users, ArrowUpRight } from 'lucide-react';

interface MovementCardProps {
    movement: {
        id: string;
        object_type: string;
        object_id: string;
        relayer_user_id: string;
        downstream_engagement_count: number;
        depth_level: number;
        created_at: string;
        relayer?: {
            username: string;
            avatar_url: string;
        };
        // From content/drop/etc join if added in future, but for now we'll handle gracefully
        content_title?: string;
    };
}

export default function MovementCard({ movement }: MovementCardProps) {
    const getObjectLabel = (type: string) => {
        switch (type) {
            case 'content': return 'Content Piece';
            case 'drop': return 'Drop';
            case 'prediction': return 'Forecast';
            case 'coupon': return 'Coupon';
            default: return 'Opportunity';
        }
    };

    const getObjectColor = (type: string) => {
        switch (type) {
            case 'content': return 'bg-blue-100 text-blue-600';
            case 'drop': return 'bg-orange-100 text-orange-600';
            case 'prediction': return 'bg-purple-100 text-purple-600';
            case 'coupon': return 'bg-green-100 text-green-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const displayTitle = movement.content_title || (movement as any).content?.title || 'Trending Opportunity';

    return (
        <div className="bg-gradient-to-br from-pr-surface-card to-pr-surface-2 rounded-xl border border-pr-surface-3 p-5 shadow-sm hover:shadow-md transition-all border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-500 p-2 rounded-lg">
                        <Share2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="max-w-[150px]">
                        <h4 className="text-sm font-bold text-pr-text-1 truncate">{displayTitle}</h4>
                        <p className="text-xs text-pr-text-2">Propagation in progress</p>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getObjectColor(movement.object_type)}`}>
                    {getObjectLabel(movement.object_type)}
                </div>
            </div>

            <div className="flex items-start space-x-3 mb-4">
                <img
                    src={movement.relayer?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${movement.relayer?.username || 'user'}`}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                    alt="Relayer"
                />
                <div className="flex-1">
                    <p className="text-sm text-pr-text-1 leading-relaxed">
                        <span className="font-bold">@{movement.relayer?.username || 'Someone'}</span> shared a new {getObjectLabel(movement.object_type)}
                    </p>
                    <p className="text-xs text-pr-text-2 mt-1">
                        {new Date(movement.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Level {movement.depth_level} Reach
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-pr-surface-3/50 rounded-lg p-3 flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <div>
                        <p className="text-[10px] text-pr-text-2 uppercase font-bold">Engagement</p>
                        <p className="text-sm font-bold text-pr-text-1">{movement.downstream_engagement_count} Clicks</p>
                    </div>
                </div>
                <div className="bg-pr-surface-3/50 rounded-lg p-3 flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <div>
                        <p className="text-[10px] text-pr-text-2 uppercase font-bold">Reach</p>
                        <p className="text-sm font-bold text-pr-text-1">Tier {Math.min(5, movement.depth_level)}</p>
                    </div>
                </div>
            </div>

            <button className="w-full mt-4 flex items-center justify-center space-x-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">
                <span>Support this Share</span>
                <ArrowUpRight className="w-4 h-4" />
            </button>
        </div>
    );
}

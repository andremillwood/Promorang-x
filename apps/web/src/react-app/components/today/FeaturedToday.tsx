/**
 * FeaturedToday - Internal Content Redistribution
 * 
 * Shows 2-3 tiles of internal Promorang content.
 * Redistributes attention without external dependencies.
 */

import { useNavigate } from 'react-router-dom';
import { Users, MessageCircle } from 'lucide-react';

interface FeaturedItem {
    id: string;
    type: 'promorang_drop' | 'community';
    title: string;
    preview: string;
    accent_color: string;
    drop_id?: string;
}

interface FeaturedTodayProps {
    items: FeaturedItem[];
}

const COLOR_MAP: Record<string, { bg: string; border: string; text: string }> = {
    emerald: { bg: 'from-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    indigo: { bg: 'from-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400' },
    blue: { bg: 'from-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
    purple: { bg: 'from-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
};

export default function FeaturedToday({ items }: FeaturedTodayProps) {
    const navigate = useNavigate();

    if (!items || items.length === 0) {
        return null;
    }

    const handleItemClick = (item: FeaturedItem) => {
        if (item.type === 'promorang_drop') {
            // Take user to Create page - they'll post on social media, then submit the link
            navigate('/create', { state: { prompt: item.title, dropId: item.drop_id } });
        } else {
            navigate('/feed');
        }
    };

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-bold text-pr-text-3 uppercase tracking-widest px-1">
                Featured Today
            </h3>
            <div className="grid grid-cols-1 gap-3">
                {items.map((item) => {
                    const colors = COLOR_MAP[item.accent_color] || COLOR_MAP.blue;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className={`text-left p-4 rounded-xl bg-gradient-to-r ${colors.bg} to-transparent border ${colors.border} hover:scale-[1.01] transition-all group`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-pr-text-1 mb-1 group-hover:text-pr-text-1">
                                        {item.title}
                                    </p>
                                    <p className={`text-xs ${colors.text}`}>
                                        {item.preview}
                                    </p>
                                </div>
                                <div className={`p-2 rounded-lg ${colors.bg.replace('from-', 'bg-')} ${colors.text}`}>
                                    {item.type === 'promorang_drop' ? (
                                        <MessageCircle className="w-4 h-4" />
                                    ) : (
                                        <Users className="w-4 h-4" />
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

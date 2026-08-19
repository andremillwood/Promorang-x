import React from 'react';
import { Users, Calendar, Sparkles, ArrowRight } from 'lucide-react';

export interface SceneProps {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  coverImage: string;
  activeMomentsCount: number;
  activeDiscoveriesCount: number;
  activeParticipantsCount: number;
  creatorsCount: number;
  isJoined?: boolean;
  onJoinToggle?: (id: string) => void;
  onExplore?: (slug: string) => void;
}

export const SceneCard: React.FC<SceneProps> = ({
  id,
  slug,
  name,
  description,
  coverImage,
  activeMomentsCount,
  activeDiscoveriesCount,
  activeParticipantsCount,
  isJoined = false,
  onJoinToggle,
  onExplore
}) => {
  return (
    <div className="group relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      {/* Background Image Container with Overlay */}
      <div className="relative h-44 w-full overflow-hidden bg-gray-900">
        <img
          src={coverImage || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800"}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-white/20">
            Persistent Scene
          </span>
          <button
            onClick={() => onJoinToggle && onJoinToggle(id)}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
              isJoined
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-white text-gray-900 hover:bg-gray-100 shadow-md'
            }`}
          >
            {isJoined ? 'Joined ✓' : '+ Join Scene'}
          </button>
        </div>

        {/* Scene Title overlay */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-xl font-bold text-white tracking-tight leading-snug drop-shadow-sm">
            {name}
          </h3>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
        <p className="text-gray-600 text-xs line-clamp-2 mb-4 leading-relaxed">
          {description}
        </p>

        {/* Activity Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-gray-50 rounded-xl mb-4 text-center">
          <div>
            <div className="flex items-center justify-center text-orange-500 text-xs font-bold mb-0.5">
              <Calendar className="w-3 h-3 mr-1" />
              {activeMomentsCount}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Moments</div>
          </div>

          <div>
            <div className="flex items-center justify-center text-purple-600 text-xs font-bold mb-0.5">
              <Sparkles className="w-3 h-3 mr-1" />
              {activeDiscoveriesCount}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Discoveries</div>
          </div>

          <div>
            <div className="flex items-center justify-center text-blue-600 text-xs font-bold mb-0.5">
              <Users className="w-3 h-3 mr-1" />
              {activeParticipantsCount}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Members</div>
          </div>
        </div>

        {/* Footer CTA */}
        <button
          onClick={() => onExplore && onExplore(slug)}
          className="w-full py-2.5 px-4 bg-gray-900 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center transition-colors duration-200 group/btn"
        >
          <span>Enter Scene Lens</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover/btn:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
};

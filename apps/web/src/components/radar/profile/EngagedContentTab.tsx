import { useState } from 'react';
import { Video, Image, FileText, Heart, Bookmark, Share2, TrendingUp, ExternalLink } from 'lucide-react';
import { ContentPieceType } from '@/shared/types';

interface EngagedContentTabProps {
  uploadedContent: ContentPieceType[];
  engagedContent?: any[];
  isPublic?: boolean;
}

export default function EngagedContentTab({ uploadedContent, engagedContent = [], isPublic = false }: EngagedContentTabProps) {
  const [subTab, setSubTab] = useState<'uploaded' | 'engaged'>('uploaded');

  const getPlatformBadge = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'youtube':
        return <span className="bg-red-50 text-red-600 font-bold text-xs px-2.5 py-0.5 rounded-md">YouTube</span>;
      case 'instagram':
        return <span className="bg-pink-50 text-pink-600 font-bold text-xs px-2.5 py-0.5 rounded-md">Instagram</span>;
      case 'tiktok':
        return <span className="bg-slate-900 text-white font-bold text-xs px-2.5 py-0.5 rounded-md">TikTok</span>;
      case 'twitter':
      default:
        return <span className="bg-blue-50 text-blue-600 font-bold text-xs px-2.5 py-0.5 rounded-md">{platform || 'Social'}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Selection */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setSubTab('uploaded')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            subTab === 'uploaded'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Uploaded Content ({uploadedContent.length})
        </button>
        <button
          onClick={() => setSubTab('engaged')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            subTab === 'engaged'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Heart className="w-4 h-4 text-red-500" />
          Engaged & Saved ({engagedContent.length})
        </button>
      </div>

      {/* Uploaded Content Section */}
      {subTab === 'uploaded' && (
        <div>
          {uploadedContent.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-gray-900">No Uploaded Content</h4>
              <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
                Link social media posts, videos, or social forecasts to feature them on your public profile.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uploadedContent.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-orange-200 transition-all">
                  <div className="flex items-center justify-between">
                    {getPlatformBadge(item.platform)}
                    <a
                      href={item.platform_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-orange-500"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <h5 className="font-bold text-gray-900 text-base mt-3">{item.title}</h5>
                  {item.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>}
                  
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>Shares: {item.total_shares}</span>
                    <span className="font-semibold text-orange-600">${item.share_price}/share</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Engaged & Saved Section */}
      {subTab === 'engaged' && (
        <div>
          {engagedContent.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-gray-900">No Engaged Items</h4>
              <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
                Posts, amplified drops, and social forecasts you interact with will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {engagedContent.map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-md">
                      {item.action_type || 'Saved'}
                    </span>
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  </div>
                  <h5 className="font-bold text-gray-900 text-base mt-2">{item.title || 'Engaged Campaign'}</h5>
                  <p className="text-xs text-gray-500 mt-1">{item.description || 'Interacted with post'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

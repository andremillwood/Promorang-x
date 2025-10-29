import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Search,
  X,
  Star,
  DollarSign,
  FileText,
  Zap,
  Users,
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>({ content: [], drops: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'content' | 'drops' | 'users'>('all');

  const USE_MOCK_DATA = !import.meta.env.VITE_API_BASE_URL;

  const MOCK_CONTENT = [
    {
      id: 'content-demo-1',
      title: 'Launch Campaign: Social Buzz',
      description: 'Highlight reel from the recent product launch activation.',
      platform: 'instagram',
      creator_name: 'Demo Creator',
      share_price: 12.5,
    },
    {
      id: 'content-demo-2',
      title: 'Creator Toolkit Walkthrough',
      description: 'Step-by-step guide on monetizing content in 30 days.',
      platform: 'youtube',
      creator_name: 'Creator Collective',
      share_price: 18.0,
    },
  ];

  const MOCK_DROPS = [
    {
      id: 'drop-demo-1',
      title: 'Product Review Blitz',
      description: 'Create authentic reviews for the new premium bundle.',
      gem_reward_base: 120,
      key_cost: 4,
      status: 'active',
    },
    {
      id: 'drop-demo-2',
      title: 'Launch Day Engagement Sprint',
      description: 'Boost engagement metrics during launch weekend.',
      gem_reward_base: 95,
      key_cost: 3,
      status: 'active',
    },
  ];

  const MOCK_USERS = [
    {
      id: 'user-demo-1',
      username: 'demo_creator',
      display_name: 'Demo Creator',
      user_type: 'creator',
      follower_count: 42000,
    },
    {
      id: 'user-demo-2',
      username: 'growth_analyst',
      display_name: 'Growth Analyst',
      user_type: 'advertiser',
      follower_count: 12500,
    },
  ];

  const buildMockResults = (query: string) => {
    const normalizedQuery = query.toLowerCase();
    const content = MOCK_CONTENT.filter(
      (item) =>
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery),
    );
    const drops = MOCK_DROPS.filter((item) => item.title.toLowerCase().includes(normalizedQuery));
    const users = MOCK_USERS.filter(
      (item) =>
        item.username.toLowerCase().includes(normalizedQuery) ||
        item.display_name.toLowerCase().includes(normalizedQuery),
    );

    return { content, drops, users };
  };

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults({ content: [], drops: [], users: [] });
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;

    if (USE_MOCK_DATA) {
      setSearchResults(buildMockResults(searchQuery));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      } else {
        setSearchResults(buildMockResults(searchQuery));
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults(buildMockResults(searchQuery));
    } finally {
      setLoading(false);
    }
  };

  const getFilteredResults = () => {
    switch (activeTab) {
      case 'content':
        return { content: searchResults.content, drops: [], users: [] };
      case 'drops':
        return { content: [], drops: searchResults.drops, users: [] };
      case 'users':
        return { content: [], drops: [], users: searchResults.users };
      default:
        return searchResults;
    }
  };

  const getTotalResults = () => {
    return (searchResults.content?.length || 0) + 
           (searchResults.drops?.length || 0) + 
           (searchResults.users?.length || 0);
  };

  if (!isOpen) return null;

  const filteredResults = getFilteredResults();
  const totalResults = getTotalResults();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Search Promorang</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for content, drops, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
              autoFocus
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        {searchQuery.length >= 2 && totalResults > 0 && (
          <div className="px-6 py-3 border-b border-gray-200">
            <div className="flex space-x-4">
              {[
                { id: 'all', label: 'All', count: totalResults },
                { id: 'content', label: 'Content', count: searchResults.content?.length || 0 },
                { id: 'drops', label: 'Drops', count: searchResults.drops?.length || 0 },
                { id: 'users', label: 'Users', count: searchResults.users?.length || 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {searchQuery.length < 2 ? (
            <div className="p-12 text-center">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Promorang</h3>
              <p className="text-gray-600">Find content, drops, and users across the platform</p>
            </div>
          ) : totalResults === 0 && !loading ? (
            <div className="p-12 text-center">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try different keywords or browse categories</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Content Results */}
              {filteredResults.content?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-orange-600" />
                    Content ({filteredResults.content.length})
                  </h3>
                  <div className="space-y-3">
                    {filteredResults.content.map((content: any) => (
                      <Link
                        key={content.id}
                        to={`/content/${content.id}`}
                        onClick={onClose}
                        className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Star className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{content.title}</h4>
                          <p className="text-sm text-gray-600 truncate">{content.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500 capitalize">{content.platform}</span>
                            <span className="text-xs text-gray-500">by {content.creator_name}</span>
                            <span className="text-xs font-medium text-green-600">${content.share_price}/share</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Drops Results */}
              {filteredResults.drops?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-purple-600" />
                    Drops ({filteredResults.drops.length})
                  </h3>
                  <div className="space-y-3">
                    {filteredResults.drops.map((drop: any) => (
                      <Link
                        key={drop.id}
                        to="/earn"
                        onClick={onClose}
                        className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{drop.title}</h4>
                          <p className="text-sm text-gray-600 truncate">{drop.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500 capitalize">
                              {(drop.drop_type || 'engagement').replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-500">by {drop.creator_name || 'Promorang Team'}</span>
                            <span className="text-xs font-medium text-purple-600">{drop.gem_reward_base ?? 0} gems</span>
                            <span className="text-xs text-gray-500">{drop.current_participants ?? 0} participants</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Users Results */}
              {filteredResults.users?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Users ({filteredResults.users.length})
                  </h3>
                  <div className="space-y-3">
                    {filteredResults.users.map((user: any) => (
                      <Link
                        key={user.id}
                        to={`/users/${user.username || user.id}`}
                        onClick={onClose}
                        className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <img
                            src={user.avatar_url || '/default-avatar.png'}
                            alt={user.display_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {user.display_name || 'Anonymous User'}
                          </h4>
                          <p className="text-sm text-gray-600">@{user.username || 'user'}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">Level {user.level}</span>
                            <span className="text-xs text-gray-500 capitalize">{user.user_tier} tier</span>
                            <span className="text-xs text-gray-500">{user.follower_count} followers</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

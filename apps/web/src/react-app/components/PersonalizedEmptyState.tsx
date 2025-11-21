import React from 'react';
import { TrendingUp, Plus, RefreshCw } from 'lucide-react';

const PersonalizedEmptyState: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <TrendingUp className="w-12 h-12 text-orange-500" />
      </div>
      <h3 className="text-xl font-semibold text-pr-text-1 mb-2">
        No personalized content yet
      </h3>
      <p className="text-pr-text-2 mb-6 max-w-md mx-auto">
        We're building your personalized feed based on your interests and activity.
        Check back soon or explore other content in the meantime!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => window.location.href = '/create'}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 mx-auto sm:mx-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Content</span>
        </button>
        <button
          onClick={handleRefresh}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-2 mx-auto sm:mx-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Feed</span>
        </button>
      </div>
    </div>
  );
};

export default PersonalizedEmptyState;

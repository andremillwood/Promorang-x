import { TrendingUp, Zap, Trophy, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RightSidebarProps {
  userData?: any;
}

export default function RightSidebar({ userData }: RightSidebarProps) {
  return (
    <div className="flex flex-col w-full h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Trending Section */}
        <div className="bg-pr-surface-card rounded-xl border border-pr-border p-4">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-pr-text-1">Trending Now</h3>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Product Launch Campaign', engagement: '12.5K' },
              { title: 'Creator Toolkit Guide', engagement: '8.2K' },
              { title: 'Social Buzz Challenge', engagement: '6.7K' }
            ].map((item, idx) => (
              <Link
                key={idx}
                to="/earn"
                className="block p-3 rounded-lg hover:bg-pr-surface-2 transition-colors"
              >
                <div className="text-sm font-medium text-pr-text-1 mb-1">{item.title}</div>
                <div className="text-xs text-pr-text-2">{item.engagement} engaged</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        {userData && (
          <div className="bg-pr-surface-2 rounded-xl border border-pr-border p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-pr-text-1">Your Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-pr-text-1">Total Earnings</span>
                <span className="text-sm font-bold text-orange-600">
                  {((userData?.points_balance || 0) + (userData?.gems_balance || 0)).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-pr-text-1">Tier</span>
                <span className="text-sm font-bold text-purple-600 capitalize">
                  {userData?.user_tier || 'Free'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-pr-text-1">Rank</span>
                <span className="text-sm font-bold text-blue-600">
                  #{Math.floor(Math.random() * 1000) + 1}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Opportunities */}
        <div className="bg-pr-surface-card rounded-xl border border-pr-border p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Gift className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-pr-text-1">Hot Opportunities</h3>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Product Review Blitz', reward: '120 gems', keys: 4 },
              { title: 'Launch Day Sprint', reward: '95 gems', keys: 3 },
              { title: 'Content Creation', reward: '150 gems', keys: 5 }
            ].map((item, idx) => (
              <Link
                key={idx}
                to="/earn"
                className="block p-3 rounded-lg hover:bg-pr-surface-2 transition-colors border border-pr-surface-3"
              >
                <div className="text-sm font-medium text-pr-text-1 mb-1">{item.title}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-600 font-medium">{item.reward}</span>
                  <span className="text-pr-text-2">{item.keys} keys</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Achievements Preview */}
        <div className="bg-pr-surface-card rounded-xl border border-pr-border p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-pr-text-1">Recent Achievements</h3>
          </div>
          <div className="space-y-2">
            {[
              { name: 'First Drop', icon: '🎯' },
              { name: 'Social Butterfly', icon: '🦋' },
              { name: 'Early Adopter', icon: '🚀' }
            ].map((achievement, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 p-2 rounded-lg bg-pr-surface-2"
              >
                <span className="text-2xl">{achievement.icon}</span>
                <span className="text-sm font-medium text-pr-text-1">{achievement.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

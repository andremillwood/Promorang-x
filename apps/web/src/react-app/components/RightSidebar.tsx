import { Trophy, Gift, Users, Rocket, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RightSidebarProps {
  userData?: any;
}

export default function RightSidebar({ userData }: RightSidebarProps) {
  return (
    <div className="flex flex-col w-full h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Referral Progress - HIGH VALUE (Platform Growth) */}
        {userData && (
          <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="w-5 h-5" />
              <h3 className="font-bold">Referral Growth</h3>
            </div>
            <p className="text-xs text-white/90 mb-4">Invite 3 more friends to unlock the <span className="font-bold">Silver Tier</span> and 6% commission!</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Progress</span>
                <span>7/10</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full w-[70%]" />
              </div>
            </div>
            <Link 
              to="/referrals" 
              className="mt-4 block w-full py-2 bg-white text-orange-600 rounded-lg text-center text-sm font-bold hover:bg-orange-50 transition-colors"
            >
              Get Invite Link
            </Link>
          </div>
        )}

        {/* Season Pass Status - MONETIZATION */}
        <div className="bg-pr-surface-card rounded-xl border border-pr-border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Rocket className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-pr-text-1">Season Hub</h3>
            </div>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
          </div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-2xl">
              🌊
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-pr-text-1 truncate">Summer Jam 2024</p>
              <p className="text-xs text-pr-text-2">Ends in 14 days</p>
            </div>
          </div>
          <Link 
            to="/club/summerjam" 
            className="flex items-center justify-center space-x-2 w-full py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            <span>Enter Hub</span>
          </Link>
        </div>

        {/* Hot Opportunities - PERFORMANCE */}
        <div className="bg-pr-surface-card rounded-xl border border-pr-border p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-pr-text-1">Earn More Gems</h3>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Review: Premium Bundle', reward: '120 gems', urgency: 'Ending soon' },
              { title: 'Share: Launch Video', reward: '45 gems', urgency: 'High yield' },
            ].map((item, idx) => (
              <Link
                key={idx}
                to="/earn"
                className="block p-3 rounded-lg hover:bg-pr-surface-2 transition-colors border border-pr-surface-3 group"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-pr-text-1 group-hover:text-orange-600 transition-colors">{item.title}</span>
                  <span className="text-[10px] text-orange-600 font-bold uppercase">{item.urgency}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Gift className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-purple-600 font-bold">{item.reward}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Global Leaderboard - RETENTION */}
        <div className="bg-pr-surface-card rounded-xl border border-pr-border p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-pr-text-1">Leaderboard</h3>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Alex M.', points: '12,450', rank: 1, avatar: '👤' },
              { name: 'Sarah J.', points: '10,120', rank: 2, avatar: '👤' },
              { name: 'You', points: '8,450', rank: 42, isMe: true, avatar: '👤' }
            ].map((user, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-2 rounded-lg ${user.isMe ? 'bg-orange-50 ring-1 ring-orange-200' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`text-xs font-bold w-4 ${user.rank === 1 ? 'text-yellow-600' : user.rank === 2 ? 'text-gray-400' : 'text-pr-text-2'}`}>
                    {user.rank}
                  </span>
                  <span className="text-sm font-medium text-pr-text-1">{user.name}</span>
                </div>
                <span className="text-xs font-bold text-pr-text-2">{user.points}</span>
              </div>
            ))}
          </div>
          <Link to="/leaderboard" className="mt-4 block text-center text-xs text-pr-text-2 hover:text-orange-600 font-medium">
            View All Rankings
          </Link>
        </div>
      </div>
    </div>
  );
}

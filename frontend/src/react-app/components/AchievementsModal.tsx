import { useState, useEffect } from 'react';
import { X, Trophy, Star, Award, Lock, CheckCircle, Gift } from 'lucide-react';
import { UserType } from '@/shared/types';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria_type: string;
  criteria_value: number;
  criteria_field: string;
  gold_reward: number;
  xp_reward: number;
  is_completed: boolean;
  progress: number;
}

interface AchievementsModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AchievementsModal({ user, isOpen, onClose }: AchievementsModalProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    if (isOpen && user) {
      fetchAchievements();
    }
  }, [isOpen, user]);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/users/achievements', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        setAchievements(Array.isArray(data) ? data : []);
      } else {
        // API endpoint doesn't exist yet, use mock data
        console.log('Achievements API not available, using mock data');
        setAchievements(getMockAchievements());
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      // Use mock data as fallback
      setAchievements(getMockAchievements());
    } finally {
      setLoading(false);
    }
  };

  const getMockAchievements = (): Achievement[] => {
    return [
      {
        id: 1,
        name: 'First Steps',
        description: 'Complete your first drop application',
        icon: 'star',
        category: 'progression',
        criteria_type: 'count',
        criteria_value: 1,
        criteria_field: 'applications',
        gold_reward: 5,
        xp_reward: 100,
        is_completed: false,
        progress: 0
      },
      {
        id: 2,
        name: 'Content Creator',
        description: 'Share your first piece of content',
        icon: 'file-text',
        category: 'creation',
        criteria_type: 'count',
        criteria_value: 1,
        criteria_field: 'content_pieces',
        gold_reward: 10,
        xp_reward: 200,
        is_completed: false,
        progress: 0
      },
      {
        id: 3,
        name: 'Social Butterfly',
        description: 'Reach 100 followers',
        icon: 'users',
        category: 'social',
        criteria_type: 'count',
        criteria_value: 100,
        criteria_field: 'followers',
        gold_reward: 25,
        xp_reward: 500,
        is_completed: false,
        progress: user?.follower_count || 0
      },
      {
        id: 4,
        name: 'Level Up',
        description: 'Reach level 5',
        icon: 'arrow-up',
        category: 'progression',
        criteria_type: 'level',
        criteria_value: 5,
        criteria_field: 'level',
        gold_reward: 15,
        xp_reward: 300,
        is_completed: (user?.level || 0) >= 5,
        progress: user?.level || 0
      },
      {
        id: 5,
        name: 'Big Spender',
        description: 'Earn 1000 points',
        icon: 'coins',
        category: 'earning',
        criteria_type: 'count',
        criteria_value: 1000,
        criteria_field: 'points',
        gold_reward: 20,
        xp_reward: 400,
        is_completed: (user?.points_balance || 0) >= 1000,
        progress: user?.points_balance || 0
      },
      {
        id: 6,
        name: 'Master Creator',
        description: 'Create 5 pieces of content',
        icon: 'crown',
        category: 'creation',
        criteria_type: 'count',
        criteria_value: 5,
        criteria_field: 'content_pieces',
        gold_reward: 50,
        xp_reward: 1000,
        is_completed: false,
        progress: 0
      }
    ];
  };
  const claimAchievement = async (achievementId: number) => {
    try {
      const response = await fetch(`/api/users/achievements/${achievementId}/claim`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        // Show reward notification
        showRewardNotification(result.gold_reward, result.xp_reward);
        // Refresh achievements
        fetchAchievements();
      }
    } catch (error) {
      console.error('Failed to claim achievement:', error);
    }
  };

  const showRewardNotification = (gold: number, xp: number) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-xl shadow-lg z-50 animate-pulse';
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
        <div>
          <div class="font-bold">Achievement Unlocked!</div>
          <div class="text-sm">+${gold} Gold, +${xp} XP</div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 4000);
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'star': Star,
      'file-text': Award,
      'zap': Trophy,
      'heart': Star,
      'calendar': Award,
      'crown': Trophy,
      'trophy': Trophy,
      'arrow-up': Star,
      'coins': Award,
      'users': Star,
    };
    const IconComponent = iconMap[iconName] || Star;
    return <IconComponent className="w-6 h-6" />;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'engagement': 'from-blue-500 to-cyan-500',
      'creation': 'from-purple-500 to-pink-500',
      'earning': 'from-green-500 to-emerald-500',
      'progression': 'from-orange-500 to-red-500',
      'currency': 'from-yellow-500 to-amber-500',
      'social': 'from-indigo-500 to-purple-500',
    };
    return colorMap[category] || 'from-gray-500 to-slate-500';
  };

  const categories = achievements && achievements.length > 0 ? ['all', ...new Set(achievements.map(a => a.category))] : ['all'];
  const filteredAchievements = achievements && achievements.length > 0
    ? (activeCategory === 'all'
        ? achievements
        : achievements.filter(a => a.category === activeCategory))
    : [];

  const completedCount = achievements && achievements.length > 0 ? achievements.filter(a => a.is_completed).length : 0;
  const totalGoldEarned = achievements && achievements.length > 0
    ? achievements
        .filter(a => a.is_completed)
        .reduce((sum, a) => sum + a.gold_reward, 0)
    : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Achievements</h2>
                <p className="text-yellow-100">Track your progress and earn rewards</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-yellow-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{completedCount}</div>
              <div className="text-yellow-100 text-sm">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{achievements?.length || 0}</div>
              <div className="text-yellow-100 text-sm">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalGoldEarned}</div>
              <div className="text-yellow-100 text-sm">Gold Earned</div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  activeCategory === category
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAchievements && filteredAchievements.length > 0 ? filteredAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`relative p-6 rounded-2xl border transition-all duration-200 ${
                    achievement.is_completed
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-white hover:shadow-md'
                  }`}
                >
                  {/* Achievement Icon */}
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${getCategoryColor(achievement.category)} text-white`}>
                      {getIconComponent(achievement.icon)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                        {achievement.is_completed && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>

                      {/* Progress Bar */}
                      {!achievement.is_completed && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress}/{achievement.criteria_value}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full bg-gradient-to-r ${getCategoryColor(achievement.category)}`}
                              style={{ width: `${Math.min(100, (achievement.progress / achievement.criteria_value) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Rewards */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-sm">
                          {achievement.gold_reward > 0 && (
                            <div className="flex items-center space-x-1 text-yellow-600">
                              <Gift className="w-4 h-4" />
                              <span>{achievement.gold_reward} Gold</span>
                            </div>
                          )}
                          {achievement.xp_reward > 0 && (
                            <div className="flex items-center space-x-1 text-blue-600">
                              <Star className="w-4 h-4" />
                              <span>{achievement.xp_reward} XP</span>
                            </div>
                          )}
                        </div>

                        {/* Claim Button */}
                        {achievement.progress >= achievement.criteria_value && !achievement.is_completed && (
                          <button
                            onClick={() => claimAchievement(achievement.id)}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                          >
                            Claim
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Locked Overlay */}
                  {achievement.progress < achievement.criteria_value && !achievement.is_completed && (
                    <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-2xl flex items-center justify-center">
                      <Lock className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              )) : (
                <div className="col-span-full text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Achievements Yet</h3>
                  <p className="text-gray-600">Complete tasks and reach milestones to unlock achievements!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

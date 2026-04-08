import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Users,
  TrendingUp,
  Award,
  DollarSign,
  ChevronRight,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Crown,
  Gem,
  Target,
  UserPlus,
  Calendar,
  Wallet,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { useAuthStore } from '@/store/authStore';
import colors from '@/constants/colors';

const { width } = Dimensions.get('window');

// Types
interface MatrixRank {
  id: string;
  rank_key: string;
  rank_name: string;
  badge_icon: string;
  badge_color: string;
  weekly_cap_cents: number;
  eligible_depth: number;
  min_active_recruits: number;
  min_team_size: number;
}

interface Recruit {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  subscription_status: 'active' | 'past_due' | 'canceled';
  tier: string;
  joined_at: string;
  level: number;
}

interface EarningEntry {
  id: string;
  source_type: string;
  amount_cents: number;
  status: string;
  created_at: string;
  metadata_json: any;
}

interface QualificationStatus {
  status: 'pass' | 'fail' | 'pending';
  active_recruits_count: number;
  total_team_size: number;
  retention_rate: number;
  support_actions_count: number;
  reasons_json: string[];
}

interface MatrixDashboardData {
  current_rank: MatrixRank;
  next_rank: MatrixRank | null;
  total_earnings_cents: number;
  pending_earnings_cents: number;
  this_period_earnings_cents: number;
  direct_recruits: Recruit[];
  team_size: number;
  active_team_count: number;
  qualification_status: QualificationStatus;
  recent_earnings: EarningEntry[];
  support_actions_this_period: number;
  support_actions_required: number;
}

// Mock data for demo
const mockMatrixData: MatrixDashboardData = {
  current_rank: {
    id: '1',
    rank_key: 'rising_star',
    rank_name: 'Rising Star',
    badge_icon: '⭐',
    badge_color: '#8b5cf6',
    weekly_cap_cents: 1000000,
    eligible_depth: 2,
    min_active_recruits: 3,
    min_team_size: 5,
  },
  next_rank: {
    id: '2',
    rank_key: 'team_leader',
    rank_name: 'Team Leader',
    badge_icon: '🌙',
    badge_color: '#a855f7',
    weekly_cap_cents: 1500000,
    eligible_depth: 3,
    min_active_recruits: 5,
    min_team_size: 15,
  },
  total_earnings_cents: 900000,
  pending_earnings_cents: 475000,
  this_period_earnings_cents: 100000,
  direct_recruits: [
    { id: '1', username: 'sarah_partner', display_name: 'Sarah Johnson', avatar_url: '', subscription_status: 'active', tier: 'user_50', joined_at: '2025-11-10', level: 1 },
    { id: '2', username: 'mike_partner', display_name: 'Mike Chen', avatar_url: '', subscription_status: 'active', tier: 'user_50', joined_at: '2025-11-25', level: 1 },
    { id: '3', username: 'emma_partner', display_name: 'Emma Williams', avatar_url: '', subscription_status: 'active', tier: 'user_100', joined_at: '2025-12-10', level: 1 },
    { id: '4', username: 'james_partner', display_name: 'James Brown', avatar_url: '', subscription_status: 'past_due', tier: 'user_50', joined_at: '2025-10-25', level: 1 },
    { id: '5', username: 'lisa_partner', display_name: 'Lisa Davis', avatar_url: '', subscription_status: 'active', tier: 'user_100', joined_at: '2025-11-05', level: 1 },
    { id: '6', username: 'david_partner', display_name: 'David Wilson', avatar_url: '', subscription_status: 'canceled', tier: 'user_50', joined_at: '2025-11-20', level: 1 },
  ],
  team_size: 12,
  active_team_count: 9,
  qualification_status: {
    status: 'pass',
    active_recruits_count: 6,
    total_team_size: 12,
    retention_rate: 0.75,
    support_actions_count: 9,
    reasons_json: ['All requirements met'],
  },
  recent_earnings: [
    { id: '1', source_type: 'team_bonus', amount_cents: 500, status: 'pending', created_at: new Date().toISOString(), metadata_json: { partner: 'sarah_partner' } },
    { id: '2', source_type: 'team_bonus', amount_cents: 500, status: 'pending', created_at: new Date().toISOString(), metadata_json: { partner: 'mike_partner' } },
    { id: '3', source_type: 'team_bonus', amount_cents: 1000, status: 'eligible', created_at: new Date(Date.now() - 86400000).toISOString(), metadata_json: { partner: 'emma_partner' } },
  ],
  support_actions_this_period: 4,
  support_actions_required: 3,
};

export default function MatrixDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<MatrixDashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'earnings'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setData(mockMatrixData);
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.success;
      case 'past_due': return colors.warning;
      case 'canceled': return colors.error;
      default: return colors.darkGray;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle size={14} color={colors.success} />;
      case 'past_due': return <AlertCircle size={14} color={colors.warning} />;
      case 'canceled': return <AlertCircle size={14} color={colors.error} />;
      default: return null;
    }
  };

  if (isLoading) {
    return <LoadingIndicator fullScreen text="Loading Matrix Dashboard..." />;
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load Matrix data</Text>
        <Button title="Retry" onPress={loadData} variant="primary" />
      </View>
    );
  }

  const rankProgress = data.next_rank
    ? (data.qualification_status.active_recruits_count / data.next_rank.min_active_recruits) * 100
    : 100;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Rank Header */}
      <LinearGradient
        colors={['#7c3aed', '#a855f7', '#c084fc']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.rankHeader}
      >
        <View style={styles.rankBadge}>
          <Text style={styles.rankEmoji}>{data.current_rank.badge_icon}</Text>
        </View>
        <Text style={styles.rankName}>{data.current_rank.rank_name}</Text>
        <Text style={styles.rankSubtitle}>Growth Partner</Text>
        
        {data.next_rank && (
          <View style={styles.nextRankContainer}>
            <Text style={styles.nextRankLabel}>Next: {data.next_rank.rank_name}</Text>
            <View style={styles.progressContainer}>
              <ProgressBar 
                progress={rankProgress / 100} 
                height={8} 
                progressColor="#fff"
                backgroundColor="rgba(255,255,255,0.3)"
              />
            </View>
            <Text style={styles.progressText}>
              {data.qualification_status.active_recruits_count} / {data.next_rank.min_active_recruits} active partners
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
            <DollarSign size={20} color="#16A34A" />
          </View>
          <Text style={styles.statValue}>{formatCurrency(data.total_earnings_cents)}</Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Clock size={20} color="#D97706" />
          </View>
          <Text style={styles.statValue}>{formatCurrency(data.pending_earnings_cents)}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#E0E7FF' }]}>
            <Users size={20} color="#4F46E5" />
          </View>
          <Text style={styles.statValue}>{data.team_size}</Text>
          <Text style={styles.statLabel}>Team Size</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FCE7F3' }]}>
            <TrendingUp size={20} color="#DB2777" />
          </View>
          <Text style={styles.statValue}>{Math.round(data.qualification_status.retention_rate * 100)}%</Text>
          <Text style={styles.statLabel}>Retention</Text>
        </Card>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {(['overview', 'team', 'earnings'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Qualification Status */}
          <Card style={styles.qualificationCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Target size={20} color={colors.primary} />
                <Text style={styles.cardTitle}>Qualification Status</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: data.qualification_status.status === 'pass' ? '#DCFCE7' : '#FEF3C7' }
              ]}>
                {data.qualification_status.status === 'pass' 
                  ? <CheckCircle size={14} color="#16A34A" />
                  : <AlertCircle size={14} color="#D97706" />
                }
                <Text style={[
                  styles.statusText,
                  { color: data.qualification_status.status === 'pass' ? '#16A34A' : '#D97706' }
                ]}>
                  {data.qualification_status.status === 'pass' ? 'Qualified' : 'Pending'}
                </Text>
              </View>
            </View>

            <View style={styles.qualificationGrid}>
              <View style={styles.qualItem}>
                <Text style={styles.qualValue}>{data.qualification_status.active_recruits_count}</Text>
                <Text style={styles.qualLabel}>Active Partners</Text>
              </View>
              <View style={styles.qualItem}>
                <Text style={styles.qualValue}>{data.support_actions_this_period}/{data.support_actions_required}</Text>
                <Text style={styles.qualLabel}>Support Actions</Text>
              </View>
              <View style={styles.qualItem}>
                <Text style={styles.qualValue}>{Math.round(data.qualification_status.retention_rate * 100)}%</Text>
                <Text style={styles.qualLabel}>Retention Rate</Text>
              </View>
            </View>
          </Card>

          {/* This Period */}
          <Card style={styles.periodCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Calendar size={20} color={colors.primary} />
                <Text style={styles.cardTitle}>This Period</Text>
              </View>
            </View>
            <View style={styles.periodStats}>
              <View style={styles.periodStat}>
                <Text style={styles.periodValue}>{formatCurrency(data.this_period_earnings_cents)}</Text>
                <Text style={styles.periodLabel}>Earnings</Text>
              </View>
              <View style={styles.periodDivider} />
              <View style={styles.periodStat}>
                <Text style={styles.periodValue}>{data.active_team_count}</Text>
                <Text style={styles.periodLabel}>Active Members</Text>
              </View>
            </View>
          </Card>

          {/* Quick Actions */}
          <Card style={styles.actionsCard}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/referrals')}>
                <View style={[styles.actionIcon, { backgroundColor: '#E0E7FF' }]}>
                  <UserPlus size={20} color="#4F46E5" />
                </View>
                <Text style={styles.actionText}>Invite</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/matrix/training')}>
                <View style={[styles.actionIcon, { backgroundColor: '#FCE7F3' }]}>
                  <Award size={20} color="#DB2777" />
                </View>
                <Text style={styles.actionText}>Training</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/withdraw')}>
                <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
                  <Wallet size={20} color="#16A34A" />
                </View>
                <Text style={styles.actionText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </>
      )}

      {activeTab === 'team' && (
        <Card style={styles.teamCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Team Members ({data.direct_recruits.length})</Text>
          </View>
          {data.direct_recruits.map((recruit) => (
            <TouchableOpacity 
              key={recruit.id} 
              style={styles.recruitItem}
              onPress={() => router.push(`/profile/${recruit.id}`)}
            >
              <View style={styles.recruitAvatar}>
                <Text style={styles.recruitInitial}>
                  {recruit.display_name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.recruitInfo}>
                <Text style={styles.recruitName}>{recruit.display_name}</Text>
                <View style={styles.recruitMeta}>
                  {getStatusIcon(recruit.subscription_status)}
                  <Text style={[styles.recruitStatus, { color: getStatusColor(recruit.subscription_status) }]}>
                    {recruit.subscription_status.replace('_', ' ')}
                  </Text>
                  <Text style={styles.recruitTier}>• {recruit.tier.replace('user_', '$')}/mo</Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.darkGray} />
            </TouchableOpacity>
          ))}
        </Card>
      )}

      {activeTab === 'earnings' && (
        <>
          <Card style={styles.earningsCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Earnings Summary</Text>
            </View>
            <View style={styles.earningsSummary}>
              <View style={styles.earningRow}>
                <Text style={styles.earningLabel}>Total Earned (All Time)</Text>
                <Text style={styles.earningValue}>{formatCurrency(data.total_earnings_cents)}</Text>
              </View>
              <View style={styles.earningRow}>
                <Text style={styles.earningLabel}>Pending Payout</Text>
                <Text style={[styles.earningValue, { color: colors.warning }]}>
                  {formatCurrency(data.pending_earnings_cents)}
                </Text>
              </View>
              <View style={styles.earningRow}>
                <Text style={styles.earningLabel}>This Period</Text>
                <Text style={[styles.earningValue, { color: colors.success }]}>
                  {formatCurrency(data.this_period_earnings_cents)}
                </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.recentEarningsCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Recent Activity</Text>
            </View>
            {data.recent_earnings.map((earning) => (
              <View key={earning.id} style={styles.earningItem}>
                <View style={[styles.earningIcon, { backgroundColor: '#DCFCE7' }]}>
                  <DollarSign size={16} color="#16A34A" />
                </View>
                <View style={styles.earningInfo}>
                  <Text style={styles.earningType}>
                    {earning.source_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                  <Text style={styles.earningMeta}>
                    From @{earning.metadata_json?.partner || 'team member'}
                  </Text>
                </View>
                <View style={styles.earningAmount}>
                  <Text style={styles.earningAmountText}>+{formatCurrency(earning.amount_cents)}</Text>
                  <Text style={[
                    styles.earningStatus,
                    { color: earning.status === 'pending' ? colors.warning : colors.success }
                  ]}>
                    {earning.status}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </>
      )}

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  content: {
    paddingBottom: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 16,
  },
  rankHeader: {
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  rankBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankEmoji: {
    fontSize: 40,
  },
  rankName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  rankSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  nextRankContainer: {
    width: '100%',
    marginTop: 8,
  },
  nextRankLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 6,
  },
  progressText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
    marginTop: -20,
  },
  statCard: {
    width: (width - 44) / 2,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.darkGray,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
  },
  activeTabText: {
    color: '#fff',
  },
  qualificationCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  qualificationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  qualItem: {
    alignItems: 'center',
  },
  qualValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
  },
  qualLabel: {
    fontSize: 11,
    color: colors.darkGray,
    marginTop: 2,
  },
  periodCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  periodStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodStat: {
    flex: 1,
    alignItems: 'center',
  },
  periodValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  periodLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 2,
  },
  periodDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.lightGray,
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.black,
  },
  teamCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  recruitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  recruitAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recruitInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  recruitInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recruitName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
  },
  recruitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  recruitStatus: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  recruitTier: {
    fontSize: 12,
    color: colors.darkGray,
  },
  earningsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  earningsSummary: {
    gap: 12,
  },
  earningRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningLabel: {
    fontSize: 14,
    color: colors.darkGray,
  },
  earningValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  recentEarningsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  earningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  earningIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earningInfo: {
    flex: 1,
    marginLeft: 12,
  },
  earningType: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
  },
  earningMeta: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 2,
  },
  earningAmount: {
    alignItems: 'flex-end',
  },
  earningAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  earningStatus: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  bottomSpacer: {
    height: 40,
  },
});

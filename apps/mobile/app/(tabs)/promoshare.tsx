import { StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator, View as RNView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing, BorderRadius } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { usePromoShareDashboard, usePromoShareHistory, usePromoSharePrizes } from '@/hooks/usePromoShare';
import { useUserBalance } from '@/hooks/useEconomy';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

export default function PromoShareScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeTab, setActiveTab] = useState<'overview' | 'prizes' | 'history' | 'how'>('overview');

  const { data: dashboard, loading: dashboardLoading } = usePromoShareDashboard();
  const { history, loading: historyLoading } = usePromoShareHistory();
  const { unclaimedPrizes, loading: prizesLoading, claimPrize, claiming } = usePromoSharePrizes();
  const { balance } = useUserBalance();

  if (dashboardLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
        <ActivityIndicator size="large" color={DesignColors.primary} />
      </View>
    );
  }

  const activeCycles = dashboard?.active_cycles || [];
  const userStats = dashboard?.user_stats_by_cycle || [];
  const totalWon = dashboard?.total_won_all_time || 0;
  const totalEntries = dashboard?.total_entries_all_time || 0;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
          PromoShare
        </Text>
        <Pressable style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color={DesignColors.primary} />
        </Pressable>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {(['overview', 'prizes', 'history', 'how'] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { backgroundColor: DesignColors.primary },
              tab === 'prizes' && unclaimedPrizes.length > 0 && activeTab !== 'prizes' && styles.tabHasBadge
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && { color: DesignColors.white }
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'prizes' && unclaimedPrizes.length > 0 && (
                <Text style={styles.tabBadge}> ({unclaimedPrizes.length})</Text>
              )}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && (
          <>
            {/* Hero Stats Card */}
            <LinearGradient
              colors={[DesignColors.primary, DesignColors.secondary]}
              style={styles.heroCard}
            >
              <View style={styles.heroHeader}>
                <Text style={styles.heroLabel}>TOTAL WON</Text>
                <Ionicons name="trophy" size={24} color={DesignColors.white} />
              </View>
              <Text style={styles.heroValue}>{totalWon.toLocaleString()} <Text style={styles.heroUnit}>GEMS</Text></Text>
              
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{totalEntries}</Text>
                  <Text style={styles.heroStatLabel}>Entries</Text>
                </View>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{activeCycles.length}</Text>
                  <Text style={styles.heroStatLabel}>Active Cycles</Text>
                </View>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{history.length}</Text>
                  <Text style={styles.heroStatLabel}>Wins</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Active Cycles */}
            <Text style={[styles.sectionTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
              Active Cycles
            </Text>
            
            {activeCycles.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                <Ionicons name="time-outline" size={48} color={DesignColors.gray[400]} />
                <Text style={styles.emptyText}>No active cycles right now</Text>
                <Text style={styles.emptySubtext}>Check back soon for new opportunities!</Text>
              </View>
            ) : (
              activeCycles.map((cycle) => {
                const stats = userStats.find(s => s.cycle_id === cycle.id);
                const progress = stats ? (stats.verified_actions_count / 3) * 100 : 0;
                const isEligible = stats?.eligibility_status === 'eligible' || stats?.eligibility_status === 'qualified';
                
                return (
                  <Pressable
                    key={cycle.id}
                    style={[styles.cycleCard, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}
                    onPress={() => router.push(`/promoshare/cycle/${cycle.id}`)}
                  >
                    <View style={styles.cycleHeader}>
                      <View>
                        <Text style={[styles.cycleName, { color: isDark ? DesignColors.white : DesignColors.black }]}>
                          {cycle.name}
                        </Text>
                        <Text style={styles.cyclePrize}>{cycle.prize_pool_gems.toLocaleString()} GEMS Prize Pool</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: isEligible ? DesignColors.success + '20' : DesignColors.warning + '20' }]}>
                        <Text style={[styles.statusText, { color: isEligible ? DesignColors.success : DesignColors.warning }]}>
                          {isEligible ? 'Eligible' : 'In Progress'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.progressSection}>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Progress to Qualification</Text>
                        <Text style={styles.progressValue}>{Math.round(progress)}%</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]} />
                      </View>
                      <Text style={styles.progressHint}>
                        {stats ? `${stats.verified_actions_count}/3 actions completed` : 'Complete 3 verified actions to qualify'}
                      </Text>
                    </View>

                    <View style={styles.cycleStats}>
                      <View style={styles.cycleStat}>
                        <Ionicons name="ticket-outline" size={16} color={DesignColors.primary} />
                        <Text style={styles.cycleStatText}>{stats?.entries_earned || 0} Entries</Text>
                      </View>
                      <View style={styles.cycleStat}>
                        <Ionicons name="fitness-outline" size={16} color={DesignColors.primary} />
                        <Text style={styles.cycleStatText}>Weight: {stats?.weight_score || 0}</Text>
                      </View>
                      <View style={styles.cycleStat}>
                        <Ionicons name="timer-outline" size={16} color={DesignColors.primary} />
                        <Text style={styles.cycleStatText}>Ends {new Date(cycle.ends_at).toLocaleDateString()}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </>
        )}

        {activeTab === 'prizes' && (
          <>
            <Text style={[styles.sectionTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
              Unclaimed Prizes
            </Text>

            {prizesLoading ? (
              <ActivityIndicator size="large" color={DesignColors.primary} />
            ) : unclaimedPrizes.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                <Ionicons name="gift-outline" size={48} color={DesignColors.gray[400]} />
                <Text style={styles.emptyText}>No unclaimed prizes</Text>
                <Text style={styles.emptySubtext}>Win prizes in draws to see them here!</Text>
              </View>
            ) : (
              unclaimedPrizes.map((prize) => (
                <View
                  key={prize.id}
                  style={[styles.prizeCard, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}
                >
                  <View style={[styles.prizeIcon, { backgroundColor: DesignColors.warning + '15' }]}>
                    <Ionicons name="gift" size={24} color={DesignColors.warning} />
                  </View>
                  <View style={styles.prizeInfo}>
                    <Text style={[styles.prizeTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
                      {prize.prize_description}
                    </Text>
                    <Text style={styles.prizeExpiry}>
                      Expires: {new Date(prize.expires_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Pressable
                    style={[
                      styles.claimButton,
                      claiming === prize.id && styles.claimButtonDisabled
                    ]}
                    onPress={() => claimPrize(prize.id)}
                    disabled={claiming === prize.id}
                  >
                    {claiming === prize.id ? (
                      <ActivityIndicator size="small" color={DesignColors.white} />
                    ) : (
                      <Text style={styles.claimButtonText}>Claim</Text>
                    )}
                  </Pressable>
                </View>
              ))
            )}
          </>
        )}

        {activeTab === 'history' && (
          <>
            <Text style={[styles.sectionTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
              Win History
            </Text>
            
            {historyLoading ? (
              <ActivityIndicator size="large" color={DesignColors.primary} />
            ) : history.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                <Ionicons name="gift-outline" size={48} color={DesignColors.gray[400]} />
                <Text style={styles.emptyText}>No wins yet</Text>
                <Text style={styles.emptySubtext}>Keep participating to win gems!</Text>
              </View>
            ) : (
              history.map((win) => (
                <View
                  key={win.id}
                  style={[styles.winCard, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}
                >
                  <View style={[styles.winIcon, { backgroundColor: DesignColors.success + '15' }]}>
                    <Ionicons name="trophy" size={24} color={DesignColors.success} />
                  </View>
                  <View style={styles.winInfo}>
                    <Text style={[styles.winTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
                      {win.prize_tier} Win
                    </Text>
                    <Text style={styles.winDate}>
                      {new Date(win.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.winAmount}>
                    <Text style={styles.winValue}>+{win.prize_gems}</Text>
                    <Text style={styles.winUnit}>GEMS</Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {activeTab === 'how' && (
          <View style={[styles.howCard, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
            <Text style={[styles.howTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
              How PromoShare Works
            </Text>
            
            {[
              {
                icon: 'checkmark-circle-outline',
                title: 'Complete Verified Actions',
                description: 'Share content, check in to venues, refer friends, and participate in drops to earn entries.',
              },
              {
                icon: 'ticket-outline',
                title: 'Earn Weighted Entries',
                description: 'Each action earns you entries. The more active you are, the higher your weight in the draw.',
              },
              {
                icon: 'trophy-outline',
                title: 'Win Gem Prizes',
                description: 'Weekly and monthly draws with huge gem prize pools. Multiple winners every cycle!',
              },
              {
                icon: 'gift-outline',
                title: 'Claim Your Winnings',
                description: 'Winners have 7 days to claim their gems. Unclaimed prizes roll over to the next cycle.',
              },
            ].map((step, index) => (
              <View key={index} style={styles.howStep}>
                <View style={[styles.howIcon, { backgroundColor: DesignColors.primary + '15' }]}>
                  <Ionicons name={step.icon as any} size={24} color={DesignColors.primary} />
                </View>
                <View style={styles.howStepContent}>
                  <Text style={[styles.howStepTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
                    {step.title}
                  </Text>
                  <Text style={styles.howStepDescription}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.container,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.md,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: 'bold',
  },
  infoButton: {
    padding: Spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.container,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    backgroundColor: 'transparent',
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  tabText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: DesignColors.gray[600],
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.container,
  },
  heroCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    backgroundColor: 'transparent',
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  heroValue: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: 'bold',
    color: DesignColors.white,
    marginBottom: Spacing.lg,
  },
  heroUnit: {
    fontSize: Typography.sizes.lg,
    color: 'rgba(255,255,255,0.7)',
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  heroStat: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  heroStatValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    color: DesignColors.white,
  },
  heroStatLabel: {
    fontSize: Typography.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  emptyState: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: DesignColors.gray[500],
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: Typography.sizes.sm,
    color: DesignColors.gray[400],
    marginTop: Spacing.xs,
  },
  cycleCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    backgroundColor: 'transparent',
  },
  cycleName: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cyclePrize: {
    fontSize: Typography.sizes.sm,
    color: DesignColors.primary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  progressSection: {
    marginBottom: Spacing.md,
    backgroundColor: 'transparent',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    backgroundColor: 'transparent',
  },
  progressLabel: {
    fontSize: Typography.sizes.sm,
    color: DesignColors.gray[500],
  },
  progressValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: 'bold',
    color: DesignColors.primary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: DesignColors.gray[200],
    borderRadius: 3,
  },
  progressBar: {
    height: '100%',
    backgroundColor: DesignColors.primary,
    borderRadius: 3,
  },
  progressHint: {
    fontSize: Typography.sizes.xs,
    color: DesignColors.gray[400],
    marginTop: Spacing.xs,
  },
  cycleStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
    backgroundColor: 'transparent',
  },
  cycleStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
  cycleStatText: {
    fontSize: Typography.sizes.xs,
    color: DesignColors.gray[500],
  },
  winCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.sm,
  },
  winIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  winInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  winTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  winDate: {
    fontSize: Typography.sizes.xs,
    color: DesignColors.gray[500],
  },
  winAmount: {
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  winValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: DesignColors.success,
  },
  winUnit: {
    fontSize: Typography.sizes.xs,
    color: DesignColors.gray[500],
  },
  howCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  howTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    marginBottom: Spacing.lg,
  },
  howStep: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    backgroundColor: 'transparent',
  },
  howIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  howStepContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  howStepTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  howStepDescription: {
    fontSize: Typography.sizes.sm,
    color: DesignColors.gray[500],
    lineHeight: 20,
  },
  tabHasBadge: {
    borderWidth: 2,
    borderColor: DesignColors.warning,
  },
  tabBadge: {
    color: DesignColors.warning,
    fontWeight: 'bold',
  },
  prizeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.sm,
  },
  prizeIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  prizeInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  prizeTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  prizeExpiry: {
    fontSize: Typography.sizes.xs,
    color: DesignColors.warning,
  },
  claimButton: {
    backgroundColor: DesignColors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    minWidth: 80,
    alignItems: 'center',
  },
  claimButtonDisabled: {
    backgroundColor: DesignColors.gray[400],
  },
  claimButtonText: {
    color: DesignColors.white,
    fontWeight: 'bold',
    fontSize: Typography.sizes.sm,
  },
});

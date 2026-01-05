import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { TabBar } from '@/components/ui/TabBar';
import { BetCard } from '@/components/bets/BetCard';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { useBetStore } from '@/store/betStore';
import { useContentShareStore } from '@/store/contentShareStore';
import { TrendingUp, BarChart, Gem, Users } from 'lucide-react-native';
import colors from '@/constants/colors';
import { PostCard } from '@/components/feed/PostCard';
import { useFeedStore } from '@/store/feedStore';
import { Card } from '@/components/ui/Card';
import { StakingModal } from '@/components/growth/StakingModal';
import { WithdrawModal } from '@/components/growth/WithdrawModal';
import { useWalletStore } from '@/store/walletStore';

export default function BetsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('bets');
  const [refreshing, setRefreshing] = useState(false);
  
  const { bets, myBets, isLoading: betsLoading, fetchBets, fetchMyBets } = useBetStore();
  const { contentShares, myOwnerships, isLoading: sharesLoading, fetchContentShares, fetchMyOwnerships } = useContentShareStore();
  const { likePost, sharePost } = useFeedStore();
  
  // Growth hub state
  const [stakingBalance, setStakingBalance] = useState(2500);
  const [totalEarnings, setTotalEarnings] = useState(1289.50);
  const [apy] = useState(12.5);
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  const { promoGems } = useWalletStore();

  useEffect(() => {
    if (activeTab === 'bets') {
      fetchBets();
    } else if (activeTab === 'mybets') {
      fetchMyBets();
    } else if (activeTab === 'content') {
      fetchContentShares();
    } else if (activeTab === 'portfolio') {
      fetchMyOwnerships();
    }
    // Growth tab doesn't need data fetching for now
  }, [activeTab]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'bets') {
      await fetchBets();
    } else if (activeTab === 'mybets') {
      await fetchMyBets();
    } else if (activeTab === 'content') {
      await fetchContentShares();
    } else if (activeTab === 'portfolio') {
      await fetchMyOwnerships();
    }
    // Growth tab refresh logic can be added later
    setRefreshing(false);
  };

  const handleBetPress = (betId: string) => {
    router.push({ pathname: '/bet/[id]', params: { id: betId } } as any);
  };

  const handlePostLike = (postId: string) => {
    likePost(postId);
  };

  const handlePostComment = (postId: string) => {
    router.push({ pathname: '/post/[id]', params: { id: postId } } as any);
  };

  const handlePostShare = (postId: string) => {
    sharePost(postId);
  };

  const handlePostBack = (postId: string) => {
    router.push({ pathname: '/post/[id]', params: { id: postId, action: 'back' } } as any);
  };

  const handleUserPress = (userId: string) => {
    router.push({ pathname: '/profile/[id]', params: { id: userId } } as any);
  };

  const handleStake = async (amount: number, initiative?: string) => {
    // Simulate staking logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStakingBalance(prev => prev + amount);
    console.log(`Staked ${amount} PromoGems${initiative ? ` in ${initiative}` : ''}`);
  };

  const handleWithdraw = async (amount: number) => {
    // Simulate withdrawal logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStakingBalance(prev => prev - amount);
    console.log(`Withdrew ${amount} PromoGems`);
  };

  const handleContentSharePress = (shareId: string) => {
    router.push({ pathname: '/content-share/[id]', params: { id: shareId } } as any);
  };

  const tabs = [
    { key: 'bets', label: 'Social Bets' },
    { key: 'mybets', label: 'My Bets' },
    { key: 'content', label: 'Content Shares' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'growth', label: 'Growth Hub' },
  ];

  const isLoading = activeTab === 'bets' ? betsLoading : 
                   activeTab === 'mybets' ? betsLoading :
                   activeTab === 'content' ? sharesLoading :
                   activeTab === 'portfolio' ? sharesLoading : false;
  const data = activeTab === 'bets' ? bets : 
              activeTab === 'mybets' ? myBets :
              activeTab === 'content' ? contentShares : 
              activeTab === 'portfolio' ? myOwnerships : [];

  const renderContent = () => {
    if (isLoading && !refreshing && data.length === 0) {
      return <LoadingIndicator fullScreen text={`Loading ${activeTab}...`} />;
    }

    if (activeTab === 'bets') {
      return (
        <FlatList
          data={bets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BetCard bet={item} onPress={handleBetPress} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No Bets Available"
              description="Check back later for new social media bets."
              icon={<TrendingUp size={48} color={colors.darkGray} />}
              style={styles.emptyState}
            />
          }
        />
      );
    } else if (activeTab === 'mybets') {
      return (
        <FlatList
          data={myBets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.myBetItem}>
              <BetCard bet={item} onPress={handleBetPress} />
              <View style={styles.betStatus}>
                <View style={styles.betStatusRow}>
                  <Text style={styles.betStatusLabel}>Your Position:</Text>
                  <Text style={styles.betStatusValue}>$50.00 @ 2.5x odds</Text>
                </View>
                <View style={styles.betStatusRow}>
                  <Text style={styles.betStatusLabel}>Potential Win:</Text>
                  <Text style={[styles.betStatusValue, styles.winAmount]}>$125.00</Text>
                </View>
                <View style={styles.betStatusRow}>
                  <Text style={styles.betStatusLabel}>Status:</Text>
                  <Text style={[styles.betStatusValue, 
                    item.status === 'active' ? styles.activeStatus : 
                    item.status === 'completed' ? styles.wonStatus : styles.lostStatus]}>
                    {item.status === 'active' ? 'In Progress' : 
                     item.status === 'completed' ? 'Completed' : 'Expired'}
                  </Text>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No Bets Placed"
              description="Place your first bet to start tracking your positions."
              icon={<TrendingUp size={48} color={colors.darkGray} />}
              style={styles.emptyState}
            />
          }
        />
      );
    } else if (activeTab === 'content') {
      return (
        <FlatList
          data={contentShares}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.contentShareItem}
              onPress={() => handleContentSharePress(item.id)}
              activeOpacity={0.9}
            >
              <View style={styles.contentShareHeader}>
                <View style={styles.priceContainer}>
                  <Text style={styles.currentPrice}>${item.currentPrice.toFixed(2)}</Text>
                  <Text style={[
                    styles.priceChange,
                    item.priceChange >= 0 ? styles.positiveChange : styles.negativeChange
                  ]}>
                    {item.priceChange >= 0 ? '+' : ''}{item.priceChangePercent.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.shareStats}>
                  <View style={styles.holdersContainer}>
                    <Users size={14} color={colors.darkGray} />
                    <Text style={styles.holdersText}>{item.holders}</Text>
                  </View>
                  <View style={styles.availableContainer}>
                    <Gem size={14} color={colors.primary} />
                    <Text style={styles.availableText}>{item.availableShares} left</Text>
                  </View>
                </View>
              </View>
              <PostCard
                post={item.content}
                onLike={handlePostLike}
                onComment={handlePostComment}
                onShare={handlePostShare}
                onBack={handlePostBack}
                onUserPress={handleUserPress}
                showActions={false}
              />
              <View style={styles.shareMetrics}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Dividend Pool</Text>
                  <Text style={styles.metricValue}>${item.dividendPool.toFixed(2)}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Total Paid</Text>
                  <Text style={styles.metricValue}>${item.totalDividendsPaid.toFixed(2)}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Time Left</Text>
                  <Text style={styles.metricValue}>{item.timeLeft}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No Content Shares Available"
              description="Check back later for content to invest in."
              icon={<BarChart size={48} color={colors.darkGray} />}
              style={styles.emptyState}
            />
          }
        />
      );
    } else if (activeTab === 'portfolio') {
      const totalInvested = myOwnerships.reduce((sum, ownership) => sum + ownership.totalInvested, 0);
      const totalDividends = myOwnerships.reduce((sum, ownership) => sum + ownership.dividendsEarned, 0);
      const currentValue = myOwnerships.reduce((sum, ownership) => {
        const share = contentShares.find(s => s.id === ownership.contentShareId);
        return sum + (share ? ownership.sharesOwned * share.currentPrice : ownership.totalInvested);
      }, 0);
      const totalReturn = currentValue + totalDividends - totalInvested;
      const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

      return (
        <View style={styles.portfolioContainer}>
          <Card style={styles.portfolioSummary}>
            <Text style={styles.portfolioTitle}>Portfolio Summary</Text>
            <View style={styles.portfolioStats}>
              <View style={styles.portfolioStat}>
                <Text style={styles.portfolioStatLabel}>Total Invested</Text>
                <Text style={styles.portfolioStatValue}>${totalInvested.toFixed(2)}</Text>
              </View>
              <View style={styles.portfolioStat}>
                <Text style={styles.portfolioStatLabel}>Current Value</Text>
                <Text style={styles.portfolioStatValue}>${currentValue.toFixed(2)}</Text>
              </View>
              <View style={styles.portfolioStat}>
                <Text style={styles.portfolioStatLabel}>Total Dividends</Text>
                <Text style={styles.portfolioStatValue}>${totalDividends.toFixed(2)}</Text>
              </View>
              <View style={styles.portfolioStat}>
                <Text style={styles.portfolioStatLabel}>Total Return</Text>
                <Text style={[
                  styles.portfolioStatValue,
                  totalReturn >= 0 ? styles.positiveReturn : styles.negativeReturn
                ]}>
                  ${totalReturn.toFixed(2)} ({returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(1)}%)
                </Text>
              </View>
            </View>
          </Card>
          
          <FlatList
            data={myOwnerships}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const share = contentShares.find(s => s.id === item.contentShareId);
              const currentShareValue = share ? item.sharesOwned * share.currentPrice : item.totalInvested;
              const unrealizedGain = currentShareValue - item.totalInvested;
              const unrealizedGainPercent = (unrealizedGain / item.totalInvested) * 100;
              
              return (
                <TouchableOpacity 
                  style={styles.portfolioItem}
                  onPress={() => handleContentSharePress(item.contentShareId)}
                >
                  <Card style={styles.portfolioItemCard}>
                    <View style={styles.portfolioItemHeader}>
                      <Text style={styles.portfolioItemTitle} numberOfLines={2}>
                        {typeof share?.content.content === 'string' ? share.content.content : 'Content Share'}
                      </Text>
                      <Text style={styles.portfolioItemShares}>
                        {item.sharesOwned} shares
                      </Text>
                    </View>
                    
                    <View style={styles.portfolioItemStats}>
                      <View style={styles.portfolioItemStat}>
                        <Text style={styles.portfolioItemStatLabel}>Invested</Text>
                        <Text style={styles.portfolioItemStatValue}>${item.totalInvested.toFixed(2)}</Text>
                      </View>
                      <View style={styles.portfolioItemStat}>
                        <Text style={styles.portfolioItemStatLabel}>Current Value</Text>
                        <Text style={styles.portfolioItemStatValue}>${currentShareValue.toFixed(2)}</Text>
                      </View>
                      <View style={styles.portfolioItemStat}>
                        <Text style={styles.portfolioItemStatLabel}>Dividends</Text>
                        <Text style={styles.portfolioItemStatValue}>${item.dividendsEarned.toFixed(2)}</Text>
                      </View>
                      <View style={styles.portfolioItemStat}>
                        <Text style={styles.portfolioItemStatLabel}>Unrealized P&L</Text>
                        <Text style={[
                          styles.portfolioItemStatValue,
                          unrealizedGain >= 0 ? styles.positiveReturn : styles.negativeReturn
                        ]}>
                          ${unrealizedGain.toFixed(2)} ({unrealizedGainPercent >= 0 ? '+' : ''}{unrealizedGainPercent.toFixed(1)}%)
                        </Text>
                      </View>
                    </View>
                    
                    {share && (
                      <View style={styles.portfolioItemFooter}>
                        <Text style={styles.portfolioItemPrice}>
                          Current Price: ${share.currentPrice.toFixed(2)}
                        </Text>
                        <Text style={[
                          styles.portfolioItemChange,
                          share.priceChange >= 0 ? styles.positiveChange : styles.negativeChange
                        ]}>
                          {share.priceChange >= 0 ? '+' : ''}{share.priceChangePercent.toFixed(1)}%
                        </Text>
                      </View>
                    )}
                  </Card>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <EmptyState
                title="No Investments"
                description="Start investing in content shares to build your portfolio."
                icon={<BarChart size={48} color={colors.darkGray} />}
                style={styles.emptyState}
              />
            }
          />
        </View>
      );
    } else {
      // Growth Hub content
      return (
        <View style={styles.growthContainer}>
          <Card style={styles.stakingCard}>
            <Text style={styles.stakingTitle}>PromoGem Staking</Text>
            <View style={styles.stakingStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Staked Balance</Text>
                <Text style={styles.statValue}>{stakingBalance.toLocaleString()} PG</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Earnings</Text>
                <Text style={styles.statValue}>${totalEarnings.toFixed(2)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Current APY</Text>
                <Text style={[styles.statValue, styles.apyValue]}>{apy}%</Text>
              </View>
            </View>
            <View style={styles.stakingActions}>
              <TouchableOpacity 
                style={styles.stakeButton}
                onPress={() => setShowStakingModal(true)}
              >
                <Text style={styles.stakeButtonText}>Stake More</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.stakeButton, styles.unstakeButton]}
                onPress={() => setShowWithdrawModal(true)}
              >
                <Text style={[styles.stakeButtonText, styles.unstakeButtonText]}>Unstake</Text>
              </TouchableOpacity>
            </View>
          </Card>
          
          <Card style={styles.multiplierCard}>
            <Text style={styles.multiplierTitle}>Growth Multipliers</Text>
            <Text style={styles.multiplierDescription}>
              Boost your earnings by staking PromoGems. Higher stakes unlock better multipliers for all platform activities.
            </Text>
            <View style={styles.multiplierTiers}>
              <View style={styles.tierItem}>
                <Text style={styles.tierStake}>1,000+ PG</Text>
                <Text style={styles.tierMultiplier}>1.2x</Text>
              </View>
              <View style={styles.tierItem}>
                <Text style={styles.tierStake}>5,000+ PG</Text>
                <Text style={styles.tierMultiplier}>1.5x</Text>
              </View>
              <View style={[styles.tierItem, styles.activeTier]}>
                <Text style={[styles.tierStake, styles.activeTierText]}>10,000+ PG</Text>
                <Text style={[styles.tierMultiplier, styles.activeTierText]}>2.0x</Text>
              </View>
            </View>
          </Card>
          
          <Card style={styles.rewardsCard}>
            <Text style={styles.rewardsTitle}>Staking Rewards History</Text>
            <View style={styles.rewardsList}>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardDate}>Today</Text>
                <Text style={styles.rewardAmount}>+12.5 PG</Text>
              </View>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardDate}>Yesterday</Text>
                <Text style={styles.rewardAmount}>+11.8 PG</Text>
              </View>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardDate}>2 days ago</Text>
                <Text style={styles.rewardAmount}>+13.2 PG</Text>
              </View>
            </View>
          </Card>
          
          <Card style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>Performance Analytics</Text>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsLabel}>7-Day APY</Text>
                <Text style={styles.analyticsValue}>12.8%</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsLabel}>30-Day APY</Text>
                <Text style={styles.analyticsValue}>11.9%</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsLabel}>Total Rewards</Text>
                <Text style={styles.analyticsValue}>1,289 PG</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsLabel}>Compound Rate</Text>
                <Text style={styles.analyticsValue}>Daily</Text>
              </View>
            </View>
          </Card>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="underlined"
        containerStyle={styles.tabBar}
      />
      {renderContent()}
      
      <StakingModal
        visible={showStakingModal}
        onClose={() => setShowStakingModal(false)}
        currentBalance={promoGems}
        onStake={handleStake}
      />
      
      <WithdrawModal
        visible={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        stakedAmount={stakingBalance}
        availableForWithdraw={Math.floor(stakingBalance * 0.6)} // 60% available for immediate withdrawal
        onWithdraw={handleWithdraw}
      />
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  tabBar: {
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    marginTop: 100,
  },
  contentShareItem: {
    marginBottom: 16,
  },
  contentShareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
    marginRight: 8,
  },
  priceChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  positiveChange: {
    color: colors.success,
  },
  negativeChange: {
    color: colors.error,
  },
  shareStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  holdersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  holdersText: {
    fontSize: 12,
    color: colors.darkGray,
    marginLeft: 4,
    fontWeight: '500',
  },
  availableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availableText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  shareMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.lightGray,
    paddingVertical: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: colors.darkGray,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.black,
  },
  growthContainer: {
    padding: 16,
  },
  stakingCard: {
    marginBottom: 16,
  },
  stakingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 16,
  },
  stakingStats: {
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: colors.darkGray,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  apyValue: {
    color: colors.success,
  },
  stakingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  stakeButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  unstakeButton: {
    backgroundColor: colors.lightGray,
  },
  stakeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  unstakeButtonText: {
    color: colors.darkGray,
  },
  multiplierCard: {
    marginBottom: 16,
  },
  multiplierTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  multiplierDescription: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 16,
    lineHeight: 20,
  },
  multiplierTiers: {
    gap: 8,
  },
  tierItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  activeTier: {
    backgroundColor: colors.primary,
  },
  tierStake: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
  },
  tierMultiplier: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  activeTierText: {
    color: colors.white,
  },
  // My Bets styles
  myBetItem: {
    marginBottom: 16,
  },
  betStatus: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  betStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  betStatusLabel: {
    fontSize: 14,
    color: colors.darkGray,
  },
  betStatusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  winAmount: {
    color: colors.success,
  },
  activeStatus: {
    color: colors.warning,
  },
  wonStatus: {
    color: colors.success,
  },
  lostStatus: {
    color: colors.error,
  },
  // Portfolio styles
  portfolioContainer: {
    flex: 1,
    padding: 16,
  },
  portfolioSummary: {
    marginBottom: 16,
  },
  portfolioTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 16,
  },
  portfolioStats: {
    gap: 12,
  },
  portfolioStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  portfolioStatLabel: {
    fontSize: 14,
    color: colors.darkGray,
  },
  portfolioStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  positiveReturn: {
    color: colors.success,
  },
  negativeReturn: {
    color: colors.error,
  },
  portfolioItem: {
    marginBottom: 12,
  },
  portfolioItemCard: {
    padding: 0,
  },
  portfolioItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  portfolioItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    flex: 1,
    marginRight: 8,
  },
  portfolioItemShares: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  portfolioItemStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  portfolioItemStat: {
    flex: 1,
    minWidth: '45%',
  },
  portfolioItemStatLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 2,
  },
  portfolioItemStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  portfolioItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  portfolioItemPrice: {
    fontSize: 12,
    color: colors.darkGray,
  },
  portfolioItemChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Growth Hub additional styles
  rewardsCard: {
    marginBottom: 16,
  },
  rewardsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  rewardsList: {
    gap: 8,
  },
  rewardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 6,
  },
  rewardDate: {
    fontSize: 14,
    color: colors.darkGray,
  },
  rewardAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  analyticsCard: {
    marginBottom: 16,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analyticsItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  analyticsLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 4,
  },
  analyticsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
});
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Users, Gem, DollarSign, Clock, BarChart3 } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PostCard } from '@/components/feed/PostCard';
import { LineChart } from '@/components/ui/LineChart';
import { useContentShareStore } from '@/store/contentShareStore';
import { useBountyStore, BountyItem } from '@/store/bountyStore';
import { useFeedStore } from '@/store/feedStore';
import { useWalletStore } from '@/store/walletStore';
import colors from '@/constants/colors';

export default function ContentShareDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  const { contentShares, myOwnerships, buyShares, sellShares, fetchContentShares, fetchMyOwnerships, fetchContentShareById, isLoading: isStoreLoading } = useContentShareStore();
  const { trendingItems, claimBounty } = useBountyStore();
  const { likePost, sharePost } = useFeedStore();
  const { promoGems } = useWalletStore();

  const [bountyItem, setBountyItem] = useState<BountyItem | null>(null);

  const contentShare = contentShares.find(share => share.id === id);
  const ownership = myOwnerships.find(own => own.contentShareId === id);

  useEffect(() => {
    if (id) {
      if (id.startsWith('trend-')) {
        const item = trendingItems.find(i => i.id === id);
        if (item) setBountyItem(item);
      } else if (!contentShare) {
        fetchContentShareById(id);
      }
    }
  }, [id, contentShare, trendingItems]);

  useEffect(() => {
    fetchMyOwnerships();
  }, [fetchMyOwnerships]);

  if (!contentShare && !bountyItem) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {isStoreLoading ? 'Loading detail...' : 'Content not found'}
          </Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  // Map bounty item to a pseudo content share for display if needed
  const displayShare = contentShare || (bountyItem ? {
    id: bountyItem.id,
    content: {
      id: bountyItem.id,
      creator: { id: 'viral_1', name: 'Viral Content', username: 'scout_target', avatar: '' },
      content: { type: 'image', media: [bountyItem.thumbnail], text: bountyItem.title },
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
      isLiked: false,
      isShared: false,
      isBacked: false
    },
    currentPrice: 10,
    totalShares: 100,
    availableShares: 0,
    holders: 0,
    dividendPool: 0,
    totalDividendsPaid: 0,
    priceChange: 0,
    priceChangePercent: 0,
    timeLeft: '7d'
  } : null);

  const handleBuyShares = async () => {
    const amount = Number(buyAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amount > contentShare.availableShares) {
      Alert.alert('Error', 'Not enough shares available');
      return;
    }

    const totalCost = amount * contentShare.currentPrice;
    if (totalCost > promoGems) {
      Alert.alert('Error', 'Insufficient PromoGems balance');
      return;
    }

    try {
      await buyShares(id!, amount, contentShare.currentPrice);
      Alert.alert('Success', `Successfully purchased ${amount} shares!`);
      setBuyAmount('');
    } catch {
      Alert.alert('Error', 'Failed to purchase shares');
    }
  };

  const handleSellShares = async () => {
    const amount = Number(sellAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!ownership || amount > ownership.sharesOwned) {
      Alert.alert('Error', 'Not enough shares to sell');
      return;
    }

    try {
      await sellShares(id!, amount);
      Alert.alert('Success', `Successfully sold ${amount} shares!`);
      setSellAmount('');
    } catch {
      Alert.alert('Error', 'Failed to sell shares');
    }
  };

  const handlePostLike = (postId: string) => {
    likePost(postId);
  };

  const handlePostComment = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handlePostShare = (postId: string) => {
    sharePost(postId);
  };

  const handlePostBack = (postId: string) => {
    router.push(`/post/${postId}?action=back`);
  };

  const handleUserPress = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  if (!displayShare) return null;

  const handleClaim = async () => {
    if (!bountyItem) return;
    try {
      await claimBounty(bountyItem);
      Alert.alert('Success', 'Bounty claimed! You now own equity in this content.');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to claim bounty');
    }
  };

  // Mock price history data
  const priceHistory = [
    { date: '6/10', price: 2.25 },
    { date: '6/11', price: 3.15 },
    { date: '6/12', price: 4.80 },
    { date: '6/13', price: 6.20 },
    { date: '6/14', price: 7.80 },
    { date: '6/15', price: displayShare.currentPrice },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{bountyItem ? 'Scouting Detail' : 'Content Shares'}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Price Overview */}
        <Card style={styles.priceCard}>
          <View style={styles.priceHeader}>
            <View>
              <Text style={styles.currentPrice}>${displayShare.currentPrice.toFixed(2)}</Text>
              <Text style={styles.priceSubtext}>per share</Text>
            </View>
            <View style={styles.priceChange}>
              <Text style={[
                styles.priceChangeText,
                displayShare.priceChange >= 0 ? styles.positiveChange : styles.negativeChange
              ]}>
                {displayShare.priceChange >= 0 ? '+' : ''}{displayShare.priceChangePercent.toFixed(1)}%
              </Text>
              <Text style={styles.priceChangeSubtext}>24h change</Text>
            </View>
          </View>

          <View style={styles.shareStats}>
            <View style={styles.statItem}>
              <Users size={16} color={colors.darkGray} />
              <Text style={styles.statText}>{displayShare.holders} holders</Text>
            </View>
            <View style={styles.statItem}>
              <Gem size={16} color={colors.primary} />
              <Text style={styles.statText}>{displayShare.availableShares} available</Text>
            </View>
            <View style={styles.statItem}>
              <Clock size={16} color={colors.warning} />
              <Text style={styles.statText}>{displayShare.timeLeft || '7d'} left</Text>
            </View>
          </View>
        </Card>

        {/* Price Chart */}
        {!bountyItem && (
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <BarChart3 size={20} color={colors.primary} />
              <Text style={styles.chartTitle}>Price History</Text>
            </View>
            <LineChart data={priceHistory} />
          </Card>
        )}

        {/* Content Preview */}
        <PostCard
          post={displayShare.content}
          onLike={handlePostLike}
          onComment={handlePostComment}
          onShare={handlePostShare}
          onBack={handlePostBack}
          onUserPress={handleUserPress}
          showActions={false}
        />

        {/* Bounty Claim Button */}
        {bountyItem && (
          <Card style={styles.tradingCard}>
            <Text style={styles.headerTitle}>Potential Found!</Text>
            <Text style={styles.cardSubtitle}>
              This content is trending fast. Claim the bounty to earn 5% finders fee and permanent equity.
            </Text>
            <View style={{ marginTop: 16 }}>
              <Button
                title={bountyItem.claimed ? "Already Claimed" : "Claim Bounty"}
                onPress={handleClaim}
                variant="primary"
                size="lg"
                disabled={bountyItem.claimed}
              />
            </View>
          </Card>
        )}

        {/* Dividend Information */}
        {!bountyItem && (
          <Card style={styles.dividendCard}>
            <Text style={styles.dividendTitle}>Dividend Pool</Text>
            <View style={styles.dividendStats}>
              <View style={styles.dividendItem}>
                <Text style={styles.dividendLabel}>Current Pool</Text>
                <Text style={styles.dividendValue}>${displayShare.dividendPool.toFixed(2)}</Text>
              </View>
              <View style={styles.dividendItem}>
                <Text style={styles.dividendLabel}>Total Paid</Text>
                <Text style={styles.dividendValue}>${displayShare.totalDividendsPaid.toFixed(2)}</Text>
              </View>
              <View style={styles.dividendItem}>
                <Text style={styles.dividendLabel}>Your Share</Text>
                <Text style={styles.dividendValue}>
                  {ownership ? `${((ownership.sharesOwned / (displayShare.totalShares - displayShare.availableShares)) * 100).toFixed(1)}%` : '0%'}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Your Position */}
        {!bountyItem && ownership && (
          <Card style={styles.positionCard}>
            <Text style={styles.positionTitle}>Your Position</Text>
            <View style={styles.positionStats}>
              <View style={styles.positionItem}>
                <Text style={styles.positionLabel}>Shares Owned</Text>
                <Text style={styles.positionValue}>{ownership.sharesOwned}</Text>
              </View>
              <View style={styles.positionItem}>
                <Text style={styles.positionLabel}>Avg. Buy Price</Text>
                <Text style={styles.positionValue}>${ownership.avgBuyPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.positionItem}>
                <Text style={styles.positionLabel}>Total Invested</Text>
                <Text style={styles.positionValue}>${ownership.totalInvested.toFixed(2)}</Text>
              </View>
              <View style={styles.positionItem}>
                <Text style={styles.positionLabel}>Current Value</Text>
                <Text style={styles.positionValue}>
                  ${(ownership.sharesOwned * displayShare.currentPrice).toFixed(2)}
                </Text>
              </View>
              <View style={styles.positionItem}>
                <Text style={styles.positionLabel}>Dividends Earned</Text>
                <Text style={[styles.positionValue, { color: colors.success }]}>
                  ${ownership.dividendsEarned.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Trading Section */}
        {!bountyItem && (
          <Card style={styles.tradingCard}>
            <View style={styles.tradingTabs}>
              <TouchableOpacity
                style={[styles.tradingTab, activeTab === 'buy' && styles.activeTab]}
                onPress={() => setActiveTab('buy')}
              >
                <Text style={[styles.tabText, activeTab === 'buy' && styles.activeTabText]}>Buy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tradingTab, activeTab === 'sell' && styles.activeTab]}
                onPress={() => setActiveTab('sell')}
              >
                <Text style={[styles.tabText, activeTab === 'sell' && styles.activeTabText]}>Sell</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'buy' ? (
              <View style={styles.tradingForm}>
                <Input
                  label="Number of Shares"
                  placeholder="Enter amount"
                  value={buyAmount}
                  onChangeText={setBuyAmount}
                  keyboardType="numeric"
                  leftIcon={<Gem size={20} color={colors.darkGray} />}
                />

                <View style={styles.tradingInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Price per share:</Text>
                    <Text style={styles.infoValue}>${displayShare.currentPrice.toFixed(2)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Total cost:</Text>
                    <Text style={styles.infoValue}>
                      ${((Number(buyAmount) || 0) * displayShare.currentPrice).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Your balance:</Text>
                    <Text style={styles.infoValue}>{promoGems} PromoGems</Text>
                  </View>
                </View>

                <Button
                  title="Buy Shares"
                  onPress={handleBuyShares}
                  variant="primary"
                  size="lg"
                  disabled={!buyAmount || Number(buyAmount) <= 0}
                />
              </View>
            ) : (
              <View style={styles.tradingForm}>
                <Input
                  label="Number of Shares"
                  placeholder="Enter amount"
                  value={sellAmount}
                  onChangeText={setSellAmount}
                  keyboardType="numeric"
                  leftIcon={<DollarSign size={20} color={colors.darkGray} />}
                />

                <View style={styles.tradingInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Price per share:</Text>
                    <Text style={styles.infoValue}>${displayShare.currentPrice.toFixed(2)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Total value:</Text>
                    <Text style={styles.infoValue}>
                      ${((Number(sellAmount) || 0) * displayShare.currentPrice).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>You own:</Text>
                    <Text style={styles.infoValue}>{ownership?.sharesOwned || 0} shares</Text>
                  </View>
                </View>

                <Button
                  title="Sell Shares"
                  onPress={handleSellShares}
                  variant="secondary"
                  size="lg"
                  disabled={!sellAmount || Number(sellAmount) <= 0 || !ownership}
                />
              </View>
            )}
          </Card>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
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
    marginBottom: 20,
  },
  priceCard: {
    marginBottom: 16,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.black,
  },
  priceSubtext: {
    fontSize: 14,
    color: colors.darkGray,
  },
  priceChange: {
    alignItems: 'flex-end',
  },
  priceChangeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  positiveChange: {
    color: colors.success,
  },
  negativeChange: {
    color: colors.error,
  },
  priceChangeSubtext: {
    fontSize: 12,
    color: colors.darkGray,
  },
  shareStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: colors.darkGray,
    marginLeft: 4,
  },
  chartCard: {
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginLeft: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 4,
  },
  dividendCard: {
    marginBottom: 16,
  },
  dividendTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
  },
  dividendStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dividendItem: {
    alignItems: 'center',
  },
  dividendLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 4,
  },
  dividendValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  positionCard: {
    marginBottom: 16,
    backgroundColor: `${colors.primary}05`,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  positionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
  },
  positionStats: {
    gap: 12,
  },
  positionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  positionLabel: {
    fontSize: 14,
    color: colors.darkGray,
  },
  positionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  tradingCard: {
    marginBottom: 16,
  },
  tradingTabs: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 4,
  },
  tradingTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.white,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  tradingForm: {
    gap: 16,
  },
  tradingInfo: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.darkGray,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  bottomPadding: {
    height: 20,
  },
});
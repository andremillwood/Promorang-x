import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  Users,
  Gem,
  DollarSign,
  Clock,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  Target,
  Flame,
  Heart,
  Share2,
  Lock,
  Zap,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useContentShareStore } from '@/store/contentShareStore';
import { useBountyStore, BountyItem } from '@/store/bountyStore';
import { useFeedStore } from '@/store/feedStore';
import { useWalletStore } from '@/store/walletStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BACKING_PRESETS = [5, 10, 25, 50, 100];

const MILESTONES = [
  {
    id: 'm1',
    title: '10K Viral Views',
    reward: '15% Bonus Gem Reward to all early backers',
    target: 10000,
    current: 7420,
    status: 'in_progress',
  },
  {
    id: 'm2',
    title: 'Brand Sponsorship Deal',
    reward: 'Creator Royalty Pool distribution (Gems)',
    target: 1,
    current: 0,
    status: 'locked',
  },
  {
    id: 'm3',
    title: '50K Views & Trend Page',
    reward: 'Exclusive VIP Creator Drop + Community Pass',
    target: 50000,
    current: 7420,
    status: 'locked',
  },
];

const RECENT_BACKERS = [
  { id: 'b1', name: 'Jordan Hayes', username: 'jordan_h', amount: 25, time: '3m ago', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
  { id: 'b2', name: 'Elena Chen', username: 'elena_c', amount: 50, time: '18m ago', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: 'b3', name: 'Devon Miles', username: 'devon_m', amount: 10, time: '1h ago', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
];

export default function ContentShareDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useThemeColors();

  const [backingAmount, setBackingAmount] = useState<number>(10);
  const [cashoutShares, setCashoutShares] = useState<string>('1');
  const [activeTab, setActiveTab] = useState<'back' | 'cashout'>('back');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    contentShares,
    myOwnerships,
    buyShares,
    sellShares,
    fetchContentShares,
    fetchMyOwnerships,
    fetchContentShareById,
    isLoading: isStoreLoading,
  } = useContentShareStore();

  const { trendingItems, claimBounty } = useBountyStore();
  const { promoGems } = useWalletStore();

  const [bountyItem, setBountyItem] = useState<BountyItem | null>(null);

  const contentShare = contentShares.find((share) => share.id === id);
  const ownership = myOwnerships.find((own) => own.contentShareId === id);

  useEffect(() => {
    if (id) {
      if (id.startsWith('trend-')) {
        const item = trendingItems.find((i) => i.id === id);
        if (item) setBountyItem(item);
      } else if (!contentShare) {
        fetchContentShareById(id);
      }
    }
  }, [id, contentShare, trendingItems]);

  useEffect(() => {
    fetchMyOwnerships();
  }, [fetchMyOwnerships]);

  const displayShare =
    contentShare ||
    (bountyItem
      ? {
          id: bountyItem.id,
          content: {
            id: bountyItem.id,
            creator: { id: 'viral_1', name: 'Sarah Miller', username: 'sarahm', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
            content: { type: 'image', media: [bountyItem.thumbnail], text: bountyItem.title },
            likes: 1240,
            comments: 88,
            shares: 240,
            createdAt: new Date().toISOString(),
            isLiked: false,
            isShared: false,
            isBacked: false,
          },
          currentPrice: 10,
          totalShares: 100,
          availableShares: 45,
          holders: 28,
          dividendPool: 340,
          totalDividendsPaid: 120,
          priceChange: 1.25,
          priceChangePercent: 14.2,
          timeLeft: '5d',
        }
      : null);

  if (!displayShare && !bountyItem) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.text }]}>
            {isStoreLoading ? 'Loading creator project...' : 'Project not found'}
          </Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const handleBackCreator = async () => {
    if (!backingAmount || backingAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please select or enter an amount of Gems to back.');
      return;
    }

    if (backingAmount > promoGems) {
      Alert.alert(
        'Insufficient Gems',
        `You have ${promoGems} Gems. You need ${backingAmount} Gems to back this creator.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const sharesToBuy = Math.max(1, Math.floor(backingAmount / (displayShare?.currentPrice || 10)));
      await buyShares(id || displayShare?.id || 'demo', sharesToBuy, displayShare?.currentPrice || 10);
      Alert.alert(
        '🎉 Successfully Backed!',
        `You backed ${displayShare?.content?.creator?.name || 'this creator'} with ${backingAmount} Gems! You will receive automatic bonus rewards as milestones are hit.`
      );
      setBackingAmount(10);
    } catch {
      Alert.alert('Error', 'Failed to complete backing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCashout = async () => {
    const sharesNum = Number(cashoutShares);
    if (!sharesNum || sharesNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid number of shares to cash out.');
      return;
    }

    if (!ownership || sharesNum > ownership.sharesOwned) {
      Alert.alert('Error', 'You do not own that many shares.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sellShares(id || displayShare?.id || 'demo', sharesNum);
      const cashValue = sharesNum * (displayShare?.currentPrice || 10);
      Alert.alert(
        '💰 Cash Out Complete',
        `Successfully cashed out ${sharesNum} shares for ${cashValue.toFixed(2)} Gems instantly.`
      );
      setCashoutShares('1');
    } catch {
      Alert.alert('Error', 'Failed to cash out shares.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const creator = displayShare?.content?.creator || {
    name: 'Featured Creator',
    username: 'creator',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  };

  const currentPoolRaised = (displayShare?.totalShares || 100) - (displayShare?.availableShares || 0);
  const poolGoal = displayShare?.totalShares || 100;
  const poolProgress = Math.min(1, currentPoolRaised / poolGoal);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Navigation Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Creator Backing Pool</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Co-grow with @{creator.username}</Text>
        </View>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => router.push(`/profile/${creator.id}` as any)}
        >
          <Avatar source={creator.avatar} size="sm" name={creator.name} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Creator Hero Card */}
        <Card style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.creatorHeaderRow}>
            <Avatar source={creator.avatar} size="lg" name={creator.name} />
            <View style={styles.creatorHeroInfo}>
              <View style={styles.nameBadgeRow}>
                <Text style={[styles.creatorHeroName, { color: theme.text }]}>{creator.name}</Text>
                <View style={[styles.tierPill, { backgroundColor: colors.primary + '18' }]}>
                  <Sparkles size={11} color={colors.primary} />
                  <Text style={[styles.tierPillText, { color: colors.primary }]}>Top Creator</Text>
                </View>
              </View>
              <Text style={[styles.creatorHeroHandle, { color: theme.textSecondary }]}>
                @{creator.username} • {displayShare?.category || 'Original Creation'}
              </Text>
            </View>
          </View>

          {/* Media / Content Preview */}
          {displayShare?.content?.content?.media && displayShare.content.content.media[0] && (
            <Image
              source={{ uri: displayShare.content.content.media[0] }}
              style={styles.contentMedia}
              contentFit="cover"
            />
          )}

          {displayShare?.content?.content?.text && (
            <Text style={[styles.contentCaption, { color: theme.text }]}>
              "{displayShare.content.content.text}"
            </Text>
          )}

          {/* Pool Goal Progress */}
          <View style={styles.poolProgressSection}>
            <View style={styles.poolLabelsRow}>
              <View>
                <Text style={[styles.poolValueText, { color: theme.text }]}>
                  ${(currentPoolRaised * (displayShare?.currentPrice || 10)).toLocaleString()} Gems
                </Text>
                <Text style={[styles.poolSubText, { color: theme.textSecondary }]}>
                  Backed by {displayShare?.holders || 28} Fans
                </Text>
              </View>
              <View style={styles.goalRight}>
                <Text style={[styles.goalTargetText, { color: colors.primary }]}>
                  Goal: ${(poolGoal * (displayShare?.currentPrice || 10)).toLocaleString()}
                </Text>
                <Text style={[styles.goalPercentText, { color: theme.textSecondary }]}>
                  {Math.round(poolProgress * 100)}% funded
                </Text>
              </View>
            </View>
            <ProgressBar progress={poolProgress} height={8} />
          </View>
        </Card>

        {/* Milestone Rewards Roadmap */}
        <Card style={[styles.milestonesCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Target size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Milestone Rewards</Text>
          </View>
          <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
            When this project hits milestones, all early backers automatically earn Gem rewards & perks.
          </Text>

          <View style={styles.milestoneList}>
            {MILESTONES.map((m, idx) => (
              <View
                key={m.id}
                style={[
                  styles.milestoneItem,
                  { backgroundColor: theme.surface, borderColor: m.status === 'in_progress' ? colors.primary : theme.border },
                ]}
              >
                <View style={styles.milestoneHeader}>
                  <View style={styles.milestoneTitleGroup}>
                    {m.status === 'in_progress' ? (
                      <Flame size={16} color="#F97316" />
                    ) : (
                      <Lock size={15} color={theme.textSecondary} />
                    )}
                    <Text style={[styles.milestoneTitle, { color: theme.text }]}>{m.title}</Text>
                  </View>
                  <Text style={[styles.milestoneStatusTag, { color: m.status === 'in_progress' ? '#F97316' : theme.textSecondary }]}>
                    {m.status === 'in_progress' ? '74% Reached' : 'Upcoming'}
                  </Text>
                </View>
                <Text style={[styles.milestoneRewardText, { color: colors.primary }]}>
                  🎁 {m.reward}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Backer Interactive Control (AMM engine under the hood) */}
        <Card style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.actionTabs}>
            <TouchableOpacity
              style={[styles.actionTab, activeTab === 'back' && { backgroundColor: colors.primary }]}
              onPress={() => setActiveTab('back')}
            >
              <Heart size={15} color={activeTab === 'back' ? '#FFF' : theme.textSecondary} fill={activeTab === 'back' ? '#FFF' : 'transparent'} />
              <Text style={[styles.actionTabText, { color: activeTab === 'back' ? '#FFF' : theme.textSecondary }]}>
                Back Creator
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionTab, activeTab === 'cashout' && { backgroundColor: '#10B981' }]}
              onPress={() => setActiveTab('cashout')}
            >
              <Zap size={15} color={activeTab === 'cashout' ? '#FFF' : theme.textSecondary} />
              <Text style={[styles.actionTabText, { color: activeTab === 'cashout' ? '#FFF' : theme.textSecondary }]}>
                1-Tap Cash Out
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'back' ? (
            <View style={styles.formContainer}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Choose Backing Amount (Gems)</Text>
              <View style={styles.presetsRow}>
                {BACKING_PRESETS.map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.presetButton,
                      backingAmount === preset && { backgroundColor: colors.primary, borderColor: colors.primary },
                      { borderColor: theme.border },
                    ]}
                    onPress={() => setBackingAmount(preset)}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        backingAmount === preset ? { color: '#FFF', fontWeight: '800' } : { color: theme.text },
                      ]}
                    >
                      {preset} 💎
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.summaryBox, { backgroundColor: theme.surface }]}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Your Balance:</Text>
                  <Text style={[styles.summaryVal, { color: theme.text }]}>{promoGems} Gems</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Backer Shares Acquired:</Text>
                  <Text style={[styles.summaryVal, { color: colors.primary, fontWeight: '700' }]}>
                    {Math.max(1, Math.floor(backingAmount / (displayShare?.currentPrice || 10)))} Shares
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Milestone Reward Eligibility:</Text>
                  <Text style={[styles.summaryVal, { color: '#10B981', fontWeight: '700' }]}>Active (100%)</Text>
                </View>
              </View>

              <Button
                title={isSubmitting ? 'Securing Backing...' : `Back with ${backingAmount} Gems`}
                onPress={handleBackCreator}
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                style={styles.submitBtn}
              />
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Instant Liquidity Cash Out</Text>
              <Text style={[styles.cashoutSub, { color: theme.textSecondary }]}>
                You can withdraw your backing value anytime at the current automated market price.
              </Text>

              {ownership && ownership.sharesOwned > 0 ? (
                <>
                  <View style={[styles.summaryBox, { backgroundColor: theme.surface }]}>
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>You Own:</Text>
                      <Text style={[styles.summaryVal, { color: theme.text }]}>{ownership.sharesOwned} Shares</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Current Value per Share:</Text>
                      <Text style={[styles.summaryVal, { color: theme.text }]}>${displayShare?.currentPrice || 10} Gems</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total Portfolio Value:</Text>
                      <Text style={[styles.summaryVal, { color: '#10B981', fontWeight: '700' }]}>
                        ${(ownership.sharesOwned * (displayShare?.currentPrice || 10)).toFixed(2)} Gems
                      </Text>
                    </View>
                  </View>

                  <Input
                    label="Shares to Cash Out"
                    placeholder="e.g. 1"
                    value={cashoutShares}
                    onChangeText={setCashoutShares}
                    keyboardType="numeric"
                  />

                  <Button
                    title={isSubmitting ? 'Processing...' : 'Cash Out to Gem Wallet'}
                    onPress={handleCashout}
                    variant="outline"
                    size="lg"
                    disabled={isSubmitting}
                    style={[styles.submitBtn, { borderColor: '#10B981' }]}
                  />
                </>
              ) : (
                <View style={styles.noSharesBox}>
                  <Text style={[styles.noSharesText, { color: theme.textSecondary }]}>
                    You haven't backed this creator project yet. Back now to participate in milestone payouts!
                  </Text>
                </View>
              )}
            </View>
          )}
        </Card>

        {/* Live Backers Ticker */}
        <Card style={[styles.backersFeedCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Users size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Backers</Text>
          </View>
          {RECENT_BACKERS.map((b) => (
            <View key={b.id} style={[styles.backerRow, { borderBottomColor: theme.border }]}>
              <Avatar source={b.avatar} size="sm" name={b.name} />
              <View style={styles.backerInfo}>
                <Text style={[styles.backerName, { color: theme.text }]}>{b.name}</Text>
                <Text style={[styles.backerTime, { color: theme.textSecondary }]}>{b.time}</Text>
              </View>
              <View style={[styles.backerAmountPill, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.backerAmountText, { color: colors.primary }]}>+{b.amount} Gems</Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 6,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 11,
  },
  shareButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    marginBottom: 16,
  },
  heroCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  creatorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  creatorHeroInfo: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creatorHeroName: {
    fontSize: 16,
    fontWeight: '700',
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tierPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  creatorHeroHandle: {
    fontSize: 12,
    marginTop: 2,
  },
  contentMedia: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  contentCaption: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  poolProgressSection: {
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  poolLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  poolValueText: {
    fontSize: 16,
    fontWeight: '800',
  },
  poolSubText: {
    fontSize: 11,
  },
  goalRight: {
    alignItems: 'flex-end',
  },
  goalTargetText: {
    fontSize: 13,
    fontWeight: '700',
  },
  goalPercentText: {
    fontSize: 11,
  },
  milestonesCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionSub: {
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  milestoneList: {
    gap: 8,
  },
  milestoneItem: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  milestoneTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestoneTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  milestoneStatusTag: {
    fontSize: 11,
    fontWeight: '600',
  },
  milestoneRewardText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  actionTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  actionTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  formContainer: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryBox: {
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryVal: {
    fontSize: 12,
  },
  submitBtn: {
    marginTop: 4,
  },
  cashoutSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  noSharesBox: {
    padding: 16,
    alignItems: 'center',
  },
  noSharesText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  backersFeedCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  backerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  backerInfo: {
    flex: 1,
  },
  backerName: {
    fontSize: 13,
    fontWeight: '600',
  },
  backerTime: {
    fontSize: 11,
  },
  backerAmountPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  backerAmountText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
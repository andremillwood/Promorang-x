import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PostCard } from '@/components/feed/PostCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useFeedStore } from '@/store/feedStore';
import { useContentShareStore } from '@/store/contentShareStore';
import { useForecastStore } from '@/store/forecastStore';
import { TrendingUp, TrendingDown, Users, Clock, Target, DollarSign, MessageCircle, Share2 } from 'lucide-react-native';
import { Divider } from '@/components/ui/Divider';
import colors from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
    padding: 16,
  },
  notFound: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
    color: colors.darkGray,
  },
  inputCard: {
    marginTop: 16,
    marginBottom: 16,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  inputDescription: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.black,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 18,
    color: colors.darkGray,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    height: 48,
    fontSize: 18,
    color: colors.black,
  },
  submitButton: {
    width: '100%',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    marginTop: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
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
    color: colors.white,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 4,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  analyticsItem: {
    flex: 1,
  },
  analyticsLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 4,
  },
  analyticsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  divider: {
    marginVertical: 16,
  },
  tabContent: {
    paddingBottom: 40,
  },
  statsCard: {
    marginBottom: 16,
  },
  shareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  shareStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.lightGray + '40',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  priceChangeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
    marginLeft: 2,
  },
  buySharesContainer: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  shareInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  shareInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: colors.black,
  },
  shareInputSuffix: {
    fontSize: 14,
    color: colors.darkGray,
    marginLeft: 4,
  },
  predictionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  predictionButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginHorizontal: 4,
  },
  predictionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  predictionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkGray,
  },
  predictionButtonTextActive: {
    color: colors.white,
  },
  betInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.black,
    marginBottom: 12,
  },
  actionButton: {
    width: '100%',
  },
  shareButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
});

export default function PostDetailScreen() {
  const { id, action } = useLocalSearchParams();
  const theme = useThemeColors();
  const router = useRouter();
  const { posts, likePost, sharePost, backPost } = useFeedStore();
  const { contentShares, fetchContentShares, buyShares } = useContentShareStore();
  const { forecasts, fetchForecasts, makePrediction } = useForecastStore();
  const [comment, setComment] = useState('');
  const [backAmount, setBackAmount] = useState('');
  const [shareAmount, setShareAmount] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [betPrediction, setBetPrediction] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'analytics' | 'markets'>('overview');

  // Find the post by ID
  const post = posts.find(p => p.id === id);

  // Find related content share and forecasts
  const relatedShare = contentShares.find(share => share.content?.id === id);
  const relatedForecasts = forecasts.filter(f => f.contentId === id);

  useEffect(() => {
    fetchContentShares();
    fetchForecasts();
  }, [fetchContentShares, fetchForecasts]);

  if (!post) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.notFound, { color: theme.textSecondary }]}>Post not found</Text>
      </View>
    );
  }

  const handlePostLike = (postId: string) => {
    likePost(postId);
  };

  const handlePostComment = (postId: string) => {
    // Already on details
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

  const handleSubmitComment = () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a comment.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      Alert.alert('Success', 'Your comment has been posted.');
      setComment('');
      setIsSubmitting(false);
    }, 1000);
  };

  const handleBuyShares = async () => {
    if (!relatedShare) return;

    const amount = parseInt(shareAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid number of shares.');
      return;
    }

    if (amount > relatedShare.availableShares) {
      Alert.alert('Error', 'Not enough shares available.');
      return;
    }

    try {
      setIsSubmitting(true);
      await buyShares(relatedShare.id, amount, relatedShare.currentPrice);
      Alert.alert('Success', `You've purchased ${amount} shares!`);
      setShareAmount('');
    } catch {
      Alert.alert('Error', 'Failed to purchase shares.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMakePrediction = async (forecastId: string) => {
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0 || betPrediction === null) {
      Alert.alert('Error', 'Please enter a valid amount and prediction.');
      return;
    }

    try {
      setIsSubmitting(true);
      await makePrediction(forecastId, amount, betPrediction);
      Alert.alert('Success', `Prediction placed!`);
      setBetAmount('');
      setBetPrediction(null);
    } catch {
      Alert.alert('Error', 'Failed to place prediction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExternalShare = async () => {
    try {
      await Share.share({
        message: `Check out this content on Promorang: ${post.title || 'Untitled Post'} - ${post.description || ''}`,
        url: post.platform_url || '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share content.');
    }
  };

  const renderSharingSection = () => (
    <Card style={styles.inputCard}>
      <Text style={styles.inputTitle}>Share & Promote</Text>
      <Text style={styles.inputDescription}>
        Help this content reach more people. You can share it internally via Relay or use your system share.
      </Text>
      <View style={styles.shareButtonsRow}>
        <Button
          title="Relay (Internal)"
          onPress={() => handlePostShare(post.id)}
          variant="primary"
          size="md"
          style={styles.halfButton}
          leftIcon={<TrendingUp size={18} color={colors.white} />}
        />
        <Button
          title="System Share"
          onPress={handleExternalShare}
          variant="outline"
          size="md"
          style={styles.halfButton}
          leftIcon={<Share2 size={18} color={colors.primary} />}
        />
      </View>
    </Card>
  );

  const renderOverview = () => (
    <View>
      {renderSharingSection()}
      <Card style={styles.inputCard}>
        <Text style={styles.inputTitle}>Discussion</Text>
        <TextInput
          style={styles.commentInput}
          value={comment}
          onChangeText={setComment}
          placeholder="What do you think about this post?"
          multiline
        />
        <Button
          title="Post Comment"
          onPress={handleSubmitComment}
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          style={styles.submitButton}
        />
      </Card>
    </View>
  );

  const renderEngagement = () => (
    <View>
      {renderSharesSection()}
      <Card style={styles.statsCard}>
        <Text style={styles.infoTitle}>Engagement Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{post.likes}</Text>
            <Text style={styles.metricLabel}>Likes</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{post.comments}</Text>
            <Text style={styles.metricLabel}>Comments</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{post.shares}</Text>
            <Text style={styles.metricLabel}>Shares</Text>
          </View>
        </View>
      </Card>
    </View>
  );

  const renderAnalytics = () => (
    <Card style={styles.infoCard}>
      <Text style={styles.infoTitle}>Monetization Analytics</Text>
      <View style={styles.analyticsRow}>
        <View style={styles.analyticsItem}>
          <Text style={styles.analyticsLabel}>Total Revenue</Text>
          <Text style={[styles.analyticsValue, { color: colors.success }]}>
            ${(post.current_revenue || 0).toLocaleString()}
          </Text>
        </View>
        <View style={styles.analyticsItem}>
          <Text style={styles.analyticsLabel}>Views</Text>
          <Text style={styles.analyticsValue}>
            {(post.views_count || 0).toLocaleString()}
          </Text>
        </View>
      </View>
      <Divider style={styles.divider} />
      <View style={styles.analyticsRow}>
        <View style={styles.analyticsItem}>
          <Text style={styles.analyticsLabel}>Engagement Yield</Text>
          <Text style={styles.analyticsValue}>
            {((post.current_revenue || 0) / (post.views_count || 1) * 1000).toFixed(2)} / 1k views
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderSharesSection = () => {
    if (!relatedShare) {
      return (
        <Card style={styles.statsCard}>
          <Text style={styles.infoTitle}>Content Shares</Text>
          <Text style={styles.description}>No shares available for this content.</Text>
        </Card>
      );
    }

    const priceChangeColor = relatedShare.priceChange >= 0 ? colors.success : colors.error;
    const PriceIcon = relatedShare.priceChange >= 0 ? TrendingUp : TrendingDown;

    return (
      <Card style={styles.statsCard}>
        <View style={styles.shareHeader}>
          <Text style={styles.infoTitle}>Content Shares</Text>
          <Badge
            text={`${relatedShare.availableShares}/${relatedShare.totalShares} available`}
            variant="info"
          />
        </View>

        <View style={styles.shareStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Current Price</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.statValue}>{relatedShare.currentPrice.toFixed(2)} PG</Text>
              <View style={[styles.priceChange, { backgroundColor: priceChangeColor }]}>
                <PriceIcon size={12} color={colors.white} />
                <Text style={styles.priceChangeText}>
                  {relatedShare.priceChangePercent.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Dividend Pool</Text>
            <Text style={styles.statValue}>{relatedShare.dividendPool.toFixed(2)} PG</Text>
          </View>
        </View>

        <View style={styles.buySharesContainer}>
          <Text style={styles.inputLabel}>Buy Shares</Text>
          <View style={styles.shareInputContainer}>
            <TextInput
              style={styles.shareInput}
              value={shareAmount}
              onChangeText={setShareAmount}
              keyboardType="numeric"
              placeholder="# of shares"
            />
            <Text style={styles.shareInputSuffix}>× {relatedShare.currentPrice.toFixed(2)} PG</Text>
          </View>
          <Button
            title="Purchase Shares"
            onPress={handleBuyShares}
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            style={styles.submitButton}
          />
        </View>
      </Card>
    );
  };

  const renderForecastsSection = () => {
    if (relatedForecasts.length === 0) {
      return (
        <Card style={styles.statsCard}>
          <Text style={styles.infoTitle}>Markets</Text>
          <Text style={styles.description}>No active social forecasts.</Text>
        </Card>
      );
    }

    return (
      <View>
        {relatedForecasts.map((f) => {
          const progress = (f.currentValue / f.target.value) * 100;
          return (
            <Card key={f.id} style={styles.statsCard}>
              <View style={styles.shareHeader}>
                <Text style={styles.infoTitle}>{f.title}</Text>
                <Badge text={`${f.odds}x odds`} variant="primary" />
              </View>

              <Text style={styles.description}>{f.description}</Text>

              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{f.pool.toLocaleString()}</Text>
                  <Text style={styles.metricLabel}>PC Pool</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{progress.toFixed(0)}%</Text>
                  <Text style={styles.metricLabel}>Progress</Text>
                </View>
              </View>

              <View style={styles.buySharesContainer}>
                <View style={styles.predictionContainer}>
                  <TouchableOpacity
                    style={[styles.predictionButton, betPrediction === true && styles.predictionButtonActive]}
                    onPress={() => setBetPrediction(true)}
                  >
                    <Text style={[styles.predictionButtonText, betPrediction === true && styles.predictionButtonTextActive]}>YES</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.predictionButton, betPrediction === false && styles.predictionButtonActive]}
                    onPress={() => setBetPrediction(false)}
                  >
                    <Text style={[styles.predictionButtonText, betPrediction === false && styles.predictionButtonTextActive]}>NO</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.betInput}
                  value={betAmount}
                  onChangeText={setBetAmount}
                  keyboardType="numeric"
                  placeholder="Prediction amount"
                />
                <Button
                  title="Make Prediction"
                  onPress={() => handleMakePrediction(f.id)}
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  style={styles.actionButton}
                />
              </View>
            </Card>
          );
        })}
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <PostCard
        post={post}
        onLike={handlePostLike}
        onComment={handlePostComment}
        onShare={handlePostShare}
        onBack={handlePostBack}
        onUserPress={handleUserPress}
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'engagement' && styles.activeTab]}
          onPress={() => setActiveTab('engagement')}
        >
          <Text style={[styles.tabText, activeTab === 'engagement' && styles.activeTabText]}>Engagement</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'markets' && styles.activeTab]}
          onPress={() => setActiveTab('markets')}
        >
          <Text style={[styles.tabText, activeTab === 'markets' && styles.activeTabText]}>Markets</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContent}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'engagement' && renderEngagement()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'markets' && renderForecastsSection()}
      </View>
    </ScrollView>
  );
}
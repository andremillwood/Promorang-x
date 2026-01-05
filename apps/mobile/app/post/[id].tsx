import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PostCard } from '@/components/feed/PostCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useFeedStore } from '@/store/feedStore';
import { useContentShareStore } from '@/store/contentShareStore';
import { useBetStore } from '@/store/betStore';
import { TrendingUp, TrendingDown, Users, Clock, Target, DollarSign } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function PostDetailScreen() {
  const { id, action } = useLocalSearchParams();
  const router = useRouter();
  const { posts, likePost, sharePost, backPost } = useFeedStore();
  const { contentShares, fetchContentShares, buyShares } = useContentShareStore();
  const { bets, fetchBets, placeBet } = useBetStore();
  const [comment, setComment] = useState('');
  const [backAmount, setBackAmount] = useState('');
  const [shareAmount, setShareAmount] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [betPrediction, setBetPrediction] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'shares' | 'bets'>('comments');

  // Find the post by ID
  const post = posts.find(p => p.id === id);
  
  // Find related content share and bets
  const relatedShare = contentShares.find(share => share.content.id === id);
  const relatedBets = bets.filter(bet => bet.contentId === id);

  useEffect(() => {
    fetchContentShares();
    fetchBets();
  }, [fetchContentShares, fetchBets]);

  if (!post) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Post not found</Text>
      </View>
    );
  }

  const handlePostLike = (postId: string) => {
    likePost(postId);
  };

  const handlePostComment = (postId: string) => {
    // Already on the post detail screen
  };

  const handlePostShare = (postId: string) => {
    sharePost(postId);
  };

  const handlePostBack = (postId: string) => {
    // Show back form
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
    // Simulate API call
    setTimeout(() => {
      Alert.alert('Success', 'Your comment has been posted.');
      setComment('');
      setIsSubmitting(false);
    }, 1000);
  };

  const handleSubmitBack = () => {
    const amount = parseFloat(backAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      backPost(post.id, amount);
      Alert.alert('Success', `You&apos;ve backed this post with ${amount}.`);
      setBackAmount('');
      setIsSubmitting(false);
      router.back();
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
      Alert.alert('Success', `You've purchased ${amount} shares for ${(amount * relatedShare.currentPrice).toFixed(2)} PromoGems.`);
      setShareAmount('');
    } catch {
      Alert.alert('Error', 'Failed to purchase shares. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaceBet = async (betId: string) => {
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid bet amount.');
      return;
    }

    if (betPrediction === null) {
      Alert.alert('Error', 'Please select your prediction.');
      return;
    }

    try {
      setIsSubmitting(true);
      await placeBet(betId, amount, betPrediction);
      Alert.alert('Success', `You&apos;ve placed a bet of ${amount} PromoCoins.`);
      setBetAmount('');
      setBetPrediction(null);
    } catch {
      Alert.alert('Error', 'Failed to place bet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSharesSection = () => {
    if (!relatedShare) {
      return (
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Content Shares</Text>
          <Text style={styles.infoDescription}>
            This content doesn&apos;t have shares available yet.
          </Text>
        </Card>
      );
    }

    const priceChangeColor = relatedShare.priceChange >= 0 ? colors.success : colors.error;
    const PriceIcon = relatedShare.priceChange >= 0 ? TrendingUp : TrendingDown;

    return (
      <Card style={styles.infoCard}>
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
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Holders</Text>
            <View style={styles.holdersContainer}>
              <Users size={16} color={colors.darkGray} />
              <Text style={styles.statValue}>{relatedShare.holders}</Text>
            </View>
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
              placeholder="Number of shares"
            />
            <Text style={styles.shareInputSuffix}>
              × {relatedShare.currentPrice.toFixed(2)} PG
            </Text>
          </View>
          {shareAmount && (
            <Text style={styles.totalCost}>
              Total: {(parseInt(shareAmount) * relatedShare.currentPrice).toFixed(2)} PromoGems
            </Text>
          )}
          <Button
            title="Buy Shares"
            onPress={handleBuyShares}
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            style={styles.actionButton}
          />
        </View>
      </Card>
    );
  };

  const renderBetsSection = () => {
    if (relatedBets.length === 0) {
      return (
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Betting Markets</Text>
          <Text style={styles.infoDescription}>
            No active betting markets for this content.
          </Text>
        </Card>
      );
    }

    return (
      <View>
        {relatedBets.map((bet) => {
          const progress = (bet.currentValue / bet.target.value) * 100;
          const timeLeft = new Date(bet.expiresAt).getTime() - Date.now();
          const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
          
          return (
            <Card key={bet.id} style={styles.betCard}>
              <View style={styles.betHeader}>
                <Text style={styles.betTitle}>{bet.title}</Text>
                <Badge text={`${bet.odds}x odds`} variant="primary" />
              </View>
              
              <Text style={styles.betDescription}>{bet.description}</Text>
              
              <View style={styles.betStats}>
                <View style={styles.betStatItem}>
                  <Target size={16} color={colors.darkGray} />
                  <Text style={styles.betStatText}>
                    {bet.currentValue.toLocaleString()} / {bet.target.value.toLocaleString()} {bet.target.metric}
                  </Text>
                </View>
                
                <View style={styles.betStatItem}>
                  <DollarSign size={16} color={colors.darkGray} />
                  <Text style={styles.betStatText}>
                    {bet.pool.toLocaleString()} PC pool
                  </Text>
                </View>
                
                <View style={styles.betStatItem}>
                  <Clock size={16} color={colors.darkGray} />
                  <Text style={styles.betStatText}>
                    {hoursLeft}h left
                  </Text>
                </View>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
                </View>
                <Text style={styles.progressText}>{progress.toFixed(1)}%</Text>
              </View>
              
              <View style={styles.betActions}>
                <Text style={styles.inputLabel}>Place Bet</Text>
                
                <View style={styles.predictionContainer}>
                  <TouchableOpacity
                    style={[
                      styles.predictionButton,
                      betPrediction === true && styles.predictionButtonActive
                    ]}
                    onPress={() => setBetPrediction(true)}
                  >
                    <Text style={[
                      styles.predictionButtonText,
                      betPrediction === true && styles.predictionButtonTextActive
                    ]}>YES</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.predictionButton,
                      betPrediction === false && styles.predictionButtonActive
                    ]}
                    onPress={() => setBetPrediction(false)}
                  >
                    <Text style={[
                      styles.predictionButtonText,
                      betPrediction === false && styles.predictionButtonTextActive
                    ]}>NO</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.betInputContainer}>
                  <TextInput
                    style={styles.betInput}
                    value={betAmount}
                    onChangeText={setBetAmount}
                    keyboardType="numeric"
                    placeholder="Bet amount in PromoCoins"
                  />
                </View>
                
                <Button
                  title="Place Bet"
                  onPress={() => handlePlaceBet(bet.id)}
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
    <ScrollView style={styles.container}>
      <PostCard
        post={post}
        onLike={handlePostLike}
        onComment={handlePostComment}
        onShare={handlePostShare}
        onBack={handlePostBack}
        onUserPress={handleUserPress}
      />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'comments' && styles.activeTab]}
          onPress={() => setActiveTab('comments')}
        >
          <Text style={[styles.tabText, activeTab === 'comments' && styles.activeTabText]}>
            Comments
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shares' && styles.activeTab]}
          onPress={() => setActiveTab('shares')}
        >
          <Text style={[styles.tabText, activeTab === 'shares' && styles.activeTabText]}>
            Shares
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bets' && styles.activeTab]}
          onPress={() => setActiveTab('bets')}
        >
          <Text style={[styles.tabText, activeTab === 'bets' && styles.activeTabText]}>
            Bets
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'comments' && (
        action === 'back' ? (
          <Card style={styles.inputCard}>
            <Text style={styles.inputTitle}>Back this Post</Text>
            <Text style={styles.inputDescription}>
              Invest in this post&apos;s potential. If it goes viral, your investment value increases.
            </Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={backAmount}
                onChangeText={setBackAmount}
                keyboardType="numeric"
                placeholder="Enter amount to invest"
              />
            </View>
            <Button
              title="Back this Post"
              onPress={handleSubmitBack}
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              style={styles.submitButton}
            />
          </Card>
        ) : (
          <Card style={styles.inputCard}>
            <Text style={styles.inputTitle}>Add a Comment</Text>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Write your comment..."
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
        )
      )}
      
      {activeTab === 'shares' && renderSharesSection()}
      
      {activeTab === 'bets' && renderBetsSection()}
    </ScrollView>
  );
}

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
    marginBottom: 32,
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
  infoCard: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
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
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  priceContainer: {
    alignItems: 'center',
  },
  priceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  priceChangeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 2,
  },
  holdersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  buySharesContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 16,
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
    marginBottom: 8,
  },
  shareInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.black,
  },
  shareInputSuffix: {
    fontSize: 14,
    color: colors.darkGray,
  },
  totalCost: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  actionButton: {
    width: '100%',
  },
  betCard: {
    marginBottom: 16,
  },
  betHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  betTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    flex: 1,
    marginRight: 12,
  },
  betDescription: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
    marginBottom: 16,
  },
  betStats: {
    marginBottom: 12,
  },
  betStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  betStatText: {
    fontSize: 14,
    color: colors.darkGray,
    marginLeft: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.darkGray,
    minWidth: 40,
  },
  betActions: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 16,
  },
  predictionContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  predictionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  predictionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  predictionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
  },
  predictionButtonTextActive: {
    color: colors.white,
  },
  betInputContainer: {
    marginBottom: 16,
  },
  betInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.black,
    height: 48,
  },
});
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const MOCK_PULSE_ITEMS = [
  {
    id: '1',
    title: 'Nike Air Max Excee - 40% OFF Coupon',
    brand: 'Nike Official',
    discount: '40% OFF',
    yieldBoost: '3.5x Dividend',
    claimedPercent: 88,
    timeLeft: '04:12',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    piecesRemaining: 14,
  },
  {
    id: '2',
    title: 'Starbucks Seasonal Brew - Free Upgrade Piece',
    brand: 'Starbucks Reserve',
    discount: 'FREE PIECE',
    yieldBoost: '2.0x Dividend',
    claimedPercent: 95,
    timeLeft: '01:45',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    piecesRemaining: 5,
  },
];

export default function MobilePulseFeedScreen() {
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderItem = ({ item }: { item: typeof MOCK_PULSE_ITEMS[0] }) => {
    const isLiked = liked[item.id];

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.overlay} />

        <SafeAreaView style={styles.contentContainer}>
          {/* Header Badges */}
          <View style={styles.headerBadges}>
            <View style={styles.badgeYield}>
              <Ionicons name="flame" size={14} color="#F97316" />
              <Text style={styles.badgeYieldText}>{item.yieldBoost}</Text>
            </View>
            <View style={styles.badgeTimer}>
              <Text style={styles.badgeTimerText}>EXPIRING IN {item.timeLeft}</Text>
            </View>
          </View>

          {/* Right Action Bar */}
          <View style={styles.rightBar}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => toggleLike(item.id)}>
              <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={26} color={isLiked ? '#EF4444' : '#FFFFFF'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="share-social-outline" size={24} color="#F97316" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="chatbubble-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Bottom Info */}
          <View style={styles.bottomInfo}>
            <View style={styles.brandRow}>
              <Text style={styles.discountBadge}>{item.discount}</Text>
              <Text style={styles.brandText}>{item.brand}</Text>
            </View>

            <Text style={styles.titleText}>{item.title}</Text>

            <View style={styles.claimCard}>
              <View style={styles.claimRow}>
                <Text style={styles.claimLabel}>Claimed Volume</Text>
                <Text style={styles.claimPercent}>{item.claimedPercent}%</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.progress, { width: `${item.claimedPercent}%` }]} />
              </View>
            </View>

            <TouchableOpacity style={styles.claimBtn}>
              <Ionicons name="flash" size={18} color="#000000" />
              <Text style={styles.claimBtnText}>CLAIM PIECE NOW</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_PULSE_ITEMS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  card: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  headerBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  badgeYield: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderColor: 'rgba(249, 115, 22, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeYieldText: {
    color: '#F97316',
    fontSize: 12,
    fontWeight: '800',
  },
  badgeTimer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeTimerText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '800',
  },
  rightBar: {
    position: 'absolute',
    right: 16,
    bottom: 180,
    gap: 16,
    alignItems: 'center',
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomInfo: {
    marginBottom: 40,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  discountBadge: {
    backgroundColor: '#F59E0B',
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  brandText: {
    color: '#D4D4D8',
    fontSize: 13,
    fontWeight: '600',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  claimCard: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 14,
    padding: 10,
    marginBottom: 14,
  },
  claimRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  claimLabel: {
    color: '#A1A1AA',
    fontSize: 11,
  },
  claimPercent: {
    color: '#F97316',
    fontSize: 11,
    fontWeight: '800',
  },
  track: {
    height: 6,
    backgroundColor: '#27272A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#F97316',
  },
  claimBtn: {
    backgroundColor: '#F97316',
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  claimBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
  },
});

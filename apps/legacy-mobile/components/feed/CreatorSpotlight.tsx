import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Sparkles, Star, Users, Flame, Heart, ChevronRight, Award } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

export interface CreatorItem {
  id: string;
  name: string;
  username: string;
  avatar: string;
  category: string;
  tier: 'Rising Star' | 'Top Creator' | 'Verified Pro' | 'Trending';
  followers: number;
  totalTips?: number;
  backedCount?: number;
}

export const FEATURED_CREATORS: CreatorItem[] = [
  {
    id: 'user2',
    name: 'Sarah Miller',
    username: 'sarahm',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=1887&q=80',
    category: 'Travel & Lifestyle',
    tier: 'Top Creator',
    followers: 5678,
    totalTips: 840,
    backedCount: 142,
  },
  {
    id: 'user4',
    name: 'Michael Chen',
    username: 'mikec',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1887&q=80',
    category: 'Tech & Photo',
    tier: 'Rising Star',
    followers: 3421,
    totalTips: 320,
    backedCount: 89,
  },
  {
    id: 'creator_elena',
    name: 'Elena Rostova',
    username: 'elenacreates',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Design & Visuals',
    tier: 'Verified Pro',
    followers: 12890,
    totalTips: 2150,
    backedCount: 310,
  },
  {
    id: 'creator_marcus',
    name: 'Marcus Vance',
    username: 'marcusbeats',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Music & Audio',
    tier: 'Trending',
    followers: 8940,
    totalTips: 1120,
    backedCount: 204,
  },
];

interface CreatorSpotlightProps {
  creators?: CreatorItem[];
  onTipCreator?: (creator: CreatorItem) => void;
  title?: string;
  subtitle?: string;
}

export const CreatorSpotlight: React.FC<CreatorSpotlightProps> = ({
  creators = FEATURED_CREATORS,
  onTipCreator,
  title = 'Featured Creators',
  subtitle = 'Discover top voices & support original talent',
}) => {
  const theme = useThemeColors();
  const router = useRouter();

  const getTierColor = (tier: CreatorItem['tier']) => {
    switch (tier) {
      case 'Top Creator':
        return '#F59E0B';
      case 'Verified Pro':
        return '#3B82F6';
      case 'Rising Star':
        return '#EC4899';
      case 'Trending':
        return '#10B981';
      default:
        return colors.primary;
    }
  };

  const formatFollowers = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Sparkles size={18} color={colors.primary} />
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          </View>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
        </View>
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={() => router.push('/(tabs)/discover' as any)}
        >
          <Text style={styles.seeAllText}>Explore</Text>
          <ChevronRight size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {creators.map((creator) => {
          const tierColor = getTierColor(creator.tier);
          return (
            <TouchableOpacity
              key={creator.id}
              style={[
                styles.creatorCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
              onPress={() => router.push(`/profile/${creator.id}` as any)}
              activeOpacity={0.88}
            >
              {/* Tier Banner */}
              <View style={[styles.tierTag, { backgroundColor: tierColor + '18' }]}>
                <Text style={[styles.tierText, { color: tierColor }]}>{creator.tier}</Text>
              </View>

              {/* Avatar & Basic Info */}
              <View style={styles.avatarSection}>
                <Avatar
                  source={creator.avatar}
                  size="lg"
                  name={creator.name}
                  style={styles.avatar}
                />
                <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                  {creator.name}
                </Text>
                <Text style={[styles.username, { color: theme.textSecondary }]} numberOfLines={1}>
                  @{creator.username}
                </Text>
                <Text style={[styles.category, { color: colors.primary }]} numberOfLines={1}>
                  {creator.category}
                </Text>
              </View>

              {/* Metrics */}
              <View style={[styles.metricsRow, { borderTopColor: theme.border }]}>
                <View style={styles.metricItem}>
                  <Users size={12} color={theme.textSecondary} />
                  <Text style={[styles.metricText, { color: theme.text }]}>
                    {formatFollowers(creator.followers)}
                  </Text>
                </View>
                {creator.backedCount ? (
                  <View style={styles.metricItem}>
                    <Flame size={12} color="#F97316" />
                    <Text style={[styles.metricText, { color: theme.text }]}>
                      {creator.backedCount} fans
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Actions */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.tipBtn, { backgroundColor: colors.primary + '15' }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    if (onTipCreator) {
                      onTipCreator(creator);
                    } else {
                      router.push(`/profile/${creator.id}` as any);
                    }
                  }}
                >
                  <Heart size={13} color={colors.primary} fill={colors.primary} />
                  <Text style={styles.tipBtnText}>Tip</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.profileBtn, { backgroundColor: colors.primary }]}
                  onPress={() => router.push(`/profile/${creator.id}` as any)}
                >
                  <Text style={styles.profileBtnText}>View</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  creatorCard: {
    width: 165,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    overflow: 'hidden',
  },
  tierTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'center',
  },
  tierText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  avatarSection: {
    alignItems: 'center',
    width: '100%',
  },
  avatar: {
    marginBottom: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  username: {
    fontSize: 11,
    marginTop: 1,
    textAlign: 'center',
  },
  category: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
    marginTop: 10,
  },
  tipBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tipBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  profileBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
  },
  profileBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
});

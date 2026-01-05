import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, DollarSign, TrendingUp, Users } from 'lucide-react-native';
import { Bet } from '@/types';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import colors from '@/constants/colors';

interface BetCardProps {
  bet: Bet;
  onPress: (betId: string) => void;
}

export const BetCard: React.FC<BetCardProps> = ({ bet, onPress }) => {
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return '#E1306C';
      case 'tiktok':
        return '#000000';
      case 'twitter':
        return '#1DA1F2';
      case 'facebook':
        return '#4267B2';
      default:
        return colors.darkGray;
    }
  };

  const progress = bet.currentValue / bet.target.value;

  return (
    <TouchableOpacity onPress={() => onPress(bet.id)} activeOpacity={0.8}>
      <Card style={styles.card} variant="elevated">
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {bet.title}
            </Text>
            <View
              style={[
                styles.platformBadge,
                { backgroundColor: getPlatformColor(bet.target.platform) },
              ]}
            >
              <Text style={styles.platformText}>{bet.target.platform}</Text>
            </View>
          </View>
          <Avatar
            source={bet.creator.avatar}
            size="sm"
            name={bet.creator.name}
          />
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {bet.description}
        </Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {bet.currentValue.toLocaleString()} / {bet.target.value.toLocaleString()} {bet.target.metric}
            </Text>
            <Text style={styles.progressPercent}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
          <ProgressBar progress={progress} height={6} />
        </View>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <DollarSign size={16} color={colors.success} />
            <Text style={styles.metaText}>${bet.pool} pool</Text>
          </View>
          <View style={styles.metaItem}>
            <TrendingUp size={16} color={colors.primary} />
            <Text style={styles.metaText}>{bet.odds}x odds</Text>
          </View>
          <View style={styles.metaItem}>
            <Users size={16} color={colors.darkGray} />
            <Text style={styles.metaText}>{bet.participants} participants</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.creator}>{bet.creator.name}</Text>
          <View style={styles.timeContainer}>
            <Clock size={14} color={colors.error} />
            <Text style={styles.timeText}>
              Ends: {new Date(bet.expiresAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginRight: 8,
    flex: 1,
  },
  platformBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  platformText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.darkGray,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: colors.darkGray,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 8,
  },
  creator: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: colors.error,
    marginLeft: 4,
  },
});
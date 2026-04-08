import { Image } from 'expo-image';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle, Share, TrendingUp, ExternalLink, DollarSign, Bookmark, Share2 } from 'lucide-react-native';
import { Post } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SwipeableCard } from '@/components/ui/SwipeableCard';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useThemeColors } from '@/hooks/useThemeColors';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onBack: (postId: string) => void;
  onUserPress: (userId: string) => void;
  onPostPress?: (postId: string) => void;
  onSave?: (postId: string) => void;
  showActions?: boolean;
  enableSwipe?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onBack,
  onUserPress,
  onPostPress,
  onSave,
  showActions = true,
  enableSwipe = true,
}) => {
  const theme = useThemeColors();

  const handleSwipeSave = () => {
    if (onSave) {
      onSave(post.id);
    }
  };

  const handleSwipeShare = () => {
    onShare(post.id);
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getPlatformIcon = () => {
    const platform = post.sourcePlatform || post.platform || 'other';
    // Mapping icons (simplified for mobile)
    return <ExternalLink size={14} color={colors.darkGray} />;
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const cardContent = (
    <Card style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }] as any} variant="default" padding="none">
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => post.creator && onUserPress(post.creator.id)}
        >
          <Avatar
            source={post.creator?.avatar}
            size="md"
            name={post.creator?.name || 'User'}
          />
          <View style={styles.nameContainer}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: theme.text }]}>{post.creator?.name || 'Unknown User'}</Text>
              {(post.is_demo || post.id.includes('demo')) && (
                <Badge text="Demo" variant="primary" size="sm" style={styles.miniBadge} />
              )}
              {(post.is_sponsored) && (
                <Badge text="Sponsored" variant="warning" size="sm" style={styles.miniBadge} />
              )}
            </View>
            <Text style={[styles.username, { color: theme.textSecondary }]}>@{post.creator?.username || 'user'}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <Text style={[styles.date, { color: theme.textSecondary }]}>{post.createdAt ? formatDate(post.createdAt) : ''}</Text>
          <View style={styles.viewsContainer}>
            <TrendingUp size={12} color={theme.textSecondary} />
            <Text style={[styles.viewsText, { color: theme.textSecondary }]}>{formatNumber(post.views_count)} views</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.content}
        onPress={() => onPostPress?.(post.id)}
        activeOpacity={0.95}
      >
        {post.title && <Text style={[styles.postTitle, { color: theme.text }]}>{post.title}</Text>}
        {(post.content?.text || post.description) && (
          <Text style={[styles.text, { color: theme.text }]}>{post.content?.text || post.description}</Text>
        )}
        {(post.content?.media || post.content?.media_url) && (
          <Image
            source={{ uri: post.content?.media_url || (post.content?.media && post.content.media[0]) }}
            style={styles.media}
            contentFit="cover"
            transition={200}
          />
        )}
      </TouchableOpacity>

      <View style={[styles.revenueRow, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <View style={styles.revenueItem}>
          <DollarSign size={16} color={colors.success} />
          <View>
            <Text style={[styles.revenueValue, { color: theme.text }]}>${formatNumber(post.current_revenue)}</Text>
            <Text style={[styles.revenueLabel, { color: theme.textSecondary }]}>Current Revenue</Text>
          </View>
        </View>
        {post.isBacked && (
          <View style={styles.revenueItem}>
            <TrendingUp size={16} color={colors.primary} />
            <View>
              <Text style={[styles.revenueValue, { color: theme.text }]}>
                {formatNumber((post.total_shares || 0) - (post.available_shares || 0))} / {formatNumber(post.total_shares || 0)}
              </Text>
              <Text style={[styles.revenueLabel, { color: theme.textSecondary }]}>Shares Owned</Text>
            </View>
          </View>
        )}
      </View>

      {post.engagement_shares_remaining && post.engagement_shares_remaining > 0 && (
        <View style={[styles.freeSharesBanner, { backgroundColor: colors.success + '15' }]}>
          <Text style={styles.freeSharesText}>
            🔥 {formatNumber(post.engagement_shares_remaining)} free shares available!
          </Text>
        </View>
      )}

      {showActions && (
        <View style={[styles.actions, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onLike(post.id)}
          >
            <Heart
              size={20}
              color={post.isLiked ? colors.error : theme.textSecondary}
              fill={post.isLiked ? colors.error : 'transparent'}
            />
            <Text style={[styles.actionText, { color: theme.textSecondary }]}>{post.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onComment(post.id)}
          >
            <MessageCircle size={20} color={theme.textSecondary} />
            <Text style={[styles.actionText, { color: theme.textSecondary }]}>{post.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onShare(post.id)}
          >
            <Share
              size={20}
              color={post.isShared ? colors.primary : theme.textSecondary}
            />
            <Text style={[styles.actionText, { color: theme.textSecondary }]}>{post.shares}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.backButton, { backgroundColor: colors.primary + '08' }]}
            onPress={() => onBack(post.id)}
          >
            <TrendingUp size={20} color={post.isBacked ? colors.success : theme.textSecondary} />
            <Text
              style={[
                styles.actionText,
                { color: post.isBacked ? colors.success : theme.textSecondary },
              ]}
            >
              {post.isBacked ? 'Invested' : 'Invest'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );

  // Wrap with SwipeableCard if enabled
  if (enableSwipe) {
    return (
      <SwipeableCard
        onSwipeLeft={handleSwipeShare}
        onSwipeRight={handleSwipeSave}
        leftAction={{
          icon: <Share2 size={24} color="#FFFFFF" />,
          label: 'Share',
          color: '#FFFFFF',
          backgroundColor: '#3B82F6',
        }}
        rightAction={{
          icon: <Bookmark size={24} color="#FFFFFF" />,
          label: 'Save',
          color: '#FFFFFF',
          backgroundColor: '#10B981',
        }}
      >
        {cardContent}
      </SwipeableCard>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nameContainer: {
    marginLeft: 10,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    ...typography.presets.bodySmall,
    fontWeight: typography.weight.bold,
    color: colors.black,
  },
  miniBadge: {
    marginLeft: 6,
    paddingHorizontal: 4,
    height: 18,
  },
  username: {
    ...typography.presets.caption,
    color: colors.darkGray,
    marginTop: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  date: {
    ...typography.presets.caption,
    color: colors.darkGray,
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  viewsText: {
    fontSize: typography.size.xs - 1,
    color: colors.darkGray,
    marginLeft: 4,
  },
  content: {
    width: '100%',
  },
  postTitle: {
    ...typography.presets.body,
    fontWeight: typography.weight.bold,
    color: colors.black,
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  text: {
    ...typography.presets.bodySmall,
    lineHeight: typography.lineHeight.normal * 14,
    color: colors.black,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  media: {
    width: '100%',
    height: 300,
    backgroundColor: colors.lightGray,
  },
  revenueRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray + '50',
    backgroundColor: colors.white,
  },
  revenueItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  revenueValue: {
    ...typography.presets.bodySmall,
    fontWeight: typography.weight.bold,
    color: colors.black,
    marginLeft: 8,
  },
  revenueLabel: {
    ...typography.presets.caption,
    fontSize: 10,
    color: colors.darkGray,
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  freeSharesBanner: {
    backgroundColor: colors.success + '15',
    paddingVertical: 6,
    alignItems: 'center',
  },
  freeSharesText: {
    ...typography.presets.caption,
    fontWeight: typography.weight.semibold,
    color: colors.success,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    padding: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  backButton: {
    backgroundColor: colors.primary + '08',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    color: colors.darkGray,
    marginLeft: 6,
    fontWeight: '500',
  },
});
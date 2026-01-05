import { Image } from 'expo-image';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle, Share, TrendingUp, ExternalLink } from 'lucide-react-native';
import { Post } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import colors from '@/constants/colors';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onBack: (postId: string) => void;
  onUserPress: (userId: string) => void;
  onPostPress?: (postId: string) => void;
  showActions?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onBack,
  onUserPress,
  onPostPress,
  showActions = true,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Added source platform display
  const getSourcePlatform = () => {
    // This would come from the post data in a real app
    const sourcePlatform = post.id === 'post1' ? 'instagram' :
      post.id === 'post2' ? 'tiktok' :
        post.id === 'post3' ? 'youtube' : null;

    if (!sourcePlatform) return null;

    return (
      <View style={styles.sourceContainer}>
        <ExternalLink size={14} color={colors.darkGray} />
        <Text style={styles.sourceText}>
          via {sourcePlatform.charAt(0).toUpperCase() + sourcePlatform.slice(1)}
        </Text>
      </View>
    );
  };

  return (
    <Card style={styles.card} variant="default" padding="none">
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => onUserPress(post.creator.id)}
        >
          <Avatar
            source={post.creator.avatar}
            size="md"
            name={post.creator.name}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{post.creator.name}</Text>
            <Text style={styles.username}>@{post.creator.username}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
      </View>

      <TouchableOpacity
        style={styles.content}
        onPress={() => onPostPress?.(post.id)}
        activeOpacity={0.95}
      >
        {post.content.text && (
          <Text style={styles.text}>{post.content.text}</Text>
        )}
        {post.content.type === 'image' && post.content.media && post.content.media.length > 0 && (
          <Image
            source={{ uri: post.content.media[0] }}
            style={styles.media}
            contentFit="cover"
            transition={200}
          />
        )}
        {getSourcePlatform()}
      </TouchableOpacity>

      {post.isBacked && post.currentValue && post.backPrice && (
        <View style={styles.backInfo}>
          <TrendingUp size={16} color={colors.success} />
          <Text style={styles.backText}>
            Backed for ${post.backPrice.toFixed(2)}, now worth ${post.currentValue.toFixed(2)}
          </Text>
        </View>
      )}

      <View style={styles.monetizationOptions}>
        {post.id === 'post1' && (
          <Badge
            text="Content Shares Enabled"
            variant="success"
            size="sm"
            style={styles.monetizationBadge}
          />
        )}
        {post.id === 'post2' && (
          <Badge
            text="Social Betting Enabled"
            variant="primary"
            size="sm"
            style={styles.monetizationBadge}
          />
        )}
      </View>

      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onLike(post.id)}
          >
            <Heart
              size={20}
              color={post.isLiked ? colors.error : colors.darkGray}
              fill={post.isLiked ? colors.error : 'transparent'}
            />
            <Text style={styles.actionText}>{post.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onComment(post.id)}
          >
            <MessageCircle size={20} color={colors.darkGray} />
            <Text style={styles.actionText}>{post.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onShare(post.id)}
          >
            <Share
              size={20}
              color={post.isShared ? colors.primary : colors.darkGray}
            />
            <Text style={styles.actionText}>{post.shares}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.backButton]}
            onPress={() => onBack(post.id)}
          >
            <TrendingUp size={20} color={post.isBacked ? colors.success : colors.darkGray} />
            <Text
              style={[
                styles.actionText,
                post.isBacked && { color: colors.success },
              ]}
            >
              {post.isBacked ? 'Backed' : 'Back'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
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
  },
  nameContainer: {
    marginLeft: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  username: {
    fontSize: 12,
    color: colors.darkGray,
  },
  date: {
    fontSize: 12,
    color: colors.darkGray,
  },
  content: {
    width: '100%',
  },
  text: {
    fontSize: 14,
    color: colors.black,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  media: {
    width: '100%',
    height: 300,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingTop: 8,
  },
  sourceText: {
    fontSize: 12,
    color: colors.darkGray,
    marginLeft: 4,
  },
  backInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  backText: {
    fontSize: 12,
    color: colors.success,
    marginLeft: 4,
    fontWeight: '500',
  },
  monetizationOptions: {
    flexDirection: 'row',
    padding: 12,
    paddingTop: 0,
    paddingBottom: 8,
  },
  monetizationBadge: {
    marginRight: 8,
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
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderRadius: 4,
  },
  actionText: {
    fontSize: 12,
    color: colors.darkGray,
    marginLeft: 4,
  },
});
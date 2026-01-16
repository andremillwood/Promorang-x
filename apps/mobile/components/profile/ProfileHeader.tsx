import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Clipboard, Alert } from 'react-native';
import { Image } from 'expo-image';
import { User } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Gem, Award, Share2, Instagram, CheckCircle2, Briefcase,
  Copy, Star, Users, DollarSign, Trophy, TrendingUp
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { InstagramVerificationModal } from './InstagramVerificationModal';
import { useWalletStore } from '@/store/walletStore';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { LinearGradient } from 'expo-linear-gradient';

interface ProfileHeaderProps {
  user: User;
  isCurrentUser: boolean;
  onEditProfile?: () => void;
  onFollow?: () => void;
  isFollowing?: boolean;
  leaderboardPosition?: number | null;
  store?: any;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isCurrentUser,
  onEditProfile,
  onFollow,
  isFollowing = false,
  leaderboardPosition,
  store,
}) => {
  const [showIGModal, setShowIGModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const theme = useThemeColors();
  const { fetchTransactions } = useWalletStore();
  const router = useRouter();

  const handleEditProfile = () => {
    if (onEditProfile) {
      onEditProfile();
    }
  };

  const handleFollow = () => {
    if (onFollow) {
      onFollow();
    }
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out ${user.name}'s profile on Promorang! @${user.username}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const copyReferralCode = () => {
    const code = user.referral_code || user.referralCode;
    if (code) {
      Clipboard.setString(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareReferral = async () => {
    const code = user.referral_code || user.referralCode;
    try {
      await Share.share({
        message: `Join Promorang using my referral code: ${code}! Earn rewards and grow your channel.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleIGSuccess = (points: number) => {
    fetchTransactions();
  };

  const userLevel = typeof user.level === 'number' ? user.level : 1;
  const userXp = user.xp || 0;
  const xpToNextLevel = (userLevel + 1) * 1000;
  const xpProgress = Math.min(100, (userXp / xpToNextLevel) * 100);
  const xpRemaining = xpToNextLevel - userXp;

  const stats = [
    {
      label: 'Earnings',
      value: `$${(user.total_earnings_usd || user.earnings || 0).toFixed(2)}`,
      icon: DollarSign,
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      label: 'XP Points',
      value: userXp.toLocaleString(),
      icon: Star,
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      label: 'Followers',
      value: user.followers.toLocaleString(),
      icon: Users,
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    {
      label: 'Level',
      value: userLevel.toString(),
      icon: Award,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
  ];

  return (
    <View style={styles.container}>
      {/* Cover Banner */}
      <LinearGradient
        colors={['#FF6B00', '#FF3366', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.coverBanner}
      >
        {/* Leaderboard Position Badge */}
        {leaderboardPosition && (
          <View style={styles.leaderboardBadge}>
            <Trophy size={14} color="#F59E0B" />
            <Text style={styles.leaderboardText}>#{leaderboardPosition}</Text>
          </View>
        )}
      </LinearGradient>

      {/* Profile Content */}
      <View style={[styles.content, { backgroundColor: theme.surface }]}>
        {/* Avatar - overlapping banner */}
        <View style={styles.avatarContainer}>
          <Avatar
            source={user.avatar_url || user.avatar}
            size="xl"
            name={user.display_name || user.name}
            borderColor="#FFF"
            style={styles.avatar}
          />
          {isCurrentUser && (
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={handleEditProfile}
            >
              <TrendingUp size={14} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Name and Username */}
        <View style={styles.nameSection}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.text }]}>
              {user.display_name || user.name}
            </Text>
            <Badge
              text={`Level ${userLevel}`}
              variant="primary"
              size="sm"
              style={styles.levelBadge}
            />
          </View>
          <Text style={[styles.username, { color: theme.textSecondary }]}>
            @{user.username}
          </Text>

          {user.instagram_verified && (
            <View style={[styles.verifiedBadge, { backgroundColor: colors.primary + '15' }]}>
              <Instagram size={14} color={colors.primary} />
              <Text style={styles.verifiedText}>@{user.instagram_handle} Verified</Text>
              <CheckCircle2 size={14} color={colors.success} style={{ marginLeft: 4 }} />
            </View>
          )}
        </View>

        {/* Bio */}
        {user.bio && (
          <View style={[styles.bioContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.bio, { color: theme.text }]}>{user.bio}</Text>
          </View>
        )}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <View
                key={stat.label}
                style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={[styles.statIconContainer, { backgroundColor: stat.bgColor }]}>
                  <IconComponent size={18} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Level Progress */}
        <View style={[styles.progressCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: theme.text }]}>Level Progress</Text>
            <Text style={styles.progressXP}>{xpRemaining.toLocaleString()} XP to next</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
              <LinearGradient
                colors={['#F59E0B', '#FF6B00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${xpProgress}%` }]}
              />
            </View>
            <Text style={[styles.progressPercent, { color: theme.textSecondary }]}>
              {xpProgress.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Referral Code - Only for current user */}
        {isCurrentUser && (
          <View style={[styles.referralCard, { backgroundColor: theme.card, borderColor: colors.primary }]}>
            <View style={styles.referralHeader}>
              <Text style={[styles.referralTitle, { color: theme.text }]}>Your Referral Code</Text>
              <Text style={[styles.referralSubtitle, { color: theme.textSecondary }]}>
                Invite friends & earn rewards
              </Text>
            </View>
            <View style={styles.referralActions}>
              <TouchableOpacity
                style={[styles.referralCodeBox, { backgroundColor: colors.primary + '10' }]}
                onPress={copyReferralCode}
              >
                <Text style={styles.referralCode}>
                  {user.referral_code || user.referralCode || 'N/A'}
                </Text>
                {copied ? (
                  <CheckCircle2 size={16} color={colors.success} />
                ) : (
                  <Copy size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareReferralButton}
                onPress={handleShareReferral}
              >
                <Share2 size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {isCurrentUser ? (
            <View style={styles.actionColumn}>
              {!user.instagram_verified && (
                <Button
                  title="Verify Instagram for Rewards"
                  onPress={() => setShowIGModal(true)}
                  variant="primary"
                  size="md"
                  style={styles.fullWidthButton}
                  leftIcon={<Instagram size={18} color={colors.white} />}
                />
              )}
              {user.role !== 'advertiser' && (
                <Button
                  title="Become a Brand"
                  onPress={() => router.push('/profile/become-advertiser' as any)}
                  variant="outline"
                  size="md"
                  style={[styles.fullWidthButton, { borderColor: theme.border }]}
                  leftIcon={<Briefcase size={18} color={colors.primary} />}
                />
              )}
              {user.role !== 'merchant' && user.role !== 'advertiser' && (
                <Button
                  title="Become a Merchant"
                  onPress={() => router.push('/profile/become-merchant' as any)}
                  variant="outline"
                  size="md"
                  style={[styles.fullWidthButton, { borderColor: theme.border }]}
                  leftIcon={<StoreIcon size={18} color={colors.primary} />}
                />
              )}
              {store && (
                <Button
                  title="Visit My Store"
                  onPress={() => router.push({ pathname: '/store/[slug]', params: { slug: store.store_slug } } as any)}
                  variant="primary"
                  size="md"
                  style={styles.fullWidthButton}
                  leftIcon={<StoreIcon size={18} color={colors.white} />}
                />
              )}
              <View style={styles.actionRow}>
                {user.role === 'advertiser' ? (
                  <Button
                    title="Brand Console"
                    onPress={() => router.push('/advertiser/dashboard')}
                    variant="primary"
                    size="md"
                    style={styles.primaryButton}
                    leftIcon={<Briefcase size={16} color={colors.white} />}
                  />
                ) : user.role === 'merchant' ? (
                  <Button
                    title="Merchant Console"
                    onPress={() => router.push('/merchant/dashboard')}
                    variant="primary"
                    size="md"
                    style={styles.primaryButton}
                    leftIcon={<StoreIcon size={16} color={colors.white} />}
                  />
                ) : (
                  <Button
                    title="Edit Profile"
                    onPress={handleEditProfile}
                    variant="outline"
                    size="md"
                    style={[styles.primaryButton, { borderColor: theme.border }]}
                  />
                )}
                <Button
                  title="Share"
                  onPress={handleShareProfile}
                  variant="outline"
                  size="md"
                  style={[styles.secondaryButton, { borderColor: theme.border }]}
                  leftIcon={<Share2 size={16} color={colors.primary} />}
                />
              </View>
            </View>
          ) : (
            <View style={styles.actionRow}>
              <Button
                title={isFollowing ? "Following" : "Follow"}
                onPress={handleFollow}
                variant={isFollowing ? "outline" : "primary"}
                size="md"
                style={[styles.primaryButton, isFollowing && { borderColor: theme.border }]}
              />
              <Button
                title="Message"
                onPress={() => console.log('Message user')}
                variant="outline"
                size="md"
                style={[styles.secondaryButton, { borderColor: theme.border }]}
              />
            </View>
          )}
        </View>
      </View>

      <InstagramVerificationModal
        visible={showIGModal}
        onClose={() => setShowIGModal(false)}
        onSuccess={handleIGSuccess}
      />
    </View>
  );
};

// Add Store icon as it's not imported but used in my replacement
import { Store as StoreIcon } from 'lucide-react-native';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  coverBanner: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  leaderboardBadge: {
    position: 'absolute',
    top: 50,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  leaderboardText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    marginTop: -50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  avatarContainer: {
    position: 'absolute',
    top: -45,
    left: 20,
  },
  avatar: {
    borderWidth: 4,
    borderColor: '#FFF',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  nameSection: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    marginRight: 10,
  },
  levelBadge: {
    marginTop: 2,
  },
  username: {
    fontSize: 15,
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  bioContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressXP: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  referralCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  referralHeader: {
    marginBottom: 12,
  },
  referralTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  referralSubtitle: {
    fontSize: 13,
  },
  referralActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  referralCodeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  referralCode: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
  },
  shareReferralButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContainer: {
    // gap handled by children margins
  },
  actionColumn: {
    gap: 12,
  },
  fullWidthButton: {
    // styling handled by Button
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 2,
  },
  secondaryButton: {
    flex: 1,
  },
});
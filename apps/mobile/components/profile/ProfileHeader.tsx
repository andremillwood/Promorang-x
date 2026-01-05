import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { User } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Gem, Award, Share2, Instagram, CheckCircle2, Briefcase } from 'lucide-react-native';
import colors from '@/constants/colors';
import { InstagramVerificationModal } from './InstagramVerificationModal';
import { useWalletStore } from '@/store/walletStore';
import { useRouter } from 'expo-router';

interface ProfileHeaderProps {
  user: User;
  isCurrentUser: boolean;
  onEditProfile?: () => void;
  onFollow?: () => void;
  isFollowing?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isCurrentUser,
  onEditProfile,
  onFollow,
  isFollowing = false,
}) => {
  const [showIGModal, setShowIGModal] = useState(false);
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

  const handleShareReferral = async () => {
    try {
      await Share.share({
        message: `Join Promorang using my referral code: ${user.referralCode}! Earn rewards and grow your channel.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleIGSuccess = (points: number) => {
    // Refresh wallet after points awarded
    fetchTransactions();
    // In a real app, you might also want to refresh the user object in useAuthStore
  };

  const userLevel = user.level || "Rising Promoter";
  const userXp = user.xp || 65; // percentage

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Avatar
          source={user.avatar}
          size="xl"
          name={user.name}
          borderColor={colors.primary}
          style={styles.avatar}
        />
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${user.earnings.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{user.name}</Text>
          <Badge
            text={userLevel.toString()}
            variant="primary"
            size="sm"
            style={styles.levelBadge}
          />
        </View>
        <Text style={styles.username}>@{user.username}</Text>
        {user.instagram_verified && (
          <View style={styles.verifiedBadge}>
            <Instagram size={14} color={colors.primary} />
            <Text style={styles.verifiedText}>@{user.instagram_handle} Verified</Text>
            <CheckCircle2 size={14} color={colors.success} style={{ marginLeft: 4 }} />
          </View>
        )}
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}

        <View style={styles.badgesContainer}>
          <View style={styles.badgeItem}>
            <Award size={16} color={colors.primary} />
            <Text style={styles.badgeText}>Top 5% Earner</Text>
          </View>
          <View style={styles.badgeItem}>
            <Gem size={16} color={colors.primary} />
            <Text style={styles.badgeText}>{user.promoGems || 0} PromoGems</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Level Progress</Text>
            <Text style={styles.progressValue}>{userXp}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${userXp}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.actionContainer}>
        {isCurrentUser ? (
          <View style={styles.columnContainer}>
            {!user.instagram_verified && (
              <Button
                title="Verify Instagram for Reward Points"
                onPress={() => setShowIGModal(true)}
                variant="primary"
                size="md"
                style={styles.verifyButton}
                leftIcon={<Instagram size={18} color={colors.white} />}
              />
            )}
            {user.role !== 'advertiser' && (
              <Button
                title="Become a Brand"
                onPress={() => router.push('/profile/become-advertiser' as any)}
                variant="outline"
                size="md"
                style={styles.verifyButton}
                leftIcon={<Briefcase size={18} color={colors.primary} />}
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
              ) : (
                <Button
                  title="Edit Profile"
                  onPress={handleEditProfile}
                  variant="outline"
                  size="md"
                  style={styles.primaryButton}
                />
              )}
              <Button
                title="Share"
                onPress={handleShareProfile}
                variant="outline"
                size="md"
                style={styles.secondaryButton}
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
              style={styles.primaryButton}
            />
            <Button
              title="Message"
              onPress={() => { console.log('Message user'); }}
              variant="outline"
              size="md"
              style={styles.secondaryButton}
            />
          </View>
        )}
      </View>

      {isCurrentUser && (
        <View style={styles.referralContainer}>
          <Text style={styles.referralLabel}>Your Referral Code:</Text>
          <TouchableOpacity style={styles.referralCode} onPress={handleShareReferral}>
            <Text style={styles.referralCodeText}>{user.referralCode}</Text>
            <Share2 size={12} color={colors.primary} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      )}

      <InstagramVerificationModal
        visible={showIGModal}
        onClose={() => setShowIGModal(false)}
        onSuccess={handleIGSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.white,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    marginRight: 16,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  statLabel: {
    fontSize: 12,
    color: colors.darkGray,
  },
  infoContainer: {
    marginBottom: 16,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    marginRight: 8,
  },
  levelBadge: {
    marginTop: 2,
  },
  username: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: colors.black,
    marginBottom: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.darkGray,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  actionContainer: {
    marginBottom: 16,
  },
  columnContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  verifyButton: {
    marginBottom: 12,
    backgroundColor: colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
  primaryButton: {
    flex: 2,
    marginRight: 8,
  },
  secondaryButton: {
    flex: 1,
  },
  referralContainer: {
    backgroundColor: colors.gray,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  referralLabel: {
    fontSize: 14,
    color: colors.darkGray,
  },
  referralCode: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  referralCodeText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});
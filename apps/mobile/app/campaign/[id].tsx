import { Image } from 'expo-image';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DollarSign, Share2, ShoppingCart, Calendar, Link, Copy } from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Badge } from '@/components/ui/Badge';
import { useCampaignStore } from '@/store/campaignStore';
import colors from '@/constants/colors';

export default function CampaignDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { campaigns, myCampaigns, joinCampaign, isLoading } = useCampaignStore();
  const [joining, setJoining] = useState(false);

  // Find the campaign in either campaigns or myCampaigns
  const campaign = [...campaigns, ...myCampaigns].find(c => c.id === id);
  const isJoined = myCampaigns.some(c => c.id === id);

  if (!campaign) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Campaign not found</Text>
      </View>
    );
  }

  const handleJoin = async () => {
    setJoining(true);
    try {
      await joinCampaign(campaign.id);
      Alert.alert('Success', 'You have successfully joined this campaign.');
    } catch (error) {
      Alert.alert('Error', 'Failed to join campaign. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this campaign: ${campaign.title} - Earn ${campaign.rewardType === 'percentage' ? campaign.reward + '%' : '$' + campaign.reward} for each conversion!`,
        title: campaign.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share campaign.');
    }
  };

  const handleCopyLink = () => {
    // In a real app, you would generate and copy a unique referral link
    Alert.alert('Success', 'Referral link copied to clipboard!');
  };

  const handleMerchantPress = () => {
    router.push(`/profile/${campaign.merchant.id}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: campaign.media }}
        style={styles.coverImage}
        contentFit="cover"
        transition={200}
      />

      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{campaign.title}</Text>
          <Badge
            text={campaign.category}
            variant="primary"
            size="sm"
            style={styles.badge}
          />
        </View>

        <View style={styles.merchantContainer}>
          <Avatar
            source={campaign.merchant.avatar}
            size="md"
            name={campaign.merchant.name}
          />
          <View style={styles.merchantInfo}>
            <Text style={styles.merchantName}>{campaign.merchant.name}</Text>
            <Text style={styles.merchantRole}>Campaign Creator</Text>
          </View>
          <Button
            title="View Profile"
            variant="outline"
            size="sm"
            onPress={handleMerchantPress}
          />
        </View>

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{campaign.description}</Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <DollarSign size={20} color={colors.success} />
            <Text style={styles.metaLabel}>Reward</Text>
            <Text style={styles.metaValue}>
              {campaign.rewardType === 'percentage'
                ? `${campaign.reward}%`
                : `$${campaign.reward}`}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Share2 size={20} color={colors.darkGray} />
            <Text style={styles.metaLabel}>Shares</Text>
            <Text style={styles.metaValue}>{campaign.shares}</Text>
          </View>
          <View style={styles.metaItem}>
            <ShoppingCart size={20} color={colors.darkGray} />
            <Text style={styles.metaLabel}>Conversions</Text>
            <Text style={styles.metaValue}>{campaign.conversions}</Text>
          </View>
        </View>

        {campaign.expiresAt && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.expiryContainer}>
              <Calendar size={20} color={colors.warning} />
              <Text style={styles.expiryText}>
                Campaign ends on {new Date(campaign.expiresAt).toLocaleDateString()}
              </Text>
            </View>
          </>
        )}
      </Card>

      <View style={styles.actionContainer}>
        {!isJoined ? (
          <Button
            title="Join Campaign"
            onPress={handleJoin}
            variant="primary"
            size="lg"
            isLoading={joining}
            style={styles.button}
          />
        ) : (
          <>
            <Button
              title="Share Campaign"
              onPress={handleShare}
              variant="primary"
              size="lg"
              leftIcon={<Share2 size={20} color={colors.white} />}
              style={styles.button}
            />
            <Button
              title="Copy Referral Link"
              onPress={handleCopyLink}
              variant="outline"
              size="lg"
              leftIcon={<Copy size={20} color={colors.primary} />}
              style={[styles.button, styles.secondaryButton]}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  notFound: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
    color: colors.darkGray,
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  card: {
    margin: 16,
    marginTop: -40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    marginTop: 4,
  },
  merchantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  merchantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  merchantRole: {
    fontSize: 12,
    color: colors.darkGray,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.black,
    lineHeight: 22,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaItem: {
    alignItems: 'center',
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 4,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.warning}10`,
    padding: 12,
    borderRadius: 8,
  },
  expiryText: {
    fontSize: 14,
    color: colors.black,
    marginLeft: 8,
  },
  actionContainer: {
    padding: 16,
    marginBottom: 16,
  },
  button: {
    width: '100%',
    marginBottom: 12,
  },
  secondaryButton: {
    marginBottom: 0,
  },
});
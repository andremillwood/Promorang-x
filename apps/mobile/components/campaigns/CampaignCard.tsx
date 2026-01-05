import { Image } from 'expo-image';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DollarSign, Share2, ShoppingCart } from 'lucide-react-native';
import { Campaign } from '@/types';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import colors from '@/constants/colors';

interface CampaignCardProps {
  campaign: Campaign;
  onPress: (campaignId: string) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={() => onPress(campaign.id)} activeOpacity={0.8}>
      <Card style={styles.card} variant="elevated" padding="none">
        <Image
          source={{ uri: campaign.media }}
          style={styles.media}
          contentFit="cover"
        />

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={2}>
                {campaign.title}
              </Text>
              <Badge
                text={campaign.category}
                variant="primary"
                size="sm"
                style={styles.badge}
              />
            </View>
            <Avatar
              source={campaign.merchant.avatar}
              size="sm"
              name={campaign.merchant.name}
            />
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {campaign.description}
          </Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <DollarSign size={16} color={colors.success} />
              <Text style={styles.metaText}>
                {campaign.rewardType === 'percentage'
                  ? `${campaign.reward}%`
                  : `$${campaign.reward}`}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Share2 size={16} color={colors.darkGray} />
              <Text style={styles.metaText}>{campaign.shares} shares</Text>
            </View>
            <View style={styles.metaItem}>
              <ShoppingCart size={16} color={colors.darkGray} />
              <Text style={styles.metaText}>
                {campaign.conversions} conversions
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.merchant}>{campaign.merchant.name}</Text>
            {campaign.expiresAt && (
              <Text style={styles.expiry}>
                Ends: {new Date(campaign.expiresAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: 16,
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
  badge: {
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 12,
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
  merchant: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  expiry: {
    fontSize: 12,
    color: colors.darkGray,
  },
});
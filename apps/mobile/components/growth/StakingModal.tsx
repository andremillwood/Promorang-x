import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Gem, TrendingUp, Shield, Award, Info } from 'lucide-react-native';
import colors from '@/constants/colors';

interface StakingModalProps {
  visible: boolean;
  onClose: () => void;
  currentBalance: number;
  onStake: (amount: number, initiative?: string) => void;
}

export const StakingModal: React.FC<StakingModalProps> = ({
  visible,
  onClose,
  currentBalance,
  onStake
}) => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedInitiative, setSelectedInitiative] = useState<string | null>(null);
  const [isStaking, setIsStaking] = useState(false);

  const stakingOptions = [
    {
      id: 'general',
      title: 'General Staking',
      description: 'Earn base rewards with flexible withdrawal',
      multiplier: '1.2x',
      minStake: 10,
      duration: 'Flexible',
      icon: <Gem size={24} color={colors.primary} />,
      color: colors.primary,
    },
    {
      id: 'growth_channel',
      title: 'Growth Channel Boost',
      description: 'Lock gems for 30 days, earn 2x on all tasks',
      multiplier: '2.0x',
      minStake: 50,
      duration: '30 days',
      icon: <TrendingUp size={24} color="#4CAF50" />,
      color: '#4CAF50',
    },
    {
      id: 'shield',
      title: 'Channel Shield',
      description: 'Protect streaks and bonuses from interruption',
      multiplier: 'Protection',
      minStake: 25,
      duration: '7 days',
      icon: <Shield size={24} color="#2196F3" />,
      color: '#2196F3',
    },
    {
      id: 'premium',
      title: 'Premium Multiplier',
      description: 'Highest rewards with 90-day commitment',
      multiplier: '3.5x',
      minStake: 100,
      duration: '90 days',
      icon: <Award size={24} color="#9C27B0" />,
      color: '#9C27B0',
    },
  ];

  const validateStake = () => {
    const amount = Number(stakeAmount);
    if (!stakeAmount || isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid stake amount');
      return false;
    }
    if (amount > currentBalance) {
      Alert.alert('Error', 'Insufficient PromoGems balance');
      return false;
    }
    if (selectedInitiative) {
      const option = stakingOptions.find(opt => opt.id === selectedInitiative);
      if (option && amount < option.minStake) {
        Alert.alert('Error', `Minimum stake for ${option.title} is ${option.minStake} PromoGems`);
        return false;
      }
    }
    return true;
  };

  const handleStake = async () => {
    if (!validateStake()) return;

    setIsStaking(true);
    try {
      await onStake(Number(stakeAmount), selectedInitiative || undefined);
      Alert.alert(
        'Success',
        'Your PromoGems have been staked successfully!',
        [{ text: 'OK', onPress: onClose }]
      );
      setStakeAmount('');
      setSelectedInitiative(null);
    } catch {
      Alert.alert('Error', 'Failed to stake PromoGems. Please try again.');
    } finally {
      setIsStaking(false);
    }
  };

  const getSelectedOption = () => {
    return stakingOptions.find(opt => opt.id === selectedInitiative);
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Stake PromoGems"
      size="lg"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceInfo}>
            <Gem size={20} color={colors.primary} />
            <Text style={styles.balanceLabel}>Available Balance</Text>
          </View>
          <Text style={styles.balanceValue}>{currentBalance} PromoGems</Text>
        </View>

        <Text style={styles.sectionTitle}>Choose Staking Option</Text>
        
        {stakingOptions.map((option) => (
          <Card
            key={option.id}
            style={[
              styles.optionCard,
              selectedInitiative === option.id && { borderColor: option.color, borderWidth: 2 }
            ]}
            onPress={() => setSelectedInitiative(option.id)}
          >
            <View style={styles.optionHeader}>
              {option.icon}
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
            </View>
            
            <View style={styles.optionDetails}>
              <View style={styles.optionDetail}>
                <Text style={styles.detailLabel}>Multiplier</Text>
                <Badge 
                  text={option.multiplier} 
                  variant="primary" 
                  size="sm"
                  style={{ backgroundColor: `${option.color}20` }}
                  textStyle={{ color: option.color }}
                />
              </View>
              <View style={styles.optionDetail}>
                <Text style={styles.detailLabel}>Min Stake</Text>
                <Text style={styles.detailValue}>{option.minStake} gems</Text>
              </View>
              <View style={styles.optionDetail}>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>{option.duration}</Text>
              </View>
            </View>
          </Card>
        ))}

        <Input
          label="Stake Amount"
          placeholder="Enter amount to stake"
          value={stakeAmount}
          onChangeText={setStakeAmount}
          keyboardType="numeric"
          leftIcon={<Gem size={20} color={colors.darkGray} />}
        />

        {selectedInitiative && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Info size={16} color={colors.primary} />
              <Text style={styles.summaryTitle}>Staking Summary</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Selected Option:</Text>
              <Text style={styles.summaryValue}>{getSelectedOption()?.title}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Stake Amount:</Text>
              <Text style={styles.summaryValue}>{stakeAmount || '0'} PromoGems</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Expected Multiplier:</Text>
              <Text style={[styles.summaryValue, { color: getSelectedOption()?.color }]}>
                {getSelectedOption()?.multiplier}
              </Text>
            </View>
          </View>
        )}

        <Button
          title="Stake PromoGems"
          onPress={handleStake}
          variant="primary"
          size="lg"
          isLoading={isStaking}
          disabled={!stakeAmount || !selectedInitiative}
          style={styles.stakeButton}
        />
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.darkGray,
    marginLeft: 8,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  optionCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  optionHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  optionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.darkGray,
  },
  optionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionDetail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
  },
  summaryCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.darkGray,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
  },
  stakeButton: {
    marginTop: 16,
    marginBottom: 20,
  },
});
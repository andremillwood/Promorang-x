import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Gem, Clock, AlertTriangle } from 'lucide-react-native';
import colors from '@/constants/colors';

interface WithdrawModalProps {
  visible: boolean;
  onClose: () => void;
  stakedAmount: number;
  availableForWithdraw: number;
  onWithdraw: (amount: number) => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  visible,
  onClose,
  stakedAmount,
  availableForWithdraw,
  onWithdraw
}) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const lockedStakes = [
    {
      id: '1',
      type: 'Growth Channel Boost',
      amount: 150,
      unlockDate: '2024-09-15',
      daysLeft: 12,
    },
    {
      id: '2',
      type: 'Premium Multiplier',
      amount: 200,
      unlockDate: '2024-11-20',
      daysLeft: 78,
    },
  ];

  const validateWithdraw = () => {
    const amount = Number(withdrawAmount);
    if (!withdrawAmount || isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid withdrawal amount');
      return false;
    }
    if (amount > availableForWithdraw) {
      Alert.alert('Error', 'Insufficient available balance for withdrawal');
      return false;
    }
    return true;
  };

  const handleWithdraw = async () => {
    if (!validateWithdraw()) return;

    Alert.alert(
      'Confirm Withdrawal',
      `Are you sure you want to withdraw ${withdrawAmount} PromoGems? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            setIsWithdrawing(true);
            try {
              await onWithdraw(Number(withdrawAmount));
              Alert.alert(
                'Success',
                'Your PromoGems have been withdrawn successfully!',
                [{ text: 'OK', onPress: onClose }]
              );
              setWithdrawAmount('');
            } catch {
              Alert.alert('Error', 'Failed to withdraw PromoGems. Please try again.');
            } finally {
              setIsWithdrawing(false);
            }
          }
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Withdraw PromoGems"
      size="lg"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Total Staked:</Text>
            <View style={styles.balanceValue}>
              <Gem size={16} color={colors.primary} />
              <Text style={styles.balanceText}>{stakedAmount}</Text>
            </View>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Available to Withdraw:</Text>
            <View style={styles.balanceValue}>
              <Gem size={16} color={colors.success} />
              <Text style={[styles.balanceText, { color: colors.success }]}>
                {availableForWithdraw}
              </Text>
            </View>
          </View>
        </View>

        <Input
          label="Withdrawal Amount"
          placeholder="Enter amount to withdraw"
          value={withdrawAmount}
          onChangeText={setWithdrawAmount}
          keyboardType="numeric"
          leftIcon={<Gem size={20} color={colors.darkGray} />}
        />

        <View style={styles.quickAmounts}>
          <Text style={styles.quickAmountsLabel}>Quick amounts:</Text>
          <View style={styles.quickAmountButtons}>
            {[25, 50, 100, availableForWithdraw].map((amount) => (
              <Button
                key={amount}
                title={amount === availableForWithdraw ? 'Max' : amount.toString()}
                variant="outline"
                size="sm"
                onPress={() => setWithdrawAmount(amount.toString())}
                style={styles.quickAmountButton}
                disabled={amount > availableForWithdraw}
              />
            ))}
          </View>
        </View>

        {lockedStakes.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Locked Stakes</Text>
            {lockedStakes.map((stake) => (
              <Card key={stake.id} style={styles.lockedStakeCard}>
                <View style={styles.lockedStakeHeader}>
                  <View style={styles.lockedStakeInfo}>
                    <Text style={styles.lockedStakeType}>{stake.type}</Text>
                    <View style={styles.lockedStakeAmount}>
                      <Gem size={16} color={colors.warning} />
                      <Text style={styles.lockedStakeAmountText}>{stake.amount} PromoGems</Text>
                    </View>
                  </View>
                  <View style={styles.unlockInfo}>
                    <Clock size={16} color={colors.darkGray} />
                    <Text style={styles.unlockText}>{stake.daysLeft} days left</Text>
                  </View>
                </View>
                <Text style={styles.unlockDate}>Unlocks on {stake.unlockDate}</Text>
              </Card>
            ))}
          </>
        )}

        <View style={styles.warningCard}>
          <AlertTriangle size={20} color={colors.warning} />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Important Notice</Text>
            <Text style={styles.warningText}>
              Withdrawing staked PromoGems will reduce your earning multipliers and may affect your Growth Hub level.
            </Text>
          </View>
        </View>

        <Button
          title="Withdraw PromoGems"
          onPress={handleWithdraw}
          variant="secondary"
          size="lg"
          isLoading={isWithdrawing}
          disabled={!withdrawAmount || Number(withdrawAmount) <= 0}
          style={styles.withdrawButton}
        />
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.darkGray,
  },
  balanceValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  quickAmounts: {
    marginVertical: 16,
  },
  quickAmountsLabel: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 8,
  },
  quickAmountButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
    marginTop: 8,
  },
  lockedStakeCard: {
    marginBottom: 12,
    backgroundColor: `${colors.warning}05`,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  lockedStakeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  lockedStakeInfo: {
    flex: 1,
  },
  lockedStakeType: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  lockedStakeAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockedStakeAmountText: {
    fontSize: 14,
    color: colors.warning,
    marginLeft: 4,
    fontWeight: '500',
  },
  unlockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unlockText: {
    fontSize: 12,
    color: colors.darkGray,
    marginLeft: 4,
  },
  unlockDate: {
    fontSize: 12,
    color: colors.darkGray,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: `${colors.warning}10`,
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
  },
  warningContent: {
    marginLeft: 12,
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.warning,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: colors.darkGray,
    lineHeight: 16,
  },
  withdrawButton: {
    marginTop: 16,
    marginBottom: 20,
  },
});
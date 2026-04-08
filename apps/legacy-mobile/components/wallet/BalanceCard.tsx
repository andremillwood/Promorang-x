import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import colors from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';

interface BalanceCardProps {
  balance: number;
  promoGems: number;
  pendingBalance: number;
  onWithdraw: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  promoGems,
  pendingBalance,
  onWithdraw,
}) => {
  const theme = useThemeColors();

  return (
    <Card style={styles.card} variant="elevated">
      <Text style={styles.title}>Your Balance</Text>
      <View style={styles.balanceRow}>
        <View style={styles.balanceSection}>
          <Text style={styles.balance}>${balance.toFixed(2)}</Text>
          <Text style={styles.balanceLabel}>USD Wallet</Text>
        </View>
        <View style={styles.balanceDivider} />
        <View style={styles.balanceSection}>
          <Text style={styles.balance}>{promoGems.toLocaleString()}</Text>
          <Text style={styles.balanceLabel}>Gems (≈ ${((promoGems || 0) * 0.01).toFixed(2)})</Text>
        </View>
      </View>

      {pendingBalance > 0 && (
        <View style={styles.pendingContainer}>
          <Text style={styles.pendingText}>
            ${pendingBalance.toFixed(2)} pending
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <Button
          title="Withdraw"
          onPress={onWithdraw}
          variant="primary"
          size="md"
          style={styles.button}
          leftIcon={<ArrowUpRight size={16} color={colors.white} />}
        />
        <Button
          title="History"
          onPress={() => { }}
          variant="outline"
          size="md"
          style={styles.button}
          leftIcon={<ArrowDownLeft size={16} color={colors.primary} />}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 8,
  },
  balance: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceSection: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 10,
    color: colors.darkGray,
    fontWeight: '500',
    marginTop: 2,
  },
  balanceDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.border,
    marginHorizontal: 12,
  },
  pendingContainer: {
    backgroundColor: `${colors.warning}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  pendingText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});
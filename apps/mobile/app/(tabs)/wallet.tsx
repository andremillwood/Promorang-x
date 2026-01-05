import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { BalanceCard } from '@/components/wallet/BalanceCard';
import { TransactionItem } from '@/components/wallet/TransactionItem';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { useWalletStore } from '@/store/walletStore';
import { useAuthStore } from '@/store/authStore';
import { Receipt } from 'lucide-react-native';
import colors from '@/constants/colors';
import { Card } from '@/components/ui/Card';

export default function WalletScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { balance, pendingBalance, transactions, isLoading, fetchTransactions, syncWithAuth } = useWalletStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      syncWithAuth(user);
    }
    fetchTransactions();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (user) syncWithAuth(user);
    await fetchTransactions();
    setRefreshing(false);
  };

  const handleWithdraw = () => {
    router.push('/withdraw');
  };

  if (isLoading && !refreshing && transactions.length === 0) {
    return <LoadingIndicator fullScreen text="Loading your wallet..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            <BalanceCard
              balance={balance}
              pendingBalance={pendingBalance}
              onWithdraw={handleWithdraw}
            />
            <Card style={styles.earningsCard} variant="elevated">
              <Text style={styles.earningsTitle}>Earnings Breakdown</Text>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>Tasks Completed</Text>
                <Text style={styles.earningsValue}>$140.00</Text>
              </View>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>Campaign Commissions</Text>
                <Text style={styles.earningsValue}>$25.75</Text>
              </View>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>Content Investments</Text>
                <Text style={styles.earningsValue}>$1,024.00</Text>
              </View>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>Social Bets Won</Text>
                <Text style={[styles.earningsValue, styles.betWinnings]}>$275.00</Text>
              </View>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>Staking Rewards</Text>
                <Text style={[styles.earningsValue, styles.stakingRewards]}>$189.50</Text>
              </View>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>Referrals</Text>
                <Text style={styles.earningsValue}>$25.00</Text>
              </View>
            </Card>

            <Card style={styles.portfolioCard} variant="elevated">
              <Text style={styles.portfolioTitle}>Portfolio Performance</Text>
              <View style={styles.portfolioMetrics}>
                <View style={styles.portfolioMetric}>
                  <Text style={styles.portfolioMetricLabel}>Active Bets</Text>
                  <Text style={styles.portfolioMetricValue}>3 positions</Text>
                  <Text style={styles.portfolioMetricSubtext}>$150 at risk</Text>
                </View>
                <View style={styles.portfolioMetric}>
                  <Text style={styles.portfolioMetricLabel}>Content Shares</Text>
                  <Text style={styles.portfolioMetricValue}>5 holdings</Text>
                  <Text style={[styles.portfolioMetricSubtext, styles.positiveGain]}>+12.5% gain</Text>
                </View>
                <View style={styles.portfolioMetric}>
                  <Text style={styles.portfolioMetricLabel}>Staked PromoGems</Text>
                  <Text style={styles.portfolioMetricValue}>2,500 PG</Text>
                  <Text style={[styles.portfolioMetricSubtext, styles.positiveGain]}>12.5% APY</Text>
                </View>
              </View>
            </Card>
            <Text style={styles.transactionsTitle}>Recent Transactions</Text>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title="No Transactions Yet"
            description="Complete tasks or join campaigns to start earning."
            icon={<Receipt size={48} color={colors.darkGray} />}
            style={styles.emptyState}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  earningsCard: {
    marginBottom: 24,
  },
  earningsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  earningsLabel: {
    fontSize: 14,
    color: colors.darkGray,
  },
  earningsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
  },
  emptyState: {
    marginTop: 24,
  },
  betWinnings: {
    color: colors.success,
  },
  stakingRewards: {
    color: colors.primary,
  },
  portfolioCard: {
    marginBottom: 24,
  },
  portfolioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
  },
  portfolioMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  portfolioMetric: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  portfolioMetricLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 4,
    textAlign: 'center',
  },
  portfolioMetricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 2,
    textAlign: 'center',
  },
  portfolioMetricSubtext: {
    fontSize: 11,
    color: colors.darkGray,
    textAlign: 'center',
  },
  positiveGain: {
    color: colors.success,
  },
});
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { BalanceCard } from '@/components/wallet/BalanceCard';
import { TransactionItem } from '@/components/wallet/TransactionItem';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { useWalletStore } from '@/store/walletStore';
import { useAuthStore } from '@/store/authStore';
import { Receipt, Zap, TrendingUp, Award, Star } from 'lucide-react-native';
import colors from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

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

  const renderHeader = () => (
    <>
      <BalanceCard
        balance={balance}
        pendingBalance={pendingBalance}
        onWithdraw={handleWithdraw}
      />

      <View style={styles.statsGrid}>
        <Card style={styles.statCard} variant="elevated">
          <Text style={styles.statLabel}>Total Earned</Text>
          <Text style={styles.statValue}>$1,679.25</Text>
          <View style={styles.trendBadge}>
            <TrendingUp size={12} color={colors.success} />
            <Text style={styles.trendText}>+12%</Text>
          </View>
        </Card>
        <Card style={styles.statCard} variant="elevated">
          <Text style={styles.statLabel}>Active Shares</Text>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statSubValue}>$1,024.00 val.</Text>
        </Card>
      </View>

      <Card style={styles.earningsCard} variant="elevated">
        <Text style={styles.earningsTitle}>Earnings Breakdown</Text>

        <View style={styles.breakdownItem}>
          <View style={[styles.breakdownIcon, { backgroundColor: '#F0FDF4' }]}>
            <Zap size={18} color="#16A34A" />
          </View>
          <View style={styles.breakdownInfo}>
            <Text style={styles.breakdownLabel}>Tasks & Campaigns</Text>
            <ProgressBar progress={0.65} height={6} progressColor="#16A34A" />
          </View>
          <Text style={styles.breakdownValue}>$165.75</Text>
        </View>

        <View style={styles.breakdownItem}>
          <View style={[styles.breakdownIcon, { backgroundColor: '#E0F2FE' }]}>
            <TrendingUp size={18} color="#0284C7" />
          </View>
          <View style={styles.breakdownInfo}>
            <Text style={styles.breakdownLabel}>Investments</Text>
            <ProgressBar progress={0.85} height={6} progressColor="#0284C7" />
          </View>
          <Text style={styles.breakdownValue}>$1,024.00</Text>
        </View>

        <View style={styles.breakdownItem}>
          <View style={[styles.breakdownIcon, { backgroundColor: '#FFFBEB' }]}>
            <Award size={18} color="#D97706" />
          </View>
          <View style={styles.breakdownInfo}>
            <Text style={styles.breakdownLabel}>Social Forecasts</Text>
            <ProgressBar progress={0.45} height={6} progressColor="#D97706" />
          </View>
          <Text style={styles.breakdownValue}>$275.00</Text>
        </View>

        <View style={styles.breakdownItem}>
          <View style={[styles.breakdownIcon, { backgroundColor: '#FDF2F8' }]}>
            <Star size={18} color="#DB2777" />
          </View>
          <View style={styles.breakdownInfo}>
            <Text style={styles.breakdownLabel}>Rewards & Referrals</Text>
            <ProgressBar progress={0.25} height={6} progressColor="#DB2777" />
          </View>
          <Text style={styles.breakdownValue}>$214.50</Text>
        </View>
      </Card>

      <Text style={styles.transactionsTitle}>Recent Activity</Text>
    </>
  );

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
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            title="No Activity Yet"
            description="Start exploring to see your transactions here."
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
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  statSubValue: {
    fontSize: 11,
    color: colors.darkGray,
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 6,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
    marginLeft: 2,
  },
  earningsCard: {
    padding: 16,
    marginBottom: 24,
  },
  earningsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 20,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  breakdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakdownInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  breakdownLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 4,
  },
  breakdownValue: {
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
});
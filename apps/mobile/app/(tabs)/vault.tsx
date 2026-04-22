import { StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing, BorderRadius } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { useVaultAssets, useVaultTransactions, useVaultSummary } from '@/hooks/useVault';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

export default function VaultScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeTab, setActiveTab] = useState<'assets' | 'history'>('assets');
  
  const { assets, loading: assetsLoading } = useVaultAssets();
  const { transactions, loading: transactionsLoading } = useVaultTransactions();
  const { summary, loading: summaryLoading } = useVaultSummary();

  if (assetsLoading || summaryLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
        <ActivityIndicator size="large" color={DesignColors.primary} />
      </View>
    );
  }

  const assetTypes = ['token', 'nft', 'coupon', 'ticket', 'key'] as const;
  const assetTypeIcons: Record<string, string> = {
    token: 'cube',
    nft: 'image',
    coupon: 'ticket',
    ticket: 'qr-code',
    key: 'key',
  };

  const assetTypeColors: Record<string, string> = {
    token: DesignColors.primary,
    nft: DesignColors.purple,
    coupon: DesignColors.success,
    ticket: DesignColors.warning,
    key: DesignColors.secondary,
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
          Vault
        </Text>
        <Pressable style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={DesignColors.primary} />
        </Pressable>
      </View>

      {/* Total Value Card */}
      <LinearGradient
        colors={[DesignColors.primary, DesignColors.secondary]}
        style={styles.valueCard}
      >
        <Text style={styles.valueLabel}>Total Portfolio Value</Text>
        <Text style={styles.valueAmount}>
          ${summary?.total_value_usd?.toLocaleString() || '0.00'}
        </Text>
        <View style={styles.valueStats}>
              {assetTypes.filter(type => (summary?.asset_counts?.[type] ?? 0) > 0).map((type) => (
            <View key={type} style={styles.valueStat}>
              <Ionicons 
                name={assetTypeIcons[type] as any} 
                size={16} 
                color={DesignColors.white} 
              />
              <Text style={styles.valueStatText}>
                {summary?.asset_counts?.[type] || 0} {type.charAt(0).toUpperCase() + type.slice(1)}s
              </Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'assets' && styles.tabActive]}
          onPress={() => setActiveTab('assets')}
        >
          <Text style={[styles.tabText, activeTab === 'assets' && styles.tabTextActive]}>
            Assets
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'assets' && (
          <>
            {/* Asset Type Grid */}
            <View style={styles.assetTypeGrid}>
              {assetTypes.map((type) => {
                const count = summary?.asset_counts?.[type] || 0;
                return (
                  <Pressable
                    key={type}
                    style={[styles.assetTypeCard, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}
                    onPress={() => router.push(`/vault/${type}`)}
                  >
                    <View style={[styles.assetTypeIcon, { backgroundColor: assetTypeColors[type] + '15' }]}>
                      <Ionicons 
                        name={assetTypeIcons[type] as any} 
                        size={24} 
                        color={assetTypeColors[type]} 
                      />
                    </View>
                    <Text style={[styles.assetTypeName, { color: isDark ? DesignColors.white : DesignColors.black }]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}s
                    </Text>
                    <Text style={styles.assetTypeCount}>{count}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Asset List */}
            <Text style={[styles.sectionTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
              Your Assets
            </Text>
            
            {assets.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                <Ionicons name="cube-outline" size={64} color={DesignColors.gray[400]} />
                <Text style={styles.emptyText}>No assets yet</Text>
                <Text style={styles.emptySubtext}>
                  Start earning tokens, coupons, and more by participating in drops and moments!
                </Text>
              </View>
            ) : (
              assets.map((asset) => (
                <Pressable
                  key={asset.id}
                  style={[styles.assetCard, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}
                  onPress={() => router.push(`/vault/asset/${asset.id}`)}
                >
                  <View style={[styles.assetIcon, { backgroundColor: assetTypeColors[asset.asset_type] + '15' }]}>
                    <Ionicons 
                      name={assetTypeIcons[asset.asset_type] as any} 
                      size={24} 
                      color={assetTypeColors[asset.asset_type]} 
                    />
                  </View>
                  <View style={styles.assetInfo}>
                    <Text style={[styles.assetName, { color: isDark ? DesignColors.white : DesignColors.black }]}>
                      {asset.asset_name}
                    </Text>
                    <Text style={styles.assetSymbol}>{asset.asset_symbol}</Text>
                    {asset.expires_at && (
                      <Text style={styles.assetExpiry}>
                        Expires {new Date(asset.expires_at).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  <View style={styles.assetBalance}>
                    <Text style={styles.assetBalanceValue}>
                      {asset.balance.toLocaleString()}
                    </Text>
                    <Text style={styles.assetBalanceLabel}>{asset.asset_symbol}</Text>
                  </View>
                </Pressable>
              ))
            )}
          </>
        )}

        {activeTab === 'history' && (
          <>
            <Text style={[styles.sectionTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
              Transaction History
            </Text>
            
            {transactionsLoading ? (
              <ActivityIndicator size="large" color={DesignColors.primary} />
            ) : transactions.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                <Ionicons name="time-outline" size={64} color={DesignColors.gray[400]} />
                <Text style={styles.emptyText}>No transactions yet</Text>
              </View>
            ) : (
              transactions.map((tx) => (
                <View
                  key={tx.id}
                  style={[styles.txCard, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}
                >
                  <View style={[styles.txIcon, { 
                    backgroundColor: tx.amount > 0 ? DesignColors.success + '15' : DesignColors.error + '15' 
                  }]}>
                    <Ionicons 
                      name={tx.amount > 0 ? 'arrow-down' : 'arrow-up'} 
                      size={20} 
                      color={tx.amount > 0 ? DesignColors.success : DesignColors.error} 
                    />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={[styles.txType, { color: isDark ? DesignColors.white : DesignColors.black }]}>
                      {tx.transaction_type.charAt(0).toUpperCase() + tx.transaction_type.slice(1)}
                    </Text>
                    <Text style={styles.txAsset}>{tx.asset_type}</Text>
                    <Text style={styles.txDate}>
                      {new Date(tx.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.txAmount}>
                    <Text style={[
                      styles.txValue,
                      { color: tx.amount > 0 ? DesignColors.success : DesignColors.error }
                    ]}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </Text>
                    <Text style={[
                      styles.txStatus,
                      { color: tx.status === 'completed' ? DesignColors.success : DesignColors.warning }
                    ]}>
                      {tx.status}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.container,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.md,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: Spacing.sm,
  },
  valueCard: {
    marginHorizontal: Spacing.container,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  valueLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  valueAmount: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: 'bold',
    color: DesignColors.white,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  valueStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    backgroundColor: 'transparent',
  },
  valueStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
  valueStatText: {
    fontSize: Typography.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.container,
    gap: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: 'transparent',
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: DesignColors.primary,
  },
  tabText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: DesignColors.gray[600],
  },
  tabTextActive: {
    color: DesignColors.white,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.container,
  },
  assetTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    backgroundColor: 'transparent',
  },
  assetTypeCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  assetTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  assetTypeName: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    marginBottom: 2,
  },
  assetTypeCount: {
    fontSize: Typography.sizes.sm,
    color: DesignColors.gray[500],
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  emptyState: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: DesignColors.gray[500],
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: Typography.sizes.sm,
    color: DesignColors.gray[400],
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  assetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  assetIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  assetInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  assetName: {
    fontSize: Typography.sizes.base,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  assetSymbol: {
    fontSize: Typography.sizes.xs,
    color: DesignColors.gray[500],
  },
  assetExpiry: {
    fontSize: Typography.sizes.xs,
    color: DesignColors.warning,
    marginTop: 2,
  },
  assetBalance: {
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  assetBalanceValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: DesignColors.primary,
  },
  assetBalanceLabel: {
    fontSize: Typography.sizes.xs,
    color: DesignColors.gray[500],
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.sm,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  txInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  txType: {
    fontSize: Typography.sizes.base,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  txAsset: {
    fontSize: Typography.sizes.xs,
    color: DesignColors.gray[500],
    textTransform: 'capitalize',
  },
  txDate: {
    fontSize: Typography.sizes.xs,
    color: DesignColors.gray[400],
    marginTop: 2,
  },
  txAmount: {
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  txValue: {
    fontSize: Typography.sizes.base,
    fontWeight: 'bold',
  },
  txStatus: {
    fontSize: Typography.sizes.xs,
    textTransform: 'capitalize',
    marginTop: 2,
  },
});

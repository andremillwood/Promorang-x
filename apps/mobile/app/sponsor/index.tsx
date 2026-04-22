import { StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing, BorderRadius } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { useSponsorPools, useSponsorConfig, useCreateSponsorPool, useSponsorCheckout } from '@/hooks/useSponsor';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useCallback } from 'react';
import type { SponsorTier } from '@/types';

export default function SponsorDashboard() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { pools, loading: poolsLoading, refetch: refetchPools } = useSponsorPools();
  const { config, loading: configLoading } = useSponsorConfig();
  const { createPool, creating } = useCreateSponsorPool();
  const { createCheckout, processing: checkoutProcessing } = useSponsorCheckout();

  const handlePayment = useCallback(async (poolId: string) => {
    try {
      const { checkout_url } = await createCheckout(poolId);
      // Open Stripe checkout in webview or external browser
      // For now, we'll show a message
      alert(`Redirecting to payment: ${checkout_url}`);
    } catch (e) {
      alert('Failed to initiate payment. Please try again.');
    }
  }, [createCheckout]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return DesignColors.success;
      case 'pending_payment': return DesignColors.warning;
      case 'draft': return DesignColors.gray[500];
      case 'completed': return DesignColors.primary;
      default: return DesignColors.gray[400];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending_payment': return 'Payment Required';
      case 'draft': return 'Draft';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  if (poolsLoading || configLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
        <ActivityIndicator size="large" color={DesignColors.primary} />
      </View>
    );
  }

  const activePools = pools.filter(p => p.status === 'active');
  const pendingPools = pools.filter(p => p.status === 'pending_payment' || p.status === 'draft');
  const completedPools = pools.filter(p => p.status === 'completed');

  return (
    <View style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
            Sponsor Dashboard
          </Text>
          <Text style={styles.headerSubtitle}>Create and manage prize pools</Text>
        </View>
        <Pressable 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <LinearGradient
            colors={[DesignColors.primary, DesignColors.secondary]}
            style={styles.createButtonGradient}
          >
            <Ionicons name="add" size={20} color={DesignColors.white} />
            <Text style={styles.createButtonText}>New Pool</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
            <Text style={styles.statValue}>{activePools.length}</Text>
            <Text style={styles.statLabel}>Active Pools</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
            <Text style={styles.statValue}>
              {activePools.reduce((sum, p) => sum + p.total_pool_amount, 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
            <Text style={styles.statValue}>{completedPools.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Active Pools */}
        {activePools.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
              Active Pools
            </Text>
            {activePools.map((pool) => (
              <View
                key={pool.id}
                style={[styles.poolCard, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}
              >
                <View style={styles.poolHeader}>
                  <View>
                    <Text style={[styles.poolName, { color: isDark ? DesignColors.white : DesignColors.black }]}>
                      {pool.name}
                    </Text>
                    <View style={styles.poolMeta}>
                      <View style={[styles.tierBadge, { backgroundColor: DesignColors.primary + '15' }]}>
                        <Text style={[styles.tierText, { color: DesignColors.primary }]}>
                          {pool.tier.charAt(0).toUpperCase() + pool.tier.slice(1)}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(pool.status) + '15' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(pool.status) }]}>
                          {getStatusLabel(pool.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Pressable onPress={() => router.push(`/sponsor/pool/${pool.id}`)}>
                    <Ionicons name="chevron-forward" size={24} color={DesignColors.gray[400]} />
                  </Pressable>
                </View>

                <View style={styles.poolStats}>
                  <View style={styles.poolStat}>
                    <Text style={styles.poolStatValue}>{pool.total_pool_amount.toLocaleString()}</Text>
                    <Text style={styles.poolStatLabel}>Pool Size</Text>
                  </View>
                  <View style={styles.poolStat}>
                    <Text style={styles.poolStatValue}>{pool.winner_count}</Text>
                    <Text style={styles.poolStatLabel}>Winners</Text>
                  </View>
                  <View style={styles.poolStat}>
                    <Text style={styles.poolStatValue}>{pool.min_win_value}</Text>
                    <Text style={styles.poolStatLabel}>Min Win</Text>
                  </View>
                </View>

                {pool.brand_message && (
                  <View style={styles.brandMessage}>
                    <Ionicons name="chatbubble-outline" size={14} color={DesignColors.gray[500]} />
                    <Text style={styles.brandMessageText} numberOfLines={2}>
                      {pool.brand_message}
                    </Text>
                  </View>
                )}

                <View style={styles.poolDates}>
                  <Ionicons name="calendar-outline" size={14} color={DesignColors.gray[500]} />
                  <Text style={styles.poolDatesText}>
                    {new Date(pool.starts_at).toLocaleDateString()} - {new Date(pool.ends_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Pending Payment */}
        {pendingPools.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
              Pending Payment
            </Text>
            {pendingPools.map((pool) => (
              <View
                key={pool.id}
                style={[styles.poolCard, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white, borderColor: DesignColors.warning, borderWidth: 1 }]}
              >
                <View style={styles.poolHeader}>
                  <View>
                    <Text style={[styles.poolName, { color: isDark ? DesignColors.white : DesignColors.black }]}>
                      {pool.name}
                    </Text>
                    <View style={styles.poolMeta}>
                      <View style={[styles.statusBadge, { backgroundColor: DesignColors.warning + '15' }]}>
                        <Text style={[styles.statusText, { color: DesignColors.warning }]}>
                          Payment Required
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.pendingActions}>
                  <View style={styles.pendingAmount}>
                    <Text style={styles.pendingLabel}>Amount Due</Text>
                    <Text style={styles.pendingValue}>${pool.total_pool_amount.toLocaleString()}</Text>
                  </View>
                  <Pressable 
                    style={styles.payButton}
                    onPress={() => handlePayment(pool.id)}
                    disabled={checkoutProcessing}
                  >
                    <LinearGradient
                      colors={[DesignColors.warning, DesignColors.error]}
                      style={styles.payButtonGradient}
                    >
                      {checkoutProcessing ? (
                        <ActivityIndicator size="small" color={DesignColors.white} />
                      ) : (
                        <>
                          <Ionicons name="card" size={16} color={DesignColors.white} />
                          <Text style={styles.payButtonText}>Pay Now</Text>
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Empty State */}
        {pools.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
            <Ionicons name="gift-outline" size={64} color={DesignColors.primary} />
            <Text style={[styles.emptyTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
              Create Your First Pool
            </Text>
            <Text style={styles.emptyText}>
              Sponsor prize pools to engage users and promote your brand. Set your budget, choose winners, and track results.
            </Text>
            <Pressable style={styles.emptyButton} onPress={() => setShowCreateModal(true)}>
              <LinearGradient
                colors={[DesignColors.primary, DesignColors.secondary]}
                style={styles.emptyButtonGradient}
              >
                <Text style={styles.emptyButtonText}>Get Started</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {/* Tier Info */}
        {config?.tiers && (
          <View style={[styles.tierInfo, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
            <Text style={[styles.tierInfoTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
              Pool Tiers
            </Text>
            {config.tiers.map((tier) => (
              <View key={tier.id} style={styles.tierRow}>
                <View style={styles.tierNameCol}>
                  <Text style={[styles.tierName, { color: isDark ? DesignColors.white : DesignColors.black }]}>
                    {tier.name}
                  </Text>
                  <Text style={styles.tierDuration}>{tier.duration_days} days</Text>
                </View>
                <Text style={styles.tierPrice}>
                  ${tier.min_amount.toLocaleString()} - ${tier.max_amount.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create Pool Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <CreatePoolModal 
          tiers={config?.tiers || []}
          onClose={() => setShowCreateModal(false)}
          onCreate={async (poolData) => {
            try {
              await createPool(poolData);
              setShowCreateModal(false);
              refetchPools();
            } catch (e) {
              alert('Failed to create pool. Please try again.');
            }
          }}
          creating={creating}
        />
      </Modal>
    </View>
  );
}

function CreatePoolModal({ 
  tiers, 
  onClose, 
  onCreate, 
  creating 
}: { 
  tiers: SponsorTier[]; 
  onClose: () => void; 
  onCreate: (data: any) => void;
  creating: boolean;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<SponsorTier | null>(null);
  const [poolName, setPoolName] = useState('');
  const [poolAmount, setPoolAmount] = useState('');
  const [brandMessage, setBrandMessage] = useState('');
  const [premiumPlacements, setPremiumPlacements] = useState({
    homepage_banner: false,
    push_notification: false,
    sponsored_badge: false,
  });

  const canProceed = () => {
    if (step === 1) return selectedTier !== null;
    if (step === 2) return poolName.length > 0 && poolAmount.length > 0;
    return true;
  };

  const handleCreate = () => {
    if (!selectedTier) return;
    onCreate({
      name: poolName,
      tier: selectedTier.id,
      pool_amount: parseInt(poolAmount),
      brand_message: brandMessage,
      premium_placements: premiumPlacements,
    });
  };

  return (
    <View style={[styles.modalContainer, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
      {/* Modal Header */}
      <View style={styles.modalHeader}>
        <Pressable onPress={onClose}>
          <Ionicons name="close" size={28} color={isDark ? DesignColors.white : DesignColors.black} />
        </Pressable>
        <Text style={[styles.modalTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
          Create Pool
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[
              styles.stepDot,
              s <= step && { backgroundColor: DesignColors.primary },
              s > step && { backgroundColor: DesignColors.gray[300] },
            ]}
          />
        ))}
      </View>

      <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <>
            <Text style={[styles.stepTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
              Select a Tier
            </Text>
            <Text style={styles.stepSubtitle}>Choose the pool size and duration that fits your budget</Text>

            {tiers.map((tier) => (
              <Pressable
                key={tier.id}
                style={[
                  styles.tierCard,
                  { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white },
                  selectedTier?.id === tier.id && { borderColor: DesignColors.primary, borderWidth: 2 },
                ]}
                onPress={() => setSelectedTier(tier)}
              >
                <View style={styles.tierHeader}>
                  <Text style={[styles.tierCardName, { color: isDark ? DesignColors.white : DesignColors.black }]}>
                    {tier.name}
                  </Text>
                  <Text style={styles.tierCardPrice}>
                    ${tier.min_amount.toLocaleString()}+
                  </Text>
                </View>
                <View style={styles.tierDetails}>
                  <Text style={styles.tierDetail}>{tier.duration_days} days</Text>
                  <Text style={styles.tierDetail}>{tier.min_winners}-{tier.max_winners} winners</Text>
                  <Text style={styles.tierDetail}>{tier.platform_fee_percent}% platform fee</Text>
                </View>
              </Pressable>
            ))}
          </>
        )}

        {step === 2 && selectedTier && (
          <>
            <Text style={[styles.stepTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
              Pool Details
            </Text>
            <Text style={styles.stepSubtitle}>Set your pool name and budget</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pool Name</Text>
              <View style={[styles.input, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                <Ionicons name="text-outline" size={20} color={DesignColors.gray[400]} />
                {/* TextInput would go here - simplified for demo */}
                <Text style={styles.inputPlaceholder}>Enter pool name...</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pool Amount</Text>
              <View style={styles.amountRange}>
                <Text style={styles.amountRangeText}>
                  ${selectedTier.min_amount.toLocaleString()} - ${selectedTier.max_amount.toLocaleString()}
                </Text>
              </View>
              <View style={[styles.input, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                <Text style={styles.inputPrefix}>$</Text>
                <Text style={styles.inputPlaceholder}>Enter amount...</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Brand Message (Optional)</Text>
              <View style={[styles.textArea, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                <Text style={styles.inputPlaceholder}>Enter a message for participants...</Text>
              </View>
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={[styles.stepTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
              Premium Placements
            </Text>
            <Text style={styles.stepSubtitle}>Boost your pool visibility (optional)</Text>

            {[
              { key: 'homepage_banner', name: 'Homepage Banner', price: '$500/week', icon: 'image' },
              { key: 'push_notification', name: 'Push Notification', price: '$200/send', icon: 'notifications' },
              { key: 'sponsored_badge', name: 'Sponsored Badge', price: '$100/pool', icon: 'star' },
            ].map((placement) => (
              <Pressable
                key={placement.key}
                style={[
                  styles.placementCard,
                  { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white },
                  premiumPlacements[placement.key as keyof typeof premiumPlacements] && { borderColor: DesignColors.primary, borderWidth: 2 },
                ]}
                onPress={() => setPremiumPlacements(prev => ({
                  ...prev,
                  [placement.key]: !prev[placement.key as keyof typeof prev],
                }))}
              >
                <View style={styles.placementIcon}>
                  <Ionicons name={placement.icon as any} size={24} color={DesignColors.primary} />
                </View>
                <View style={styles.placementInfo}>
                  <Text style={[styles.placementName, { color: isDark ? DesignColors.white : DesignColors.black }]}>
                    {placement.name}
                  </Text>
                  <Text style={styles.placementPrice}>{placement.price}</Text>
                </View>
                <View style={[
                  styles.checkbox,
                  premiumPlacements[placement.key as keyof typeof premiumPlacements] && { 
                    backgroundColor: DesignColors.primary,
                    borderColor: DesignColors.primary,
                  },
                ]}>
                  {premiumPlacements[placement.key as keyof typeof premiumPlacements] && (
                    <Ionicons name="checkmark" size={16} color={DesignColors.white} />
                  )}
                </View>
              </Pressable>
            ))}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.modalFooter}>
        {step > 1 && (
          <Pressable style={styles.backButton} onPress={() => setStep(s => s - 1)}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        )}
        <Pressable 
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
          onPress={() => step < 3 ? setStep(s => s + 1) : handleCreate()}
          disabled={!canProceed() || creating}
        >
          <LinearGradient
            colors={canProceed() ? [DesignColors.primary, DesignColors.secondary] : [DesignColors.gray[400], DesignColors.gray[500]]}
            style={styles.nextButtonGradient}
          >
            {creating ? (
              <ActivityIndicator size="small" color={DesignColors.white} />
            ) : (
              <Text style={styles.nextButtonText}>
                {step === 3 ? 'Create Pool' : 'Continue'}
              </Text>
            )}
          </LinearGradient>
        </Pressable>
      </View>
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
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.container,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.md,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    color: DesignColors.gray[500],
    marginTop: 2,
  },
  createButton: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  createButtonText: {
    color: DesignColors.white,
    fontWeight: 'bold',
    fontSize: Typography.sizes.sm,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.container,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    backgroundColor: 'transparent',
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    color: DesignColors.primary,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: DesignColors.gray[500],
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  poolCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    backgroundColor: 'transparent',
  },
  poolName: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  poolMeta: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: 'transparent',
  },
  tierBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  tierText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  poolStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    backgroundColor: 'transparent',
  },
  poolStat: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  poolStatValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: DesignColors.primary,
  },
  poolStatLabel: {
    fontSize: Typography.sizes.xs,
    color: DesignColors.gray[500],
  },
  brandMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    backgroundColor: 'transparent',
  },
  brandMessageText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: DesignColors.gray[600],
    fontStyle: 'italic',
  },
  poolDates: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'transparent',
  },
  poolDatesText: {
    fontSize: Typography.sizes.xs,
    color: DesignColors.gray[500],
  },
  pendingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  pendingAmount: {
    backgroundColor: 'transparent',
  },
  pendingLabel: {
    fontSize: Typography.sizes.xs,
    color: DesignColors.gray[500],
  },
  pendingValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    color: DesignColors.warning,
  },
  payButton: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  payButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  payButtonText: {
    color: DesignColors.white,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.sizes.sm,
    color: DesignColors.gray[500],
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  emptyButton: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  emptyButtonText: {
    color: DesignColors.white,
    fontWeight: 'bold',
    fontSize: Typography.sizes.base,
  },
  tierInfo: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
  },
  tierInfoTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'transparent',
  },
  tierNameCol: {
    backgroundColor: 'transparent',
  },
  tierName: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
  },
  tierDuration: {
    fontSize: Typography.sizes.xs,
    color: DesignColors.gray[500],
  },
  tierPrice: {
    fontSize: Typography.sizes.sm,
    color: DesignColors.primary,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.container,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.md,
    backgroundColor: 'transparent',
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    backgroundColor: 'transparent',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Spacing.container,
  },
  stepTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    fontSize: Typography.sizes.sm,
    color: DesignColors.gray[500],
    marginBottom: Spacing.lg,
  },
  tierCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    backgroundColor: 'transparent',
  },
  tierCardName: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
  },
  tierCardPrice: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: DesignColors.primary,
  },
  tierDetails: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: 'transparent',
  },
  tierDetail: {
    fontSize: Typography.sizes.xs,
    color: DesignColors.gray[500],
  },
  inputGroup: {
    marginBottom: Spacing.lg,
    backgroundColor: 'transparent',
  },
  inputLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    color: DesignColors.gray[700],
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  textArea: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    minHeight: 80,
  },
  inputPlaceholder: {
    color: DesignColors.gray[400],
    fontSize: Typography.sizes.base,
  },
  inputPrefix: {
    fontSize: Typography.sizes.base,
    fontWeight: 'bold',
    color: DesignColors.primary,
  },
  amountRange: {
    marginBottom: Spacing.sm,
    backgroundColor: 'transparent',
  },
  amountRangeText: {
    fontSize: Typography.sizes.xs,
    color: DesignColors.gray[500],
  },
  placementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  placementIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: DesignColors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  placementInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  placementName: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    marginBottom: 2,
  },
  placementPrice: {
    fontSize: Typography.sizes.sm,
    color: DesignColors.primary,
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: DesignColors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.container,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.lg,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: Spacing.md,
  },
  backButtonText: {
    fontSize: Typography.sizes.base,
    color: DesignColors.gray[500],
  },
  nextButton: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  nextButtonText: {
    color: DesignColors.white,
    fontWeight: 'bold',
    fontSize: Typography.sizes.base,
  },
});

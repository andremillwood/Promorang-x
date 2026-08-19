import { Alert, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing, BorderRadius } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { useSponsorPools, useSponsorConfig, useCreateSponsorPool, useSponsorCheckout } from '@/hooks/useSponsor';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useCallback } from 'react';
import type { SponsorTier } from '@/types';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { rankBrandOpportunities, type RankedBrandOpportunity } from '@promorang/shared';
import { useAuth } from '@/context/AuthContext';

export default function SponsorDashboard() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedPoolId, setExpandedPoolId] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<RankedBrandOpportunity<any>[]>([]);
  const { user } = useAuth();
  
  const { pools, loading: poolsLoading, refetch: refetchPools } = useSponsorPools();
  const { config, loading: configLoading } = useSponsorConfig();
  const { createPool, creating } = useCreateSponsorPool();
  const { createCheckout, processing: checkoutProcessing } = useSponsorCheckout();
  const mobileSponsorCheckoutEnabled = process.env.EXPO_PUBLIC_ENABLE_MOBILE_SPONSOR_CHECKOUT === 'true';

  useEffect(() => {
    let active = true;
    async function loadOpportunities() {
      const { data } = await supabase.from('view_public_moment_directory').select('*').eq('is_active', true).gte('starts_at', new Date().toISOString()).order('starts_at').limit(24);
      const objectives = pools.flatMap((pool) => [pool.name, pool.brand_message].filter(Boolean) as string[]);
      const ranked = rankBrandOpportunities({ geographies: [user?.user_metadata?.location].filter(Boolean), objectives, interests: objectives }, (data || []).filter((item) => item.id).map((item) => ({ id:item.id!,kind:'moment' as const,title:item.title || 'Untitled Moment',description:item.description,category:item.category,city:item.city,country:item.country,starts_at:item.starts_at,momentum:item.participant_count,data:item })));
      if (active) setOpportunities(ranked.slice(0, 4));
    }
    void loadOpportunities();
    return () => { active = false; };
  }, [pools, user?.user_metadata?.location]);

  const handlePayment = useCallback(async (poolId: string) => {
    if (!mobileSponsorCheckoutEnabled) {
      Alert.alert(
        'Funding checkout is not available in this app',
        'You can still create, review, and report on sponsor pools here. Funding is disabled in this mobile release.'
      );
      return;
    }
    try {
      const { checkout_url } = await createCheckout(poolId);
      Alert.alert('Secure funding', `Open the checkout to secure this pool's Gems.\n\n${checkout_url}`);
    } catch (e) {
      Alert.alert('Could not start checkout', 'Please try again.');
    }
  }, [createCheckout, mobileSponsorCheckoutEnabled]);

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
      case 'pending_payment': return 'Funding Required';
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
          <Text style={styles.headerSubtitle}>Fund real actions with Gems</Text>
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
            <Text style={styles.statLabel}>Active pools</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
            <Text style={styles.statValue}>
              {activePools.reduce((sum, p) => sum + p.total_pool_amount, 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Gems secured</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
            <Text style={styles.statValue}>{completedPools.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.opportunityHeading}><View><Text style={styles.opportunityEyebrow}>MATCHED FOR YOUR BRAND</Text><Text style={[styles.sectionTitle, { color: isDark ? DesignColors.white : DesignColors.black, marginTop: 4 }]}>Why these Moments fit</Text></View><Ionicons name="sparkles" size={20} color={DesignColors.primary}/></View>
        {opportunities.length ? opportunities.map((opportunity) => {
          const moment = opportunity.data;
          return <Pressable key={opportunity.id} style={[styles.opportunityCard,{backgroundColor:isDark?DesignColors.gray[900]:DesignColors.white}]} onPress={() => router.push(`/moment/${opportunity.id}` as any)}>
            <View style={styles.opportunityTop}><View style={styles.fitBadge}><Text style={styles.fitText}>{opportunity.match_score}% FIT</Text></View><Text style={styles.opportunityDate}>{moment.starts_at ? new Date(moment.starts_at).toLocaleDateString() : 'OPEN'}</Text></View>
            <Text style={[styles.opportunityTitle,{color:isDark?DesignColors.white:DesignColors.black}]}>{opportunity.title}</Text>
            <Text style={styles.opportunityLocation}>{moment.venue_name || moment.city || moment.location || 'Location pending'}</Text>
            <View style={styles.reasonList}>{opportunity.reasons.map(reason=><View key={reason} style={styles.reason}><Ionicons name="checkmark-circle" size={13} color={DesignColors.primary}/><Text style={styles.reasonText}>{reason}</Text></View>)}</View>
            <View style={styles.opportunityFoot}><Text style={styles.opportunitySignal}>{Number(moment.participant_count || 0).toLocaleString()} participants</Text><Text style={styles.openOpportunity}>Evaluate →</Text></View>
          </Pressable>;
        }) : <View style={[styles.opportunityEmpty,{backgroundColor:isDark?DesignColors.gray[900]:DesignColors.white}]}><Text style={styles.opportunityEmptyText}>Complete your brand profile and campaign objectives to improve matching.</Text></View>}

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
                  <Pressable
                    accessibilityLabel={expandedPoolId === pool.id ? 'Hide pool details' : 'Show pool details'}
                    onPress={() => setExpandedPoolId(expandedPoolId === pool.id ? null : pool.id)}
                  >
                    <Ionicons name={expandedPoolId === pool.id ? 'chevron-up' : 'chevron-down'} size={24} color={DesignColors.gray[400]} />
                  </Pressable>
                </View>

                <View style={styles.poolStats}>
                  <View style={styles.poolStat}>
                    <Text style={styles.poolStatValue}>{pool.total_pool_amount.toLocaleString()}</Text>
                    <Text style={styles.poolStatLabel}>Gems</Text>
                  </View>
                  <View style={styles.poolStat}>
                    <Text style={styles.poolStatValue}>{pool.winner_count}</Text>
                    <Text style={styles.poolStatLabel}>Winners</Text>
                  </View>
                  <View style={styles.poolStat}>
                    <Text style={styles.poolStatValue}>{pool.min_win_value}</Text>
                    <Text style={styles.poolStatLabel}>Min Gems</Text>
                  </View>
                </View>

                {expandedPoolId === pool.id && (
                  <View style={styles.poolDetail}>
                    <Text style={styles.poolDetailText}>This pool is funding verified actions from {new Date(pool.starts_at).toLocaleDateString()} to {new Date(pool.ends_at).toLocaleDateString()}.</Text>
                    <View style={styles.poolDetailGrid}>
                      <View style={styles.poolDetailItem}><Text style={styles.poolDetailValue}>{pool.promoshare_contribution?.toLocaleString?.() || 0}</Text><Text style={styles.poolDetailLabel}>PromoShare Gems</Text></View>
                      <View style={styles.poolDetailItem}><Text style={styles.poolDetailValue}>{pool.payment_status}</Text><Text style={styles.poolDetailLabel}>Funding status</Text></View>
                    </View>
                  </View>
                )}

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
              Funding to secure
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
                          Funding Required
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.pendingActions}>
                  <View style={styles.pendingAmount}>
                    <Text style={styles.pendingLabel}>Gems to secure</Text>
                    <Text style={styles.pendingValue}>{pool.total_pool_amount.toLocaleString()}</Text>
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
                      <Text style={styles.payButtonText}>{mobileSponsorCheckoutEnabled ? 'Secure Gems' : 'Funding unavailable'}</Text>
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
              Create your first pool
            </Text>
            <Text style={styles.emptyText}>
              Fund a PromoShare pool so verified attendance, content, and referrals can unlock clear value.
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
              Funding tiers
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
                  {tier.min_amount.toLocaleString()} - {tier.max_amount.toLocaleString()} Gems
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
              Alert.alert('Could not create pool', 'Please try again.');
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
    if (step === 2 && selectedTier) {
      const amount = Number(poolAmount);
      return poolName.trim().length > 0 && amount >= selectedTier.min_amount && amount <= selectedTier.max_amount;
    }
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
            <Text style={styles.stepSubtitle}>Choose the Gem range and duration that fits the outcome you want to fund.</Text>

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
                    {tier.min_amount.toLocaleString()}+ Gems
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
              Pool details
            </Text>
            <Text style={styles.stepSubtitle}>Name the funded outcome and choose how many Gems to secure.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pool name</Text>
              <View style={[styles.input, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                <Ionicons name="text-outline" size={20} color={DesignColors.gray[400]} />
                <TextInput
                  value={poolName}
                  onChangeText={setPoolName}
                  placeholder="e.g. Kingston food crawl rewards"
                  placeholderTextColor={DesignColors.gray[400]}
                  style={[styles.textInput, { color: isDark ? DesignColors.white : DesignColors.black }]}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gems to secure</Text>
              <View style={styles.amountRange}>
                <Text style={styles.amountRangeText}>
                  {selectedTier.min_amount.toLocaleString()} - {selectedTier.max_amount.toLocaleString()} Gems
                </Text>
              </View>
              <View style={[styles.input, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                <Text style={styles.inputPrefix}>G</Text>
                <TextInput
                  value={poolAmount}
                  onChangeText={(value) => setPoolAmount(value.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  placeholder="Enter Gem amount"
                  placeholderTextColor={DesignColors.gray[400]}
                  style={[styles.textInput, { color: isDark ? DesignColors.white : DesignColors.black }]}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Participant message</Text>
              <View style={[styles.textArea, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                <TextInput
                  value={brandMessage}
                  onChangeText={setBrandMessage}
                  multiline
                  textAlignVertical="top"
                  placeholder="Tell people what this pool is helping make happen."
                  placeholderTextColor={DesignColors.gray[400]}
                  style={[styles.textInput, styles.textAreaInput, { color: isDark ? DesignColors.white : DesignColors.black }]}
                />
              </View>
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={[styles.stepTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
              Optional boosts
            </Text>
            <Text style={styles.stepSubtitle}>Add extra distribution if this funded action needs more reach.</Text>

            {[
              { key: 'homepage_banner', name: 'Today placement', price: '500 Gems/week', icon: 'image' },
              { key: 'push_notification', name: 'Return reminder', price: '200 Gems/send', icon: 'notifications' },
              { key: 'sponsored_badge', name: 'Funded badge', price: '100 Gems/pool', icon: 'star' },
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
                {step === 3 ? 'Create pool' : 'Continue'}
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
  opportunityHeading:{marginTop:22,marginBottom:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:'transparent'},
  opportunityEyebrow:{color:DesignColors.primary,fontFamily:'SpaceMono',fontSize:10,letterSpacing:.8},
  opportunityCard:{padding:15,borderRadius:BorderRadius.xl,borderWidth:1,borderColor:DesignColors.border,marginBottom:10},
  opportunityTop:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:'transparent'},
  fitBadge:{paddingHorizontal:8,paddingVertical:5,borderRadius:99,backgroundColor:DesignColors.primary},
  fitText:{color:DesignColors.black,fontSize:9,fontWeight:'900'},
  opportunityDate:{color:DesignColors.gray[500],fontFamily:'SpaceMono',fontSize:10},
  opportunityTitle:{fontSize:18,fontWeight:'900',marginTop:12},
  opportunityLocation:{color:DesignColors.gray[500],fontSize:11,marginTop:4},
  reasonList:{gap:5,marginTop:12,backgroundColor:'transparent'},
  reason:{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'transparent'},
  reasonText:{color:DesignColors.gray[400],fontSize:10,flex:1},
  opportunityFoot:{marginTop:13,paddingTop:11,borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:DesignColors.border,flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:'transparent'},
  opportunitySignal:{color:DesignColors.gray[500],fontSize:10},
  openOpportunity:{color:DesignColors.primary,fontSize:11,fontWeight:'900'},
  opportunityEmpty:{padding:18,borderRadius:BorderRadius.xl,borderWidth:1,borderStyle:'dashed',borderColor:DesignColors.border},
  opportunityEmptyText:{color:DesignColors.gray[500],fontSize:11,lineHeight:17},
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
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 12,
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
  poolDetail: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: DesignColors.primary + '10',
    marginBottom: Spacing.md,
  },
  poolDetailText: {
    fontSize: Typography.sizes.sm,
    color: DesignColors.gray[600],
    lineHeight: 19,
  },
  poolDetailGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    backgroundColor: 'transparent',
  },
  poolDetailItem: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  poolDetailValue: {
    color: DesignColors.primary,
    fontWeight: 'bold',
    fontSize: Typography.sizes.base,
    textTransform: 'capitalize',
  },
  poolDetailLabel: {
    color: DesignColors.gray[500],
    fontSize: Typography.sizes.xs,
    marginTop: 2,
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
  textInput: {
    flex: 1,
    fontSize: Typography.sizes.base,
    padding: 0,
  },
  textAreaInput: {
    minHeight: 70,
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

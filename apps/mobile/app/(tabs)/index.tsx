import { Ionicons } from '@expo/vector-icons';
import { GEM_LANGUAGE, getCurrentMove, getJourneyStatuses } from '@promorang/shared';
import { router } from 'expo-router';
import { ActivityIndicator, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { AppHeader } from '@/components/AppHeader';
import { BorderRadius, Colors, Spacing } from '@/constants/DesignTokens';
import { STAKEHOLDER_EXPERIENCES, isStakeholderRole } from '@/constants/StakeholderExperience';
import { useAuth } from '@/context/AuthContext';
import { useUserBalance } from '@/hooks/useEconomy';
import { useMoments, type Moment } from '@/hooks/useMoments';
import { useVaultSummary } from '@/hooks/useVault';
import { useLivingFeed } from '@/hooks/useLivingFeed';
import { LivingFeedCard } from '@/components/LivingFeedCard';

const homeHeroImage = 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1000&q=85';

export default function StakeholderHomeScreen() {
  const [feedIntent, setFeedIntent] = useState<'nearby' | 'tonight' | 'earn' | null>(null);
  const [removedFeedItems, setRemovedFeedItems] = useState<Set<string>>(new Set());
  const { activeRole, user } = useAuth();
  const { balance, loading: balanceLoading } = useUserBalance();
  const { summary, loading: vaultLoading } = useVaultSummary();
  const { moments, loading: momentsLoading, error: momentsError } = useMoments();
  const { items: livingFeed, loading: feedLoading, error: feedError, refresh: refreshFeed } = useLivingFeed(feedIntent);
  const role = isStakeholderRole(activeRole) ? activeRole : 'participant';
  const experience = STAKEHOLDER_EXPERIENCES[role];
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Explorer';
  const hasLiveMoments = moments.length > 0;
  const featuredMoment = moments[0] as Moment | undefined;
  const gems = balance?.gems || 0;
  const vaultObjects = Object.values(summary?.asset_counts || {}).reduce((sum, count) => sum + Number(count || 0), 0);
  const securedGems = summary?.asset_counts?.access ? Number(summary.asset_counts.access || 0) : 0;
  const valueProgress = Math.min(100, Math.max(12, gems ? (Math.min(gems, 1000) / 1000) * 100 : vaultObjects ? 38 : 12));
  const journeyStatuses = getJourneyStatuses({
    hasDiscovered: hasLiveMoments || gems > 0 || vaultObjects > 0,
    hasJoinedMoment: hasLiveMoments,
    hasArrived: gems > 0 || vaultObjects > 0,
    hasContribution: gems > 0,
    hasUnlockedValue: gems > 0 || securedGems > 0,
    hasSavedMemory: vaultObjects > 0,
    hasRecognizedPattern: vaultObjects > 2,
    hasReturned: vaultObjects > 4,
  });
  const currentMove = getCurrentMove({
    hasDiscovered: hasLiveMoments || gems > 0 || vaultObjects > 0,
    hasJoinedMoment: hasLiveMoments,
    hasArrived: gems > 0 || vaultObjects > 0,
    hasContribution: gems > 0,
    hasUnlockedValue: gems > 0 || securedGems > 0,
    hasSavedMemory: vaultObjects > 0,
    hasRecognizedPattern: vaultObjects > 2,
    hasReturned: vaultObjects > 4,
  });

  return (
    <View style={styles.screen}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroShell}>
          <ImageBackground
            source={{ uri: featuredMoment?.image_url || homeHeroImage }}
            style={styles.heroImage}
            imageStyle={styles.heroImageRadius}
          >
            <View style={styles.heroShade} />
            <View style={styles.heroTop}>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>{hasLiveMoments ? 'LIVE NEAR YOU' : momentsError ? 'OFFLINE' : 'TODAY'}</Text>
              </View>
              <Pressable accessibilityLabel="Open discover" onPress={() => router.push('/discover')} style={styles.heroIconButton}>
                <Ionicons name="compass" size={19} color={Colors.white} />
              </Pressable>
            </View>

            <View style={styles.heroCopy}>
              <Text style={styles.greeting}>Welcome, {firstName}.</Text>
              <Text style={styles.heroTitle}>{featuredMoment?.title || 'Find the next move worth making.'}</Text>
              <Text style={styles.heroLocation}>{featuredMoment?.location || experience.label}</Text>
              <Text style={styles.heroSummary} numberOfLines={2}>
                {featuredMoment?.description || (momentsError ? 'Today could not refresh live Moments. Pull back into Discover or search when you are ready.' : experience.summary)}
              </Text>
              <View style={styles.heroActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push(featuredMoment ? `/moment/${featuredMoment.id}` as any : '/discover')}
                  style={styles.heroPrimary}
                >
                  <Text style={styles.heroPrimaryText}>{featuredMoment ? 'See the moment' : momentsLoading ? 'Loading moments' : 'Explore moments'}</Text>
                  <Ionicons name="arrow-forward" size={17} color={Colors.black} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/post')}
                  style={styles.heroSecondary}
                >
                  <Ionicons name="camera" size={17} color={Colors.white} />
                  <Text style={styles.heroSecondaryText}>{featuredMoment ? 'Share the moment' : 'Create a Moment'}</Text>
                </Pressable>
              </View>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.roleStrip}>
          <View style={[styles.roleMark, { backgroundColor: `${experience.color}22` }]}>
            <Ionicons name={experience.icon} size={18} color={experience.color} />
          </View>
          <View style={styles.roleCopy}>
            <Text style={[styles.roleEyebrow, { color: experience.color }]}>{experience.label.toUpperCase()}</Text>
            <Text style={styles.roleLine}>{experience.outcome}</Text>
          </View>
        </View>

        <View style={styles.currentMoveCard}>
          <View style={styles.currentMoveTop}>
            <View>
              <Text style={styles.currentMoveEyebrow}>YOUR CURRENT MOVE</Text>
              <Text style={styles.currentMoveTitle}>{currentMove.title}</Text>
            </View>
            <View style={styles.currentMoveBadge}>
              <Text style={styles.currentMoveBadgeText}>{currentMove.step.label}</Text>
            </View>
          </View>
          <Text style={styles.currentMoveBody}>{currentMove.body}</Text>
          <View style={styles.journeyRail}>
            {journeyStatuses.slice(2, 7).map((step) => (
              <View
                key={step.id}
                style={[
                  styles.journeyDot,
                  step.status === 'done' && styles.journeyDotDone,
                  step.status === 'current' && styles.journeyDotCurrent,
                ]}
              />
            ))}
          </View>
          <Text style={styles.gemLine}>{GEM_LANGUAGE.valueStatement}. Gems secure paid access, rewards, tips, and funded participation.</Text>
        </View>

        <View style={styles.sectionHeading}>
          <View><Text style={styles.sectionEyebrow}>YOUR LIVING MARKET</Text><Text style={styles.sectionTitle}>Moving toward you</Text></View>
          {feedLoading ? <ActivityIndicator color={Colors.primary}/> : <Text style={[styles.stepCount,{color:Colors.primary}]}>{livingFeed.length} SIGNALS</Text>}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.intentRail}>
          {([
            { value: null, label: 'For you', icon: 'sparkles' },
            { value: 'nearby', label: 'Nearby', icon: 'location' },
            { value: 'tonight', label: 'Tonight', icon: 'moon' },
            { value: 'earn', label: 'Earn', icon: 'diamond' },
          ] as const).map((option) => {
            const active = feedIntent === option.value;
            return (
              <Pressable key={option.label} onPress={() => setFeedIntent(option.value)} style={[styles.intentChip, active && styles.intentChipActive]}>
                <Ionicons name={option.icon} size={14} color={active ? Colors.black : Colors.gray[300]} />
                <Text style={[styles.intentText, active && styles.intentTextActive]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {feedError && !feedLoading ? (
          <Pressable onPress={() => void refreshFeed()} style={styles.feedError}>
            <View><Text style={styles.feedErrorTitle}>Your market paused</Text><Text style={styles.feedErrorBody}>Tap to reconnect the ranked stream.</Text></View>
            <Ionicons name="refresh" size={18} color={Colors.primary} />
          </Pressable>
        ) : null}
        {livingFeed
          .filter((item) => !removedFeedItems.has(`${item.type}-${item.id}`))
          .slice(0, 12)
          .map((item) => (
            <LivingFeedCard
              key={`${item.type}-${item.id}`}
              item={item}
              onRemoved={() => setRemovedFeedItems((current) => new Set(current).add(`${item.type}-${item.id}`))}
            />
          ))}

        <View style={styles.economyCard}>
          <View style={styles.economyHeader}>
            <View>
              <Text style={styles.economyEyebrow}>WHAT YOUR PRESENCE IS OPENING</Text>
              <Text style={styles.economyTitle}>Your life around Promorang</Text>
            </View>
            {(balanceLoading || vaultLoading) ? <ActivityIndicator color={Colors.primary} /> : (
              <View style={styles.livePill}>
                <View style={styles.economyLiveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>

          <View style={styles.economyStats}>
            <Pressable accessibilityRole="button" onPress={() => router.push('/rewards')} style={styles.economyStat}>
              <View style={[styles.economyIcon, { backgroundColor: 'rgba(245,158,11,.15)' }]}>
                <Ionicons name="diamond" size={19} color="#F59E0B" />
              </View>
              <Text style={styles.economyValue}>{gems.toLocaleString()}</Text>
              <Text style={styles.economyLabel}>Available Gems</Text>
            </Pressable>

            <Pressable accessibilityRole="button" onPress={() => router.push('/rewards')} style={styles.economyStat}>
              <View style={[styles.economyIcon, { backgroundColor: 'rgba(255,106,26,.16)' }]}>
                <Ionicons name="lock-closed" size={19} color={Colors.primary} />
              </View>
              <Text style={styles.economyValue}>{securedGems}</Text>
              <Text style={styles.economyLabel}>Secured value</Text>
            </Pressable>

            <Pressable accessibilityRole="button" onPress={() => router.push('/vault')} style={styles.economyStat}>
              <View style={[styles.economyIcon, { backgroundColor: 'rgba(45,212,191,.14)' }]}>
                <Ionicons name="archive" size={19} color="#2DD4BF" />
              </View>
              <Text style={styles.economyValue}>{vaultObjects}</Text>
              <Text style={styles.economyLabel}>Saved memories</Text>
            </Pressable>
          </View>

          <View style={styles.keyProgress}>
            <View style={styles.keyProgressTop}>
              <Text style={styles.keyProgressLabel}>Value record</Text>
              <Text style={styles.keyProgressValue}>{GEM_LANGUAGE.valueStatement}</Text>
            </View>
            <View style={styles.keyTrack}>
              <View style={[styles.keyFill, { width: `${valueProgress}%` }]} />
            </View>
          </View>

        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionEyebrow}>YOUR PATH</Text>
            <Text style={styles.sectionTitle}>How Promorang opens value</Text>
          </View>
          <Text style={[styles.stepCount, { color: experience.color }]}>3 STEPS</Text>
        </View>

        <View style={styles.steps}>
          {experience.steps.map((step, index) => (
            <Pressable
              key={step.title}
              accessibilityRole="button"
              onPress={() => router.push(step.href as never)}
              style={styles.step}
            >
              <View style={[styles.stepNumber, { borderColor: `${experience.color}70` }]}>
                <Text style={[styles.stepNumberText, { color: experience.color }]}>{index + 1}</Text>
              </View>
              <View style={[styles.stepIcon, { backgroundColor: `${experience.color}16` }]}>
                <Ionicons name={step.icon} size={19} color={experience.color} />
              </View>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDetail}>{step.detail}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.gray[500]} />
            </Pressable>
          ))}
        </View>

        <Pressable onPress={() => router.push('/modal')} style={styles.switchCard}>
          <View style={styles.switchIcon}><Ionicons name="swap-horizontal" size={20} color={Colors.primary} /></View>
          <View style={styles.switchCopy}>
            <Text style={styles.switchTitle}>Change what you are here to do</Text>
            <Text style={styles.switchDetail}>View Promorang as a participant, creator, host, brand, merchant, or agency.</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </Pressable>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  content: { paddingHorizontal: Spacing.container },
  intentRail: { gap: 8, paddingBottom: 14 },
  intentChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: 'rgba(255,255,255,.12)' },
  intentChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  intentText: { color: Colors.gray[300], fontSize: 11, fontWeight: '800' },
  intentTextActive: { color: Colors.black },
  feedError: { minHeight: 82, marginBottom: 14, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: 'rgba(255,106,26,.32)' },
  feedErrorTitle: { color: Colors.white, fontSize: 14, fontWeight: '800' },
  feedErrorBody: { color: Colors.gray[400], fontSize: 11, marginTop: 4 },
  heroShell: {
    overflow: 'hidden',
    marginTop: 16,
    height: 430,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: Colors.gray[900],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.12)',
  },
  heroImage: { flex: 1, justifyContent: 'space-between', padding: 16 },
  heroImageRadius: { borderRadius: BorderRadius['2xl'] },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.24)' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(8,8,8,.72)' },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary },
  liveBadgeText: { color: Colors.white, fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: .8 },
  heroIconButton: { width: 39, height: 39, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,8,8,.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,.16)' },
  heroCopy: { backgroundColor: 'transparent' },
  greeting: { color: Colors.gray[100], fontSize: 13, fontWeight: '700', marginBottom: 8 },
  heroTitle: { color: Colors.white, fontSize: 38, lineHeight: 40, fontWeight: '900', letterSpacing: -1.45, maxWidth: 320 },
  heroLocation: { color: Colors.accent, fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: .8, marginTop: 8, textTransform: 'uppercase' },
  heroSummary: { color: Colors.gray[100], fontSize: 13, lineHeight: 19, marginTop: 7, maxWidth: 300 },
  heroActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  heroPrimary: { flex: 1, minHeight: 48, borderRadius: 17, backgroundColor: Colors.primary, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroPrimaryText: { color: Colors.black, fontSize: 12, fontWeight: '900' },
  heroSecondary: { minHeight: 48, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(255,255,255,.24)', backgroundColor: 'rgba(8,8,8,.62)', paddingHorizontal: 14, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' },
  heroSecondaryText: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  roleStrip: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, padding: 14, borderRadius: BorderRadius.xl, backgroundColor: '#11100F', borderWidth: 1, borderColor: Colors.border },
  roleMark: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  roleCopy: { flex: 1 },
  roleEyebrow: { fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: .9 },
  roleLine: { color: Colors.white, fontSize: 12, lineHeight: 17, fontWeight: '700', marginTop: 3 },
  currentMoveCard: { marginTop: 12, padding: 15, borderRadius: BorderRadius.xl, backgroundColor: '#17100C', borderWidth: 1, borderColor: 'rgba(255,106,26,.26)' },
  currentMoveTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, backgroundColor: 'transparent' },
  currentMoveEyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: .9 },
  currentMoveTitle: { color: Colors.white, fontSize: 18, lineHeight: 22, fontWeight: '900', letterSpacing: -.3, marginTop: 5, maxWidth: 230 },
  currentMoveBadge: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.ambientWash, borderWidth: 1, borderColor: 'rgba(255,106,26,.28)' },
  currentMoveBadgeText: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: .6 },
  currentMoveBody: { color: Colors.gray[300], fontSize: 11, lineHeight: 17, marginTop: 9 },
  journeyRail: { flexDirection: 'row', gap: 7, marginTop: 14, backgroundColor: 'transparent' },
  journeyDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.gray[800] },
  journeyDotDone: { backgroundColor: Colors.success },
  journeyDotCurrent: { backgroundColor: Colors.primary },
  gemLine: { color: Colors.gray[500], fontSize: 9, lineHeight: 14, marginTop: 12 },
  economyCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.09)',
    backgroundColor: '#11100F',
  },
  economyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  economyEyebrow: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: .8 },
  economyTitle: { color: Colors.white, fontSize: 19, fontWeight: '900', letterSpacing: -.45, marginTop: 4 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(34,197,94,.12)' },
  economyLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  liveText: { color: Colors.success, fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: .7 },
  economyStats: { flexDirection: 'row', gap: 9, marginTop: 15 },
  economyStat: { flex: 1, minHeight: 104, padding: 11, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900] },
  economyIcon: { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  economyValue: { color: Colors.white, fontSize: 19, fontWeight: '900', marginTop: 14 },
  economyLabel: { color: Colors.gray[500], fontSize: 9, lineHeight: 12, marginTop: 2 },
  keyProgress: { marginTop: 14, padding: 13, borderRadius: 17, backgroundColor: 'rgba(255,255,255,.045)' },
  keyProgressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  keyProgressLabel: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  keyProgressValue: { color: Colors.gray[500], fontSize: 10, fontFamily: 'SpaceMono' },
  keyTrack: { height: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,.08)', marginTop: 11, overflow: 'hidden' },
  keyFill: { height: 8, borderRadius: 999, backgroundColor: Colors.primary },
  sectionHeading: { marginTop: 26, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionEyebrow: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: .8 },
  sectionTitle: { color: Colors.white, fontSize: 21, fontWeight: '800', letterSpacing: -.5, marginTop: 4 },
  stepCount: { fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: .6 },
  steps: { gap: 10 },
  step: { minHeight: 76, padding: 12, flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900] },
  stepNumber: { width: 23, height: 23, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  stepNumberText: { fontFamily: 'SpaceMono', fontSize: 9 },
  stepIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  stepCopy: { flex: 1 },
  stepTitle: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  stepDetail: { color: Colors.gray[500], fontSize: 10, lineHeight: 14, marginTop: 3 },
  switchCard: { marginTop: 14, padding: 15, flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.xl, backgroundColor: '#24160F', borderWidth: 1, borderColor: 'rgba(255,106,26,.25)' },
  switchIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  switchCopy: { flex: 1 },
  switchTitle: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  switchDetail: { color: Colors.gray[500], fontSize: 9, marginTop: 3 },
  bottomSpace: { height: 115 },
});

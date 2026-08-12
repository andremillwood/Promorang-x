import { Ionicons } from '@expo/vector-icons';
import { getCurrentMove, getJourneyStatuses } from '@promorang/shared';
import { router } from 'expo-router';
import { ActivityIndicator, ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { LivingFeedCardSkeleton } from '@/components/SkeletonLoader';
import { ResponsivePressable as Pressable } from '@/components/ResponsivePressable';
import { useMomentParticipation } from '@/hooks/useMomentParticipation';

import { useDiscoveries } from '@/hooks/useDiscoveries';
import { formatDiscoveryCategory, discoveryLocation } from '@promorang/shared';

const homeHeroImage = 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1000&q=85';

export default function StakeholderHomeScreen() {
  const [feedMode, setFeedMode] = useState<'today' | 'for_you'>('today');
  const [feedIntent, setFeedIntent] = useState<'nearby' | 'tonight' | 'earn' | null>(null);
  const { discoveries } = useDiscoveries();
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
  const featuredParticipation = useMomentParticipation(featuredMoment?.id);
  const nextInvitation = moments[1] as Moment | undefined;
  const gems = balance?.gems || 0;
  const vaultObjects = Object.values(summary?.asset_counts || {}).reduce((sum, count) => sum + Number(count || 0), 0);
  const securedGems = summary?.asset_counts?.access ? Number(summary.asset_counts.access || 0) : 0;
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

      <View style={styles.topModeBar}>
        <Pressable
          style={[styles.modeBtn, feedMode === 'today' && styles.modeBtnActive]}
          onPress={() => setFeedMode('today')}
        >
          <Ionicons name="calendar-outline" size={14} color={feedMode === 'today' ? Colors.black : Colors.gray[400]} />
          <Text style={[styles.modeBtnText, feedMode === 'today' && styles.modeBtnTextActive]}>Today</Text>
        </Pressable>
        <Pressable
          style={[styles.modeBtn, feedMode === 'for_you' && styles.modeBtnActive]}
          onPress={() => setFeedMode('for_you')}
        >
          <Ionicons name="sparkles" size={14} color={feedMode === 'for_you' ? Colors.black : Colors.gray[400]} />
          <Text style={[styles.modeBtnText, feedMode === 'for_you' && styles.modeBtnTextActive]}>For You</Text>
        </Pressable>
      </View>

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

        <View style={styles.currentMoveCard}>
          <View style={styles.currentMoveTop}>
            <View>
              <Text style={styles.currentMoveEyebrow}>YOUR CURRENT MOVE</Text>
              <Text style={styles.currentMoveTitle}>{featuredParticipation.journey?.title || currentMove.title}</Text>
            </View>
            <View style={styles.currentMoveBadge}>
              <Text style={styles.currentMoveBadgeText}>{featuredParticipation.journey?.stage.replace('_', ' ') || currentMove.step.label}</Text>
            </View>
          </View>
          <Text style={styles.currentMoveBody}>{featuredParticipation.journey?.body || currentMove.body}</Text>
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
          <Text style={styles.gemLine}>{gems > 0 ? `${gems.toLocaleString()} Gems are ready in your Vault.` : 'Promorang will keep the useful parts close without interrupting the Moment.'}</Text>
        </View>

        {/* Stakeholder Role Archetypes Rail */}
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionEyebrow}>STAKEHOLDER SUPERPOWERS</Text>
            <Text style={styles.sectionTitle}>Role Archetypes & Missions</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.archetypeRail}>
          {[
            { id: 'scout', title: 'Scout 🔍', role: 'Spotter', perk: '+100 Pts / Spot', color: '#F59E0B' },
            { id: 'catalyst', title: 'Catalyst ⚡', role: 'Momentum', perk: 'Match Boosts', color: '#F97316' },
            { id: 'anchor', title: 'Anchor ⚓', role: 'Venue Host', perk: 'Commerce Cash', color: '#10B981' },
            { id: 'hype', title: 'Hype 📣', role: 'Amplifier', perk: 'Referral Slice', color: '#A855F7' },
            { id: 'pulse', title: 'Pulse 📊', role: 'Auditor', perk: 'Rep + Gems', color: '#06B6D4' },
          ].map((arch) => (
            <Pressable key={arch.id} style={[styles.archetypeChip, { borderColor: arch.color }]} onPress={() => router.push(`/mission/demo-${arch.id}` as any)}>
              <Text style={[styles.archetypeTitle, { color: arch.color }]}>{arch.title}</Text>
              <Text style={styles.archetypeRole}>{arch.role}</Text>
              <Text style={styles.archetypePerk}>{arch.perk}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Discoveries Section */}
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionEyebrow}>SCOUT NETWORK</Text>
            <Text style={styles.sectionTitle}>Fresh Discoveries</Text>
          </View>
          <Pressable onPress={() => router.push('/discover')}>
            <Text style={{ color: Colors.primary, fontWeight: '800', fontSize: 12 }}>SEE ALL</Text>
          </Pressable>
        </View>

        {discoveries.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.discoveryRail}>
            {discoveries.slice(0, 6).map((disc) => (
              <Pressable
                key={disc.id}
                style={styles.discoveryCard}
                onPress={() => router.push(`/discovery/${disc.slug}` as any)}
              >
                <ImageBackground
                  source={disc.cover_image ? { uri: disc.cover_image } : undefined}
                  style={styles.discoveryCardImage}
                  imageStyle={{ borderRadius: 16 }}
                >
                  <View style={styles.discoveryCardShade} />
                  <View style={styles.discoveryCardCopy}>
                    <Text style={styles.discoveryCardTag}>{formatDiscoveryCategory(disc.category).toUpperCase()}</Text>
                    <Text style={styles.discoveryCardTitle} numberOfLines={1}>{disc.title}</Text>
                    <Text style={styles.discoveryCardCity} numberOfLines={1}>{discoveryLocation(disc)}</Text>
                  </View>
                </ImageBackground>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

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
        {feedLoading && livingFeed.length === 0 ? (
          <>
            <LivingFeedCardSkeleton />
            <LivingFeedCardSkeleton />
          </>
        ) : (
          livingFeed
            .filter((item) => !removedFeedItems.has(`${item.type}-${item.id}`))
            .slice(0, 12)
            .map((item) => (
              <LivingFeedCard
                key={`${item.type}-${item.id}`}
                item={item}
                onRemoved={() => setRemovedFeedItems((current) => new Set(current).add(`${item.type}-${item.id}`))}
              />
            ))
        )}

        <Pressable accessibilityRole="button" onPress={() => router.push('/vault')} style={styles.economyCard}>
          <View style={styles.economyHeader}>
            <View>
              <Text style={styles.economyEyebrow}>WHAT STAYED WITH YOU</Text>
              <Text style={styles.economyTitle}>{vaultObjects > 0 ? `${vaultObjects} ${vaultObjects === 1 ? 'thing is' : 'things are'} waiting in your Vault.` : 'Your first memory starts outside.'}</Text>
            </View>
            {(balanceLoading || vaultLoading) ? <ActivityIndicator color={Colors.primary} /> : <Ionicons name="arrow-forward" size={20} color={Colors.primary} />}
          </View>
          <View style={styles.keptTrail}>
            <View style={styles.keptMark}><Ionicons name="images" size={18} color={Colors.accent} /></View>
            <View style={styles.keptCopy}><Text style={styles.keptTitle}>{vaultObjects > 0 ? 'Memories, access, and invitations' : 'Show up. Take part. Keep what follows.'}</Text><Text style={styles.keptDetail}>{gems > 0 ? `${gems.toLocaleString()} Gems are also available.` : securedGems > 0 ? 'Something useful has opened for you.' : 'The Vault becomes your private record of the life you build here.'}</Text></View>
          </View>
        </Pressable>

        <View style={styles.sectionHeading}>
          <View><Text style={styles.sectionEyebrow}>WHAT OPENS NEXT</Text><Text style={styles.sectionTitle}>Your next invitation</Text></View>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push(nextInvitation ? `/moment/${nextInvitation.id}` as any : '/discover')} style={styles.invitationCard}>
          <ImageBackground source={{ uri: nextInvitation?.image_url || homeHeroImage }} style={styles.invitationImage} imageStyle={styles.invitationImageRadius}>
            <View style={styles.invitationShade} />
            <View style={styles.invitationTop}><Text style={styles.invitationLabel}>{nextInvitation ? 'CONNECTED TO YOUR WORLD' : 'STILL TO BE FOUND'}</Text><Ionicons name="arrow-up" size={20} color={Colors.white} style={{ transform: [{ rotate: '45deg' }] }} /></View>
            <View style={styles.invitationCopy}>
              <Text style={styles.invitationTitle}>{nextInvitation?.title || 'Find somewhere worth showing up.'}</Text>
              <Text style={styles.invitationDetail}>{nextInvitation?.location || 'Nearby Moments, people and places—not a random recommendation.'}</Text>
            </View>
          </ImageBackground>
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
  intentText: { color: Colors.gray[300], fontSize: 13, fontWeight: '800' },
  intentTextActive: { color: Colors.black },
  feedError: { minHeight: 82, marginBottom: 14, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: 'rgba(255,106,26,.32)' },
  feedErrorTitle: { color: Colors.white, fontSize: 14, fontWeight: '800' },
  feedErrorBody: { color: Colors.gray[400], fontSize: 13, marginTop: 4 },
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
  liveBadgeText: { color: Colors.white, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .8 },
  heroIconButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,8,8,.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,.16)' },
  heroCopy: { backgroundColor: 'transparent' },
  greeting: { color: Colors.gray[100], fontSize: 13, fontWeight: '700', marginBottom: 8 },
  heroTitle: { color: Colors.white, fontSize: 38, lineHeight: 40, fontWeight: '900', letterSpacing: -1.45, maxWidth: 320 },
  heroLocation: { color: Colors.accent, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .8, marginTop: 8, textTransform: 'uppercase' },
  heroSummary: { color: Colors.gray[100], fontSize: 13, lineHeight: 19, marginTop: 7, maxWidth: 300 },
  heroActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  heroPrimary: { flex: 1, minHeight: 48, borderRadius: 17, backgroundColor: Colors.primary, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroPrimaryText: { color: Colors.black, fontSize: 12, fontWeight: '900' },
  heroSecondary: { minHeight: 48, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(255,255,255,.24)', backgroundColor: 'rgba(8,8,8,.62)', paddingHorizontal: 14, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' },
  heroSecondaryText: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  currentMoveCard: { marginTop: 12, padding: 15, borderRadius: BorderRadius.xl, backgroundColor: '#17100C', borderWidth: 1, borderColor: 'rgba(255,106,26,.26)' },
  currentMoveTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, backgroundColor: 'transparent' },
  currentMoveEyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .6 },
  currentMoveTitle: { color: Colors.white, fontSize: 18, lineHeight: 22, fontWeight: '900', letterSpacing: -.3, marginTop: 5, maxWidth: 230 },
  currentMoveBadge: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.ambientWash, borderWidth: 1, borderColor: 'rgba(255,106,26,.28)' },
  currentMoveBadgeText: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .4 },
  currentMoveBody: { color: Colors.gray[300], fontSize: 14, lineHeight: 20, marginTop: 9 },
  journeyRail: { flexDirection: 'row', gap: 7, marginTop: 14, backgroundColor: 'transparent' },
  journeyDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.gray[800] },
  journeyDotDone: { backgroundColor: Colors.success },
  journeyDotCurrent: { backgroundColor: Colors.primary },
  gemLine: { color: Colors.gray[400], fontSize: 12, lineHeight: 18, marginTop: 12 },
  economyCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.09)',
    backgroundColor: '#11100F',
  },
  economyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  economyEyebrow: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .8 },
  economyTitle: { color: Colors.white, fontSize: 19, fontWeight: '900', letterSpacing: -.45, marginTop: 4 },
  keptTrail: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, paddingTop: 15, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border, backgroundColor: 'transparent' },
  keptMark: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,176,103,.10)' },
  keptCopy: { flex: 1, backgroundColor: 'transparent' },
  keptTitle: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  keptDetail: { color: Colors.gray[400], fontSize: 12, lineHeight: 17, marginTop: 3 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(34,197,94,.12)' },
  economyLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  liveText: { color: Colors.success, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .7 },
  economyStats: { flexDirection: 'row', gap: 9, marginTop: 15 },
  economyStat: { flex: 1, minHeight: 104, padding: 11, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900] },
  economyIcon: { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  economyValue: { color: Colors.white, fontSize: 19, fontWeight: '900', marginTop: 14 },
  economyLabel: { color: Colors.gray[500], fontSize: 12, lineHeight: 12, marginTop: 2 },
  keyProgress: { marginTop: 14, padding: 13, borderRadius: 17, backgroundColor: 'rgba(255,255,255,.045)' },
  keyProgressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  keyProgressLabel: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  keyProgressValue: { color: Colors.gray[500], fontSize: 12, fontFamily: 'SpaceMono' },
  keyTrack: { height: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,.08)', marginTop: 11, overflow: 'hidden' },
  keyFill: { height: 8, borderRadius: 999, backgroundColor: Colors.primary },
  sectionHeading: { marginTop: 26, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionEyebrow: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .8 },
  sectionTitle: { color: Colors.white, fontSize: 21, fontWeight: '800', letterSpacing: -.5, marginTop: 4 },
  stepCount: { fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .6 },
  archetypeRail: { paddingRight: 16, gap: 10, marginBottom: 4 },
  archetypeChip: { minWidth: 130, padding: 12, borderRadius: 16, borderWidth: 1, backgroundColor: '#141418' },
  archetypeTitle: { fontSize: 13, fontWeight: '900' },
  archetypeRole: { color: Colors.white, fontSize: 12, fontWeight: '700', marginTop: 2 },
  archetypePerk: { color: Colors.gray[400], fontSize: 10, fontWeight: '600', marginTop: 4 },
  invitationCard: { height: 300, overflow: 'hidden', borderRadius: BorderRadius['2xl'], borderWidth: 1, borderColor: 'rgba(255,255,255,.12)', backgroundColor: Colors.gray[900] },
  invitationImage: { flex: 1, justifyContent: 'space-between', padding: 17 },
  invitationImageRadius: { borderRadius: BorderRadius['2xl'] },
  invitationShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.38)' },
  invitationTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent' },
  invitationLabel: { color: Colors.accent, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .8 },
  invitationCopy: { backgroundColor: 'transparent' },
  topModeBar: { flexDirection: 'row', paddingHorizontal: Spacing.container, paddingVertical: 10, gap: 10, backgroundColor: Colors.black, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modeBtn: { flex: 1, height: 38, borderRadius: 19, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  modeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  modeBtnText: { color: Colors.gray[400], fontSize: 12, fontWeight: '800' },
  modeBtnTextActive: { color: Colors.black, fontWeight: '900' },
  discoveryRail: { gap: 12, paddingBottom: 10 },
  discoveryCard: { width: 220, height: 140, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  discoveryCardImage: { flex: 1, justifyContent: 'flex-end', padding: 12 },
  discoveryCardShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.5)' },
  discoveryCardCopy: { backgroundColor: 'transparent' },
  discoveryCardTag: { color: Colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  discoveryCardTitle: { color: Colors.white, fontSize: 14, fontWeight: '900', marginTop: 2 },
  discoveryCardCity: { color: Colors.gray[300], fontSize: 11, marginTop: 2 },
  invitationTitle: { color: Colors.white, fontSize: 29, lineHeight: 31, fontWeight: '900', letterSpacing: -1, maxWidth: 300 },
  invitationDetail: { color: Colors.gray[100], fontSize: 12, lineHeight: 17, marginTop: 7, maxWidth: 280 },
  bottomSpace: { height: 115 },
});

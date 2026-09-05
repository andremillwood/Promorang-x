import { Ionicons } from '@expo/vector-icons';
import { getCurrentMove } from '@promorang/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { PromoCardFace } from '@/components/people/PromoCardFace';
import { PromoCardUseSheet } from '@/components/people/PromoCardUseSheet';
import { QuietEmpty, StatPile } from '@/components/people/ExperienceShell';
import { BorderRadius, Colors, Spacing } from '@/constants/DesignTokens';
import { useAuth } from '@/context/AuthContext';
import { useExperienceHome } from '@/hooks/usePeopleExperience';
import { presentPromoCard } from '@/lib/promoCard';

const money = (value: number) => {
  if (!value) return 'J$0';
  return `J$${Math.round(value).toLocaleString()}`;
};

export default function TodayScreen() {
  const { user, activeRole } = useAuth();
  const home = useExperienceHome();
  const [usingCard, setUsingCard] = useState(false);
  const data = home.data;
  const name = data?.name || user?.user_metadata?.full_name?.split(' ')[0] || 'You';
  const cardView = presentPromoCard(data?.card, name);
  const role = data?.role || (['creator', 'host', 'promoter', 'merchant', 'brand'].includes(String(activeRole)) ? 'contributor' : 'member');
  const communityName = data?.communities?.[0]?.title || name;
  const currentMove = getCurrentMove({
    hasDiscovered: Boolean(data?.communities?.length || data?.opportunityItems?.length),
    hasJoinedMoment: Boolean(data?.happened?.buckets?.went),
    hasArrived: Boolean(data?.happened?.buckets?.went || data?.happened?.buckets?.claimed),
    hasContribution: Boolean(data?.happened?.buckets?.shared || data?.perks?.length),
    hasUnlockedValue: Number(data?.wallet?.points || 0) > 0 || Number(data?.wallet?.promokeys || 0) > 0,
    hasSavedMemory: Number(data?.cardPerks || data?.wallet?.points || 0) > 0,
  });

  if (home.isLoading) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Today" />
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (!data && home.isError) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Today" />
        <View style={styles.pad}>
          <QuietEmpty
            title="Couldn’t load your home"
            copy="Try again to see your perks, community and activity."
            actionLabel={home.isFetching ? 'Trying again…' : 'Try again'}
            onAction={() => void home.refetch()}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppHeader title="Today" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>
          {role === 'operator' ? 'YOUR COMMUNITY' : role === 'contributor' ? 'YOUR PEOPLE' : 'TODAY'}
        </Text>
        <Text style={styles.title}>{communityName}</Text>
        <Text style={styles.description}>
          {role === 'member'
            ? 'Your PromoCard is the thing you hold. Discover what’s next, then use it when you get there.'
            : 'Give value that lands on people’s PromoCards. Your card is how you spend and recharge too.'}
        </Text>

        <PromoCardFace
          holder={cardView.holder}
          available={cardView.available}
          limit={cardView.limit}
          places={cardView.places}
          tier={cardView.tier}
          cardNumber={cardView.cardNumber}
          compact={role !== 'member'}
          onPress={() => router.push('/card')}
          onUsePress={() => setUsingCard(true)}
        />

        <Pressable style={styles.move} onPress={() => router.push(destinationFor(currentMove.destination))}>
          <View style={styles.moveTop}>
            <Text style={styles.moveEyebrow}>YOUR CURRENT MOVE</Text>
            <Text style={styles.moveBadge}>{currentMove.step.label}</Text>
          </View>
          <Text style={styles.moveTitle}>{currentMove.title}</Text>
          <Text style={styles.moveBody}>{currentMove.body}</Text>
          <View style={styles.moveCta}>
            <Text style={styles.moveCtaText}>{currentMove.ctaLabel}</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.black} />
          </View>
        </Pressable>

        {role !== 'member' ? (
          <View style={styles.statGrid}>
            {(data?.outcomes?.cards || [
              { key: 'people', label: 'People', value: data?.people || 0, hint: data?.peopleThisMonth ? `+${data.peopleThisMonth} this month` : 'Invite the first ones' },
              { key: 'earned', label: 'Earned', value: Number(data?.earned || 0), hint: 'From verified activity' },
            ]).slice(0, 4).map((card: any) => (
              <StatPile
                key={card.key}
                label={card.label}
                value={card.key === 'earned' ? money(Number(card.value || 0)) : card.value}
                hint={card.hint}
              />
            ))}
          </View>
        ) : null}

        {role === 'operator' ? (
          <View style={styles.weekCard}>
            <Text style={styles.moveEyebrow}>THIS WEEK</Text>
            <Text style={styles.weekTitle}>
              {data?.happening || 0} {data?.happening === 1 ? 'person showed up' : 'people showed up'}
            </Text>
            <Text style={styles.description}>
              {[
                data?.happened?.buckets?.went ? `${data.happened.buckets.went} went` : null,
                data?.happened?.buckets?.claimed ? `${data.happened.buckets.claimed} claimed` : null,
                data?.happened?.buckets?.brought ? `${data.happened.buckets.brought} brought friends` : null,
              ].filter(Boolean).join(' · ') || 'Nothing verified yet. Give something or ask them to show up.'}
            </Text>
          </View>
        ) : null}

        {role !== 'member' ? (
          <View style={styles.actions}>
            {[
              { href: '/give', label: 'Give something', copy: 'Put a perk on your people’s PromoCards.', icon: 'gift' as const },
              { href: '/post', label: 'Create something', copy: 'Ask them to go, try, answer or show up.', icon: 'add' as const },
              { href: '/people', label: 'Grow my network', copy: 'See who you brought and who is helping.', icon: 'people' as const },
              { href: '/promoshare', label: 'See results', copy: 'What your people actually did.', icon: 'sparkles' as const },
            ].map((action) => (
              <Pressable key={action.href} style={styles.action} onPress={() => router.push(action.href as any)}>
                <View style={styles.actionIcon}>
                  <Ionicons name={action.icon} size={20} color={Colors.black} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                  <Text style={styles.actionCopy}>{action.copy}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <Pressable style={styles.pathCard} onPress={() => router.push('/discover')}>
            <Text style={styles.moveEyebrow}>WHAT’S HAPPENING</Text>
            <Text style={styles.pathTitle}>Name what you want. Then we show the matching next step.</Text>
          </Pressable>
        )}

        {role !== 'member' && (data?.outcomes?.suppliesInventory || ['merchant', 'brand'].includes(String(activeRole))) ? (
          <Pressable style={styles.inventory} onPress={() => router.push('/stock')}>
            <Text style={styles.inventoryKicker}>INVENTORY</Text>
            <Text style={styles.inventoryTitle}>Put something up</Text>
            <Text style={styles.inventoryCopy}>Other people move it. You see claimed and used.</Text>
          </Pressable>
        ) : null}

        {data?.opportunityItems?.length ? (
          <View style={{ gap: 10 }}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Opportunities</Text>
              <Pressable onPress={() => router.push('/earn')}><Text style={styles.link}>Earn</Text></Pressable>
            </View>
            {data.opportunityItems.slice(0, 2).map((item: any) => (
              <Pressable key={item.id} style={styles.listCard} onPress={() => router.push('/earn')}>
                <Text style={styles.listTitle}>{item.title}</Text>
                <Text style={styles.actionCopy}>{item.youEarn}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {!data?.communities?.length ? (
          <Pressable style={styles.inventory} onPress={() => router.push('/start')}>
            <Text style={styles.inventoryKicker}>FIRST MOVE</Text>
            <Text style={styles.inventoryTitle}>Start a community — or join one.</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.listCard} onPress={() => router.push(`/scene/${data.communities[0].slug}` as any)}>
            <Text style={styles.moveEyebrow}>YOUR COMMUNITY</Text>
            <Text style={styles.listTitle}>{data.communities[0].title}</Text>
          </Pressable>
        )}

        {role !== 'member' ? (
          <Pressable onPress={() => router.push('/dashboard')}>
            <Text style={styles.studioLink}>Open the older studio tools</Text>
          </Pressable>
        ) : null}
        <View style={{ height: 120 }} />
      </ScrollView>
      <PromoCardUseSheet
        visible={usingCard}
        onClose={() => setUsingCard(false)}
        holder={cardView.holder}
        available={cardView.available}
        useCode={cardView.useCode}
      />
    </View>
  );
}

function destinationFor(destination: string) {
  if (destination === 'discover') return '/discover';
  if (destination === 'create') return '/post';
  if (destination === 'progress') return '/promoshare';
  if (destination === 'vault') return '/card';
  return '/';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pad: { padding: Spacing.container },
  content: { paddingHorizontal: Spacing.container, paddingTop: 10, gap: 16 },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 2, fontWeight: '800' },
  title: { color: Colors.white, fontSize: 36, lineHeight: 38, fontWeight: '800', letterSpacing: -1.2 },
  description: { color: Colors.gray[400], fontSize: 14, lineHeight: 21 },
  move: { borderRadius: BorderRadius['2xl'], padding: 16, backgroundColor: '#17100C', borderWidth: 1, borderColor: 'rgba(255,85,0,0.28)' },
  moveTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  moveEyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 1.2, fontWeight: '800' },
  moveBadge: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 11 },
  moveTitle: { color: Colors.white, fontSize: 20, fontWeight: '800', marginTop: 8 },
  moveBody: { color: Colors.gray[300], fontSize: 14, lineHeight: 20, marginTop: 6 },
  moveCta: { marginTop: 14, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  moveCtaText: { color: Colors.black, fontSize: 13, fontWeight: '900' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  weekCard: { borderRadius: BorderRadius['2xl'], padding: 16, borderWidth: 1, borderColor: 'rgba(255,85,0,0.3)', backgroundColor: 'rgba(255,85,0,0.1)' },
  weekTitle: { color: Colors.white, fontSize: 20, fontWeight: '800', marginTop: 6, marginBottom: 4 },
  actions: { gap: 10 },
  action: { minHeight: 88, borderRadius: 24, borderWidth: 1, borderColor: Colors.border, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  actionIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { color: Colors.white, fontSize: 20, fontWeight: '800' },
  actionCopy: { color: Colors.gray[400], fontSize: 13, marginTop: 4 },
  sectionTitle: { color: Colors.white, fontSize: 22, fontWeight: '800' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { color: Colors.primary, fontSize: 14, fontWeight: '800' },
  pathCard: { borderRadius: BorderRadius['2xl'], borderWidth: 1, borderColor: Colors.border, backgroundColor: 'rgba(255,255,255,0.04)', padding: 20 },
  pathTitle: { color: Colors.white, fontSize: 22, fontWeight: '800', marginTop: 8 },
  inventory: { borderRadius: 24, backgroundColor: Colors.primary, padding: 20 },
  inventoryKicker: { color: 'rgba(0,0,0,0.55)', fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 2, fontWeight: '800' },
  inventoryTitle: { color: Colors.black, fontSize: 24, fontWeight: '800', marginTop: 4 },
  inventoryCopy: { color: 'rgba(0,0,0,0.7)', fontSize: 14, marginTop: 4 },
  listCard: { borderRadius: 22, borderWidth: 1, borderColor: Colors.border, backgroundColor: 'rgba(255,255,255,0.04)', padding: 16 },
  listTitle: { color: Colors.white, fontSize: 20, fontWeight: '800' },
  studioLink: { color: Colors.gray[600], fontSize: 12, textAlign: 'center', marginTop: 8 },
});

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { QuietEmpty } from '@/components/people/ExperienceShell';
import { PromoCardFace } from '@/components/people/PromoCardFace';
import { PromoCardUseSheet } from '@/components/people/PromoCardUseSheet';
import { BorderRadius, Colors, Spacing } from '@/constants/DesignTokens';
import { useAuth } from '@/context/AuthContext';
import { useMoments } from '@/hooks/useMoments';
import { useMyPromoCard } from '@/hooks/usePeopleExperience';
import { PROMOCARD_LOOP, PROMOCARD_RECHARGE_ACTIONS, presentPromoCard } from '@/lib/promoCard';

export default function CardTabScreen() {
  const { user } = useAuth();
  const card = useMyPromoCard();
  const { moments } = useMoments();
  const [using, setUsing] = useState(false);
  const view = presentPromoCard(card.data, user?.user_metadata?.full_name?.split(' ')[0] || 'Member');
  const nearby = moments.slice(0, 3);

  if (card.isLoading) {
    return (
      <View style={styles.screen}>
        <AppHeader title="PromoCard" />
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppHeader title="PromoCard" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>PROMORANG’S MEMBER SPENDING BENEFIT</Text>
        <Text style={styles.hero}>
          Spend less.{'\n'}
          <Text style={styles.heroAccent}>Do more.</Text>
        </Text>
        <Text style={styles.lead}>
          PromoCard is how members spend promotional value at participating places — then recharge it by showing up.
        </Text>
        <View style={styles.promise}>
          <Ionicons name="shield-checkmark" size={18} color="#67C587" />
          <View style={{ flex: 1 }}>
            <Text style={styles.promiseTitle}>Not a loan. No cash repayment.</Text>
            <Text style={styles.promiseCopy}>
              Each place sets its own offer and minimum. Eligible value is shown before checkout.
            </Text>
          </View>
        </View>

        <PromoCardFace
          holder={view.holder}
          available={view.available}
          limit={view.limit}
          places={view.places}
          tier={view.tier}
          cardNumber={view.cardNumber}
          onUsePress={() => setUsing(true)}
        />

        {!view.isLive ? (
          <View style={styles.preview}>
            <Ionicons name="information-circle" size={16} color="#F6D48A" />
            <Text style={styles.previewCopy}>
              Your live spendable balance appears when the card is issued. Points, keys and claimed drops already live here.
            </Text>
          </View>
        ) : null}

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>ON THE CARD</Text>
            <Text style={styles.statValue}>{view.points.toLocaleString()}</Text>
            <Text style={styles.statHint}>PromoPoints</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>KEYS</Text>
            <Text style={styles.statValue}>{view.keys}</Text>
            <Text style={styles.statHint}>PromoKeys</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>CYCLE</Text>
            <Text style={styles.statValue}>{view.cycleDaysRemaining ?? '—'}</Text>
            <Text style={styles.statHint}>{view.cycleDaysRemaining != null ? 'days left' : 'Open cycle'}</Text>
          </View>
        </View>

        <Text style={styles.section}>One simple loop</Text>
        {PROMOCARD_LOOP.map((item) => (
          <View key={item.step} style={styles.loopRow}>
            <View style={styles.loopIcon}>
              <Ionicons
                name={item.step === '01' ? 'qr-code-outline' : item.step === '02' ? 'location-outline' : 'flash-outline'}
                size={18}
                color={Colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.loopStep}>STEP {item.step}</Text>
              <Text style={styles.loopTitle}>{item.title}</Text>
              <Text style={styles.loopCopy}>{item.copy}</Text>
            </View>
          </View>
        ))}

        <View style={styles.sectionRow}>
          <Text style={styles.section}>Use it nearby</Text>
          <Pressable onPress={() => router.push('/discover')}>
            <Text style={styles.link}>Discover</Text>
          </Pressable>
        </View>
        {nearby.length ? (
          nearby.map((moment) => (
            <Pressable
              key={moment.id}
              style={styles.place}
              onPress={() => router.push(`/moment/${moment.id}` as any)}
            >
              <Text style={styles.placeKicker}>{moment.location || 'Nearby'}</Text>
              <Text style={styles.placeTitle}>{moment.title}</Text>
              <Text style={styles.placeCopy}>View the offer before you go.</Text>
            </Pressable>
          ))
        ) : (
          <QuietEmpty
            title="Find a participating place"
            copy="Discover what’s happening, then apply the card when you get there."
            actionLabel="Open Discover"
            onAction={() => router.push('/discover')}
          />
        )}

        <Text style={styles.section}>Ways to recharge</Text>
        {PROMOCARD_RECHARGE_ACTIONS.map((action) => (
          <Pressable key={action.id} style={styles.action} onPress={() => router.push(action.mobileHref as any)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionCopy}>{action.copy}</Text>
            </View>
            <Text style={styles.reward}>{action.reward}</Text>
          </Pressable>
        ))}

        <Text style={styles.section}>Active perks</Text>
        {card.data?.perks?.length ? (
          card.data.perks.map((perk: any) => (
            <Pressable key={perk.id} style={styles.perk} onPress={() => setUsing(true)}>
              <Text style={styles.perkTitle}>{perk.title}</Text>
              {perk.detail ? <Text style={styles.actionCopy}>{perk.detail}</Text> : null}
              {perk.redemptionCode ? (
                <View style={styles.codeBox}>
                  <Text style={styles.placeKicker}>SHOW THIS CODE</Text>
                  <Text style={styles.code}>{perk.redemptionCode}</Text>
                </View>
              ) : (
                <Text style={styles.perkStatus}>{perk.status || 'On your card'}</Text>
              )}
            </Pressable>
          ))
        ) : (
          <QuietEmpty title="No perks yet" copy="When someone drops something for you, it lands on this card." />
        )}

        <Text style={styles.section}>Memberships</Text>
        {card.data?.memberships?.length ? (
          card.data.memberships.map((item: any) => (
            <Pressable
              key={item.id}
              style={styles.perk}
              onPress={() => router.push(item.slug ? (`/scene/${item.slug}` as any) : '/scenes')}
            >
              <Text style={styles.perkTitle}>{item.title}</Text>
              <Text style={styles.actionCopy}>{item.role}</Text>
            </Pressable>
          ))
        ) : (
          <QuietEmpty
            title="No communities yet"
            copy="Find a room that feels like yours."
            actionLabel="Find a community"
            onAction={() => router.push('/scenes')}
          />
        )}

        <Pressable style={styles.vault} onPress={() => router.push('/vault')}>
          <Ionicons name="archive-outline" size={18} color={Colors.gray[300]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.vaultTitle}>Memories stay in Vault</Text>
            <Text style={styles.actionCopy}>Receipts, photos and what you kept after a visit.</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color={Colors.gray[500]} />
        </Pressable>
        <View style={{ height: 120 }} />
      </ScrollView>
      <PromoCardUseSheet
        visible={using}
        onClose={() => setUsing(false)}
        holder={view.holder}
        available={view.available}
        useCode={view.useCode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: Spacing.container, paddingTop: 8, gap: 14 },
  kicker: { color: '#F6D48A', fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1.8, fontWeight: '800' },
  hero: { color: Colors.white, fontSize: 42, lineHeight: 42, fontWeight: '900', letterSpacing: -1.6 },
  heroAccent: { color: Colors.primary },
  lead: { color: Colors.gray[400], fontSize: 15, lineHeight: 22, maxWidth: 360 },
  promise: {
    flexDirection: 'row',
    gap: 10,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(103,197,135,0.6)',
    paddingLeft: 12,
    paddingVertical: 4,
  },
  promiseTitle: { color: Colors.white, fontSize: 14, fontWeight: '800' },
  promiseCopy: { color: Colors.gray[400], fontSize: 12, lineHeight: 18, marginTop: 4 },
  preview: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(246,212,138,0.25)',
    backgroundColor: 'rgba(246,212,138,0.08)',
    padding: 12,
  },
  previewCopy: { flex: 1, color: '#F6E7C4', fontSize: 12, lineHeight: 18 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 12,
  },
  statLabel: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: 1.2, fontWeight: '800' },
  statValue: { color: Colors.white, fontSize: 22, fontWeight: '800', marginTop: 6 },
  statHint: { color: Colors.gray[500], fontSize: 11, marginTop: 2 },
  section: { color: Colors.white, fontSize: 22, fontWeight: '800', marginTop: 8 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  link: { color: Colors.primary, fontSize: 13, fontWeight: '800' },
  loopRow: { flexDirection: 'row', gap: 12, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  loopIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,85,0,0.35)',
    backgroundColor: 'rgba(255,85,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loopStep: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: 1.4, fontWeight: '800' },
  loopTitle: { color: Colors.white, fontSize: 16, fontWeight: '800', marginTop: 2 },
  loopCopy: { color: Colors.gray[400], fontSize: 13, lineHeight: 19, marginTop: 4 },
  place: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 16,
  },
  placeKicker: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1.2, fontWeight: '800' },
  placeTitle: { color: Colors.white, fontSize: 18, fontWeight: '800', marginTop: 6 },
  placeCopy: { color: Colors.gray[500], fontSize: 12, marginTop: 4 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 16,
  },
  actionTitle: { color: Colors.white, fontSize: 15, fontWeight: '800' },
  actionCopy: { color: Colors.gray[400], fontSize: 13, marginTop: 4 },
  reward: { color: '#67C587', fontSize: 13, fontWeight: '800' },
  perk: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  perkTitle: { color: Colors.white, fontSize: 20, fontWeight: '800' },
  perkStatus: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1.2, marginTop: 10 },
  codeBox: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(103,197,135,0.3)',
    backgroundColor: 'rgba(103,197,135,0.1)',
    padding: 12,
  },
  code: { color: Colors.white, fontFamily: 'SpaceMono', fontSize: 20, fontWeight: '800', letterSpacing: 2, marginTop: 4 },
  vault: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginTop: 8,
  },
  vaultTitle: { color: Colors.white, fontSize: 16, fontWeight: '800' },
});

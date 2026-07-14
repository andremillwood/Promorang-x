import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, Platform, Pressable, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { supabase } from '@/lib/supabase';

type ReviewItem = {
  id: string;
  contentId: string | null;
  creatorId: string | null;
  name: string;
  handle: string;
  momentId: string | null;
  moment: string;
  time: string;
  distance: string;
  image: string;
  caption: string;
  reward: string;
  platform: string;
  source: 'proof_submissions' | 'content_items';
  live: boolean;
};

const fallbackProofImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=85';

export default function ProofReviewScreen() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [index, setIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, 'approved' | 'rejected'>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deciding, setDeciding] = useState(false);

  const queue = items;
  const current = queue[index];

  const refresh = useCallback(async (pull = false) => {
    if (pull) setRefreshing(true);
    else setLoading(true);

    const { data: proofData, error: proofError } = await supabase
      .from('proof_submissions')
      .select('id, moment_id, user_id, proof_bundle, created_at, moments:moment_id(title, location)')
      .eq('submission_state', 'pending')
      .order('created_at', { ascending: true })
      .limit(25);

    if (!proofError && proofData?.length) {
      const userIds = [...new Set(proofData.map((item: any) => item.user_id).filter(Boolean))];
      const contentIds = [...new Set(proofData.map((item: any) => item.proof_bundle?.content_item_id).filter(Boolean))];
      const [{ data: users }, { data: contents }] = await Promise.all([
        userIds.length ? supabase.from('users').select('id, display_name, username, avatar_url').in('id', userIds) : Promise.resolve({ data: [] }),
        contentIds.length ? supabase.from('content_items').select('id, title, description, media_url, platform').in('id', contentIds) : Promise.resolve({ data: [] }),
      ]);
      const usersById = new Map((users || []).map((user: any) => [user.id, user]));
      const contentById = new Map((contents || []).map((content: any) => [content.id, content]));

      setError(null);
      setItems(proofData.map((item: any) => {
        const creator = usersById.get(item.user_id) as any;
        const contentId = item.proof_bundle?.content_item_id || null;
        const content = contentId ? contentById.get(contentId) as any : null;
        const moment = Array.isArray(item.moments) ? item.moments[0] : item.moments;
        const name = creator?.display_name || creator?.username || 'Promorang creator';
        return {
          id: item.id,
          contentId,
          creatorId: item.user_id,
          name,
          handle: creator?.username ? `@${creator.username}` : '@creator',
          momentId: item.moment_id,
          moment: moment?.title || content?.title || 'Moment contribution',
          time: formatRelativeTime(item.created_at),
          distance: moment?.location ? `At ${moment.location}` : 'Location attached by participant',
          image: item.proof_bundle?.media_url || content?.media_url || fallbackProofImage,
          caption: item.proof_bundle?.caption || content?.description || 'Contribution submitted for review.',
          reward: 'Gem eligibility pending',
          platform: item.proof_bundle?.source || content?.platform || 'promorang-mobile',
          source: 'proof_submissions',
          live: true,
        };
      }));
      setIndex(0);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const { data, error: queryError } = await supabase
      .from('content_items')
      .select('id, creator_id, title, description, media_url, platform, posted_at, status, users:creator_id(display_name, username, avatar_url)')
      .eq('status', 'pending_review')
      .order('posted_at', { ascending: true })
      .limit(25);

    if (queryError) {
      setError(queryError.message);
      setItems([]);
    } else {
      setError(null);
      setItems((data || []).map((item: any) => {
        const creator = Array.isArray(item.users) ? item.users[0] : item.users;
        const name = creator?.display_name || creator?.username || 'Promorang creator';
        return {
          id: item.id,
          contentId: item.id,
          creatorId: item.creator_id,
          name,
          handle: creator?.username ? `@${creator.username}` : '@creator',
          momentId: null,
          moment: item.title || 'Untitled contribution',
          time: formatRelativeTime(item.posted_at),
          distance: 'Location attached by participant',
          image: item.media_url || fallbackProofImage,
          caption: item.description || 'Contribution submitted for review.',
          reward: 'Gem eligibility pending',
          platform: item.platform || 'promorang-mobile',
          source: 'content_items',
          live: true,
        };
      }));
      setIndex(0);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const decide = async (decision: 'approved' | 'rejected') => {
    if (!current || deciding) return;
    const nextStatus = decision === 'approved' ? 'published' : 'returned';
    const nextProofState = decision === 'approved' ? 'verified' : 'rejected';
    setDeciding(true);
    setDecisions((existing) => ({ ...existing, [current.id]: decision }));

    if (current.live) {
      if (current.source === 'proof_submissions') {
        const { error: rpcError } = await supabase.rpc('review_moment_proof', {
          p_proof_submission_id: current.id,
          p_decision: decision,
        });

        if (!rpcError) {
          setItems((existing) => existing.filter((item) => item.id !== current.id));
          setIndex((value) => Math.min(value, Math.max(queue.length - 2, 0)));
          setDeciding(false);
          return;
        }

        if (!isMissingReviewRpc(rpcError)) {
          setDecisions((existing) => {
            const next = { ...existing };
            delete next[current.id];
            return next;
          });
          setDeciding(false);
          Alert.alert('Decision not saved', rpcError.message);
          return;
        }
      }

      const updateResult = current.source === 'proof_submissions'
        ? await supabase
          .from('proof_submissions')
          .update({
            submission_state: nextProofState,
            reviewed_at: new Date().toISOString(),
            review_reason: decision === 'approved' ? 'Approved in mobile Studio Review' : 'Returned from mobile Studio Review',
          })
          .eq('id', current.id)
          .eq('submission_state', 'pending')
        : await supabase
          .from('content_items')
          .update({ status: nextStatus })
          .eq('id', current.id)
          .eq('status', 'pending_review');

      if (updateResult.error) {
        setDecisions((existing) => {
          const next = { ...existing };
          delete next[current.id];
          return next;
        });
        setDeciding(false);
        Alert.alert('Decision not saved', updateResult.error.message);
        return;
      }

      if (current.source === 'proof_submissions' && current.contentId) {
        await supabase.from('content_items').update({ status: nextStatus }).eq('id', current.contentId);
      }

      if (decision === 'approved' && current.source === 'proof_submissions' && current.creatorId && current.momentId) {
        await issueVerifiedValue(current);
      }

      if (current.creatorId) {
        await supabase.from('notifications').insert({
          user_id: current.creatorId,
          type: decision === 'approved' ? 'proof_approved' : 'proof_returned',
          title: decision === 'approved' ? 'Your contribution counted' : 'Your contribution needs another pass',
          message: decision === 'approved' ? `${current.moment} is now part of your Moment record.` : `Review ${current.moment} and submit clearer context when you are ready.`,
          related_id: current.momentId || current.contentId || current.id,
          is_read: false,
        });
      }

      setItems((existing) => existing.filter((item) => item.id !== current.id));
      setIndex((value) => Math.min(value, Math.max(queue.length - 2, 0)));
    } else {
      setTimeout(() => setIndex((value) => value + 1), 180);
    }

    setDeciding(false);
  };

  const skip = () => setIndex((value) => Math.min(value + 1, queue.length));

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading contribution queue…</Text>
      </View>
    );
  }

  if (!current) {
    return (
      <View style={styles.complete}>
        <View style={styles.completeMark}><Ionicons name="checkmark-done" size={35} color={Colors.black} /></View>
        <Text style={styles.completeEyebrow}>QUEUE CLEAR</Text>
        <Text style={styles.completeTitle}>Every contribution has a decision.</Text>
        <Text style={styles.completeDetail}>{Object.values(decisions).filter((value) => value === 'approved').length} approved · {Object.values(decisions).filter((value) => value === 'rejected').length} returned</Text>
        {error ? <Text style={styles.completeWarning}>Live queue unavailable. Pull to retry when you are back online.</Text> : null}
        <Pressable style={styles.completeButton} onPress={() => router.back()}><Text style={styles.completeButtonText}>Back to Studio</Text><Ionicons name="arrow-forward" size={17} color={Colors.black} /></Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" style={styles.back} onPress={() => router.back()}><Ionicons name="arrow-back" size={21} color={Colors.white} /></Pressable>
        <View style={styles.heading}><Text style={styles.eyebrow}>TRUST OPERATIONS</Text><Text style={styles.title}>Review contributions</Text></View>
        <View style={styles.counter}><Text style={styles.counterText}>{index + 1}/{queue.length}</Text></View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={Colors.primary} onRefresh={() => refresh(true)} />}
      >
        {error ? <View style={styles.offline}><Ionicons name="cloud-offline" size={15} color={Colors.warning} /><Text style={styles.offlineText}>Live queue unavailable. Pull to retry.</Text></View> : null}
        <ImageBackground source={{ uri: current.image }} style={styles.evidence} imageStyle={styles.evidenceRadius}>
          <View style={styles.shade} />
          <View style={styles.evidenceTop}><View style={styles.mediaType}><Ionicons name="camera" size={13} color={Colors.white} /><Text style={styles.mediaTypeText}>{current.source === 'proof_submissions' ? 'MOMENT CONTRIBUTION' : current.live ? 'LIVE CONTRIBUTION' : 'PHOTO CONTRIBUTION'}</Text></View><Pressable accessibilityLabel="Inspect contribution image" style={styles.expand} onPress={() => Alert.alert('Contribution image', 'The full evidence image is shown here for review. Use the signals below before approving or returning it.')}><Ionicons name="expand" size={18} color={Colors.white} /></Pressable></View>
          <View style={styles.evidenceBottom}><Text style={styles.evidenceMoment}>{current.moment}</Text><Text style={styles.evidenceCaption}>“{current.caption}”</Text></View>
        </ImageBackground>

        <View style={styles.person}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{current.name.split(' ').map((name) => name[0]).join('')}</Text></View>
          <View style={styles.personCopy}><Text style={styles.personName}>{current.name}</Text><Text style={styles.personHandle}>{current.handle} · {current.time}</Text></View>
          <View style={styles.reliability}><Ionicons name="shield-checkmark" size={14} color={Colors.success} /><Text style={styles.reliabilityText}>92%</Text></View>
        </View>

        <Text style={styles.sectionEyebrow}>EVIDENCE SIGNALS</Text>
        <View style={styles.signals}>
          <Signal icon="location" label="Location" value={current.distance} state="strong" />
          <Signal icon="time" label="Time" value="Inside active window" state="strong" />
          <Signal icon="images" label="Source" value={current.source === 'proof_submissions' ? 'Moment-linked contribution' : current.platform} state="strong" />
          <Signal icon="person" label="History" value={current.live ? 'Creator record attached' : '10 of 11 contributions approved'} state="neutral" />
        </View>

        <View style={styles.reward}>
          <View style={styles.rewardIcon}><Ionicons name="sparkles" size={20} color={Colors.primary} /></View>
          <View style={styles.rewardCopy}><Text style={styles.rewardLabel}>APPROVAL WILL UNLOCK</Text><Text style={styles.rewardTitle}>{current.reward} + Vault memory</Text><Text style={styles.rewardDetail}>Gem release depends on the activation rules; this also counts toward PromoShare qualification.</Text></View>
        </View>

        <Text style={styles.guidance}>Approve only when the evidence clearly supports real participation. Returned contributions go back with a chance to add clearer context.</Text>
        <View style={styles.actions}>
          <Pressable disabled={deciding} style={[styles.reject, deciding && styles.actionDisabled]} onPress={() => decide('rejected')}><Ionicons name="close" size={20} color={Colors.white} /><Text style={styles.rejectText}>Return</Text></Pressable>
          <Pressable disabled={deciding} style={[styles.approve, deciding && styles.actionDisabled]} onPress={() => decide('approved')}>{deciding ? <ActivityIndicator size="small" color={Colors.black} /> : <Ionicons name="checkmark" size={20} color={Colors.black} />}<Text style={styles.approveText}>Approve contribution</Text></Pressable>
        </View>
        <Pressable disabled={deciding} style={styles.skip} onPress={skip}><Text style={styles.skipText}>Decide later</Text></Pressable>
        <View style={{ height: 35 }} />
      </ScrollView>
    </View>
  );
}

function isMissingReviewRpc(error: { code?: string; message?: string }) {
  return error.code === 'PGRST202' || /review_moment_proof|schema cache|function/i.test(error.message || '');
}

async function issueVerifiedValue(item: ReviewItem) {
  const memoryTitle = `${item.moment} contribution`;
  const memoryPayload = {
    user_id: item.creatorId,
    moment_id: item.momentId,
    creator_id: item.creatorId,
    rarity: 'common',
    title: memoryTitle,
    collection_key: 'verified-proof',
    legacy_score: 1,
    metadata: {
      proof_submission_id: item.id,
      content_item_id: item.contentId,
      caption: item.caption,
      source: 'mobile-studio-review',
    },
  };

  await supabase
    .from('memories')
    .upsert(memoryPayload, { onConflict: 'user_id,moment_id' });

  await supabase
    .from('reward_receipts')
    .upsert({
      user_id: item.creatorId,
      source_type: 'proof_submission',
      source_id: item.id,
      lifecycle_status: 'available',
      headline: 'Contribution added to your Vault',
      description: `${item.moment} is now part of your retained record.`,
      rewards: [{ currency: 'memory', amount: 1, label: 'Vault memory' }],
      proof: { proof_submission_id: item.id, content_item_id: item.contentId, moment_id: item.momentId },
      next_action: { label: 'Open Vault', href: '/vault' },
      available_at: new Date().toISOString(),
      metadata: { source: 'mobile-studio-review' },
    }, { onConflict: 'user_id,source_type,source_id' });
}

function formatRelativeTime(value?: string | null) {
  if (!value) return 'Just now';
  const elapsed = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(elapsed / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function Signal({ icon, label, value, state }: { icon: any; label: string; value: string; state: 'strong' | 'neutral' }) {
  return <View style={styles.signal}><View style={[styles.signalIcon, state === 'strong' && styles.signalIconStrong]}><Ionicons name={icon} size={17} color={state === 'strong' ? Colors.success : Colors.gray[300]} /></View><View style={styles.signalCopy}><Text style={styles.signalLabel}>{label}</Text><Text style={styles.signalValue}>{value}</Text></View><Ionicons name={state === 'strong' ? 'checkmark-circle' : 'information-circle'} size={18} color={state === 'strong' ? Colors.success : Colors.gray[500]} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.black },
  loadingText: { color: Colors.gray[400], fontSize: 11, marginTop: 10 },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: Spacing.container, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.black },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  heading: { flex: 1, marginLeft: 13, backgroundColor: 'transparent' },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: 1 },
  title: { color: Colors.white, fontSize: Typography.sizes.xl, fontWeight: '800', marginTop: 2 },
  counter: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 15, backgroundColor: Colors.gray[900] },
  counterText: { color: Colors.gray[300], fontFamily: 'SpaceMono', fontSize: 9 },
  content: { paddingHorizontal: Spacing.container },
  offline: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 10, marginBottom: 10, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(242,184,75,.25)', backgroundColor: 'rgba(242,184,75,.08)' },
  offlineText: { color: Colors.gray[300], fontSize: 10, flex: 1 },
  evidence: { height: 410, borderRadius: BorderRadius['2xl'], overflow: 'hidden', padding: 14, justifyContent: 'space-between' },
  evidenceRadius: { borderRadius: BorderRadius['2xl'] },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.25)' },
  evidenceTop: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent' },
  mediaType: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 15, backgroundColor: 'rgba(8,8,8,.72)' },
  mediaTypeText: { color: Colors.white, fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: .6 },
  expand: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(8,8,8,.72)', alignItems: 'center', justifyContent: 'center' },
  evidenceBottom: { backgroundColor: 'transparent' },
  evidenceMoment: { color: Colors.accent, fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: .6, textTransform: 'uppercase' },
  evidenceCaption: { color: Colors.white, fontSize: 17, lineHeight: 22, fontWeight: '700', marginTop: 6, maxWidth: 290 },
  person: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, backgroundColor: 'transparent' },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#4B2D1D', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  personCopy: { flex: 1, backgroundColor: 'transparent' },
  personName: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  personHandle: { color: Colors.gray[500], fontSize: 9, marginTop: 3 },
  reliability: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 14, backgroundColor: 'rgba(103,197,135,.10)' },
  reliabilityText: { color: Colors.success, fontSize: 10, fontWeight: '800' },
  sectionEyebrow: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1, marginTop: 21, marginBottom: 9 },
  signals: { borderRadius: BorderRadius.xl, overflow: 'hidden', backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  signal: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, backgroundColor: 'transparent' },
  signalIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: Colors.gray[800], alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  signalIconStrong: { backgroundColor: 'rgba(103,197,135,.10)' },
  signalCopy: { flex: 1, backgroundColor: 'transparent' },
  signalLabel: { color: Colors.gray[500], fontSize: 9 },
  signalValue: { color: Colors.white, fontSize: 11, fontWeight: '700', marginTop: 2 },
  reward: { flexDirection: 'row', padding: 14, marginTop: 12, borderRadius: BorderRadius.xl, backgroundColor: '#24160F', borderWidth: 1, borderColor: 'rgba(255,106,26,.24)' },
  rewardIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  rewardCopy: { flex: 1, backgroundColor: 'transparent' },
  rewardLabel: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: .6 },
  rewardTitle: { color: Colors.white, fontSize: 12, fontWeight: '800', marginTop: 4 },
  rewardDetail: { color: Colors.gray[400], fontSize: 9, marginTop: 3 },
  guidance: { color: Colors.gray[500], fontSize: 9, lineHeight: 14, textAlign: 'center', paddingHorizontal: 15, marginTop: 16 },
  actions: { flexDirection: 'row', gap: 9, marginTop: 14, backgroundColor: 'transparent' },
  reject: { flex: 1, height: 50, borderRadius: 17, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900], flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  rejectText: { color: Colors.white, fontSize: 11, fontWeight: '800' },
  approve: { flex: 1.55, height: 50, borderRadius: 17, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  approveText: { color: Colors.black, fontSize: 11, fontWeight: '900' },
  actionDisabled: { opacity: .62 },
  skip: { alignItems: 'center', padding: 14, backgroundColor: 'transparent' },
  skipText: { color: Colors.gray[500], fontSize: 10, fontWeight: '700' },
  complete: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, backgroundColor: Colors.black },
  completeMark: { width: 72, height: 72, borderRadius: 25, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  completeEyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1, marginTop: 25 },
  completeTitle: { color: Colors.white, fontSize: 27, lineHeight: 33, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  completeDetail: { color: Colors.gray[400], fontSize: 12, marginTop: 8 },
  completeWarning: { color: Colors.warning, fontSize: 10, textAlign: 'center', marginTop: 8 },
  completeButton: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 20, backgroundColor: Colors.primary, marginTop: 24 },
  completeButtonText: { color: Colors.black, fontSize: 11, fontWeight: '900' },
});

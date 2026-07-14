import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useMoments, type Moment } from '@/hooks/useMoments';

type ProofType = 'moment' | 'mission' | 'story';

export default function PostScreen() {
  const { user } = useAuth();
  const { momentId } = useLocalSearchParams<{ momentId?: string }>();
  const { moments, loading: momentsLoading } = useMoments();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [proofType, setProofType] = useState<ProofType>('moment');
  const [selectedMomentId, setSelectedMomentId] = useState<string | null>(momentId || null);
  const [locationAdded, setLocationAdded] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const selectedMoment = useMemo(() => moments.find((moment) => moment.id === selectedMomentId) || null, [moments, selectedMomentId]);

  useEffect(() => {
    if (momentId) setSelectedMomentId(momentId);
  }, [momentId]);

  const chooseImage = async (camera: boolean) => {
    const permission = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', `Allow ${camera ? 'camera' : 'photo'} access to add your capture.`);
      return;
    }
    const result = camera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const publish = async () => {
    if (!imageUri) {
      Alert.alert('Add your capture', 'Capture or choose a photo before publishing.');
      return;
    }
    if (!user) return Alert.alert('Sign in required', 'Sign in before publishing your contribution.');
    setPublishing(true);
    setPublishError(null);
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const extension = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
      const path = `${user.id}/mobile/${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('moment-images').upload(path, blob, {
        contentType: blob.type || 'image/jpeg', cacheControl: '3600', upsert: false,
      });
      if (uploadError) throw uploadError;
      const { data: url } = supabase.storage.from('moment-images').getPublicUrl(path);
      const { data: content, error: insertError } = await supabase.from('content_items').insert({
        creator_id: user.id,
        title: selectedMoment?.title || caption.trim().split(/[.!?]/)[0].slice(0, 80) || 'A moment worth keeping',
        description: caption.trim() || null,
        media_url: url.publicUrl,
        platform: 'promorang-mobile',
        status: selectedMoment ? 'pending_review' : proofType === 'mission' ? 'pending_review' : 'published',
        posted_at: new Date().toISOString(),
      }).select('id').single();
      if (insertError) throw insertError;

      if (selectedMoment && content?.id) {
        const { error: linkError } = await supabase.from('content_moment_links').insert({
          content_item_id: content.id,
          moment_id: selectedMoment.id,
          entry_action_types: [proofType, locationAdded ? 'location_context' : 'media_proof'],
        });
        if (linkError) throw linkError;

        const { error: proofError } = await supabase.from('proof_submissions').insert({
          moment_id: selectedMoment.id,
          user_id: user.id,
          submission_state: 'pending',
          proof_bundle: {
            content_item_id: content.id,
            media_url: url.publicUrl,
            caption: caption.trim() || null,
            proof_type: proofType,
            location_added: locationAdded,
            source: 'mobile-post',
          },
        });
        if (proofError) throw proofError;
      }
      setPublished(true);
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : 'Publishing failed. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  if (published) {
    return (
      <View style={styles.successScreen}>
        <View style={styles.successMark}><Ionicons name="checkmark" size={35} color={Colors.black} /></View>
        <Text style={styles.successEyebrow}>CONTRIBUTION RECEIVED</Text>
        <Text style={styles.successTitle}>Your Moment has a receipt.</Text>
        <Text style={styles.successDetail}>{selectedMoment ? `Your contribution is routed to ${selectedMoment.title} for review.` : 'Your post is live. Action value may remain pending until it is reviewed.'}</Text>
        <View style={styles.successReceipt}>
          <ReceiptLine icon="images" label="Content" value="Published" />
          <ReceiptLine icon="shield-checkmark" label="Contribution" value={selectedMoment || proofType === 'mission' ? 'Under review' : 'Recorded'} />
          <ReceiptLine icon="flash" label="Moment" value={selectedMoment?.title || 'Not linked'} />
          <ReceiptLine icon="archive" label="Vault" value="Eligible after verification" />
        </View>
        <Pressable style={styles.successPrimary} onPress={() => router.replace(selectedMoment ? `/moment/${selectedMoment.id}` as any : '/discover')}><Text style={styles.successPrimaryText}>{selectedMoment ? 'Back to moment' : 'Return to discovery'}</Text><Ionicons name="arrow-forward" size={17} color={Colors.black} /></Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CREATE · COUNT · KEEP</Text>
        <Text style={styles.title}>What do you want to make happen?</Text>
        <Text style={styles.subtitle}>Start with an outcome, a Moment, or what happened. Promorang will connect it to people, value, and return.</Text>
      </View>

      <View style={styles.createPaths}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/create-proposal')} style={styles.createPathPrimary}>
          <View style={styles.createPathIcon}><Ionicons name="sparkles" size={20} color={Colors.black} /></View>
          <View style={styles.createPathCopy}>
            <Text style={styles.createPathEyebrow}>ACTIVATION PLAN</Text>
            <Text style={styles.createPathTitle}>Shape a funded outcome</Text>
            <Text style={styles.createPathDetail}>Choose the Scene, Moment, content, people, what counts, participant value, and Gems.</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={Colors.black} />
        </Pressable>

        <View style={styles.secondaryPaths}>
          <Pressable accessibilityRole="button" onPress={() => router.push('/studio/create-moment' as any)} style={styles.secondaryPath}>
            <Ionicons name="calendar" size={18} color={Colors.primary} />
            <Text style={styles.secondaryPathText}>Create Moment</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push('/discover')} style={styles.secondaryPath}>
            <Ionicons name="compass" size={18} color={Colors.primary} />
            <Text style={styles.secondaryPathText}>Find prompt</Text>
          </Pressable>
        </View>

        <View style={styles.captureIntro}>
          <Text style={styles.captureIntroEyebrow}>CAPTURE THE MOMENT</Text>
          <Text style={styles.captureIntroTitle}>Show what happened.</Text>
          <Text style={styles.captureIntroDetail}>A good post gives people context and gives Promorang something clear to review.</Text>
        </View>
      </View>

      <View style={styles.typeRow}>
        {([
          ['moment', 'Moment', 'flash'],
          ['mission', 'Action contribution', 'checkmark-circle'],
          ['story', 'Story', 'play-circle'],
        ] as const).map(([id, label, icon]) => (
          <Pressable key={id} onPress={() => setProofType(id)} style={[styles.type, proofType === id && styles.typeActive]}>
            <Ionicons name={icon} size={16} color={proofType === id ? Colors.black : Colors.gray[400]} />
            <Text style={[styles.typeText, proofType === id && styles.typeTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.capture}>
        {imageUri ? (
          <>
            <Image source={{ uri: imageUri }} style={styles.preview} />
            <View style={styles.previewShade} />
            <Pressable accessibilityLabel="Remove image" style={styles.remove} onPress={() => setImageUri(null)}><Ionicons name="close" size={20} color={Colors.white} /></Pressable>
            <View style={styles.proofBadge}><Ionicons name="shield-checkmark" size={14} color={Colors.primary} /><Text style={styles.proofBadgeText}>READY TO REVIEW</Text></View>
          </>
        ) : (
          <View style={styles.captureEmpty}>
            <View style={styles.captureIcon}><Ionicons name="camera" size={29} color={Colors.primary} /></View>
            <Text style={styles.captureTitle}>Start with what happened</Text>
            <Text style={styles.captureDetail}>Photos with clear people, place, and context make the Moment easier to understand.</Text>
            <View style={styles.captureActions}>
              <Pressable style={styles.primaryButton} onPress={() => chooseImage(true)}><Ionicons name="camera" size={17} color={Colors.black} /><Text style={styles.primaryButtonText}>Open camera</Text></Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => chooseImage(false)}><Ionicons name="images" size={17} color={Colors.white} /><Text style={styles.secondaryButtonText}>Library</Text></Pressable>
            </View>
          </View>
        )}
      </View>

      <View style={styles.composer}>
        <Text style={styles.label}>THE STORY</Text>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="What should people know about this moment?"
          placeholderTextColor={Colors.gray[500]}
          style={styles.caption}
          multiline
          maxLength={280}
        />
        <Text style={styles.count}>{caption.length}/280</Text>
        <Pressable style={styles.contextRow} onPress={() => setLocationAdded(!locationAdded)}>
          <View style={styles.contextIcon}><Ionicons name="location" size={18} color={Colors.primary} /></View>
          <View style={styles.contextCopy}><Text style={styles.contextTitle}>{locationAdded ? 'Kingston, Jamaica' : 'Add the place'}</Text><Text style={styles.contextDetail}>{locationAdded ? 'Visible as participation context' : 'Location makes the contribution clearer'}</Text></View>
          <Ionicons name={locationAdded ? 'checkmark-circle' : 'add-circle-outline'} size={22} color={locationAdded ? Colors.success : Colors.gray[500]} />
        </Pressable>
        <View style={styles.contextRow}>
          <View style={styles.contextIcon}><Ionicons name="people" size={18} color={Colors.primary} /></View>
          <View style={styles.contextCopy}><Text style={styles.contextTitle}>{selectedMoment ? selectedMoment.title : 'Tag a moment or scene'}</Text><Text style={styles.contextDetail}>{selectedMoment ? `${selectedMoment.location} · routed to review` : 'Connect this contribution to the people and place it supports'}</Text></View>
          <Ionicons name={selectedMoment ? 'checkmark-circle' : 'chevron-forward'} size={20} color={selectedMoment ? Colors.success : Colors.gray[500]} />
        </View>
        <MomentRail moments={moments} selectedMomentId={selectedMomentId} loading={momentsLoading} onSelect={setSelectedMomentId} />
      </View>

      <View style={styles.receipt}>
        <Ionicons name="sparkles" size={18} color={Colors.primary} />
        <View style={styles.receiptCopy}><Text style={styles.receiptTitle}>What this can unlock</Text><Text style={styles.receiptDetail}>Vault memory · action progress · reward eligibility</Text></View>
      </View>

      {publishError && <View style={styles.errorBanner}><Ionicons name="alert-circle" size={18} color={Colors.error} /><Text style={styles.errorText}>{publishError}</Text></View>}
      <Pressable style={[styles.publish, (!imageUri || publishing) && styles.publishMuted]} onPress={publish} disabled={publishing}>
        {publishing ? <><ActivityIndicator size="small" color={Colors.black} /><Text style={styles.publishText}>Publishing contribution…</Text></> : <><Text style={styles.publishText}>Publish contribution</Text><Ionicons name="arrow-forward" size={18} color={Colors.black} /></>}
      </Pressable>
      <View style={{ height: 105 }} />
    </ScrollView>
  );
}

function ReceiptLine({ icon, label, value }: { icon: any; label: string; value: string }) {
  return <View style={styles.receiptLine}><Ionicons name={icon} size={17} color={Colors.primary} /><Text style={styles.receiptLineLabel}>{label}</Text><Text style={styles.receiptLineValue}>{value}</Text></View>;
}

function MomentRail({ moments, selectedMomentId, loading, onSelect }: { moments: Moment[]; selectedMomentId: string | null; loading: boolean; onSelect: (id: string | null) => void }) {
  return (
    <View style={styles.momentRail}>
      <View style={styles.momentRailHeader}>
        <Text style={styles.momentRailLabel}>ROUTE CONTRIBUTION TO</Text>
        {selectedMomentId ? <Pressable onPress={() => onSelect(null)}><Text style={styles.clearMoment}>Clear</Text></Pressable> : null}
      </View>
      {loading ? (
        <View style={styles.momentLoading}><ActivityIndicator size="small" color={Colors.primary} /><Text style={styles.momentLoadingText}>Finding active moments…</Text></View>
      ) : moments.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.momentOptions}>
          {moments.slice(0, 8).map((moment) => {
            const selected = moment.id === selectedMomentId;
            return (
              <Pressable key={moment.id} style={[styles.momentChip, selected && styles.momentChipActive]} onPress={() => onSelect(selected ? null : moment.id)}>
                <View style={[styles.momentChipIcon, selected && styles.momentChipIconActive]}><Ionicons name={selected ? 'checkmark' : 'flash'} size={14} color={selected ? Colors.black : Colors.primary} /></View>
                <View style={styles.momentChipCopy}><Text numberOfLines={1} style={[styles.momentChipTitle, selected && styles.momentChipTitleActive]}>{moment.title}</Text><Text numberOfLines={1} style={[styles.momentChipDetail, selected && styles.momentChipDetailActive]}>{moment.location}</Text></View>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.momentEmpty}><Text style={styles.momentEmptyTitle}>No active moments found</Text><Text style={styles.momentEmptyDetail}>Publish as a general contribution, or create a Moment in Studio first.</Text></View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  content: { paddingTop: 18, paddingHorizontal: Spacing.container },
  header: { backgroundColor: 'transparent' },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1.1 },
  title: { color: Colors.white, fontSize: Typography.sizes['3xl'], lineHeight: 38, fontWeight: '800', letterSpacing: -1, marginTop: 5 },
  subtitle: { color: Colors.gray[400], fontSize: 13, lineHeight: 19, marginTop: 6, maxWidth: 330 },
  createPaths: { marginTop: 20, backgroundColor: 'transparent' },
  createPathPrimary: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: BorderRadius.xl, backgroundColor: Colors.primary },
  createPathIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: 'rgba(0,0,0,.16)', alignItems: 'center', justifyContent: 'center' },
  createPathCopy: { flex: 1, backgroundColor: 'transparent' },
  createPathEyebrow: { color: 'rgba(0,0,0,.58)', fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: .7 },
  createPathTitle: { color: Colors.black, fontSize: 14, fontWeight: '900', marginTop: 3 },
  createPathDetail: { color: 'rgba(0,0,0,.68)', fontSize: 10, lineHeight: 15, marginTop: 3 },
  secondaryPaths: { flexDirection: 'row', gap: 9, marginTop: 10, backgroundColor: 'transparent' },
  secondaryPath: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900] },
  secondaryPathText: { color: Colors.white, fontSize: 11, fontWeight: '800' },
  captureIntro: { marginTop: 18, paddingTop: 18, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border, backgroundColor: 'transparent' },
  captureIntroEyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: .9 },
  captureIntroTitle: { color: Colors.white, fontSize: 18, fontWeight: '800', marginTop: 5 },
  captureIntroDetail: { color: Colors.gray[400], fontSize: 12, lineHeight: 18, marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 8, marginTop: 22, backgroundColor: 'transparent' },
  type: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900] },
  typeActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeText: { color: Colors.gray[300], fontSize: 11, fontWeight: '700' },
  typeTextActive: { color: Colors.black },
  capture: { height: 330, marginTop: 15, borderRadius: BorderRadius['2xl'], overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900] },
  captureEmpty: { flex: 1, padding: 25, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  captureIcon: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.ambientWash },
  captureTitle: { color: Colors.white, fontSize: 19, fontWeight: '800', marginTop: 16 },
  captureDetail: { color: Colors.gray[400], fontSize: 12, lineHeight: 18, textAlign: 'center', maxWidth: 275, marginTop: 6 },
  captureActions: { flexDirection: 'row', gap: 10, marginTop: 20, backgroundColor: 'transparent' },
  primaryButton: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 15, paddingVertical: 11, borderRadius: 20, backgroundColor: Colors.primary },
  primaryButtonText: { color: Colors.black, fontSize: 12, fontWeight: '800' },
  secondaryButton: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 15, paddingVertical: 11, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[800] },
  secondaryButtonText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  preview: { width: '100%', height: '100%' },
  previewShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.12)' },
  remove: { position: 'absolute', right: 13, top: 13, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,8,8,.72)' },
  proofBadge: { position: 'absolute', left: 13, bottom: 13, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(8,8,8,.78)', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 18 },
  proofBadgeText: { color: Colors.white, fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: .7 },
  composer: { marginTop: 15, padding: 16, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  label: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1 },
  caption: { color: Colors.white, minHeight: 80, fontSize: 15, lineHeight: 21, textAlignVertical: 'top', marginTop: 9 },
  count: { color: Colors.gray[600], fontSize: 10, textAlign: 'right', marginBottom: 10 },
  contextRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border, backgroundColor: 'transparent' },
  contextIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  contextCopy: { flex: 1, backgroundColor: 'transparent' },
  contextTitle: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  contextDetail: { color: Colors.gray[500], fontSize: 10, marginTop: 2 },
  momentRail: { paddingTop: 13, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border, backgroundColor: 'transparent' },
  momentRailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent' },
  momentRailLabel: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: .7 },
  clearMoment: { color: Colors.gray[400], fontSize: 10, fontWeight: '700' },
  momentOptions: { gap: 8, paddingTop: 10, paddingRight: 8 },
  momentChip: { width: 190, flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 15, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[800] },
  momentChipActive: { borderColor: Colors.primary, backgroundColor: '#2A180F' },
  momentChipIcon: { width: 31, height: 31, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.ambientWash, marginRight: 9 },
  momentChipIconActive: { backgroundColor: Colors.primary },
  momentChipCopy: { flex: 1, backgroundColor: 'transparent' },
  momentChipTitle: { color: Colors.white, fontSize: 11, fontWeight: '800' },
  momentChipTitleActive: { color: Colors.white },
  momentChipDetail: { color: Colors.gray[500], fontSize: 9, marginTop: 2 },
  momentChipDetailActive: { color: Colors.gray[300] },
  momentLoading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, backgroundColor: 'transparent' },
  momentLoadingText: { color: Colors.gray[500], fontSize: 10 },
  momentEmpty: { paddingVertical: 12, backgroundColor: 'transparent' },
  momentEmptyTitle: { color: Colors.white, fontSize: 11, fontWeight: '800' },
  momentEmptyDetail: { color: Colors.gray[500], fontSize: 9, marginTop: 3 },
  receipt: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14, marginTop: 13, borderRadius: BorderRadius.lg, backgroundColor: '#25170F', borderWidth: 1, borderColor: 'rgba(255,106,26,.22)' },
  receiptCopy: { flex: 1, backgroundColor: 'transparent' },
  receiptTitle: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  receiptDetail: { color: Colors.gray[400], fontSize: 10, marginTop: 3 },
  publish: { marginTop: 15, height: 52, borderRadius: 17, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  publishMuted: { opacity: .55 },
  publishText: { color: Colors.black, fontSize: 14, fontWeight: '900' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 13, borderRadius: BorderRadius.lg, marginTop: 13, backgroundColor: 'rgba(239,98,91,.10)', borderWidth: 1, borderColor: 'rgba(239,98,91,.28)' },
  errorText: { color: Colors.gray[200], fontSize: 11, lineHeight: 16, flex: 1 },
  successScreen: { flex: 1, paddingHorizontal: 25, paddingTop: Platform.OS === 'ios' ? 110 : 80, backgroundColor: Colors.black, alignItems: 'center' },
  successMark: { width: 72, height: 72, borderRadius: 25, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }] },
  successEyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1.1, marginTop: 28 },
  successTitle: { color: Colors.white, fontSize: 29, lineHeight: 35, fontWeight: '800', letterSpacing: -.8, textAlign: 'center', marginTop: 8, maxWidth: 330 },
  successDetail: { color: Colors.gray[400], fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 9, maxWidth: 320 },
  successReceipt: { alignSelf: 'stretch', padding: 16, borderRadius: BorderRadius.xl, marginTop: 28, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  receiptLine: { flexDirection: 'row', alignItems: 'center', minHeight: 42, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, backgroundColor: 'transparent' },
  receiptLineLabel: { color: Colors.gray[400], fontSize: 11, flex: 1 },
  receiptLineValue: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  successPrimary: { alignSelf: 'stretch', height: 52, borderRadius: 17, marginTop: 18, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  successPrimaryText: { color: Colors.black, fontSize: 13, fontWeight: '900' },
});

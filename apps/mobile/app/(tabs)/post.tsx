import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { CREATE_INTENTS, resolveCreateIntent } from '@promorang/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { useAuth } from '@/context/AuthContext';
import { useExperienceActions } from '@/hooks/usePeopleExperience';
import { supabase } from '@/lib/supabase';
import { mobileCreateHref } from '@/lib/createIntents';
import { useMoments, type Moment } from '@/hooks/useMoments';
import { PrimaryButton } from '@/components/people/ExperienceShell';

type ProofType = 'moment' | 'mission' | 'story';

export default function CreateScreen() {
  const params = useLocalSearchParams<{ intent?: string; momentId?: string }>();
  const selected = resolveCreateIntent(params.intent);
  const showAnswer = params.intent === 'answer';
  const showCapture = params.intent === 'post';

  if (showAnswer) return <AskPeopleForm />;
  if (showCapture) return <CaptureContribution momentId={params.momentId} />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>CREATE SOMETHING</Text>
      <Text style={styles.title}>What do you want your people to do?</Text>
      <Text style={styles.subtitle}>You choose the behaviour. PROMORANG picks the right tool underneath.</Text>
      <View style={{ gap: 10, marginTop: 22 }}>
        {CREATE_INTENTS.map((item) => (
          <Pressable
            key={item.intent}
            style={[styles.intent, selected.intent === item.intent && styles.intentActive]}
            onPress={() => router.push(mobileCreateHref(item.intent, item.href) as any)}
          >
            <Text style={styles.intentLabel}>{item.label}</Text>
            <Text style={styles.intentPrompt}>{item.prompt}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ height: 110 }} />
    </ScrollView>
  );
}

function AskPeopleForm() {
  const { ask } = useExperienceActions();
  const [question, setQuestion] = useState('');

  const submit = async () => {
    try {
      await ask.mutateAsync({ question, category: 'community' });
      Alert.alert('Asked', 'Your people can answer this now.');
      router.push('/promoshare');
    } catch (error) {
      Alert.alert('Could not ask that yet', error instanceof Error ? error.message : 'Try again.');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Pressable onPress={() => router.replace('/post')} style={styles.back}>
        <Ionicons name="arrow-back" size={16} color={Colors.gray[400]} />
        <Text style={styles.backText}>All create paths</Text>
      </Pressable>
      <Text style={styles.eyebrow}>ASK YOUR PEOPLE</Text>
      <Text style={styles.title}>What do you want to know?</Text>
      <TextInput
        value={question}
        onChangeText={setQuestion}
        placeholder="Where should we eat in Kingston this weekend?"
        placeholderTextColor={Colors.gray[500]}
        multiline
        style={styles.askInput}
      />
      <PrimaryButton
        label={ask.isPending ? 'Asking…' : 'Ask them'}
        loading={ask.isPending}
        disabled={!question.trim()}
        onPress={submit}
      />
    </ScrollView>
  );
}

function CaptureContribution({ momentId }: { momentId?: string }) {
  const { user } = useAuth();
  const { moments, loading: momentsLoading } = useMoments();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [contentUrl, setContentUrl] = useState('');
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
    if (!imageUri && !contentUrl.trim() && !caption.trim()) {
      Alert.alert('Add content or story', 'Provide a photo, social content link, or story description before publishing.');
      return;
    }
    if (!user) return Alert.alert('Sign in required', 'Sign in before publishing your contribution.');
    setPublishing(true);
    setPublishError(null);
    try {
      let mediaUrl: string | null = null;
      if (imageUri) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const extension = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
        const path = `${user.id}/mobile/${Date.now()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from('moment-images').upload(path, blob, {
          contentType: blob.type || 'image/jpeg', cacheControl: '3600', upsert: false,
        });
        if (uploadError) throw uploadError;
        mediaUrl = supabase.storage.from('moment-images').getPublicUrl(path).data.publicUrl;
      } else if (contentUrl.trim()) {
        mediaUrl = contentUrl.trim();
      }

      const detectedPlatform = contentUrl.toLowerCase().includes('instagram') ? 'instagram'
        : contentUrl.toLowerCase().includes('tiktok') ? 'tiktok'
        : contentUrl.toLowerCase().includes('youtube') || contentUrl.toLowerCase().includes('youtu.be') ? 'youtube'
        : contentUrl.toLowerCase().includes('x.com') || contentUrl.toLowerCase().includes('twitter') ? 'x'
        : 'promorang-mobile';

      const { data: content, error: insertError } = await supabase.from('content_items').insert({
        creator_id: user.id,
        title: selectedMoment?.title || caption.trim().split(/[.!?]/)[0].slice(0, 80) || 'A moment worth keeping',
        description: caption.trim() || null,
        media_url: mediaUrl,
        platform: contentUrl.trim() ? detectedPlatform : 'promorang-mobile',
        status: selectedMoment ? 'pending_review' : proofType === 'mission' ? 'pending_review' : 'published',
        posted_at: new Date().toISOString(),
        metadata: { content_url: contentUrl.trim() || null, moment_id: selectedMomentId, source: 'mobile_post', has_local_image: Boolean(imageUri) },
      }).select('id').single();
      if (insertError) throw insertError;

      if (selectedMoment && content?.id) {
        await supabase.from('content_moment_links').insert({
          content_item_id: content.id,
          moment_id: selectedMoment.id,
          entry_action_types: [proofType, locationAdded ? 'location_context' : 'media_proof'],
        });
        await supabase.from('proof_submissions').insert({
          moment_id: selectedMoment.id,
          user_id: user.id,
          submission_state: 'pending',
          proof_bundle: { content_item_id: content.id, media_url: mediaUrl, content_url: contentUrl.trim() || null, caption: caption.trim() || null, proof_type: proofType, location_added: locationAdded, platform: detectedPlatform, source: 'mobile-post' },
        });
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
        <Text style={styles.successEyebrow}>IT COUNTED</Text>
        <Text style={styles.successTitle}>Your story has a receipt.</Text>
        <Pressable style={styles.publish} onPress={() => router.replace('/promoshare')}>
          <Text style={styles.publishText}>See what happened</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Pressable onPress={() => router.replace('/post')} style={styles.back}>
        <Ionicons name="arrow-back" size={16} color={Colors.gray[400]} />
        <Text style={styles.backText}>All create paths</Text>
      </Pressable>
      <Text style={styles.eyebrow}>POST SOMETHING</Text>
      <Text style={styles.title}>Show what happened.</Text>
      <View style={styles.typeRow}>
        {([['moment', 'Moment'], ['mission', 'Action'], ['story', 'Story']] as const).map(([id, label]) => (
          <Pressable key={id} onPress={() => setProofType(id)} style={[styles.type, proofType === id && styles.typeActive]}>
            <Text style={[styles.typeText, proofType === id && styles.typeTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.capture}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <View style={styles.captureEmpty}>
            <Text style={styles.captureTitle}>Start with what happened</Text>
            <View style={styles.captureActions}>
              <Pressable style={styles.primaryButton} onPress={() => chooseImage(true)}><Text style={styles.primaryButtonText}>Open camera</Text></Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => chooseImage(false)}><Text style={styles.secondaryButtonText}>Library</Text></Pressable>
            </View>
          </View>
        )}
      </View>
      <TextInput value={contentUrl} onChangeText={setContentUrl} placeholder="https://instagram.com/p/…" placeholderTextColor={Colors.gray[500]} style={styles.linkInput} autoCapitalize="none" />
      <TextInput value={caption} onChangeText={setCaption} placeholder="What should people know about this moment?" placeholderTextColor={Colors.gray[500]} style={styles.caption} multiline />
      <Pressable style={styles.contextRow} onPress={() => setLocationAdded(!locationAdded)}>
        <Text style={styles.contextTitle}>{locationAdded ? 'Place added' : 'Add the place'}</Text>
      </Pressable>
      <MomentRail moments={moments} selectedMomentId={selectedMomentId} loading={momentsLoading} onSelect={setSelectedMomentId} />
      {publishError ? <Text style={styles.errorText}>{publishError}</Text> : null}
      <Pressable style={[styles.publish, publishing && styles.publishMuted]} onPress={publish} disabled={publishing}>
        {publishing ? <ActivityIndicator color={Colors.black} /> : <Text style={styles.publishText}>Publish contribution</Text>}
      </Pressable>
      <View style={{ height: 110 }} />
    </ScrollView>
  );
}

function MomentRail({ moments, selectedMomentId, loading, onSelect }: { moments: Moment[]; selectedMomentId: string | null; loading: boolean; onSelect: (id: string | null) => void }) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.eyebrow}>ROUTE TO A MOMENT</Text>
      {loading ? <ActivityIndicator color={Colors.primary} /> : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 10 }}>
          {moments.slice(0, 8).map((moment) => {
            const selected = moment.id === selectedMomentId;
            return (
              <Pressable key={moment.id} style={[styles.momentChip, selected && styles.momentChipActive]} onPress={() => onSelect(selected ? null : moment.id)}>
                <Text numberOfLines={1} style={styles.momentChipTitle}>{moment.title}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  content: { paddingTop: 18, paddingHorizontal: Spacing.container },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1.1 },
  title: { color: Colors.white, fontSize: Typography.sizes['3xl'], lineHeight: 38, fontWeight: '800', letterSpacing: -1, marginTop: 5 },
  subtitle: { color: Colors.gray[400], fontSize: 13, lineHeight: 19, marginTop: 6, maxWidth: 330 },
  intent: { borderRadius: 24, borderWidth: 1, borderColor: Colors.border, backgroundColor: 'rgba(255,255,255,0.04)', padding: 16 },
  intentActive: { borderColor: Colors.primary, backgroundColor: 'rgba(255,85,0,0.15)' },
  intentLabel: { color: Colors.white, fontSize: 24, fontWeight: '800' },
  intentPrompt: { color: Colors.gray[400], fontSize: 13, marginTop: 4 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, marginBottom: 8 },
  backText: { color: Colors.gray[400], fontSize: 13 },
  askInput: { minHeight: 120, marginVertical: 18, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900], color: Colors.white, padding: 16, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', gap: 8, marginTop: 18 },
  type: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900] },
  typeActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeText: { color: Colors.gray[300], fontSize: 13, fontWeight: '700' },
  typeTextActive: { color: Colors.black },
  capture: { height: 240, marginTop: 15, borderRadius: BorderRadius['2xl'], overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900] },
  captureEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  captureTitle: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  captureActions: { flexDirection: 'row', gap: 10 },
  primaryButton: { paddingHorizontal: 15, paddingVertical: 11, borderRadius: 20, backgroundColor: Colors.primary },
  primaryButtonText: { color: Colors.black, fontSize: 12, fontWeight: '800' },
  secondaryButton: { paddingHorizontal: 15, paddingVertical: 11, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  secondaryButtonText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  preview: { width: '100%', height: '100%' },
  linkInput: { height: 48, borderRadius: 14, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, color: Colors.white, fontSize: 13, marginTop: 14 },
  caption: { minHeight: 80, borderRadius: 14, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, padding: 14, color: Colors.white, marginTop: 10, textAlignVertical: 'top' },
  contextRow: { paddingVertical: 14 },
  contextTitle: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  momentChip: { width: 180, padding: 10, borderRadius: 15, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[800] },
  momentChipActive: { borderColor: Colors.primary },
  momentChipTitle: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  publish: { marginTop: 15, height: 52, borderRadius: 17, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  publishMuted: { opacity: 0.55 },
  publishText: { color: Colors.black, fontSize: 14, fontWeight: '900' },
  errorText: { color: Colors.error, marginTop: 10 },
  successScreen: { flex: 1, paddingHorizontal: 25, paddingTop: Platform.OS === 'ios' ? 110 : 80, backgroundColor: Colors.black, alignItems: 'center' },
  successMark: { width: 72, height: 72, borderRadius: 25, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  successEyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1.1, marginTop: 28 },
  successTitle: { color: Colors.white, fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 8 },
});

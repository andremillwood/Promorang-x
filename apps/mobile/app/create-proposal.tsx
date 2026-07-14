import { useMemo, useState } from 'react';
import {
  ACTIVATION_COLLABORATORS,
  ACTIVATION_CREATION_GUIDANCE,
  ACTIVATION_CONTENT_NEEDS,
  ACTIVATION_OUTCOMES,
  ACTIVATION_PARTICIPANT_RETURNS,
  ACTIVATION_SUCCESS_LANGUAGE,
} from '@promorang/shared';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { useAuth } from '@/context/AuthContext';
import { useCreateProposal } from '@/hooks/useProposals';
import { operationalSupabase } from '@/lib/operationalSupabase';

const outcomeIcons = {
  gather: 'people',
  visits: 'storefront',
  content: 'videocam',
  launch: 'sparkles',
  community: 'heart',
  commercial: 'business',
} as const;
const stepNames = [
  { id: 'outcome', shortLabel: 'Outcome', eyebrow: 'Desired outcome', title: 'What do you want to make happen between people?', detail: 'Start with the change people should feel, do, or carry forward.', guide: 'outcome' },
  { id: 'scene', shortLabel: 'Scene', eyebrow: 'Choose the Scene', title: 'Which living community should this strengthen?', detail: 'The Scene holds the people, places, rituals, stories, and reasons to return.', guide: 'scene_moment' },
  { id: 'moment', shortLabel: 'Moment', eyebrow: 'Shape the Moment', title: 'What gives this Scene a reason to gather now?', detail: 'Name the experience, place, feeling, and reason someone would join.', guide: 'scene_moment' },
  { id: 'content', shortLabel: 'Story', eyebrow: 'Plan the story', title: 'How will people discover, feel, and remember it?', detail: 'Content creates desire before, live meaning during, and memory after.', guide: 'content_people' },
  { id: 'people', shortLabel: 'People', eyebrow: 'Build the room', title: 'Who will make this credible and alive?', detail: 'Choose the human network whose contributions turn the idea into an experience.', guide: 'content_people' },
  { id: 'value', shortLabel: 'Value', eyebrow: 'Define shared value', title: 'What should everyone leave with?', detail: 'Connect participant value, partner return, success signals, and Gems.', guide: 'value_launch' },
  { id: 'review', shortLabel: 'Review', eyebrow: 'Activation story', title: 'Does this feel worth joining and backing?', detail: 'Review the activation as one human story before opening the room.', guide: 'return_review' },
] as const;

type Form = {
  outcome: string;
  outcomeDetail: string;
  scene: string;
  sceneId: string;
  title: string;
  location: string;
  description: string;
  contentNeeds: string[];
  collaborators: string[];
  whatCounts: string;
  participantReturns: string[];
  budget: string;
  partnerContribution: string;
  socialReturn: string;
  commercialReturn: string;
};

export default function CreateProposalScreen() {
  const { user } = useAuth();
  const createProposal = useCreateProposal();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>({ outcome: '', outcomeDetail: '', scene: '', sceneId: '', title: '', location: '', description: '', contentNeeds: [], collaborators: [], whatCounts: '', participantReturns: [], budget: '', partnerContribution: '', socialReturn: '', commercialReturn: '' });
  const { data: availableScenes = [] } = useQuery({ queryKey: ['activation-scenes'], queryFn: async () => { const { data, error } = await operationalSupabase.from('scenes').select('id,title,city').eq('status', 'active').order('title').limit(24); if (error) throw error; return data || []; } });
  const currentGuide = ACTIVATION_CREATION_GUIDANCE[stepNames[step].guide];
  const field = <K extends keyof Form>(key: K, value: Form[K]) => setForm((current) => ({ ...current, [key]: value }));
  const toggle = (key: 'contentNeeds' | 'collaborators' | 'participantReturns', value: string) => field(key, form[key].includes(value) ? form[key].filter((item) => item !== value) : [...form[key], value]);
  const canContinue = useMemo(() => step === 0 ? Boolean(form.outcome && form.outcomeDetail.trim()) : step === 1 ? Boolean(form.scene.trim()) : step === 2 ? Boolean(form.title.trim() && form.description.trim()) : step === 3 ? Boolean(form.contentNeeds.length) : step === 4 ? Boolean(form.collaborators.length) : step === 5 ? Boolean(form.whatCounts.trim() && form.participantReturns.length && form.socialReturn.trim() && form.commercialReturn.trim()) : true, [form, step]);

  const submit = async (status: 'draft' | 'sent') => {
    if (!user) return Alert.alert('Sign in required', 'Sign in to save this activation plan.');
    try {
      const proposal = await createProposal.mutateAsync({
        title: form.title || 'Untitled activation plan',
        description: form.description || form.outcomeDetail,
        budget: Number(form.budget) || null,
        target_moment_id: null,
        brand_id: null,
        status,
        metadata: { desired_outcome: form.outcome, outcome_detail: form.outcomeDetail, scene: form.scene, location: form.location, content_needed: form.contentNeeds, collaborators: form.collaborators, what_counts: form.whatCounts, participant_value: form.participantReturns, funder_contribution: form.partnerContribution, social_return: form.socialReturn, commercial_return: form.commercialReturn, creation_model: 'scene_activation_v3_guided', builder_journey: stepNames.map((item) => item.id) },
      });
      let linkedSceneId = form.sceneId;
      if (!linkedSceneId && form.scene.trim()) {
        const slug = `${form.scene.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString(36)}`;
        const { data: scene, error } = await operationalSupabase.from('scenes').insert({ owner_user_id: user.id, title: form.scene.trim(), slug, city: form.location || null, status: 'active', visibility: 'public', description: form.outcomeDetail }).select('id').single();
        if (error) throw error;
        linkedSceneId = scene.id;
      }
      if (linkedSceneId) {
        const { error } = await operationalSupabase.rpc('link_activation_scene', { p_proposal_id: proposal.id, p_scene_id: linkedSceneId });
        if (error) throw error;
      }
      Alert.alert(status === 'draft' ? 'Plan saved' : 'Your activation is open', status === 'draft' ? 'Continue shaping it from your activation workspace.' : 'Now invite the people, assign the story, secure Gems, and bring the Moment alive.', [{ text: 'Enter workspace', onPress: () => router.replace(`/proposal/${proposal.id}`) }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please check your connection and try again.';
      Alert.alert('This plan could not be saved', message);
    }
  };

  return <View style={styles.screen}>
    <View style={styles.header}>
      <Pressable accessibilityLabel="Close" style={styles.close} onPress={() => router.back()}><Ionicons name="close" size={21} color={Colors.white} /></Pressable>
      <View style={styles.heading}><Text style={styles.eyebrow}>ACTIVATION BUILDER</Text><Text style={styles.headerTitle}>Make something happen</Text></View>
      <Text style={styles.stepCount}>{step + 1} OF {stepNames.length}</Text>
    </View>
    <View style={styles.progress}>{stepNames.map((item, index) => <View key={item.id} style={styles.progressItem}><View style={[styles.progressBar, index <= step && styles.progressBarActive]} /><Text style={[styles.progressName, index === step && styles.progressNameActive]}>{item.shortLabel}</Text></View>)}</View>

    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {step === 0 && <>
        <Step eyebrow={stepNames[0].eyebrow.toUpperCase()} title={stepNames[0].title} detail={stepNames[0].detail} />
        <GuidanceCard guide={currentGuide} />
        <View style={styles.cards}>{ACTIVATION_OUTCOMES.map(({ id, title, detail }) => <SelectCard key={id} active={form.outcome === id} icon={outcomeIcons[id]} title={title} detail={detail} onPress={() => field('outcome', id)} />)}</View>
        <InputBlock label="DESCRIBE THE CHANGE"><TextInput value={form.outcomeDetail} onChangeText={(value) => field('outcomeDetail', value)} placeholder="Who should meet, feel seen, discover something, return, create, or gain an opportunity?" placeholderTextColor={Colors.gray[600]} style={styles.textArea} multiline /></InputBlock>
      </>}

      {step === 1 && <>
        <Step eyebrow={stepNames[1].eyebrow.toUpperCase()} title={stepNames[1].title} detail={stepNames[1].detail} />
        <GuidanceCard guide={currentGuide} />
        <ChipGroup label="CHOOSE AN EXISTING SCENE">{availableScenes.map((scene) => <Chip key={scene.id} active={form.sceneId === scene.id} label={String(scene.title)} onPress={() => { field('sceneId', scene.id); field('scene', String(scene.title)); }} />)}</ChipGroup>
        {!form.sceneId && <InputBlock label="OR NAME A NEW SCENE"><TextInput value={form.scene} onChangeText={(value) => field('scene', value)} placeholder="e.g. Kingston Makers" placeholderTextColor={Colors.gray[600]} style={styles.input} /></InputBlock>}
        {form.sceneId && <Pressable onPress={() => { field('sceneId', ''); field('scene', ''); }} style={styles.changeScene}><Text style={styles.changeSceneText}>Create a new Scene instead</Text></Pressable>}
        <View style={styles.sceneTest}><Text style={styles.sceneTestLabel}>SCENE TEST</Text><Text style={styles.sceneTestTitle}>Can people recognize themselves in this world?</Text><Text style={styles.sceneTestCopy}>A Scene should carry relationships, places, content, memory, and a credible next gathering.</Text></View>
      </>}

      {step === 2 && <>
        <Step eyebrow={stepNames[2].eyebrow.toUpperCase()} title={stepNames[2].title} detail={stepNames[2].detail} />
        <GuidanceCard guide={currentGuide} />
        <InputBlock label="MOMENT NAME"><TextInput value={form.title} onChangeText={(value) => field('title', value)} placeholder="e.g. Makers After Hours" placeholderTextColor={Colors.gray[600]} style={styles.input} /></InputBlock>
        <InputBlock label="PLACE"><TextInput value={form.location} onChangeText={(value) => field('location', value)} placeholder="Venue, neighborhood, or online" placeholderTextColor={Colors.gray[600]} style={styles.input} /></InputBlock>
        <InputBlock label="WHAT WILL PEOPLE EXPERIENCE?"><TextInput value={form.description} onChangeText={(value) => field('description', value)} placeholder="Describe the people, feeling, activity, and reason they will want to be there." placeholderTextColor={Colors.gray[600]} style={styles.textArea} multiline /></InputBlock>
      </>}

      {step === 3 && <>
        <Step eyebrow={stepNames[3].eyebrow.toUpperCase()} title={stepNames[3].title} detail={stepNames[3].detail} />
        <GuidanceCard guide={currentGuide} />
        <ChipGroup label="CONTENT NEEDED">{ACTIVATION_CONTENT_NEEDS.map(({ id, title }) => <Chip key={id} active={form.contentNeeds.includes(id)} label={title} onPress={() => toggle('contentNeeds', id)} />)}</ChipGroup>
        <View style={styles.storyPath}>{['Invite', 'Before', 'Live', 'After'].map((phase, index) => <View key={phase} style={styles.storyPhase}><View style={styles.storyNumber}><Text style={styles.storyNumberText}>{index + 1}</Text></View><Text style={styles.storyPhaseText}>{phase}</Text></View>)}</View>
      </>}

      {step === 4 && <>
        <Step eyebrow={stepNames[4].eyebrow.toUpperCase()} title={stepNames[4].title} detail={stepNames[4].detail} />
        <GuidanceCard guide={currentGuide} />
        <ChipGroup label="PEOPLE AND PLACES NEEDED">{ACTIVATION_COLLABORATORS.map(({ id, title }) => <Chip key={id} active={form.collaborators.includes(id)} label={title} onPress={() => toggle('collaborators', id)} />)}</ChipGroup>
      </>}

      {step === 5 && <>
        <Step eyebrow={stepNames[5].eyebrow.toUpperCase()} title={stepNames[5].title} detail={stepNames[5].detail} />
        <GuidanceCard guide={currentGuide} />
        <ChipGroup label="WHAT CAN PARTICIPANTS LEAVE WITH?">{ACTIVATION_PARTICIPANT_RETURNS.map((value) => <Chip key={value} active={form.participantReturns.includes(value)} label={value} onPress={() => toggle('participantReturns', value)} />)}</ChipGroup>
        <InputBlock label="WHAT WILL TELL US IT WORKED?"><TextInput value={form.whatCounts} onChangeText={(value) => field('whatCounts', value)} placeholder={ACTIVATION_SUCCESS_LANGUAGE.whatCounts} placeholderTextColor={Colors.gray[600]} style={styles.textArea} multiline /></InputBlock>
        <InputBlock label="FUNDING GOAL IN GEMS"><TextInput value={form.budget} onChangeText={(value) => field('budget', value)} placeholder="500 Gems · US$500 value" placeholderTextColor={Colors.gray[600]} style={styles.input} keyboardType="numeric" /></InputBlock>
        <InputBlock label="WHAT WILL THE PARTNER CONTRIBUTE?"><TextInput value={form.partnerContribution} onChangeText={(value) => field('partnerContribution', value)} placeholder="Budget, venue, product, access, media…" placeholderTextColor={Colors.gray[600]} style={styles.input} /></InputBlock>
        <View style={styles.gemsNote}><Text style={styles.gemsNoteText}>{ACTIVATION_SUCCESS_LANGUAGE.gemsFunding}</Text></View>
        <InputBlock label="HUMAN RETURN"><TextInput value={form.socialReturn} onChangeText={(value) => field('socialReturn', value)} placeholder={ACTIVATION_SUCCESS_LANGUAGE.humanReturn} placeholderTextColor={Colors.gray[600]} style={styles.textArea} multiline /></InputBlock>
        <InputBlock label="COMMERCIAL RETURN"><TextInput value={form.commercialReturn} onChangeText={(value) => field('commercialReturn', value)} placeholder={ACTIVATION_SUCCESS_LANGUAGE.commercialReturn} placeholderTextColor={Colors.gray[600]} style={styles.textArea} multiline /></InputBlock>
      </>}

      {step === 6 && <ActivationStory form={form} />}

      <View style={styles.sharedReturn}><Ionicons name="heart-circle" size={22} color={Colors.primary} /><View style={styles.sharedCopy}><Text style={styles.sharedLabel}>THE SHARED RETURN</Text><Text style={styles.sharedText}>{ACTIVATION_SUCCESS_LANGUAGE.sharedReturn}</Text></View></View>
      <View style={styles.actions}>
        <Pressable style={styles.back} onPress={() => step ? setStep(step - 1) : router.back()}><Ionicons name="arrow-back" size={17} color={Colors.white} /><Text style={styles.backText}>{step ? 'Back' : 'Cancel'}</Text></Pressable>
        <Pressable disabled={!canContinue || createProposal.isPending} style={[styles.continue, (!canContinue || createProposal.isPending) && styles.disabled]} onPress={() => step < stepNames.length - 1 ? setStep(step + 1) : submit('sent')}>{createProposal.isPending ? <ActivityIndicator size="small" color={Colors.black} /> : <><Text style={styles.continueText}>{step < stepNames.length - 1 ? 'Continue' : 'Open activation'}</Text><Ionicons name="arrow-forward" size={17} color={Colors.black} /></>}</Pressable>
      </View>
      {step === stepNames.length - 1 && <Pressable style={styles.draft} onPress={() => submit('draft')}><Text style={styles.draftText}>Save as draft</Text></Pressable>}
      <View style={{ height: 40 }} />
    </ScrollView>
  </View>;
}

function ActivationStory({ form }: { form: Form }) {
  const outcome = ACTIVATION_OUTCOMES.find((item) => item.id === form.outcome)?.title || 'A meaningful outcome';
  return <View><Step eyebrow="07 · ACTIVATION STORY" title="See the experience before you open the room." detail="This is the shared story every participant, creator, host, venue, merchant, and funder should understand." />
    <View style={styles.storyCard}><View style={styles.storyScene}><Text style={styles.storySceneText}>{form.scene}</Text></View><Text style={styles.storyTitle}>{form.title}</Text><Text style={styles.storyLocation}>{form.location || 'Place to be confirmed'}</Text><Text style={styles.storyDescription}>{form.description}</Text><View style={styles.storyOutcome}><Text style={styles.storyOutcomeText}>{outcome}: {form.outcomeDetail}</Text></View></View>
    <View style={styles.reviewStack}><ReviewSignal icon="videocam" label="THE STORY TRAVELS" value={form.contentNeeds.join(' · ')} /><ReviewSignal icon="people" label="THE ROOM COMES ALIVE" value={form.collaborators.join(' · ')} /><ReviewSignal icon="diamond" label="VALUE IS SECURED" value={form.budget ? `${Number(form.budget).toLocaleString()} Gems · US$${Number(form.budget).toLocaleString()} value` : 'Gem funding can be added as partners align.'} /><ReviewSignal icon="heart" label="PEOPLE LEAVE WITH" value={form.participantReturns.join(' · ')} /><ReviewSignal icon="trending-up" label="HUMAN + COMMERCIAL RETURN" value={`${form.socialReturn} ${form.commercialReturn}`} /></View>
    <View style={styles.afterCard}><Text style={styles.afterLabel}>AFTER THE MOMENT</Text><Text style={styles.afterText}>This plan opens into the activation workspace: invite people, assign content, secure Gems, open access, launch, and review what changed for the Scene.</Text></View>
  </View>;
}
function ReviewSignal({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) { return <View style={styles.reviewSignal}><View style={styles.reviewIcon}><Ionicons name={icon} size={16} color={Colors.primary} /></View><View style={styles.reviewCopy}><Text style={styles.reviewLabel}>{label}</Text><Text style={styles.reviewValue}>{value}</Text></View></View>; }
function Step({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) { return <View style={styles.stepIntro}><Text style={styles.stepEyebrow}>{eyebrow}</Text><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{detail}</Text></View>; }
function GuidanceCard({ guide }: { guide: (typeof ACTIVATION_CREATION_GUIDANCE)[keyof typeof ACTIVATION_CREATION_GUIDANCE] }) { return <View style={styles.guidanceCard}><View style={styles.guidanceHead}><View style={styles.guidanceIcon}><Ionicons name="bulb" size={17} color={Colors.primary} /></View><View style={styles.guidanceCopy}><Text style={styles.guidanceLabel}>SUCCESS LENS</Text><Text style={styles.guidanceQuestion}>{guide.successQuestion}</Text></View></View><View style={styles.guidanceRows}><GuidanceRow label="Participant" value={guide.participantLens} /><GuidanceRow label="Scene" value={guide.sceneLens} /><GuidanceRow label="Gems" value={guide.gemsLens} /></View><Text style={styles.guidanceAvoid}><Text style={styles.guidanceAvoidStrong}>Avoid: </Text>{guide.avoid}</Text></View>; }
function GuidanceRow({ label, value }: { label: string; value: string }) { return <View style={styles.guidanceRow}><Text style={styles.guidanceRowLabel}>{label}</Text><Text style={styles.guidanceRowText}>{value}</Text></View>; }
function SelectCard({ active, icon, title, detail, onPress }: { active: boolean; icon: keyof typeof Ionicons.glyphMap; title: string; detail: string; onPress: () => void }) { return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={[styles.selectCard, active && styles.selectCardActive]}><View style={[styles.selectIcon, active && styles.selectIconActive]}><Ionicons name={icon} size={19} color={active ? Colors.black : Colors.primary} /></View><View style={styles.selectCopy}><Text style={styles.selectTitle}>{title}</Text><Text style={styles.selectDetail}>{detail}</Text></View>{active && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}</Pressable>; }
function InputBlock({ label, children }: { label: string; children: React.ReactNode }) { return <View style={styles.inputBlock}><Text style={styles.label}>{label}</Text>{children}</View>; }
function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) { return <View style={styles.chipGroup}><Text style={styles.label}>{label}</Text><View style={styles.chips}>{children}</View></View>; }
function Chip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}><Ionicons name={active ? 'checkmark' : 'add'} size={14} color={active ? Colors.black : Colors.gray[400]} /><Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black }, header: { paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: Spacing.container, paddingBottom: 13, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, backgroundColor: Colors.black }, close: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border }, heading: { flex: 1, marginLeft: 12, backgroundColor: 'transparent' }, eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: .9 }, headerTitle: { color: Colors.white, fontSize: 15, fontWeight: '800', marginTop: 2 }, stepCount: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 8 }, progress: { flexDirection: 'row', gap: 5, paddingHorizontal: Spacing.container, paddingVertical: 11, backgroundColor: Colors.black }, progressItem: { flex: 1, backgroundColor: 'transparent' }, progressBar: { height: 3, borderRadius: 2, backgroundColor: Colors.gray[800] }, progressBarActive: { backgroundColor: Colors.primary }, progressName: { color: Colors.gray[700], fontSize: 7, textAlign: 'center', marginTop: 5 }, progressNameActive: { color: Colors.white, fontWeight: '700' }, content: { paddingHorizontal: Spacing.container, paddingTop: 20 }, stepIntro: { backgroundColor: 'transparent' }, stepEyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: .9 }, title: { color: Colors.white, fontSize: Typography.sizes['2xl'], lineHeight: 31, fontWeight: '800', letterSpacing: -.7, marginTop: 7 }, subtitle: { color: Colors.gray[400], fontSize: 11, lineHeight: 17, marginTop: 7 }, cards: { gap: 9, marginTop: 18, backgroundColor: 'transparent' }, selectCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border }, selectCardActive: { borderColor: Colors.primary, backgroundColor: '#24160F' }, selectIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.ambientWash, marginRight: 11 }, selectIconActive: { backgroundColor: Colors.primary }, selectCopy: { flex: 1, backgroundColor: 'transparent' }, selectTitle: { color: Colors.white, fontSize: 12, fontWeight: '800' }, selectDetail: { color: Colors.gray[500], fontSize: 9, lineHeight: 14, marginTop: 3, paddingRight: 8 }, inputBlock: { marginTop: 15, padding: 14, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border }, label: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: .7, marginBottom: 8 }, input: { color: Colors.white, fontSize: 13, paddingVertical: 6 }, textArea: { color: Colors.white, fontSize: 13, lineHeight: 19, minHeight: 88, textAlignVertical: 'top' }, chipGroup: { marginTop: 19, backgroundColor: 'transparent' }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: 'transparent' }, chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 9, borderRadius: 18, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border }, chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary }, chipText: { color: Colors.gray[300], fontSize: 9, fontWeight: '700' }, chipTextActive: { color: Colors.black }, sharedReturn: { flexDirection: 'row', marginTop: 20, padding: 14, borderRadius: BorderRadius.xl, backgroundColor: '#24160F', borderWidth: 1, borderColor: 'rgba(255,106,26,.24)' }, sharedCopy: { flex: 1, marginLeft: 10, backgroundColor: 'transparent' }, sharedLabel: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 7, letterSpacing: .6 }, sharedText: { color: Colors.white, fontSize: 10, lineHeight: 15, fontWeight: '700', marginTop: 4 }, actions: { flexDirection: 'row', gap: 10, marginTop: 18, backgroundColor: 'transparent' }, back: { height: 48, paddingHorizontal: 16, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900] }, backText: { color: Colors.white, fontSize: 11, fontWeight: '800' }, continue: { flex: 1, height: 48, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: Colors.primary }, continueText: { color: Colors.black, fontSize: 11, fontWeight: '900' }, disabled: { opacity: .4 }, draft: { alignItems: 'center', padding: 13 }, draftText: { color: Colors.gray[400], fontSize: 10, fontWeight: '700' },
  gemsNote: { marginTop: 15, padding: 13, borderRadius: BorderRadius.xl, backgroundColor: '#24160F', borderWidth: 1, borderColor: 'rgba(255,106,26,.24)' },
  gemsNoteText: { color: Colors.gray[200], fontSize: 10, lineHeight: 15, fontWeight: '700' },
  changeScene: { alignItems: 'center', paddingVertical: 10 }, changeSceneText: { color: Colors.primary, fontSize: 9, fontWeight: '800' },
  sceneTest: { marginTop: 16, padding: 15, borderRadius: BorderRadius.xl, backgroundColor: '#17100C', borderWidth: 1, borderColor: 'rgba(255,106,26,.2)' },
  sceneTestLabel: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 7, letterSpacing: .7 },
  sceneTestTitle: { color: Colors.white, fontSize: 14, lineHeight: 19, fontWeight: '800', marginTop: 6 },
  sceneTestCopy: { color: Colors.gray[400], fontSize: 10, lineHeight: 15, marginTop: 5 },
  storyPath: { flexDirection: 'row', gap: 6, marginTop: 18, backgroundColor: 'transparent' },
  storyPhase: { flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 14, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  storyNumber: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.ambientWash },
  storyNumberText: { color: Colors.primary, fontSize: 8, fontWeight: '900' }, storyPhaseText: { color: Colors.gray[300], fontSize: 7, fontWeight: '700', marginTop: 5 },
  storyCard: { marginTop: 18, padding: 18, borderRadius: 24, backgroundColor: '#11100E', borderWidth: 1, borderColor: 'rgba(255,106,26,.3)' },
  storyScene: { alignSelf: 'flex-start', backgroundColor: Colors.primary, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 }, storySceneText: { color: Colors.black, fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },
  storyTitle: { color: Colors.white, fontSize: 28, lineHeight: 31, fontWeight: '900', letterSpacing: -1, marginTop: 15 }, storyLocation: { color: Colors.primary, fontSize: 9, fontWeight: '800', marginTop: 7 }, storyDescription: { color: Colors.gray[300], fontSize: 11, lineHeight: 17, marginTop: 12 },
  storyOutcome: { marginTop: 15, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: Colors.primary }, storyOutcomeText: { color: Colors.white, fontSize: 11, lineHeight: 17, fontWeight: '800' },
  reviewStack: { gap: 8, marginTop: 10, backgroundColor: 'transparent' }, reviewSignal: { flexDirection: 'row', padding: 13, borderRadius: 16, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border }, reviewIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.ambientWash }, reviewCopy: { flex: 1, marginLeft: 10, backgroundColor: 'transparent' }, reviewLabel: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 7, letterSpacing: .5 }, reviewValue: { color: Colors.gray[200], fontSize: 10, lineHeight: 15, fontWeight: '700', marginTop: 4, textTransform: 'capitalize' },
  afterCard: { marginTop: 10, padding: 14, borderRadius: 16, backgroundColor: Colors.black, borderWidth: 1, borderColor: Colors.border }, afterLabel: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 7, letterSpacing: .6 }, afterText: { color: Colors.gray[300], fontSize: 10, lineHeight: 15, marginTop: 5 },
  guidanceCard: { marginTop: 15, padding: 14, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: 'rgba(255,106,26,.22)' },
  guidanceHead: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'transparent' },
  guidanceIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#24160F', marginRight: 10 },
  guidanceCopy: { flex: 1, backgroundColor: 'transparent' },
  guidanceLabel: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 7, letterSpacing: .7 },
  guidanceQuestion: { color: Colors.white, fontSize: 12, lineHeight: 17, fontWeight: '800', marginTop: 4 },
  guidanceRows: { gap: 8, marginTop: 12, backgroundColor: 'transparent' },
  guidanceRow: { padding: 10, borderRadius: 13, backgroundColor: Colors.black, borderWidth: 1, borderColor: Colors.border },
  guidanceRowLabel: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 7, letterSpacing: .6, textTransform: 'uppercase' },
  guidanceRowText: { color: Colors.gray[300], fontSize: 10, lineHeight: 15, marginTop: 4 },
  guidanceAvoid: { color: Colors.gray[400], fontSize: 10, lineHeight: 15, marginTop: 12 },
  guidanceAvoidStrong: { color: Colors.white, fontWeight: '800' },
});

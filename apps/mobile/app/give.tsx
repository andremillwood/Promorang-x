import { useMemo, useState } from 'react';
import { Alert, Share, Text, TextInput, View } from 'react-native';
import { AUDIENCE_LABELS, PERK_KIND_LABELS, dropShareCopy, type DropAudience, type PerkKind } from '@promorang/shared';
import { router, useLocalSearchParams } from 'expo-router';

import { ChoiceChip, ExperienceShell, PrimaryButton, QuietEmpty } from '@/components/people/ExperienceShell';
import { Colors } from '@/constants/DesignTokens';
import { useAuth } from '@/context/AuthContext';
import { useExperienceActions, useGiveablePerks } from '@/hooks/usePeopleExperience';
import { WEB_BASE } from '@/lib/api';

const KINDS = Object.entries(PERK_KIND_LABELS) as Array<[PerkKind, string]>;
const AUDIENCES = Object.entries(AUDIENCE_LABELS) as Array<[DropAudience, string]>;

export default function GiveScreen() {
  const params = useLocalSearchParams<{ kind?: PerkKind }>();
  const { user } = useAuth();
  const perks = useGiveablePerks();
  const { createDrop } = useExperienceActions();
  const giverName = user?.user_metadata?.full_name?.split(' ')[0] || 'Someone';
  const [kind, setKind] = useState<PerkKind>(params.kind || 'complimentary');
  const [audience, setAudience] = useState<DropAudience>('everyone');
  const [title, setTitle] = useState('');
  const [limit, setLimit] = useState('50');
  const [offerId, setOfferId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const selectedPerk = useMemo(() => (perks.data || []).find((item) => item.id === offerId), [perks.data, offerId]);

  const dropIt = async () => {
    try {
      const drop = await createDrop.mutateAsync({
        kind,
        title: title || selectedPerk?.title || PERK_KIND_LABELS[kind],
        description: selectedPerk?.description,
        offerId,
        audience,
        audienceLimit: audience === 'first_x' ? Number(limit) || 50 : null,
      });
      const url = `${WEB_BASE}/drop/${drop.slug}`;
      setShareUrl(url);
      await Share.share({ message: `${dropShareCopy(giverName, title || selectedPerk?.title || PERK_KIND_LABELS[kind])} ${url}` });
    } catch (error) {
      Alert.alert('Could not drop it', error instanceof Error ? error.message : 'Try again.');
    }
  };

  return (
    <ExperienceShell
      eyebrow="Give something"
      title="What do you want to give your people?"
      description="Drop it onto their PromoCards. They should never need to understand the machinery underneath."
      backTo="/"
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {KINDS.map(([id, label]) => (
          <ChoiceChip key={id} label={label} active={kind === id} onPress={() => setKind(id)} />
        ))}
      </View>
      {perks.data?.length ? (
        perks.data.map((perk) => (
          <ChoiceChip
            key={perk.id}
            label={`${perk.title}${perk.remaining != null ? ` · ${perk.remaining} left` : ''}`}
            active={offerId === perk.id}
            onPress={() => {
              setOfferId(perk.id);
              setTitle(perk.title);
            }}
          />
        ))
      ) : (
        <QuietEmpty title="No partner inventory yet" copy="You can still make a simple perk and drop it yourself." />
      )}
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="2-for-1 at the restaurant"
        placeholderTextColor={Colors.gray[500]}
        style={{ minHeight: 54, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900], color: Colors.white, paddingHorizontal: 16 }}
      />
      <Text style={{ color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 2 }}>WHO GETS IT?</Text>
      {AUDIENCES.map(([id, label]) => (
        <ChoiceChip key={id} label={label} active={audience === id} onPress={() => setAudience(id)} />
      ))}
      {audience === 'first_x' ? (
        <TextInput value={limit} onChangeText={setLimit} keyboardType="number-pad" placeholder="First 50 people" placeholderTextColor={Colors.gray[500]} style={{ minHeight: 48, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, color: Colors.white, paddingHorizontal: 16 }} />
      ) : null}
      <PrimaryButton label="Putting this up for other networks? Put inventory up." onPress={() => router.push('/stock')} />
      <PrimaryButton label={createDrop.isPending ? 'Dropping…' : 'Drop it'} loading={createDrop.isPending} onPress={dropIt} />
      {shareUrl ? (
        <QuietEmpty title={dropShareCopy(giverName, title || selectedPerk?.title || PERK_KIND_LABELS[kind])} copy={`${shareUrl}\nSend that. They claim it on their PromoCard.`} />
      ) : null}
    </ExperienceShell>
  );
}

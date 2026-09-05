import { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { PERK_KIND_LABELS, inventoryOpenCopy, type PerkKind } from '@promorang/shared';
import { router } from 'expo-router';

import { ChoiceChip, ExperienceShell, PrimaryButton } from '@/components/people/ExperienceShell';
import { Colors } from '@/constants/DesignTokens';
import { useAuth } from '@/context/AuthContext';
import { useExperienceActions } from '@/hooks/usePeopleExperience';

const KINDS = (Object.entries(PERK_KIND_LABELS) as Array<[PerkKind, string]>).filter(([id]) =>
  ['merchant', 'complimentary', 'discount', 'free_entry', 'priority', 'invitation', 'custom'].includes(id),
);

export default function StockScreen() {
  const { user } = useAuth();
  const { provideInventory } = useExperienceActions();
  const merchantName = user?.user_metadata?.full_name?.split(' ')[0] || 'A place';
  const [kind, setKind] = useState<PerkKind>('merchant');
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState('50');
  const [youEarn, setYouEarn] = useState('');
  const [opened, setOpened] = useState<{ title: string; remaining: number | null } | null>(null);

  const submit = async () => {
    try {
      const result = await provideInventory.mutateAsync({
        kind,
        title,
        quantity: quantity ? Number(quantity) : null,
        peopleGet: title,
        youEarn: youEarn || undefined,
      });
      setOpened({ title: result.opportunity.title, remaining: result.opportunity.remaining });
    } catch (error) {
      Alert.alert('Could not put that up yet', error instanceof Error ? error.message : 'Try again.');
    }
  };

  if (opened) {
    return (
      <ExperienceShell eyebrow="It’s up" title={inventoryOpenCopy(merchantName, opened.title)} backTo="/">
        <Text style={{ color: Colors.gray[400] }}>Contributors will see this under Earn. You will see claimed and used — not a funding dashboard.</Text>
        {opened.remaining != null ? <Text style={{ color: Colors.gray[500] }}>{opened.remaining} available.</Text> : null}
        <PrimaryButton label="See it as an opportunity" onPress={() => router.push('/earn')} />
        <PrimaryButton label="Drop it on your own people too" onPress={() => router.push('/give')} />
      </ExperienceShell>
    );
  }

  return (
    <ExperienceShell
      eyebrow="Put something up"
      title="What can people get from you?"
      description="This becomes an opportunity. Other people move it. You see claimed and used."
      backTo="/"
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {KINDS.map(([id, label]) => (
          <ChoiceChip key={id} label={label} active={kind === id} onPress={() => setKind(id)} />
        ))}
      </View>
      <TextInput value={title} onChangeText={setTitle} placeholder="Free tasting, 2-for-1 Friday, first drink" placeholderTextColor={Colors.gray[500]} style={inputStyle} />
      <TextInput value={quantity} onChangeText={setQuantity} keyboardType="number-pad" placeholder="How many? Leave blank if open" placeholderTextColor={Colors.gray[500]} style={inputStyle} />
      <TextInput value={youEarn} onChangeText={setYouEarn} placeholder="What do people who move it earn?" placeholderTextColor={Colors.gray[500]} style={inputStyle} />
      <PrimaryButton label={provideInventory.isPending ? 'Putting it up…' : 'Put it up'} loading={provideInventory.isPending} disabled={!title.trim()} onPress={submit} />
    </ExperienceShell>
  );
}

const inputStyle = {
  minHeight: 54,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: Colors.border,
  backgroundColor: Colors.gray[900],
  color: Colors.white,
  paddingHorizontal: 16,
} as const;

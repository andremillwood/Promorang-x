import { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { COMMUNITY_THEMES, REACH_CHANNELS } from '@promorang/shared';
import { router } from 'expo-router';

import { ChoiceChip, ExperienceShell, PrimaryButton } from '@/components/people/ExperienceShell';
import { Colors } from '@/constants/DesignTokens';
import { useExperienceActions } from '@/hooks/usePeopleExperience';

export default function StartScreen() {
  const { start } = useExperienceActions();
  const [theme, setTheme] = useState('food');
  const [location, setLocation] = useState('Kingston');
  const [name, setName] = useState('');
  const [reach, setReach] = useState<string[]>(['instagram']);
  const [created, setCreated] = useState<any>(null);

  const toggleReach = (id: string) => {
    setReach((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const submit = async () => {
    try {
      const result = await start.mutateAsync({ name, theme, location, city: location, reach });
      setCreated(result);
    } catch (error) {
      Alert.alert('Could not create that community', error instanceof Error ? error.message : 'Try again.');
    }
  };

  if (created?.scene) {
    return (
      <ExperienceShell eyebrow="You’re in" title="Here’s something you can give your people.">
        <Text style={{ color: Colors.gray[400] }}>{created.scene.title} is live. Don’t stop at the name.</Text>
        <PrimaryButton label="Give the first 50 a perk" onPress={() => router.push('/give')} />
        <PrimaryButton label="Invite your people" onPress={() => router.push('/people')} />
        {created.firstValue?.opportunity ? (
          <PrimaryButton label="Take an opportunity" onPress={() => router.push('/earn')} />
        ) : null}
      </ExperienceShell>
    );
  }

  return (
    <ExperienceShell
      eyebrow="Start"
      title="What is your community about?"
      description="Keep it short. You can give people something immediately after this."
      backTo="/"
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {COMMUNITY_THEMES.map((item) => (
          <ChoiceChip key={item.id} label={item.label} active={theme === item.id} onPress={() => setTheme(item.id)} />
        ))}
      </View>
      <TextInput value={location} onChangeText={setLocation} placeholder="Where is your community?" placeholderTextColor={Colors.gray[500]} style={inputStyle} />
      <TextInput value={name} onChangeText={setName} placeholder="Kingston Food Club" placeholderTextColor={Colors.gray[500]} style={inputStyle} />
      <Text style={{ color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 2 }}>HOW DO YOU REACH YOUR PEOPLE?</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {REACH_CHANNELS.map((item) => (
          <ChoiceChip key={item.id} label={item.label} active={reach.includes(item.id)} onPress={() => toggleReach(item.id)} />
        ))}
      </View>
      <PrimaryButton label={start.isPending ? 'Creating…' : 'Create'} loading={start.isPending} disabled={!name.trim()} onPress={submit} />
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

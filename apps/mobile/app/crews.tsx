import { KINGSTON_AFTER_DARK_SLICE } from '@promorang/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';

import { ExperienceShell, PrimaryButton } from '@/components/people/ExperienceShell';
import { Colors } from '@/constants/DesignTokens';
import { useExperienceActions, useMyCrew } from '@/hooks/usePeopleExperience';

export default function CrewsScreen() {
  const crewQuery = useMyCrew();
  const { createCrew, joinCrew } = useExperienceActions();
  const [name, setName] = useState('Night Owls');
  const [code, setCode] = useState('');
  const crew = crewQuery.data;

  if (crewQuery.isLoading) {
    return <ExperienceShell eyebrow="Crew" title="Who you move with" />;
  }

  if (crew) {
    return (
      <ExperienceShell eyebrow="Who you move with" title={crew.name}>
        <Text style={{ color: Colors.gray[400] }}>
          {crew.run?.title || KINGSTON_AFTER_DARK_SLICE.runTitle} · {crew.run?.completed || 0}/{crew.run?.total || 4} counted
        </Text>
        {(crew.members || []).map((member: { userId: string; name: string; pathCue?: string | null; runRole?: { title: string } | null }) => (
          <View key={member.userId} style={{ paddingVertical: 10 }}>
            <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '700' }}>{member.name}</Text>
            <Text style={{ color: Colors.gray[500], marginTop: 4 }}>
              {[member.runRole?.title, member.pathCue || 'A path has not formed yet'].filter(Boolean).join(' · ')}
            </Text>
          </View>
        ))}
        <PrimaryButton
          label={`Copy invite · ${crew.inviteCode}`}
          onPress={() => Alert.alert('Invite code', crew.inviteCode)}
        />
        <PrimaryButton label="Open Guilds" onPress={() => router.push('/guilds')} />
      </ExperienceShell>
    );
  }

  return (
    <ExperienceShell eyebrow="Crew" title="Form 3–8 people">
      <Text style={{ color: Colors.gray[400] }}>Not the invite ladder. Mixed-faction Crews are valid.</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Crew name" placeholderTextColor={Colors.gray[600]} style={{ color: Colors.white, borderColor: Colors.gray[700], borderWidth: 1, borderRadius: 16, padding: 14 }} />
      <PrimaryButton
        label={createCrew.isPending ? 'Forming…' : 'Form Crew'}
        onPress={() => void createCrew.mutateAsync({ name }).catch((error) => Alert.alert('Could not form a Crew', error.message))}
      />
      <TextInput value={code} onChangeText={setCode} placeholder="CRW-XXXXXX" autoCapitalize="characters" placeholderTextColor={Colors.gray[600]} style={{ color: Colors.white, borderColor: Colors.gray[700], borderWidth: 1, borderRadius: 16, padding: 14 }} />
      <PrimaryButton
        label={joinCrew.isPending ? 'Joining…' : 'Join Crew'}
        onPress={() => void joinCrew.mutateAsync(code).catch((error) => Alert.alert('Could not join', error.message))}
      />
    </ExperienceShell>
  );
}

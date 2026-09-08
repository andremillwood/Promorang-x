import { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';

import { ExperienceShell, PrimaryButton } from '@/components/people/ExperienceShell';
import { Colors } from '@/constants/DesignTokens';
import { useExperienceActions, useMyCrew, useMyGuild } from '@/hooks/usePeopleExperience';

export default function GuildsScreen() {
  const crewQuery = useMyCrew();
  const guildQuery = useMyGuild();
  const { createGuild, joinGuild } = useExperienceActions();
  const [name, setName] = useState('Night Watch');
  const [code, setCode] = useState('');
  const crew = crewQuery.data;
  const guild = guildQuery.data;

  if (guildQuery.isLoading || crewQuery.isLoading) {
    return <ExperienceShell eyebrow="Guild" title="Who coordinates the Scene" />;
  }

  if (!crew) {
    return (
      <ExperienceShell eyebrow="Guild" title="Form a Crew first">
        <Text style={{ color: Colors.gray[400] }}>
          A Guild is 2–6 Crews. Individuals do not join alone.
        </Text>
      </ExperienceShell>
    );
  }

  if (guild) {
    return (
      <ExperienceShell eyebrow="Scene coordination" title={guild.name}>
        <Text style={{ color: Colors.gray[400] }}>{guild.readiness?.line}</Text>
        {(guild.crews || []).map((item: { id: string; name: string; size: number }) => (
          <View key={item.id} style={{ paddingVertical: 10 }}>
            <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '700' }}>{item.name}</Text>
            <Text style={{ color: Colors.gray[500], marginTop: 4 }}>
              {item.size} {item.size === 1 ? 'person' : 'people'}
            </Text>
          </View>
        ))}
        <PrimaryButton
          label={`Copy invite · ${guild.inviteCode}`}
          onPress={() => Alert.alert('Invite code', guild.inviteCode)}
        />
      </ExperienceShell>
    );
  }

  return (
    <ExperienceShell eyebrow="Guild" title="Federate this Crew">
      <Text style={{ color: Colors.gray[400] }}>
        {crew.name} can join 1–5 other Crews. Flat — not an upline.
      </Text>
      <TextInput value={name} onChangeText={setName} placeholder="Guild name" placeholderTextColor={Colors.gray[600]} style={{ color: Colors.white, borderColor: Colors.gray[700], borderWidth: 1, borderRadius: 16, padding: 14 }} />
      <PrimaryButton
        label={createGuild.isPending ? 'Forming…' : 'Form Guild'}
        onPress={() => void createGuild.mutateAsync({ name }).catch((error) => Alert.alert('Could not form a Guild', error.message))}
      />
      <TextInput value={code} onChangeText={setCode} placeholder="GLD-XXXXXX" autoCapitalize="characters" placeholderTextColor={Colors.gray[600]} style={{ color: Colors.white, borderColor: Colors.gray[700], borderWidth: 1, borderRadius: 16, padding: 14 }} />
      <PrimaryButton
        label={joinGuild.isPending ? 'Joining…' : 'Join Guild'}
        onPress={() => void joinGuild.mutateAsync(code).catch((error) => Alert.alert('Could not join', error.message))}
      />
    </ExperienceShell>
  );
}

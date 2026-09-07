import { useState } from 'react';
import { Alert, Share, View } from 'react-native';
import { router } from 'expo-router';

import { ExperienceShell, PrimaryButton, QuietEmpty, StatPile } from '@/components/people/ExperienceShell';
import { WEB_BASE } from '@/lib/api';
import { useExperienceActions, useExperienceNetwork } from '@/hooks/usePeopleExperience';

export default function PeopleScreen() {
  const network = useExperienceNetwork();
  const { invite } = useExperienceActions();
  const [copied, setCopied] = useState(false);
  const data = network.data;

  const handleInvite = async () => {
    try {
      const firstScene = data?.sceneSlug;
      const result = firstScene
        ? await invite.mutateAsync(firstScene)
        : { shareUrl: `${WEB_BASE}/auth?mode=signup` };
      await Share.share({ message: result.shareUrl, url: result.shareUrl });
      setCopied(true);
    } catch (error) {
      Alert.alert('Could not share invite', error instanceof Error ? error.message : 'Try again.');
    }
  };

  return (
    <ExperienceShell
      eyebrow="Your people"
      title="Your network"
      description="Credit follows the people you actually moved — not empty accounts."
    >
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <StatPile label="People" value={data?.people || 0} hint={data?.thisMonth ? `+${data.thisMonth} this month` : 'Start with one invite'} />
        <StatPile label="Brought by you" value={data?.direct || 0} hint={`${data?.throughNetwork || 0} through your network`} />
      </View>
      <PrimaryButton label={copied ? 'Invite shared' : 'Invite someone to build'} onPress={handleInvite} />
      {network.isLoading ? (
        <QuietEmpty title="Loading your people" copy="Seeing who actually showed up." />
      ) : data?.topContributors?.length ? (
        data.topContributors.map((person: any) => (
          <View key={person.id} style={{ borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 16 }}>
            <StatPile
              label={`${person.verifiedActions || 0} verified`}
              value={person.name}
              hint={`${person.people} people · ${person.active} active${person.attributedValue ? ` · J$${Math.round(person.attributedValue).toLocaleString()}` : ''}`}
            />
          </View>
        ))
      ) : (
        <QuietEmpty
          title="No contributors yet"
          copy="When someone in your network starts bringing people who actually do things, they will show up here."
          actionLabel="Give them a reason to join"
          onAction={() => router.push('/give')}
        />
      )}
    </ExperienceShell>
  );
}

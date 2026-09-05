import { ActivityIndicator, Alert, Image, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ExperienceShell, PrimaryButton, QuietEmpty } from '@/components/people/ExperienceShell';
import { Colors } from '@/constants/DesignTokens';
import { useAuth } from '@/context/AuthContext';
import { useExperienceActions, usePublicDrop } from '@/hooks/usePeopleExperience';

export default function DropClaimScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user } = useAuth();
  const drop = usePublicDrop(slug);
  const { claimDrop } = useExperienceActions();
  const data = drop.data;

  const claim = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    try {
      await claimDrop.mutateAsync(slug!);
      Alert.alert('It’s on your PromoCard', 'Show it when you get there.');
      router.replace('/card');
    } catch (error) {
      Alert.alert('Could not claim this', error instanceof Error ? error.message : 'Try again.');
    }
  };

  if (drop.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.black, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (!data) {
    return (
      <ExperienceShell title="This drop is gone">
        <QuietEmpty title="Gone" copy="This perk is no longer available." actionLabel="See what’s happening" onAction={() => router.push('/discover')} />
      </ExperienceShell>
    );
  }

  const remaining = data.remaining;
  const claimed = data.claimedCount || 0;
  const total = remaining == null ? null : remaining + claimed;

  return (
    <ExperienceShell eyebrow={data.creatorName} title="has something for you." backTo="/discover">
      {data.image_url ? <Image source={{ uri: data.image_url }} style={{ height: 180, borderRadius: 24 }} /> : null}
      <Text style={{ color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 2 }}>{String(data.perk_kind || '').replace('_', ' ')}</Text>
      <Text style={{ color: Colors.white, fontSize: 32, fontWeight: '800' }}>{data.title}</Text>
      {data.description ? <Text style={{ color: Colors.gray[400] }}>{data.description}</Text> : null}
      {total != null ? <Text style={{ color: Colors.primary }}>{remaining} / {total} remaining</Text> : null}
      <PrimaryButton
        label={claimDrop.isPending ? 'Claiming…' : user ? 'Claim' : 'Join the network to claim'}
        loading={claimDrop.isPending}
        onPress={claim}
      />
      <Pressable onPress={() => router.push('/discover')}>
        <Text style={{ color: Colors.gray[600], textAlign: 'center' }}>Powered by PROMORANG</Text>
      </Pressable>
    </ExperienceShell>
  );
}

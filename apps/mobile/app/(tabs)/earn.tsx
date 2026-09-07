import { Alert, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ExperienceShell, PrimaryButton, QuietEmpty } from '@/components/people/ExperienceShell';
import { Colors } from '@/constants/DesignTokens';
import { useExperienceActions, useOpportunities } from '@/hooks/usePeopleExperience';
import { WEB_BASE } from '@/lib/api';

export default function EarnScreen() {
  const opportunities = useOpportunities();
  const { takeOpportunity } = useExperienceActions();

  const take = async (id: string) => {
    try {
      const result = await takeOpportunity.mutateAsync({ id });
      Alert.alert('You took it', `A drop is ready for your people.\n${WEB_BASE}/drop/${result.drop.slug}`);
    } catch (error) {
      Alert.alert('Could not take this yet', error instanceof Error ? error.message : 'Try again.');
    }
  };

  return (
    <ExperienceShell
      eyebrow="Earn"
      title="Opportunities"
      description="Get people to try, visit, buy or show up. You earn when the action is verified."
    >
      {opportunities.isLoading ? (
        <QuietEmpty title="Looking for work" copy="Opportunities appear when a merchant, brand or venue wants your people." />
      ) : opportunities.data?.length ? (
        opportunities.data.map((item) => (
          <View key={item.id} style={{ borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 20, backgroundColor: 'rgba(255,255,255,0.04)' }}>
            <Text style={{ color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 2 }}>{item.sourceKind}</Text>
            <Text style={{ color: Colors.white, fontSize: 28, fontWeight: '800', marginTop: 8 }}>{item.title}</Text>
            {item.description ? <Text style={{ color: Colors.gray[400], marginTop: 8 }}>{item.description}</Text> : null}
            <Text style={{ color: Colors.gray[300], marginTop: 12 }}>Your people get · {item.peopleGet}</Text>
            <Text style={{ color: Colors.gray[300], marginTop: 4 }}>You can earn · {item.youEarn}</Text>
            <View style={{ marginTop: 16 }}>
              <PrimaryButton label={takeOpportunity.isPending ? 'Taking…' : 'Take opportunity'} loading={takeOpportunity.isPending} onPress={() => take(item.id)} />
            </View>
          </View>
        ))
      ) : (
        <QuietEmpty
          title="Nothing to earn from right now"
          copy="When a merchant, brand or venue wants your people, the opportunity will land here."
          actionLabel="Put something up yourself"
          onAction={() => router.push('/stock')}
        />
      )}
    </ExperienceShell>
  );
}

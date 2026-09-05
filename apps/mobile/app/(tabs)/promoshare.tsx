import { ActivityIndicator, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { humanActionLabel } from '@promorang/shared';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { QuietEmpty, StatPile } from '@/components/people/ExperienceShell';
import { useWhatHappened } from '@/hooks/usePeopleExperience';

const BUCKETS: Array<[string, string]> = [
  ['went somewhere', 'went'],
  ['bought something', 'bought'],
  ['answered Discoveries', 'answered'],
  ['shared something', 'shared'],
  ['brought friends', 'brought'],
  ['claimed a perk', 'claimed'],
  ['used a perk', 'used'],
];

export default function ProgressScreen() {
  const happened = useWhatHappened();
  const data = happened.data;
  const buckets = data?.buckets || {};

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>WHAT HAPPENED</Text>
      <Text style={styles.title}>This week</Text>
      <Text style={styles.subtitle}>Not charts. What your people actually did.</Text>

      {happened.isLoading ? (
        <View style={styles.state}><ActivityIndicator color={Colors.primary} /></View>
      ) : happened.isError ? (
        <QuietEmpty
          title="Could not load results"
          copy="Try again to see verified movement."
          actionLabel={happened.isFetching ? 'Trying again…' : 'Try again'}
          onAction={() => void happened.refetch()}
        />
      ) : (
        <>
          <StatPile
            label="People participated"
            value={data?.participated || 0}
            hint={data?.earned ? `J$${Math.round(data.earned).toLocaleString()} generated` : 'Verified movement only'}
          />
          <View style={styles.grid}>
            {BUCKETS.map(([label, key]) => (
              <View key={key} style={styles.bucket}>
                <Text style={styles.bucketValue}>{buckets[key] || 0}</Text>
                <Text style={styles.bucketLabel}>{label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Your people are most interested in</Text>
          {data?.topInterests?.length ? (
            <View style={{ gap: 8 }}>
              {data.topInterests.map((interest: string, index: number) => (
                <View key={interest} style={styles.interest}>
                  <Text style={styles.interestText}>{index + 1}. {interest}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.subtitle}>Interest shows up after people start answering and showing up.</Text>
          )}

          <Text style={styles.sectionTitle}>Recent</Text>
          {data?.recent?.length ? (
            <View style={{ gap: 8 }}>
              {data.recent.map((row: any) => (
                <View key={row.id} style={styles.interest}>
                  <Text style={styles.interestText}>{row.actorName || 'Someone'} {humanActionLabel(row.action_type)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <QuietEmpty title="Quiet week" copy="When people claim, show up or answer, it will read like a story here." />
          )}

          <Pressable style={styles.next} onPress={() => router.push('/discover')}>
            <Text style={styles.nextTitle}>Find the next move</Text>
            <Text style={styles.subtitle}>Progress always ends in a decision: invite, improve, or show up again.</Text>
          </Pressable>
        </>
      )}
      <View style={{ height: 110 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  content: { paddingTop: 18, paddingHorizontal: Spacing.container, gap: 16 },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1.1 },
  title: { color: Colors.white, fontSize: Typography.sizes['3xl'], fontWeight: '800', letterSpacing: -1 },
  subtitle: { color: Colors.gray[400], fontSize: 13, lineHeight: 19 },
  state: { minHeight: 180, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bucket: { width: '47%', borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.border, backgroundColor: 'rgba(255,255,255,0.04)', padding: 16 },
  bucketValue: { color: Colors.white, fontSize: 28, fontWeight: '800' },
  bucketLabel: { color: Colors.gray[400], fontSize: 12, marginTop: 4 },
  sectionTitle: { color: Colors.white, fontSize: 22, fontWeight: '800', marginTop: 8 },
  interest: { borderRadius: 18, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 16, paddingVertical: 12 },
  interestText: { color: Colors.white, fontSize: 14 },
  next: { borderRadius: 22, backgroundColor: Colors.primary, padding: 18 },
  nextTitle: { color: Colors.black, fontSize: 20, fontWeight: '800' },
});

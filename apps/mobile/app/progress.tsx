import { WORLD_PATH_TITLES, type WorldPathDimension } from '@promorang/shared';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { ExperienceShell, PrimaryButton } from '@/components/people/ExperienceShell';
import { Colors } from '@/constants/DesignTokens';
import { useWorldProgress } from '@/hooks/usePeopleExperience';

const DIMENSIONS: WorldPathDimension[] = ['discover', 'connect', 'create', 'host', 'keep', 'support'];

export default function ProgressScreen() {
  const query = useWorldProgress();
  const world = query.data?.world;
  const counts = world?.path?.counts || {};

  return (
    <ExperienceShell
      eyebrow={world?.dispatch?.eyebrow || 'Progress'}
      title="What happened because of you"
    >
      <Text style={{ color: Colors.gray[400] }}>
        {world?.path?.forming ? world.path.cue : 'A path has not formed yet. Three matching verified actions first.'}
      </Text>
      {world?.latestReturn ? (
        <Text style={{ color: Colors.white, fontSize: 22, fontWeight: '700' }}>{world.latestReturn.heading}</Text>
      ) : (
        <Text style={{ color: Colors.gray[500] }}>Nothing counted yet. Show up, then come back here.</Text>
      )}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {DIMENSIONS.map((dimension) => (
          <View key={dimension} style={{ width: '30%' }}>
            <Text style={{ color: Colors.gray[500], fontSize: 10 }}>{WORLD_PATH_TITLES[dimension]}</Text>
            <Text style={{ color: Colors.white, fontSize: 22, fontWeight: '700' }}>{counts[dimension] || 0}</Text>
          </View>
        ))}
      </View>
      {world?.polarity?.line ? (
        <Text style={{ color: Colors.gray[400] }}>{world.polarity.line}</Text>
      ) : null}
      {world?.contest?.contestLine ? (
        <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '700' }}>{world.contest.contestLine}</Text>
      ) : null}
      {(world?.territories || []).map((area: { key: string; title: string; state: string }) => (
        <Text key={area.key} style={{ color: Colors.gray[500] }}>
          {area.title} · {area.state}
        </Text>
      ))}
      <PrimaryButton label="Open Crew" onPress={() => router.push('/crews')} />
      <PrimaryButton label="Open Guild" onPress={() => router.push('/guilds')} />
      <PrimaryButton label="Open Vault" onPress={() => router.push('/vault')} />
    </ExperienceShell>
  );
}

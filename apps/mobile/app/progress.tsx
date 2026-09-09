import { presentContestLine, resolveWorldInvitation, WORLD_PATH_TITLES, type WorldPathDimension } from '@promorang/shared';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { ExperienceShell, PrimaryButton } from '@/components/people/ExperienceShell';
import { Colors } from '@/constants/DesignTokens';
import { useWorldProgress } from '@/hooks/usePeopleExperience';

const DIMENSIONS: WorldPathDimension[] = ['discover', 'connect', 'create', 'host', 'keep', 'support'];

export default function ProgressScreen() {
  const query = useWorldProgress();
  const world = query.data?.world;
  const invitation = world?.invitation || world?.worldSystem?.invitation || resolveWorldInvitation({
    identityLine: world?.identity?.line,
    nextHref: '/discover',
  });
  const counts = world?.path?.counts || {};

  return (
    <ExperienceShell
      eyebrow={world?.dispatch?.eyebrow || 'Progress'}
      title="What happened because of you"
    >
      {world?.identity?.line ? (
        <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '700' }}>{world.identity.line}</Text>
      ) : invitation?.formingLine ? (
        <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '700' }}>{invitation.formingLine}</Text>
      ) : null}
      <Text style={{ color: Colors.gray[400] }}>
        {world?.path?.forming ? world.path.cue : 'A path has not formed yet. Three matching verified actions first.'}
      </Text>
      {world?.identity?.influenceLine ? (
        <Text style={{ color: Colors.gray[400] }}>{world.identity.influenceLine}</Text>
      ) : null}
      {world?.worldSystem?.returnChain?.line ? (
        <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '700' }}>{world.worldSystem.returnChain.heading}</Text>
      ) : null}
      {world?.latestReturn ? (
        <Text style={{ color: Colors.white, fontSize: 22, fontWeight: '700' }}>{world.latestReturn.heading}</Text>
      ) : invitation ? (
        <View style={{ gap: 8 }}>
          <Text style={{ color: Colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 2 }}>THIS IS HOW PROMORANG WORKS</Text>
          <Text style={{ color: Colors.white, fontSize: 22, fontWeight: '700' }}>{invitation.headline}</Text>
          <Text style={{ color: Colors.gray[400] }}>{invitation.why}</Text>
          <Text style={{ color: Colors.gray[500] }}>{invitation.benefit}</Text>
          {(invitation.steps || []).map((step: { title: string; line: string }) => (
            <Text key={step.title} style={{ color: Colors.gray[400] }}>
              {step.title} — {step.line}
            </Text>
          ))}
        </View>
      ) : null}
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
      {(world?.contest?.totalCurrent || 0) > 0 ? (
        <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '700' }}>
          {presentContestLine(world.contest.contestLine, world.contest.totalCurrent)}
        </Text>
      ) : null}
      {(world?.territories || []).map((area: { key: string; title: string; state: string }) => (
        <Text key={area.key} style={{ color: Colors.gray[500] }}>
          {area.title} · {area.state}
        </Text>
      ))}
      <PrimaryButton
        label={invitation?.nextLabel || 'Find something worth doing'}
        onPress={() => router.push((invitation?.nextHref || '/discover') as any)}
      />
      <PrimaryButton label="Open Crew" onPress={() => router.push('/crews')} />
      <PrimaryButton label="Open Guild" onPress={() => router.push('/guilds')} />
      <PrimaryButton label="Open Vault" onPress={() => router.push('/vault')} />
    </ExperienceShell>
  );
}

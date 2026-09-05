import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ExperienceShell, QuietEmpty } from '@/components/people/ExperienceShell';
import { PromoCardFace } from '@/components/people/PromoCardFace';
import { Colors } from '@/constants/DesignTokens';
import { useMyPromoCard } from '@/hooks/usePeopleExperience';

export default function CardScreen() {
  const card = useMyPromoCard();
  const data = card.data;

  return (
    <ExperienceShell
      eyebrow="PromoCard"
      title="Your perks live here"
      description="Identity, access, keys, points and claimed drops — one card."
      backTo="/vault"
    >
      <PromoCardFace
        holder={data?.name || 'Member'}
        available={`${Number(data?.points || 0).toLocaleString()} pts`}
        limit={`${Number(data?.keys || 0)} keys`}
        places="Active"
      />
      <View style={{ borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 16 }}>
        <Text style={{ color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 2 }}>ON THE CARD</Text>
        <Text style={{ color: Colors.white, fontSize: 28, fontWeight: '800', marginTop: 8 }}>{Number(data?.points || 0).toLocaleString()} PromoPoints</Text>
        <Text style={{ color: Colors.gray[400], marginTop: 4 }}>{Number(data?.keys || 0)} PromoKeys</Text>
      </View>
      <Text style={{ color: Colors.white, fontSize: 22, fontWeight: '800' }}>Active</Text>
      {data?.perks?.length ? (
        data.perks.map((perk: any) => (
          <View key={perk.id} style={{ borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 16 }}>
            <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '800' }}>{perk.title}</Text>
            {perk.detail ? <Text style={{ color: Colors.gray[400], marginTop: 4 }}>{perk.detail}</Text> : null}
          </View>
        ))
      ) : (
        <QuietEmpty title="No perks yet" copy="When someone drops something for you, it lands here." />
      )}
      <Text style={{ color: Colors.white, fontSize: 22, fontWeight: '800' }}>Memberships</Text>
      {data?.memberships?.length ? (
        data.memberships.map((item: any) => (
          <Pressable key={item.id} onPress={() => router.push(item.slug ? `/scene/${item.slug}` as any : '/scenes')}>
            <View style={{ borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 16 }}>
              <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '800' }}>{item.title}</Text>
              <Text style={{ color: Colors.gray[500], marginTop: 4 }}>{item.role}</Text>
            </View>
          </Pressable>
        ))
      ) : (
        <QuietEmpty title="No communities yet" copy="Find a room that feels like yours." actionLabel="Find a community" onAction={() => router.push('/scenes')} />
      )}
    </ExperienceShell>
  );
}

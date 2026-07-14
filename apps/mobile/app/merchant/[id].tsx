import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/DesignTokens';
import { supabase } from '@/lib/supabase';

const offerLabel = (x: any) => x.discount_value ? `${x.discount_value}${x.discount_type === 'percentage' ? '%' : ''} off` : null;

export default function MerchantStore() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('view_public_commerce_directory')
      .select('*')
      .eq('merchant_user_id', id)
      .eq('is_active', true)
      .eq('visibility', 'public')
      .then(({ data }) => { setItems(data || []); setLoading(false); });
  }, [id]);

  const sorted = useMemo(() => [...items].sort((a, b) => {
    const ar = a.discount_value ? 0 : a.fulfillment_mode === 'booking' ? 1 : 2;
    const br = b.discount_value ? 0 : b.fulfillment_mode === 'booking' ? 1 : 2;
    return ar - br;
  }), [items]);
  const merchant = sorted[0];
  const offers = sorted.filter((x) => x.discount_value).length;

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Pressable onPress={() => router.back()} style={s.back}><Ionicons name="arrow-back" size={20} color="white" /></Pressable>
      <View style={s.hero}>
        <Text style={s.eyebrow}>PROMORANG STOREFRONT</Text>
        <Text style={s.title}>{merchant?.merchant_name || 'Local merchant'}</Text>
        <Text style={s.sub}>Products, services and offers connected to the Moments around this merchant.</Text>
        <View style={s.chips}>
          <Chip icon="pricetag" text={`${offers} offers`} />
          <Chip icon="bag-handle" text={`${sorted.length} listings`} />
        </View>
      </View>
      {loading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} /> : sorted.map((x) => (
        <Pressable key={x.listing_id} onPress={() => router.push(`/product/${x.source_id}` as any)} style={s.card}>
          {x.image_url ? <Image source={{ uri: x.image_url }} style={s.image} /> : <View style={s.image} />}
          <View style={s.copy}>
            <Text style={s.kind}>{offerLabel(x) || x.listing_kind?.toUpperCase() || 'PRODUCT'}</Text>
            <Text style={s.name}>{x.name}</Text>
            <Text style={s.meta}>{x.fulfillment_mode || 'pickup'} · {typeof x.price === 'number' ? `${x.price.toLocaleString()} Gems` : 'Open'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.gray[500]} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

function Chip({ icon, text }: { icon: any; text: string }) {
  return <View style={s.chip}><Ionicons name={icon} size={13} color={Colors.primary} /><Text style={s.chipText}>{text}</Text></View>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  content: { padding: 16, paddingBottom: 80 },
  back: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1d1d1d', alignItems: 'center', justifyContent: 'center' },
  hero: { marginTop: 14, padding: 24, borderRadius: 28, backgroundColor: '#15110f', borderWidth: 1, borderColor: 'rgba(255,106,26,.22)' },
  eyebrow: { fontFamily: 'SpaceMono', fontSize: 9, color: Colors.primary, letterSpacing: 1 },
  title: { color: 'white', fontSize: 38, fontWeight: '900', letterSpacing: -1.2, marginTop: 9 },
  sub: { color: 'rgba(255,255,255,.55)', lineHeight: 20, marginTop: 9 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, backgroundColor: 'transparent' },
  chip: { flexDirection: 'row', gap: 6, alignItems: 'center', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: 'rgba(255,255,255,.08)' },
  chipText: { color: 'white', fontSize: 10, fontWeight: '900' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 12, borderRadius: 20, backgroundColor: '#131313', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', marginTop: 12 },
  image: { width: 78, height: 78, borderRadius: 15, backgroundColor: '#242424' },
  copy: { flex: 1 },
  kind: { fontFamily: 'SpaceMono', fontSize: 8, color: Colors.primary },
  name: { color: 'white', fontSize: 16, fontWeight: '800', marginTop: 5 },
  meta: { color: 'rgba(255,255,255,.5)', fontSize: 12, marginTop: 4, textTransform: 'capitalize' },
});

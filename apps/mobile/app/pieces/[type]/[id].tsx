import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '@/constants/DesignTokens';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { API_BASE } from '@/lib/api';

export default function PieceDetail() {
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<any>();
  const [listings, setListings] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [mode, setMode] = useState<'buy' | 'sell' | 'manage'>('buy');
  const [buyQuantity, setBuyQuantity] = useState('1');
  const [sellQuantity, setSellQuantity] = useState('1');
  const [sellPrice, setSellPrice] = useState('');

  const token = async () => (await supabase.auth.getSession()).data.session?.access_token || '';
  const owned = useMemo(() => positions.find((x) => x.piece_type === type && x.asset_id === id), [positions, type, id]);

  const load = async () => {
    if (!id || !type) return;
    setLoading(true);
    const authToken = await token();
    const statsPromise = type === 'content'
      ? supabase.from('content_piece_stats').select('*,content_items:content_id(*)').eq('content_id', id).maybeSingle()
      : Promise.resolve({ data: null });
    const [stats, book, portfolio] = await Promise.all([
      statsPromise,
      fetch(`${API_BASE}/api/pieces/${type}/${id}/listings`).then((r) => r.json()).catch(() => ({})),
      authToken ? fetch(`${API_BASE}/api/pieces/portfolio/me`, { headers: { Authorization: `Bearer ${authToken}` } }).then((r) => r.json()).catch(() => ({})) : Promise.resolve({}),
    ]);
    setData(stats.data);
    setListings(book.sell_listings || []);
    setBids(book.buy_listings || []);
    setPositions(portfolio.positions || []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [id, type]);

  const request = async (path: string, options: RequestInit) => {
    const authToken = await token();
    if (!authToken) throw new Error('Sign in required');
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Request failed');
    return result;
  };

  const buy = async (listing: any) => {
    setBusy(`buy:${listing.id}`);
    try {
      const quantity = Math.min(Number(buyQuantity), Number(listing.quantity));
      if (!quantity || quantity <= 0) throw new Error('Enter a valid quantity');
      await request(`/api/pieces/${type}/${id}/buy`, {
        method: 'POST',
        headers: { 'Idempotency-Key': `mobile-piece:${listing.id}:${Date.now()}` },
        body: JSON.stringify({ listing_id: listing.id, quantity, max_price: listing.price_per_piece }),
      });
      Alert.alert('Piece acquired', `${quantity} Piece${quantity === 1 ? '' : 's'} added to your portfolio.`);
      await load();
    } catch (error: any) {
      Alert.alert('Trade not completed', error.message);
    } finally {
      setBusy('');
    }
  };

  const sell = async () => {
    setBusy('sell');
    try {
      const quantity = Number(sellQuantity);
      const min_price = Number(sellPrice);
      if (!quantity || quantity <= 0) throw new Error('Enter a valid quantity');
      if (!min_price || min_price <= 0) throw new Error('Enter a valid Gem price');
      if (owned && quantity > Number(owned.pieces_owned)) throw new Error('You do not own enough Pieces');
      await request(`/api/pieces/${type}/${id}/sell`, {
        method: 'POST',
        body: JSON.stringify({ quantity, min_price }),
      });
      setSellQuantity('1');
      setSellPrice('');
      Alert.alert('Listing opened', `${quantity} Pieces listed at ${min_price.toFixed(2)} Gems.`);
      await load();
    } catch (error: any) {
      Alert.alert('Listing not created', error.message);
    } finally {
      setBusy('');
    }
  };

  const cancel = async (listingId: string) => {
    setBusy(`cancel:${listingId}`);
    try {
      await request(`/api/pieces/listings/${listingId}`, { method: 'DELETE' });
      Alert.alert('Listing cancelled', 'Escrowed Pieces returned to your position.');
      await load();
    } catch (error: any) {
      Alert.alert('Cancel failed', error.message);
    } finally {
      setBusy('');
    }
  };

  if (loading) return <View style={s.state}><ActivityIndicator color={Colors.primary} /></View>;
  if (!data) return <View style={s.state}><Text style={s.title}>Piece unavailable</Text><Pressable onPress={() => router.back()}><Text style={s.link}>Go back</Text></Pressable></View>;

  const content = data.content_items || {};
  const mine = listings.filter((x) => x.seller_id === user?.id);

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Pressable onPress={() => router.back()} style={s.back}><Ionicons name="arrow-back" size={20} color="white" /></Pressable>
      <ImageBackground source={content.media_url ? { uri: content.media_url } : undefined} style={s.hero} imageStyle={s.radius}>
        <View style={s.shade} />
        <View style={s.heroCopy}>
          <Text style={s.eyebrow}>{String(type || 'content').toUpperCase()} PIECE</Text>
          <Text style={s.heroTitle}>{content.title || 'Piece profile'}</Text>
          <Text style={s.desc}>{content.description || 'Own a measurable piece of the momentum around this content.'}</Text>
        </View>
      </ImageBackground>

      <View style={s.metrics}>
        <Metric label="Price" value={`${Number(data.current_price || 0).toFixed(2)} Gems`} />
        <Metric label="24h" value={`${Number(data.change_24h || 0) >= 0 ? '+' : ''}${Number(data.change_24h || 0).toFixed(1)}%`} />
        <Metric label="Owned" value={String(Number(owned?.pieces_owned || 0))} />
      </View>

      <View style={s.tabs}>
        {(['buy', 'sell', 'manage'] as const).map((x) => (
          <Pressable key={x} onPress={() => setMode(x)} style={[s.tab, mode === x && s.tabActive]}>
            <Text style={[s.tabText, mode === x && s.tabTextActive]}>{x.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      {mode === 'buy' ? (
        <View style={s.panel}>
          <Text style={s.panelTitle}>Available now</Text>
          <Input label="Buy quantity" value={buyQuantity} onChangeText={setBuyQuantity} />
          {listings.length ? listings.slice(0, 6).map((x) => (
            <View key={x.id} style={s.listing}>
              <View><Text style={s.listingPrice}>{Number(x.price_per_piece).toFixed(2)} Gems</Text><Text style={s.muted}>{x.quantity} available</Text></View>
              <Pressable disabled={!!busy} onPress={() => buy(x)} style={s.buy}>{busy === `buy:${x.id}` ? <ActivityIndicator size="small" color={Colors.black} /> : <Text style={s.buyText}>Buy</Text>}</Pressable>
            </View>
          )) : <Text style={s.panelText}>No one is offering this Piece yet.</Text>}
          {bids.length ? <Text style={s.panelText}>Best bid: {Number(bids[0].price_per_piece).toFixed(2)} Gems</Text> : null}
        </View>
      ) : null}

      {mode === 'sell' ? (
        <View style={s.panel}>
          <Text style={s.panelTitle}>List Pieces</Text>
          <Text style={s.panelText}>You own {Number(owned?.pieces_owned || 0)} Pieces in this asset.</Text>
          <Input label="Pieces to list" value={sellQuantity} onChangeText={setSellQuantity} />
          <Input label="Gem price per Piece" value={sellPrice} onChangeText={setSellPrice} placeholder="12.50" />
          <Pressable disabled={busy === 'sell' || !owned} onPress={sell} style={[s.primary, (!owned || busy === 'sell') && s.disabled]}>
            {busy === 'sell' ? <ActivityIndicator color={Colors.black} /> : <Text style={s.primaryText}>Open listing</Text>}
          </Pressable>
        </View>
      ) : null}

      {mode === 'manage' ? (
        <View style={s.panel}>
          <Text style={s.panelTitle}>Your active listings</Text>
          {mine.length ? mine.map((x) => (
            <View key={x.id} style={s.listing}>
              <View><Text style={s.listingPrice}>{Number(x.price_per_piece).toFixed(2)} Gems</Text><Text style={s.muted}>{x.quantity} listed</Text></View>
              <Pressable disabled={!!busy} onPress={() => cancel(x.id)} style={s.cancel}>{busy === `cancel:${x.id}` ? <ActivityIndicator size="small" color="white" /> : <Text style={s.cancelText}>Cancel</Text>}</Pressable>
            </View>
          )) : <Text style={s.panelText}>No active listings from your portfolio yet.</Text>}
        </View>
      ) : null}
    </ScrollView>
  );
}

function Input({ label, ...props }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string }) {
  return <View style={s.inputWrap}><Text style={s.inputLabel}>{label}</Text><TextInput keyboardType="decimal-pad" placeholderTextColor="rgba(255,255,255,.32)" style={s.input} {...props} /></View>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={s.metric}><Text style={s.metricValue}>{value}</Text><Text style={s.metricLabel}>{label}</Text></View>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  content: { padding: 16, paddingBottom: 80 },
  state: { flex: 1, backgroundColor: Colors.black, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { color: 'white', fontSize: 24, fontWeight: '900' },
  link: { color: Colors.primary },
  back: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1d1d1d', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  hero: { height: 390, justifyContent: 'flex-end', padding: 20, backgroundColor: '#171717' },
  radius: { borderRadius: 28 },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.48)', borderRadius: 28 },
  heroCopy: { backgroundColor: 'transparent' },
  eyebrow: { fontFamily: 'SpaceMono', color: '#C4B5FD', fontSize: 10, letterSpacing: 1 },
  heroTitle: { color: 'white', fontSize: 38, lineHeight: 40, fontWeight: '900', letterSpacing: -1.2, marginTop: 9 },
  desc: { color: 'rgba(255,255,255,.65)', fontSize: 13, lineHeight: 20, marginTop: 9 },
  metrics: { flexDirection: 'row', gap: 1, backgroundColor: 'rgba(255,255,255,.12)', borderRadius: 20, overflow: 'hidden', marginTop: 13 },
  metric: { flex: 1, backgroundColor: '#15121d', padding: 15 },
  metricValue: { color: 'white', fontSize: 16, fontWeight: '900' },
  metricLabel: { color: 'rgba(255,255,255,.4)', fontSize: 9, textTransform: 'uppercase', marginTop: 3 },
  tabs: { flexDirection: 'row', gap: 8, backgroundColor: '#101010', borderRadius: 18, padding: 5, marginTop: 13 },
  tab: { flex: 1, borderRadius: 14, paddingVertical: 10, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { color: 'rgba(255,255,255,.52)', fontSize: 11, fontWeight: '900' },
  tabTextActive: { color: Colors.black },
  panel: { marginTop: 13, borderRadius: 22, backgroundColor: '#131313', borderWidth: 1, borderColor: 'rgba(255,255,255,.09)', padding: 18 },
  panelTitle: { color: 'white', fontSize: 20, fontWeight: '900' },
  panelText: { color: 'rgba(255,255,255,.55)', fontSize: 13, lineHeight: 20, marginTop: 8 },
  listing: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,.08)' },
  listingPrice: { color: 'white', fontWeight: '900' },
  muted: { color: 'rgba(255,255,255,.4)', fontSize: 10, marginTop: 2 },
  buy: { backgroundColor: Colors.primary, borderRadius: 15, paddingHorizontal: 18, paddingVertical: 10, minWidth: 70, alignItems: 'center' },
  buyText: { color: Colors.black, fontWeight: '900' },
  cancel: { backgroundColor: '#2b1010', borderRadius: 15, paddingHorizontal: 18, paddingVertical: 10, minWidth: 78, alignItems: 'center' },
  cancelText: { color: 'white', fontWeight: '900' },
  inputWrap: { marginTop: 12 },
  inputLabel: { color: 'rgba(255,255,255,.5)', fontSize: 10, textTransform: 'uppercase', marginBottom: 7, fontWeight: '900' },
  input: { color: 'white', borderRadius: 16, backgroundColor: '#0b0b0b', borderWidth: 1, borderColor: 'rgba(255,255,255,.1)', paddingHorizontal: 14, paddingVertical: 12 },
  primary: { marginTop: 14, backgroundColor: Colors.primary, borderRadius: 16, alignItems: 'center', paddingVertical: 13 },
  primaryText: { color: Colors.black, fontWeight: '900' },
  disabled: { opacity: 0.45 },
});

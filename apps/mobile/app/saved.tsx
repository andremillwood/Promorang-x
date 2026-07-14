import { useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { useSavedObjects, type SavedObject, type SavedObjectType } from '@/hooks/useSavedObjects';

type SavedLane = 'all' | 'moments' | 'actions' | 'value' | 'people';
type SavedCard = {
  id: string;
  savedId?: string;
  objectType: SavedObjectType;
  lane: Exclude<SavedLane, 'all'>;
  title: string;
  meta: string;
  image: string;
  signal: string;
  metadata?: Record<string, unknown>;
};
const fallbackSavedImage = 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=800&q=85';

const laneFor = (type: SavedObjectType): Exclude<SavedLane, 'all'> => {
  if (type === 'moment' || type === 'scene') return 'moments';
  if (type === 'creator' || type === 'merchant') return 'people';
  if (type === 'product' || type === 'offer' || type === 'piece') return 'value';
  return 'actions';
};

const signalFor = (type: SavedObjectType) => {
  if (type === 'product' || type === 'offer') return 'Redeem or buy';
  if (type === 'piece') return 'Value object';
  if (type === 'mission' || type === 'campaign' || type === 'content') return 'Action';
  if (type === 'creator' || type === 'merchant' || type === 'scene') return 'Follow return';
  return 'Saved';
};

const labelFor = (type: SavedObjectType) => {
  if (type === 'product') return 'offer';
  if (type === 'merchant') return 'place';
  return type;
};

const cardFromSaved = (item: SavedObject): SavedCard => ({
  id: item.object_id,
  savedId: item.id,
  objectType: item.object_type,
  lane: laneFor(item.object_type),
  title: item.title,
  meta: item.subtitle || 'Saved for later',
  image: item.image_url || fallbackSavedImage,
  signal: signalFor(item.object_type),
  metadata: item.metadata,
});

const openSaved = (item: SavedCard) => {
  const href = typeof item.metadata?.href === 'string' ? item.metadata.href : null;
  if (href?.startsWith('/')) {
    router.push(href as any);
    return;
  }
  switch (item.objectType) {
    case 'moment':
      router.push(`/moment/${item.id}` as any);
      break;
    case 'product':
      router.push(`/product/${item.id}` as any);
      break;
    case 'merchant':
      router.push(`/merchant/${item.id}` as any);
      break;
    case 'piece':
      router.push(`/pieces/${String(item.metadata?.piece_type || item.metadata?.type || 'moment')}/${item.id}` as any);
      break;
    case 'offer':
      router.push('/shop');
      break;
    default:
      router.push({ pathname: '/search', params: { type: item.objectType, q: item.title } } as any);
  }
};

export default function SavedScreen() {
  const [filter, setFilter] = useState<SavedLane>('all');
  const { items, loading, error, refresh, remove } = useSavedObjects();
  const source = items.map(cardFromSaved);
  const visible = source.filter((item) => filter === 'all' || item.lane === filter);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" style={styles.back} onPress={() => router.back()}><Ionicons name="arrow-back" size={21} color={Colors.white} /></Pressable>
        <View style={styles.heading}><Text style={styles.eyebrow}>YOUR LIBRARY</Text><Text style={styles.title}>Saved</Text></View>
        <Pressable accessibilityLabel="Search saved items" style={styles.search} onPress={() => router.push('/search')}><Ionicons name="search" size={20} color={Colors.white} /></Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Keep the culture you want to return to. Saving is private.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {([['all', 'Everything'], ['moments', 'Moments'], ['actions', 'Actions'], ['value', 'Value'], ['people', 'People']] as const).map(([id, label]) => (
            <Pressable key={id} style={[styles.filter, filter === id && styles.filterActive]} onPress={() => setFilter(id)}><Text style={[styles.filterText, filter === id && styles.filterTextActive]}>{label}</Text></Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionRow}><Text style={styles.sectionTitle}>{filter === 'all' ? 'Saved for later' : filter}</Text><Text style={styles.count}>{visible.length} objects</Text></View>
        {loading ? (
          <View style={styles.empty}><ActivityIndicator color={Colors.primary} /><Text style={styles.emptyDetail}>Opening your library…</Text></View>
        ) : visible.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Ionicons name="bookmark-outline" size={29} color={Colors.primary} /></View>
            <Text style={styles.emptyTitle}>Nothing saved in this lane.</Text>
            <Text style={styles.emptyDetail}>Save moments, action prompts, and creators when you want an easy path back.</Text>
            <Pressable style={styles.emptyAction} onPress={() => router.replace('/discover')}><Text style={styles.emptyActionText}>Explore what is live</Text><Ionicons name="arrow-forward" size={16} color={Colors.black} /></Pressable>
          </View>
        ) : visible.map((item) => (
          <Pressable key={`${item.objectType}-${item.id}`} style={styles.card} onPress={() => openSaved(item)}>
            <ImageBackground source={{ uri: item.image }} style={styles.image} imageStyle={styles.imageRadius}>
              <View style={styles.shade} />
              <View style={styles.cardTop}>
                <View style={styles.typePill}><Text style={styles.typeText}>{labelFor(item.objectType).toUpperCase()}</Text></View>
                <Pressable accessibilityLabel={`Remove ${item.title} from saved`} style={styles.bookmark} onPress={(event) => { event.stopPropagation(); if (item.savedId) remove(item.savedId).catch((removeError) => Alert.alert('Could not update saved', removeError.message || 'Please try again.')); }}><Ionicons name="bookmark" size={18} color={Colors.primary} /></Pressable>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.signal}>{item.signal}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.cardMetaRow}><Text style={styles.cardMeta}>{item.meta}</Text><Ionicons name="arrow-forward" size={17} color={Colors.white} /></View>
              </View>
            </ImageBackground>
          </Pressable>
        ))}

        {error && <Pressable style={styles.syncWarning} onPress={refresh}><Ionicons name="cloud-offline-outline" size={18} color={Colors.warning} /><Text style={styles.syncWarningText}>Saved sync is unavailable. Tap to retry.</Text></Pressable>}

        <View style={styles.collection}>
          <View style={styles.collectionIcon}><Ionicons name="folder-open" size={21} color={Colors.primary} /></View>
          <View style={styles.collectionCopy}><Text style={styles.collectionTitle}>Make a collection</Text><Text style={styles.collectionDetail}>Group saved objects around a trip, scene or plan.</Text></View>
          <Ionicons name="add-circle-outline" size={22} color={Colors.gray[400]} />
        </View>
        <View style={{ height: 45 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: Spacing.container, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, backgroundColor: Colors.black },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  heading: { flex: 1, marginLeft: 13, backgroundColor: 'transparent' },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: 1 },
  title: { color: Colors.white, fontSize: Typography.sizes['2xl'], fontWeight: '800', letterSpacing: -.7, marginTop: 2 },
  search: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  content: { paddingHorizontal: Spacing.container, paddingTop: 17 },
  intro: { color: Colors.gray[400], fontSize: 12, lineHeight: 18, maxWidth: 300 },
  filters: { gap: 7, paddingVertical: 16 },
  filter: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 17, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  filterActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.gray[400], fontSize: 10, fontWeight: '700' },
  filterTextActive: { color: Colors.black },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11, backgroundColor: 'transparent' },
  sectionTitle: { color: Colors.white, fontSize: 17, fontWeight: '800', textTransform: 'capitalize' },
  count: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 9 },
  card: { height: 260, marginBottom: 12, borderRadius: BorderRadius['2xl'], overflow: 'hidden', backgroundColor: Colors.gray[900] },
  image: { flex: 1, padding: 14, justifyContent: 'space-between' },
  imageRadius: { borderRadius: BorderRadius['2xl'] },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.38)' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent' },
  typePill: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 15, backgroundColor: 'rgba(8,8,8,.72)' },
  typeText: { color: Colors.white, fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: .7 },
  bookmark: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(8,8,8,.72)', alignItems: 'center', justifyContent: 'center' },
  cardBottom: { backgroundColor: 'transparent' },
  signal: { color: Colors.accent, fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: .6, textTransform: 'uppercase' },
  cardTitle: { color: Colors.white, fontSize: 23, fontWeight: '800', letterSpacing: -.6, marginTop: 5 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 7, backgroundColor: 'transparent' },
  cardMeta: { color: Colors.gray[200], fontSize: 10, flex: 1 },
  empty: { alignItems: 'center', padding: 28, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  emptyIcon: { width: 56, height: 56, borderRadius: 19, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: Colors.white, fontSize: 17, fontWeight: '800', marginTop: 14 },
  emptyDetail: { color: Colors.gray[400], fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 6, maxWidth: 280 },
  emptyAction: { flexDirection: 'row', gap: 7, alignItems: 'center', paddingHorizontal: 15, paddingVertical: 11, borderRadius: 19, backgroundColor: Colors.primary, marginTop: 17 },
  emptyActionText: { color: Colors.black, fontSize: 11, fontWeight: '800' },
  collection: { flexDirection: 'row', alignItems: 'center', padding: 15, marginTop: 4, borderRadius: BorderRadius.xl, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.gray[600], backgroundColor: 'transparent' },
  collectionIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  collectionCopy: { flex: 1, backgroundColor: 'transparent' },
  collectionTitle: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  collectionDetail: { color: Colors.gray[500], fontSize: 9, marginTop: 3 },
  syncWarning: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 13, marginTop: 10, borderRadius: BorderRadius.lg, backgroundColor: 'rgba(242,184,75,.08)', borderWidth: 1, borderColor: 'rgba(242,184,75,.2)' },
  syncWarningText: { color: Colors.gray[300], fontSize: 9, lineHeight: 14, flex: 1 },
});

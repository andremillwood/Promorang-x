import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { useMoments, type Moment } from '@/hooks/useMoments';
import { useSavedObjects } from '@/hooks/useSavedObjects';

const LENSES = [
  { id: 'eat', label: 'Eat well', detail: 'Food, tastings, spots worth the trip', keywords: ['food', 'eat', 'taste', 'restaurant', 'cook', 'drink'] },
  { id: 'go_out', label: 'Go out', detail: 'Music, shows, what’s heating up', keywords: ['music', 'night', 'club', 'live', 'party', 'bar'] },
  { id: 'hang', label: 'Hang', detail: 'People, workshops, midweek lymes', keywords: ['community', 'workshop', 'gather', 'people', 'hang'] },
  { id: 'try', label: 'Try something new', detail: 'Hidden finds the city hasn’t unlocked yet', keywords: ['new', 'try', 'hidden', 'first', 'drop'] },
] as const;

const fallbackImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85';

export default function DiscoverScreen() {
  const [lens, setLens] = useState<(typeof LENSES)[number]['id'] | null>(null);
  const [query, setQuery] = useState('');
  const { moments, loading, error } = useMoments();
  const { isSaved, toggle } = useSavedObjects();

  const visibleMoments = useMemo(() => {
    const selected = LENSES.find((item) => item.id === lens);
    return moments.filter((moment) => {
      const haystack = `${moment.title} ${moment.location} ${moment.description} ${moment.type}`.toLowerCase();
      const matchesQuery = !query.trim() || haystack.includes(query.toLowerCase());
      const matchesLens = !selected || selected.keywords.some((word) => haystack.includes(word));
      return matchesQuery && matchesLens;
    });
  }, [moments, query, lens]);

  const featuredMoment = visibleMoments[0];
  const moreMoments = visibleMoments.slice(1);
  const namedIntent = query.trim().length > 0;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>YOUR PATH</Text>
            <Text style={styles.title}>Find what’s for you</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable accessibilityLabel="Browse Scenes" style={styles.mapIcon} onPress={() => router.push('/scenes')}>
              <Ionicons name="people-outline" size={21} color={Colors.primary} />
            </Pressable>
            <Pressable accessibilityLabel="Open map" style={styles.mapIcon} onPress={() => router.push('/search' as any)}>
              <Ionicons name="map-outline" size={21} color={Colors.white} />
            </Pressable>
          </View>
        </View>
        <Text style={styles.copy}>Name what you want, then we show the matching Moment — not a pile of leftover polls.</Text>
        <View style={styles.search}>
          <Ionicons name="search" size={19} color={Colors.gray[400]} />
          <TextInput
            value={query}
            onChangeText={(value) => {
              setQuery(value);
              if (value.trim()) setLens(null);
            }}
            placeholder="Food tonight, a lyme, somewhere new…"
            placeholderTextColor={Colors.gray[500]}
            style={styles.input}
          />
          {query.length > 0 && (
            <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.gray[500]} />
            </Pressable>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.lenses}>
          {LENSES.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => {
                setLens(item.id === lens ? null : item.id);
                setQuery('');
              }}
              style={[styles.lens, lens === item.id && styles.lensActive]}
            >
              <Text style={[styles.lensLabel, lens === item.id && styles.lensLabelActive]}>{item.label}</Text>
              <Text style={[styles.lensDetail, lens === item.id && styles.lensDetailActive]}>{item.detail}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.ask} onPress={() => router.push('/post?intent=answer' as any)}>
          <Ionicons name="help-circle" size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.askTitle}>Ask your people</Text>
            <Text style={styles.askCopy}>Don’t dump polls. Ask one live question.</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </Pressable>

        {loading && moments.length === 0 ? (
          <View style={styles.state}><ActivityIndicator color={Colors.primary} /><Text style={styles.stateText}>Finding what matches…</Text></View>
        ) : error && moments.length === 0 ? (
          <View style={styles.state}>
            <Ionicons name="cloud-offline-outline" size={38} color={Colors.gray[500]} />
            <Text style={styles.stateTitle}>Discovery could not refresh</Text>
            <Text style={styles.stateText}>Check back in a moment or search for a specific scene.</Text>
          </View>
        ) : visibleMoments.length === 0 ? (
          <View style={styles.state}>
            <Ionicons name="compass-outline" size={38} color={Colors.gray[500]} />
            <Text style={styles.stateTitle}>{namedIntent || lens ? 'Nothing matches that yet' : 'Nothing in this lane yet'}</Text>
            <Text style={styles.stateText}>Try another want, or create the next Moment worth showing up for.</Text>
            <Pressable style={styles.stateAction} onPress={() => router.push('/post')}><Text style={styles.stateActionText}>Create something</Text></Pressable>
          </View>
        ) : (
          <>
            <View style={styles.sectionRow}>
              <View>
                <Text style={styles.sectionKicker}>{namedIntent ? `MATCHING “${query.trim().toUpperCase()}”` : lens ? LENSES.find((item) => item.id === lens)?.label.toUpperCase() : 'CHOSEN FOR RIGHT NOW'}</Text>
                <Text style={styles.sectionTitle}>Step into the Scene</Text>
              </View>
              <Text style={styles.resultCount}>{visibleMoments.length} live</Text>
            </View>
            <MomentCard
              moment={featuredMoment}
              featured
              saved={isSaved('moment', featuredMoment.id)}
              onSave={() => toggle({ object_type: 'moment', object_id: featuredMoment.id, title: featuredMoment.title, subtitle: featuredMoment.location, image_url: featuredMoment.image_url || null, metadata: { type: featuredMoment.type, href: `/moment/${featuredMoment.id}` } })}
            />
            {moreMoments.length > 0 && (
              <>
                <View style={styles.railHeading}>
                  <View>
                    <Text style={styles.sectionKicker}>MORE WAYS IN</Text>
                    <Text style={styles.railTitle}>Tonight, nearby, and worth knowing</Text>
                  </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.posterRail}>
                  {moreMoments.map((moment) => <CompactMomentCard key={moment.id} moment={moment} />)}
                </ScrollView>
              </>
            )}
          </>
        )}
        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

function CompactMomentCard({ moment }: { moment: Moment }) {
  return (
    <Pressable accessibilityRole="button" style={styles.posterCard} onPress={() => router.push(`/moment/${moment.id}` as any)}>
      <ImageBackground source={{ uri: moment.image_url || fallbackImage }} style={styles.posterImage} imageStyle={styles.posterImageRadius}>
        <View style={styles.posterShade} />
        <View style={styles.posterCopy}>
          <Text style={styles.posterLocation} numberOfLines={1}>{moment.location || 'PROMORANG'}</Text>
          <Text style={styles.posterTitle} numberOfLines={3}>{moment.title}</Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

function MomentCard({ moment, featured, saved, onSave }: { moment: Moment; featured: boolean; saved: boolean; onSave: () => Promise<unknown> }) {
  return (
    <Pressable accessibilityRole="button" style={[styles.card, featured && styles.cardFeatured]} onPress={() => router.push(`/moment/${moment.id}` as any)}>
      <ImageBackground source={{ uri: moment.image_url || fallbackImage }} style={styles.image} imageStyle={styles.imageRadius}>
        <View style={styles.shade} />
        <View style={styles.cardTop}>
          <View style={styles.contextPill}><View style={styles.liveDot} /><Text style={styles.contextText}>{featured ? 'LIVE NOW' : moment.type.toUpperCase()}</Text></View>
          <Pressable accessibilityLabel={saved ? 'Remove saved moment' : 'Save moment'} style={styles.save} onPress={(event) => { event.stopPropagation(); onSave().catch((error) => Alert.alert('Could not update saved', error.message || 'Please try again.')); }}>
            <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={saved ? Colors.primary : Colors.white} />
          </Pressable>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.location}>{moment.location || 'Near you'}</Text>
          <Text style={styles.cardTitle}>{moment.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{moment.description || 'Show up, meet the Scene, and see what opens next.'}</Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  header: { paddingTop: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, backgroundColor: Colors.black },
  headerRow: { paddingHorizontal: Spacing.container, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerActions: { flexDirection: 'row', gap: 8 },
  eyebrow: { color: Colors.primary, fontSize: 12, fontFamily: 'SpaceMono', letterSpacing: 1.1 },
  title: { color: Colors.white, fontSize: Typography.sizes['3xl'], fontWeight: '800', letterSpacing: -1, marginTop: 3 },
  copy: { color: Colors.gray[400], fontSize: 13, lineHeight: 19, marginTop: 10, paddingHorizontal: Spacing.container },
  mapIcon: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900], alignItems: 'center', justifyContent: 'center' },
  search: { marginHorizontal: Spacing.container, marginTop: 16, height: 47, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900], flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: { color: Colors.white, fontSize: 14, flex: 1, height: '100%' },
  lenses: { paddingHorizontal: Spacing.container, paddingTop: 13, gap: 8 },
  lens: { width: 170, padding: 12, borderRadius: 18, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  lensActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  lensLabel: { color: Colors.white, fontSize: 14, fontWeight: '800' },
  lensLabelActive: { color: Colors.black },
  lensDetail: { color: Colors.gray[400], fontSize: 11, marginTop: 4 },
  lensDetailActive: { color: 'rgba(0,0,0,0.7)' },
  content: { padding: Spacing.container, gap: 14 },
  ask: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900] },
  askTitle: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  askCopy: { color: Colors.gray[400], fontSize: 12, marginTop: 2 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionKicker: { color: Colors.primary, fontSize: 11, fontFamily: 'SpaceMono', letterSpacing: 0.9, marginBottom: 4 },
  sectionTitle: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  resultCount: { color: Colors.gray[500], fontSize: 13, fontFamily: 'SpaceMono' },
  card: { height: 330, borderRadius: BorderRadius['2xl'], overflow: 'hidden', backgroundColor: Colors.gray[900], ...Shadows.soft },
  cardFeatured: { height: 390 },
  image: { flex: 1, justifyContent: 'space-between', padding: 15 },
  imageRadius: { borderRadius: BorderRadius['2xl'] },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.36)' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  contextPill: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: 'rgba(8,8,8,.78)', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  contextText: { color: Colors.white, fontFamily: 'SpaceMono', letterSpacing: 0.7, fontSize: 12 },
  save: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(8,8,8,.7)', alignItems: 'center', justifyContent: 'center' },
  cardBody: { backgroundColor: 'transparent' },
  location: { color: Colors.accent, fontSize: 12, fontFamily: 'SpaceMono', letterSpacing: 0.5, textTransform: 'uppercase' },
  cardTitle: { color: Colors.white, fontSize: 27, lineHeight: 31, fontWeight: '800', letterSpacing: -0.7, marginTop: 6 },
  description: { color: Colors.gray[100], fontSize: 13, lineHeight: 19, marginTop: 5, maxWidth: 300 },
  railHeading: { marginTop: 8 },
  railTitle: { color: Colors.white, fontSize: 18, lineHeight: 22, fontWeight: '800' },
  posterRail: { gap: 12, paddingRight: Spacing.container },
  posterCard: { width: 226, height: 310, borderRadius: BorderRadius['2xl'], overflow: 'hidden', backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  posterImage: { flex: 1, justifyContent: 'flex-end', padding: 13 },
  posterImageRadius: { borderRadius: BorderRadius['2xl'] },
  posterShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.32)' },
  posterCopy: { backgroundColor: 'transparent' },
  posterLocation: { color: Colors.accent, fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 0.65 },
  posterTitle: { color: Colors.white, fontSize: 23, lineHeight: 25, fontWeight: '900', marginTop: 6 },
  state: { minHeight: 260, justifyContent: 'center', alignItems: 'center', gap: 9 },
  stateTitle: { color: Colors.white, fontSize: 17, fontWeight: '700', marginTop: 5, textAlign: 'center' },
  stateText: { color: Colors.gray[500], fontSize: 13, textAlign: 'center' },
  stateAction: { marginTop: 7, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 18, backgroundColor: Colors.primary },
  stateActionText: { color: Colors.black, fontSize: 13, fontWeight: '800' },
});

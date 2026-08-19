import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { useMoments, type Moment } from '@/hooks/useMoments';
import { useSavedObjects } from '@/hooks/useSavedObjects';
import { useAuth } from '@/context/AuthContext';
import { STAKEHOLDER_EXPERIENCES, isStakeholderRole } from '@/constants/StakeholderExperience';

const categories = [
  { id: 'all', label: 'For you' },
  { id: 'community', label: 'Community' },
  { id: 'activation', label: 'Brand activations' },
  { id: 'digital', label: 'Online' },
  { id: 'bounty', label: 'Action prompts' },
];

const fallbackImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85';

export default function DiscoverScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [query, setQuery] = useState('');
  const { activeRole } = useAuth();
  const role = isStakeholderRole(activeRole) ? activeRole : 'participant';
  const experience = STAKEHOLDER_EXPERIENCES[role];
  const { moments, loading, error } = useMoments(selectedCategory);
  const { isSaved, toggle } = useSavedObjects();
  const visibleMoments = useMemo(() => moments.filter((moment) =>
    `${moment.title} ${moment.location}`.toLowerCase().includes(query.toLowerCase())
  ), [moments, query]);
  const featuredMoment = visibleMoments[0];
  const moreMoments = visibleMoments.slice(1);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View><Text style={styles.eyebrow}>{experience.eyebrow}</Text><Text style={styles.title}>{experience.tabs.discover}</Text></View>
          <View style={styles.headerActions}><Pressable accessibilityLabel="Browse Scenes" style={styles.mapIcon} onPress={() => router.push('/scenes')}><Ionicons name="people-outline" size={21} color={Colors.primary} /></Pressable><Pressable accessibilityLabel="Open map" style={styles.mapIcon} onPress={() => router.push({ pathname: '/search', params: { type: 'moments', q: query } } as any)}><Ionicons name="map-outline" size={21} color={Colors.white} /></Pressable></View>
        </View>
        <View style={styles.search}>
          <Ionicons name="search" size={19} color={Colors.gray[400]} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={
              role === 'host'
                ? 'Search community moments, scenes, hosts…'
                : role === 'creator'
                ? 'Search creator prompts, moments…'
                : role === 'brand'
                ? 'Search network activations, creators…'
                : role === 'merchant'
                ? 'Search nearby offers, venues…'
                : role === 'agency'
                ? 'Search client campaigns, partners…'
                : role === 'admin'
                ? 'Search all system moments, accounts…'
                : 'Moments, scenes, creators…'
            }
            placeholderTextColor={Colors.gray[500]}
            style={styles.input}
          />
          {query.length > 0 && <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')}><Ionicons name="close-circle" size={18} color={Colors.gray[500]} /></Pressable>}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {categories.map((category) => (
            <Pressable key={category.id} onPress={() => setSelectedCategory(category.id)} style={[styles.category, selectedCategory === category.id && styles.categoryActive]}>
              <Text style={[styles.categoryText, selectedCategory === category.id && styles.categoryTextActive]}>{category.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading && moments.length === 0 ? (
          <View style={styles.state}><ActivityIndicator color={Colors.primary} /><Text style={styles.stateText}>Finding what is live near you…</Text></View>
        ) : error && moments.length === 0 ? (
          <View style={styles.state}><Ionicons name="cloud-offline-outline" size={38} color={Colors.gray[500]} /><Text style={styles.stateTitle}>Discovery could not refresh</Text><Text style={styles.stateText}>Check back in a moment or search for a specific scene.</Text><Pressable style={styles.stateAction} onPress={() => router.push('/search')}><Text style={styles.stateActionText}>Search Promorang</Text></Pressable></View>
        ) : visibleMoments.length === 0 ? (
          <View style={styles.state}><Ionicons name="compass-outline" size={38} color={Colors.gray[500]} /><Text style={styles.stateTitle}>Nothing in this lane yet</Text><Text style={styles.stateText}>Try another scene or create the next Moment worth showing up for.</Text><Pressable style={styles.stateAction} onPress={() => router.push('/post')}><Text style={styles.stateActionText}>Create a Moment</Text></Pressable></View>
        ) : (
          <>
            <View style={styles.sectionRow}>
              <View>
                <Text style={styles.sectionKicker}>
                  {role === 'host'
                    ? 'HOST COMMUNITY & SCENES'
                    : role === 'creator'
                    ? 'CREATOR PROMPTS & BRIEFS'
                    : role === 'brand'
                    ? 'VERIFIED NETWORK ACTIVATIONS'
                    : role === 'merchant'
                    ? 'LOCAL VENUE & SCENE FOOT TRAFFIC'
                    : role === 'agency'
                    ? 'MANAGED PARTNERS & CAMPAIGNS'
                    : role === 'admin'
                    ? 'SYSTEM ECOSYSTEM OVERVIEW'
                    : 'CHOSEN FOR RIGHT NOW'}
                </Text>
                <Text style={styles.sectionTitle}>
                  {role === 'host'
                    ? 'Community Moments'
                    : role === 'creator'
                    ? 'Action Prompts'
                    : role === 'brand'
                    ? 'Campaign Network'
                    : role === 'merchant'
                    ? 'Nearby Offers'
                    : role === 'agency'
                    ? 'Ecosystem Partners'
                    : role === 'admin'
                    ? 'All Live Moments'
                    : 'Step into the Scene'}
                </Text>
              </View>
              <Text style={styles.resultCount}>{visibleMoments.length} live</Text>
            </View>
            <MomentCard
              moment={featuredMoment}
              featured
              saved={isSaved('moment', featuredMoment.id)}
              onSave={() => toggle({ object_type: 'moment', object_id: featuredMoment.id, title: featuredMoment.title, subtitle: featuredMoment.location, image_url: featuredMoment.image_url || null, metadata: { type: featuredMoment.type, href: `/moment/${featuredMoment.id}` } })}
            />
            {moreMoments.length > 0 && <>
              <View style={styles.railHeading}><View><Text style={styles.sectionKicker}>MORE WAYS IN</Text><Text style={styles.railTitle}>Tonight, nearby, and worth knowing</Text></View><Ionicons name="arrow-forward" size={18} color={Colors.primary} /></View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.posterRail} decelerationRate="fast" snapToInterval={238}>
                {moreMoments.map((moment) => <CompactMomentCard key={moment.id} moment={moment} />)}
              </ScrollView>
            </>}
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
        <View style={styles.posterBadge}><Text style={styles.posterBadgeText}>{moment.status === 'active' ? 'HAPPENING' : moment.type.toUpperCase()}</Text></View>
        <View style={styles.posterCopy}>
          <Text style={styles.posterLocation} numberOfLines={1}>{moment.location || 'PROMORANG'}</Text>
          <Text style={styles.posterTitle} numberOfLines={3}>{moment.title}</Text>
          <View style={styles.posterAction}><Text style={styles.posterActionText}>Enter the Moment</Text><Ionicons name="arrow-forward" size={14} color={Colors.white} /></View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

function MomentCard({ moment, featured, saved, onSave }: { moment: Moment; featured: boolean; saved: boolean; onSave: () => Promise<unknown> }) {
  const activityLabel = moment.status === 'active' ? 'Active now' : `${moment.type} moment`;

  return (
    <Pressable accessibilityRole="button" style={[styles.card, featured && styles.cardFeatured]} onPress={() => router.push(`/moment/${moment.id}` as any)}>
      <ImageBackground source={{ uri: moment.image_url || fallbackImage }} style={styles.image} imageStyle={styles.imageRadius}>
        <View style={styles.shade} />
        <View style={styles.cardTop}>
          <View style={styles.contextPill}><View style={styles.liveDot} /><Text style={styles.contextText}>{featured ? 'LIVE NOW' : moment.type.toUpperCase()}</Text></View>
          <Pressable accessibilityLabel={saved ? 'Remove saved moment' : 'Save moment'} style={styles.save} onPress={(event) => { event.stopPropagation(); onSave().catch((error) => Alert.alert('Could not update saved', error.message || 'Please try again.')); }}><Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={saved ? Colors.primary : Colors.white} /></Pressable>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.location}>{moment.location || 'Near you'}</Text>
          <Text style={styles.cardTitle}>{moment.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{moment.description || 'Show up, meet the Scene, and see what opens next.'}</Text>
          <View style={styles.cardFooter}>
            <View style={styles.attendance}><Ionicons name="people" size={15} color={Colors.gray[200]} /><Text style={styles.attendanceText}>{featured ? activityLabel : 'People are joining'}</Text></View>
            <View style={styles.action}><Text style={styles.actionText}>{moment.type === 'bounty' ? 'View action' : 'See moment'}</Text><Ionicons name="arrow-forward" size={15} color={Colors.black} /></View>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  header: { paddingTop: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, backgroundColor: Colors.black },
  headerRow: { paddingHorizontal: Spacing.container, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' },
  headerActions: { flexDirection: 'row', gap: 8, backgroundColor: 'transparent' },
  eyebrow: { color: Colors.primary, fontSize: 12, fontFamily: 'SpaceMono', letterSpacing: 1.1 },
  title: { color: Colors.white, fontSize: Typography.sizes['3xl'], fontWeight: '800', letterSpacing: -1, marginTop: 3 },
  mapIcon: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900], alignItems: 'center', justifyContent: 'center' },
  search: { marginHorizontal: Spacing.container, marginTop: 16, height: 47, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900], flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: { color: Colors.white, fontSize: 14, flex: 1, height: '100%' },
  categories: { paddingHorizontal: Spacing.container, paddingTop: 13, gap: 8 },
  category: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  categoryActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryText: { color: Colors.gray[300], fontSize: 12, fontWeight: '600' },
  categoryTextActive: { color: Colors.black, fontWeight: '800' },
  content: { padding: Spacing.container },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13, backgroundColor: 'transparent' },
  sectionKicker: { color: Colors.primary, fontSize: 11, fontFamily: 'SpaceMono', letterSpacing: .9, marginBottom: 4 },
  sectionTitle: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  resultCount: { color: Colors.gray[500], fontSize: 13, fontFamily: 'SpaceMono' },
  card: { height: 330, borderRadius: BorderRadius['2xl'], overflow: 'hidden', marginBottom: 14, backgroundColor: Colors.gray[900], ...Shadows.soft },
  cardFeatured: { height: 390 },
  image: { flex: 1, justifyContent: 'space-between', padding: 15 },
  imageRadius: { borderRadius: BorderRadius['2xl'] },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.36)' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent' },
  contextPill: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: 'rgba(8,8,8,.78)', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  contextText: { color: Colors.white, fontFamily: 'SpaceMono', letterSpacing: .7, fontSize: 12 },
  save: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(8,8,8,.7)', alignItems: 'center', justifyContent: 'center' },
  cardBody: { backgroundColor: 'transparent' },
  location: { color: Colors.accent, fontSize: 12, fontFamily: 'SpaceMono', letterSpacing: .5, textTransform: 'uppercase' },
  cardTitle: { color: Colors.white, fontSize: 27, lineHeight: 31, fontWeight: '800', letterSpacing: -.7, marginTop: 6 },
  description: { color: Colors.gray[100], fontSize: 13, lineHeight: 19, marginTop: 5, maxWidth: 300 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 15, backgroundColor: 'transparent' },
  attendance: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'transparent' },
  attendanceText: { color: Colors.gray[200], fontSize: 13 },
  action: { flexDirection: 'row', gap: 6, alignItems: 'center', paddingHorizontal: 13, paddingVertical: 9, backgroundColor: Colors.primary, borderRadius: 18 },
  actionText: { color: Colors.black, fontSize: 13, fontWeight: '800' },
  railHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 13, marginBottom: 12, backgroundColor: 'transparent' },
  railTitle: { color: Colors.white, fontSize: 18, lineHeight: 22, fontWeight: '800', letterSpacing: -.3, maxWidth: 270 },
  posterRail: { gap: 12, paddingRight: Spacing.container, paddingBottom: 4 },
  posterCard: { width: 226, height: 310, borderRadius: BorderRadius['2xl'], overflow: 'hidden', backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, ...Shadows.soft },
  posterImage: { flex: 1, justifyContent: 'space-between', padding: 13 },
  posterImageRadius: { borderRadius: BorderRadius['2xl'] },
  posterShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.32)' },
  posterBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(8,8,8,.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,.15)' },
  posterBadgeText: { color: Colors.white, fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: .7 },
  posterCopy: { backgroundColor: 'transparent' },
  posterLocation: { color: Colors.accent, fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: .65 },
  posterTitle: { color: Colors.white, fontSize: 23, lineHeight: 25, fontWeight: '900', letterSpacing: -.65, marginTop: 6 },
  posterAction: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 13, backgroundColor: 'transparent' },
  posterActionText: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  state: { minHeight: 300, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', gap: 9 },
  stateTitle: { color: Colors.white, fontSize: 17, fontWeight: '700', marginTop: 5 },
  stateText: { color: Colors.gray[500], fontSize: 13, textAlign: 'center' },
  stateAction: { marginTop: 7, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 18, backgroundColor: Colors.primary },
  stateActionText: { color: Colors.black, fontSize: 13, fontWeight: '800' },
});

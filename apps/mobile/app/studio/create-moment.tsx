import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { useAuth } from '@/context/AuthContext';
import { ResponsivePressable as Pressable } from '@/components/ResponsivePressable';
import { apiRequest } from '@/lib/api';

const MapViewComponent = MapView as any;
const MarkerComponent = Marker as any;

const types = [
  ['community', 'Community', 'people'],
  ['activation', 'Activation', 'flash'],
  ['bounty', 'Action prompt', 'flag'],
  ['digital', 'Online', 'globe'],
] as const;

export default function CreateMomentScreen() {
  const { parentMomentId, parentTitle, parentLocation } = useLocalSearchParams<{ parentMomentId?: string; parentTitle?: string; parentLocation?: string }>();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(parentLocation || '');
  const [type, setType] = useState<(typeof types)[number][0]>('community');
  const [capacity, setCapacity] = useState('');
  const [rewardPool, setRewardPool] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState({ latitude: 30.2672, longitude: -97.7431, latitudeDelta: 0.01, longitudeDelta: 0.01 });
  const [markerCoord, setMarkerCoord] = useState({ latitude: 30.2672, longitude: -97.7431 });
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publish = async () => {
    if (!title.trim() || !location.trim()) {
      Alert.alert('Moment needs a shape', 'Add a title and location before publishing.');
      return;
    }
    if (!user) return Alert.alert('Sign in required', 'Sign in to publish a moment.');
    setPublishing(true);
    setError(null);
    try {
      const startsAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      const response = await apiRequest<{ success: boolean; moment: { id: string } }>('/api/moment-economy/moments', { method: 'POST', body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim(),
        type: parentMomentId ? 'submoment' : type,
        category: type,
        starts_at: startsAt,
        parent_moment_id: parentMomentId || null,
        creative_owner_id: user.id,
        money_source: 'host',
        moves: [{ title: parentMomentId ? 'Complete the sub-moment activity' : 'Take part in the Moment', proof_type: 'code', reward_amount_jmd: 0 }],
        payout_rules: [{ rule_type: 'per_action', amount_jmd: 0 }],
        max_capacity: capacity ? parseInt(capacity, 10) : null,
        reward_pool_jmd: rewardPool ? parseInt(rewardPool, 10) : 0,
        cover_image_url: coverImage || null,
        geo: { lat: markerCoord.latitude, lng: markerCoord.longitude },
      }) });
      router.replace(`/moment/${response.moment.id}` as any);
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Could not publish this moment.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Close" style={styles.close} onPress={() => router.back()}><Ionicons name="close" size={22} color={Colors.white} /></Pressable>
        <View style={styles.heading}><Text style={styles.eyebrow}>{parentMomentId ? 'SUB-MOMENT PROPOSAL' : 'STUDIO'}</Text><Text style={styles.headerTitle}>{parentMomentId ? 'Create inside Moment' : 'Create moment'}</Text></View>
        <Text style={styles.step}>1 OF 1</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Give people one clear reason to move.</Text>
        <Text style={styles.subtitle}>{parentMomentId ? `Propose an activity inside ${parentTitle || 'this Moment'}. The parent host will review it before it becomes public.` : 'Start with the decision-making essentials. You can add tickets, rewards and collaborators after publishing.'}</Text>

        <View style={styles.field}>
          <Text style={styles.label}>MOMENT NAME</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Sunset Sessions" placeholderTextColor={Colors.gray[600]} style={styles.titleInput} maxLength={70} />
          <Text style={styles.count}>{title.length}/70</Text>
        </View>

        <Text style={styles.labelOutside}>WHAT KIND OF MOVEMENT?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.types}>
          {types.map(([id, label, icon]) => (
            <Pressable key={id} style={[styles.type, type === id && styles.typeActive]} onPress={() => setType(id)}>
              <Ionicons name={icon} size={18} color={type === id ? Colors.black : Colors.gray[300]} />
              <Text style={[styles.typeText, type === id && styles.typeTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.field}>
          <Text style={styles.label}>PLACE</Text>
          <View style={styles.inputRow}><Ionicons name="location" size={19} color={Colors.primary} /><TextInput value={location} onChangeText={setLocation} placeholder="Venue, neighborhood or online" placeholderTextColor={Colors.gray[600]} style={styles.input} /></View>
        </View>

        <View style={styles.mapContainer}>
          <MapViewComponent
            style={styles.map}
            initialRegion={mapRegion}
            onRegionChangeComplete={setMapRegion}
          >
            <MarkerComponent
              coordinate={markerCoord}
              draggable
              onDragEnd={(e: any) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setMarkerCoord({ latitude, longitude });
                setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
              }}
            />
          </MapViewComponent>
          <Text style={styles.mapHint}>Drag the pin to set your exact venue location</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>WHY IT MATTERS</Text>
          <TextInput value={description} onChangeText={setDescription} placeholder="What will happen, who is it for, and why should they show up?" placeholderTextColor={Colors.gray[600]} style={styles.description} multiline maxLength={280} />
          <Text style={styles.count}>{description.length}/280</Text>
        </View>

        <View style={styles.twoColumn}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>MAX CAPACITY</Text>
            <TextInput value={capacity} onChangeText={setCapacity} placeholder="e.g. 100" placeholderTextColor={Colors.gray[600]} style={styles.input} keyboardType="number-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>GEM REWARD POOL</Text>
            <TextInput value={rewardPool} onChangeText={setRewardPool} placeholder="e.g. 500" placeholderTextColor={Colors.gray[600]} style={styles.input} keyboardType="number-pad" />
          </View>
        </View>

        <Pressable style={styles.coverPickerButton} onPress={async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
          if (!result.canceled) setCoverImage(result.assets[0].uri);
        }}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverThumb} />
          ) : (
            <View style={styles.coverEmpty}>
              <Ionicons name="image" size={24} color={Colors.primary} />
              <Text style={styles.coverEmptyText}>Add cover photo</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.timing}>
          <View style={styles.timingIcon}><Ionicons name="calendar" size={20} color={Colors.primary} /></View>
          <View style={styles.timingCopy}><Text style={styles.timingTitle}>Timing and access</Text><Text style={styles.timingDetail}>Publishing creates the moment now. Add schedule, capacity and tickets from Manage.</Text></View>
          <Ionicons name="chevron-forward" size={19} color={Colors.gray[500]} />
        </View>

        <View style={styles.preview}>
          <Text style={styles.previewEyebrow}>LIVE PREVIEW</Text>
          <View style={styles.previewCard}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.previewVisualImage} />
          ) : (
            <View style={styles.previewVisual}><Ionicons name={types.find(([id]) => id === type)?.[2] || 'people'} size={31} color={Colors.primary} /></View>
          )}
          <View style={styles.previewCopy}><Text style={styles.previewType}>{type.toUpperCase()} · NEW</Text><Text style={styles.previewTitle} numberOfLines={1}>{title || 'Your moment name'}</Text><Text style={styles.previewLocation} numberOfLines={1}>{location || 'Add a place'}</Text>{(capacity || rewardPool) ? <Text style={styles.previewLocation}>{capacity ? `Cap: ${capacity}` : ''}{capacity && rewardPool ? ' · ' : ''}{rewardPool ? `${rewardPool} Gems` : ''}</Text> : null}</View>
        </View>
        </View>

        {error && <View style={styles.error}><Ionicons name="alert-circle" size={18} color={Colors.error} /><Text style={styles.errorText}>{error}</Text></View>}
        <Pressable style={[styles.publish, publishing && styles.publishMuted]} onPress={publish} disabled={publishing}>
          {publishing ? <><ActivityIndicator size="small" color={Colors.black} /><Text style={styles.publishText}>Publishing…</Text></> : <><Text style={styles.publishText}>Publish moment</Text><Ionicons name="arrow-forward" size={18} color={Colors.black} /></>}
        </Pressable>
        <Text style={styles.note}>The moment will be visible immediately. You can pause it from Studio.</Text>
        <View style={{ height: 35 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: Spacing.container, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, backgroundColor: Colors.black },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  heading: { flex: 1, marginLeft: 13, backgroundColor: 'transparent' },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .7 },
  headerTitle: { color: Colors.white, fontSize: 16, fontWeight: '800', marginTop: 2 },
  step: { color: Colors.gray[400], fontFamily: 'SpaceMono', fontSize: 12 },
  content: { paddingHorizontal: Spacing.container, paddingTop: 24 },
  title: { color: Colors.white, fontSize: Typography.sizes['2xl'], lineHeight: 31, fontWeight: '800', letterSpacing: -.7, maxWidth: 330 },
  subtitle: { color: Colors.gray[400], fontSize: 12, lineHeight: 18, marginTop: 8, maxWidth: 340 },
  field: { padding: 15, marginTop: 17, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  label: { color: Colors.gray[400], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .6 },
  labelOutside: { color: Colors.gray[400], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .6, marginTop: 20, marginBottom: 9 },
  titleInput: { color: Colors.white, fontSize: 20, fontWeight: '700', paddingTop: 12, paddingBottom: 5 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 8, backgroundColor: 'transparent' },
  input: { color: Colors.white, fontSize: 14, flex: 1, paddingVertical: 6 },
  description: { color: Colors.white, fontSize: 14, lineHeight: 20, minHeight: 90, textAlignVertical: 'top', paddingTop: 11 },
  count: { color: Colors.gray[400], fontSize: 12, textAlign: 'right', marginTop: 4 },
  types: { gap: 8 },
  type: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 19, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  typeActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeText: { color: Colors.gray[300], fontSize: 13, fontWeight: '700' },
  typeTextActive: { color: Colors.black },
  timing: { flexDirection: 'row', alignItems: 'center', padding: 14, marginTop: 13, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  timingIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  timingCopy: { flex: 1, backgroundColor: 'transparent' },
  timingTitle: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  timingDetail: { color: Colors.gray[500], fontSize: 12, lineHeight: 14, marginTop: 3, paddingRight: 8 },
  preview: { marginTop: 22, backgroundColor: 'transparent' },
  previewEyebrow: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .8, marginBottom: 9 },
  previewCard: { flexDirection: 'row', alignItems: 'center', padding: 13, borderRadius: BorderRadius.xl, backgroundColor: '#24160F', borderWidth: 1, borderColor: 'rgba(255,106,26,.24)' },
  previewVisual: { width: 67, height: 67, borderRadius: 17, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  previewCopy: { flex: 1, backgroundColor: 'transparent' },
  previewType: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .6 },
  previewTitle: { color: Colors.white, fontSize: 15, fontWeight: '800', marginTop: 5 },
  previewLocation: { color: Colors.gray[400], fontSize: 12, marginTop: 4 },
  error: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 13, marginTop: 13, borderRadius: BorderRadius.lg, backgroundColor: 'rgba(239,98,91,.10)', borderWidth: 1, borderColor: 'rgba(239,98,91,.28)' },
  errorText: { color: Colors.gray[200], fontSize: 12, flex: 1 },
  publish: { height: 52, marginTop: 17, borderRadius: 17, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  publishMuted: { opacity: .55 },
  publishText: { color: Colors.black, fontSize: 13, fontWeight: '900' },
  note: { color: Colors.gray[600], fontSize: 12, textAlign: 'center', marginTop: 10 },
  mapContainer: { marginTop: 13, borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  map: { height: 180, borderRadius: BorderRadius.xl },
  mapHint: { color: Colors.gray[500], fontSize: 11, textAlign: 'center', paddingVertical: 6, backgroundColor: Colors.gray[900] },
  twoColumn: { flexDirection: 'row', gap: 10 },
  coverPickerButton: { marginTop: 13, borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900] },
  coverThumb: { height: 120, borderRadius: BorderRadius.xl },
  coverEmpty: { height: 80, alignItems: 'center', justifyContent: 'center', gap: 6 },
  coverEmptyText: { color: Colors.gray[400], fontSize: 12, fontWeight: '700' },
  previewVisualImage: { width: 67, height: 67, borderRadius: 17, marginRight: 12 },
});

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActionSheetIOS, Alert, ImageBackground, Platform, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { Colors } from '@/constants/DesignTokens';
import type { LivingFeedItem } from '@/hooks/useLivingFeed';
import { useSavedObjects, type SavedObjectType } from '@/hooks/useSavedObjects';
import { feedApi } from '@/lib/api';
import { ResponsivePressable as Pressable } from '@/components/ResponsivePressable';

const icons: any = { moment: 'flash', content: 'play', product: 'bag-handle', offer: 'pricetag', piece: 'layers', promoshare_draw: 'trophy', promoshare_receipt: 'ticket' };
const interactionTypeFor = (type: LivingFeedItem['type']) => type === 'moment' ? 'event' : type === 'offer' ? 'campaign' : type === 'piece' ? 'content' : type.startsWith('promoshare_') ? 'reward' : type;

export function LivingFeedCard({ item, onRemoved }: { item: LivingFeedItem; onRemoved?: () => void }) {
  const saved = useSavedObjects();
  const objectType = (item.type === 'promoshare_draw' || item.type === 'promoshare_receipt' ? 'reward' : item.type === 'content' ? 'content' : item.type) as SavedObjectType;
  const loggedImpression = useRef(false);

  useEffect(() => {
    if (loggedImpression.current) return;
    loggedImpression.current = true;
    void feedApi.recordInteraction({
      item_type: interactionTypeFor(item.type),
      item_id: item.id,
      interaction_type: 'impression',
      meta_data: { source: 'mobile_living_feed', eyebrow: item.eyebrow },
    }).catch(() => undefined);
  }, [item.id, item.type, item.eyebrow]);

  const open = () => {
    void feedApi.recordInteraction({
      item_type: interactionTypeFor(item.type),
      item_id: item.id,
      interaction_type: 'click',
      meta_data: { source: 'mobile_living_feed' },
    }).catch(() => undefined);
    router.push(item.href as any);
  };

  const report = () => router.push({
    pathname: '/report',
    params: { targetType: item.type, targetId: item.id, reportedUserId: item.authorId || '', title: item.title },
  } as any);

  const block = async () => {
    if (!item.authorId) return;
    try {
      const { safetyApi } = await import('@/lib/api');
      await safetyApi.blockUser(item.authorId);
      onRemoved?.();
      Alert.alert('User blocked', 'Their content will no longer appear in your personalized feed.');
    } catch (error) {
      Alert.alert('Could not block user', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const openSafetyMenu = () => {
    const blockLabel = item.authorId ? 'Block this user' : null;
    if (Platform.OS === 'ios') {
      const options = ['Report content', ...(blockLabel ? [blockLabel] : []), 'Cancel'];
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: options.length - 1, destructiveButtonIndex: blockLabel ? 1 : undefined, title: 'Content controls' },
        (index) => { if (index === 0) report(); else if (blockLabel && index === 1) void block(); }
      );
      return;
    }
    Alert.alert('Content controls', 'Choose what you want to do.', [
      { text: 'Report', onPress: report },
      ...(blockLabel ? [{ text: 'Block user', style: 'destructive' as const, onPress: () => void block() }] : []),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <Pressable accessibilityRole="button" onPress={open} style={styles.card}>
      <ImageBackground source={item.image ? { uri: item.image } : undefined} style={styles.image} imageStyle={styles.radius}>
        <View style={styles.shade} />
        <View style={styles.top}>
          <View style={styles.badge}>
            <Ionicons name={icons[item.type]} size={13} color={Colors.primary} />
            <Text style={styles.eyebrow}>{item.eyebrow}</Text>
          </View>
          <Pressable
            accessibilityLabel={saved.isSaved(objectType, item.id) ? 'Remove saved item' : 'Save item'}
            onPress={(event) => {
              event.stopPropagation();
              void feedApi.recordInteraction({ item_type: interactionTypeFor(item.type), item_id: item.id, interaction_type: 'save', meta_data: { source: 'mobile_living_feed' } }).catch(() => undefined);
              saved.toggle({ object_type: objectType, object_id: item.id, title: item.title, subtitle: item.meta || null, image_url: item.image || null, metadata: { source: 'living_feed', href: item.href, type: item.type } }).catch((error) => Alert.alert('Could not update saved', error.message || 'Please try again.'));
            }}
            style={styles.save}
          >
            <Ionicons name={saved.isSaved(objectType, item.id) ? 'bookmark' : 'bookmark-outline'} size={17} color={saved.isSaved(objectType, item.id) ? Colors.primary : 'white'} />
          </Pressable>
          <Pressable accessibilityLabel="Content safety options" onPress={(event) => { event.stopPropagation(); openSafetyMenu(); }} style={styles.more}>
            <Ionicons name="ellipsis-horizontal" size={18} color="white" />
          </Pressable>
        </View>

        <View style={styles.body}>
          {/* Type-specific badges */}
          {item.type === 'offer' && (
            <View style={styles.couponBadge}>
              <Ionicons name="pricetag" size={13} color="#10B981" />
              <Text style={styles.couponBadgeText}>{item.price != null ? `Save ${item.price} Gems` : 'QR PASS'}</Text>
              <View style={styles.qrIndicator}><Ionicons name="qr-code" size={11} color="white" /></View>
            </View>
          )}
          {item.type === 'content' && item.meta && (
            <View style={styles.creatorBadge}>
              <Ionicons name={item.meta.toLowerCase().includes('instagram') ? 'logo-instagram' : item.meta.toLowerCase().includes('tiktok') ? 'logo-tiktok' : item.meta.toLowerCase().includes('youtube') ? 'logo-youtube' : 'person-circle'} size={14} color="#E879F9" />
              <Text style={styles.creatorBadgeText}>{item.meta}</Text>
            </View>
          )}
          {item.type === 'promoshare_draw' && (
            <View style={styles.brandBadge}>
              <Ionicons name="megaphone" size={13} color={Colors.primary} />
              <Text style={styles.brandBadgeText}>{item.price != null ? `${Number(item.price).toLocaleString()} Gems Reserve` : 'BRAND ACTIVATION'}</Text>
            </View>
          )}
          {item.type === 'piece' && item.change != null && (
            <View style={styles.yieldBadge}>
              <Ionicons name={item.change >= 0 ? 'trending-up' : 'trending-down'} size={14} color={item.change >= 0 ? '#10B981' : '#EF4444'} />
              <Text style={[styles.yieldText, { color: item.change >= 0 ? '#10B981' : '#EF4444' }]}>{item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}% 24h</Text>
              <View style={styles.miniChart}>
                {[0.3, 0.5, 0.4, 0.7, 0.6, 0.9, 0.8].map((h, i) => (
                  <View key={i} style={[styles.miniBar, { height: h * 16, backgroundColor: item.change! >= 0 ? '#10B981' : '#EF4444' }]} />
                ))}
              </View>
            </View>
          )}
          {item.type === 'product' && (
            <View style={styles.productBadge}>
              <View style={styles.inStockDot} />
              <Text style={styles.productBadgeText}>IN STOCK</Text>
              {item.price != null && <Text style={styles.productPrice}>${Number(item.price).toLocaleString()}</Text>}
            </View>
          )}
          {item.type !== 'content' && item.meta ? <Text style={styles.meta}>{item.meta}</Text> : null}
          <Text style={styles.title}>{item.title}</Text>
          {item.description ? <Text numberOfLines={2} style={styles.description}>{item.description}</Text> : null}
          {item.reasonLabels && item.reasonLabels.length > 1 ? (
            <View style={styles.reasonRow}>
              {item.reasonLabels.slice(1, 3).map((reason) => (
                <View key={reason} style={styles.reasonPill}><Text style={styles.reasonText}>{reason}</Text></View>
              ))}
            </View>
          ) : null}
          <View style={styles.footer}>
            <View style={styles.returnCopy}>
              <Text numberOfLines={1} style={styles.returnLabel}>{item.returnLabel}</Text>
              {item.price != null && item.type !== 'offer' && item.type !== 'promoshare_draw' ? <Text style={styles.price}>{Number(item.price).toLocaleString()} Gems</Text> : null}
            </View>
            <View style={[styles.open, item.type === 'offer' && styles.openGreen, item.type === 'piece' && styles.openBlue]}>
              <Text style={[styles.openText, (item.type === 'offer' || item.type === 'piece') && { color: 'white' }]}>
                {item.type === 'piece' ? 'Trade Piece' : item.type === 'product' ? 'Shop Now' : item.type === 'offer' ? 'Claim Pass' : item.type === 'content' ? 'Watch Drop' : item.type === 'promoshare_draw' ? 'Join Brief' : 'See it'}
              </Text>
              <Ionicons name="arrow-forward" size={15} color={item.type === 'offer' || item.type === 'piece' ? 'white' : Colors.black} />
            </View>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { height: 380, borderRadius: 28, overflow: 'hidden', marginBottom: 14, backgroundColor: '#171717', borderWidth: 1, borderColor: 'rgba(255,255,255,.1)' },
  image: { flex: 1, justifyContent: 'space-between', padding: 15 },
  radius: { borderRadius: 28 },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.48)' },
  top: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent' },
  more: { position: 'absolute', right: 52, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,.72)', alignItems: 'center', justifyContent: 'center' },
  save: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,.72)', alignItems: 'center', justifyContent: 'center' },
  couponBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(16,185,129,.18)', borderWidth: 1, borderColor: 'rgba(16,185,129,.35)', marginBottom: 6 },
  couponBadgeText: { color: '#10B981', fontSize: 12, fontWeight: '900', fontFamily: 'SpaceMono' },
  qrIndicator: { width: 20, height: 20, borderRadius: 6, backgroundColor: 'rgba(16,185,129,.3)', alignItems: 'center', justifyContent: 'center' },
  creatorBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  creatorBadgeText: { color: '#E879F9', fontSize: 12, fontWeight: '700', fontFamily: 'SpaceMono' },
  brandBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(255,106,26,.15)', borderWidth: 1, borderColor: 'rgba(255,106,26,.3)', marginBottom: 6 },
  brandBadgeText: { color: Colors.primary, fontSize: 12, fontWeight: '900', fontFamily: 'SpaceMono' },
  yieldBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(16,185,129,.12)', marginBottom: 6 },
  yieldText: { fontSize: 13, fontWeight: '900', fontFamily: 'SpaceMono' },
  miniChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 16 },
  miniBar: { width: 3, borderRadius: 1 },
  productBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  inStockDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981' },
  productBadgeText: { color: '#10B981', fontSize: 11, fontWeight: '900', fontFamily: 'SpaceMono' },
  productPrice: { color: 'white', fontSize: 13, fontWeight: '900', marginLeft: 'auto' },
  openGreen: { backgroundColor: '#10B981' },
  openBlue: { backgroundColor: '#3B82F6' },
  badge: { flexDirection: 'row', gap: 7, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(0,0,0,.76)' },
  eyebrow: { color: 'white', fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .8 },
  body: { backgroundColor: 'transparent' },
  meta: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, textTransform: 'uppercase', letterSpacing: .8 },
  title: { color: 'white', fontSize: 28, lineHeight: 31, fontWeight: '900', letterSpacing: -.8, marginTop: 7 },
  description: { color: 'rgba(255,255,255,.72)', fontSize: 13, lineHeight: 19, marginTop: 6 },
  reasonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10, backgroundColor: 'transparent' },
  reasonPill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,.12)' },
  reasonText: { color: 'rgba(255,255,255,.78)', fontSize: 12, fontFamily: 'SpaceMono' },
  footer: { marginTop: 14, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, backgroundColor: 'transparent' },
  returnCopy: { flex: 1, backgroundColor: 'transparent' },
  returnLabel: { color: 'rgba(255,255,255,.55)', fontSize: 12 },
  price: { color: 'white', fontSize: 19, fontWeight: '900', marginTop: 2 },
  open: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  openText: { color: Colors.black, fontSize: 13, fontWeight: '900' },
});

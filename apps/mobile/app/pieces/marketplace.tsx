import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/DesignTokens';
import { supabase } from '@/lib/supabase';

export default function MobilePieceMarketplace() {
  const [pieces, setPieces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'content' | 'moment' | 'host' | 'venue'>('all');

  const loadMarketplace = async () => {
    setLoading(true);
    try {
      const { data } = await (supabase as any)
        .from('content_piece_stats')
        .select('*, content_items:content_id(*)')
        .limit(20);

      setPieces(data || []);
    } catch (err) {
      console.warn('Marketplace load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMarketplace();
  }, []);

  const filteredPieces = filter === 'all' ? pieces : pieces.filter((p) => p.piece_type === filter);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Piece Marketplace</Text>
        <Pressable style={styles.backBtn} onPress={() => router.push('/pieces/portfolio')}>
          <Ionicons name="wallet-outline" size={20} color={Colors.primary} />
        </Pressable>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        {(['all', 'content', 'moment', 'host', 'venue'] as const).map((cat) => (
          <Pressable
            key={cat}
            style={[styles.filterChip, filter === cat && styles.filterChipActive]}
            onPress={() => setFilter(cat)}
          >
            <Text style={[styles.filterText, filter === cat && styles.filterTextActive]}>
              {cat.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.loadingText}>Loading Marketplace…</Text>
        </View>
      ) : filteredPieces.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="sparkles-outline" size={42} color={Colors.gray[600]} />
          <Text style={styles.emptyTitle}>No Pieces Available</Text>
          <Text style={styles.emptySubtitle}>Check back soon for new drop allocations and liquidity pools.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPieces}
          keyExtractor={(item, index) => item.content_id || index.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/pieces/${item.piece_type || 'content'}/${item.content_id}` as any)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.badge}>{(item.piece_type || 'CONTENT').toUpperCase()}</Text>
                <Text style={styles.price}>${(item.current_price || 1.0).toFixed(2)}</Text>
              </View>
              <Text style={styles.title}>
                {item.content_items?.title || item.title || `Asset #${item.content_id?.slice(0, 8)}`}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.volumeText}>24h Vol: ${item.volume_24h || 0}</Text>
                <View style={styles.tradeBtn}>
                  <Text style={styles.tradeBtnText}>Trade Piece</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.black} />
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black, paddingTop: 54 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { color: Colors.white, fontSize: 20, fontWeight: '900' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray[900], alignItems: 'center', justifyContent: 'center' },
  filterBar: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 16 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.gray[400], fontSize: 10, fontWeight: '800' },
  filterTextActive: { color: Colors.black },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 8 },
  loadingText: { color: Colors.gray[400] },
  emptyTitle: { color: Colors.white, fontSize: 18, fontWeight: '900', marginTop: 8 },
  emptySubtitle: { color: Colors.gray[400], fontSize: 13, textAlign: 'center', lineHeight: 18 },
  list: { padding: 20, gap: 14 },
  card: { backgroundColor: Colors.gray[900], borderRadius: 18, padding: 16, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { color: Colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  price: { color: Colors.white, fontSize: 16, fontWeight: '900' },
  title: { color: Colors.white, fontSize: 18, fontWeight: '900', marginTop: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  volumeText: { color: Colors.gray[400], fontSize: 12 },
  tradeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  tradeBtnText: { color: Colors.black, fontWeight: '900', fontSize: 12 },
});

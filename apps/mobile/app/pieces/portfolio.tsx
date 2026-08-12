import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/DesignTokens';
import { supabase } from '@/lib/supabase';
import { API_BASE } from '@/lib/api';

export default function MobilePiecePortfolio() {
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) {
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_BASE}/api/pieces/portfolio/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setPositions(data.positions || []);
    } catch (err) {
      console.warn('Portfolio load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPortfolio();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Piece Portfolio</Text>
        <Pressable style={styles.backBtn} onPress={() => router.push('/pieces/marketplace')}>
          <Ionicons name="cart-outline" size={20} color={Colors.primary} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.loadingText}>Loading Portfolio…</Text>
        </View>
      ) : positions.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="wallet-outline" size={48} color={Colors.gray[600]} />
          <Text style={styles.emptyTitle}>No Pieces Owned Yet</Text>
          <Text style={styles.emptySubtitle}>Collect or trade Pieces from moments, venues, and hosts you support.</Text>
          <Pressable style={styles.exploreBtn} onPress={() => router.push('/pieces/marketplace')}>
            <Text style={styles.exploreBtnText}>Browse Marketplace</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={positions}
          keyExtractor={(item) => `${item.piece_type}-${item.asset_id}`}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/pieces/${item.piece_type}/${item.asset_id}` as any)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.badge}>{item.piece_type.toUpperCase()}</Text>
                <Text style={styles.ownedText}>{item.pieces_owned} Pieces</Text>
              </View>
              <Text style={styles.assetTitle}>
                {item.asset?.title || item.asset?.name || `${item.piece_type} #${item.asset_id}`}
              </Text>
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.label}>Market Value</Text>
                  <Text style={styles.value}>${(item.market_value || 0).toFixed(2)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.label}>PnL</Text>
                  <Text style={[styles.pnl, (item.pnl || 0) >= 0 ? styles.pnlPositive : styles.pnlNegative]}>
                    {(item.pnl || 0) >= 0 ? '+' : ''}${(item.pnl || 0).toFixed(2)}
                  </Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { color: Colors.white, fontSize: 20, fontWeight: '900' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray[900], alignItems: 'center', justifyContent: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 12 },
  loadingText: { color: Colors.gray[400] },
  emptyTitle: { color: Colors.white, fontSize: 20, fontWeight: '900', marginTop: 8 },
  emptySubtitle: { color: Colors.gray[400], fontSize: 13, textAlign: 'center', lineHeight: 18 },
  exploreBtn: { marginTop: 16, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16 },
  exploreBtnText: { color: Colors.black, fontWeight: '900', fontSize: 14 },
  list: { padding: 20, gap: 14 },
  card: { backgroundColor: Colors.gray[900], borderRadius: 18, padding: 16, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { color: Colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  ownedText: { color: Colors.gray[300], fontSize: 12, fontWeight: '700' },
  assetTitle: { color: Colors.white, fontSize: 18, fontWeight: '900', marginTop: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  label: { color: Colors.gray[500], fontSize: 10, fontWeight: '700' },
  value: { color: Colors.white, fontSize: 15, fontWeight: '900', marginTop: 2 },
  pnl: { fontSize: 15, fontWeight: '900', marginTop: 2 },
  pnlPositive: { color: '#22c55e' },
  pnlNegative: { color: '#ef4444' },
});

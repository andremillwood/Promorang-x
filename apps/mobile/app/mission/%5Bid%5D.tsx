import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, Image, Pressable, ActivityIndicator, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function MobileMissionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [mission, setMission] = useState<any>(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    async function fetchMission() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('moment_bounties' as any)
          .select('*')
          .eq('id', id)
          .single();

        if (data) {
          setMission(data);
        } else {
          // Fallback mock mission data if ID is demo
          setMission({
            id: id || 'demo-m1',
            title: 'Share & Check In at Cultural Anchor',
            description: 'Visit the location, capture proof of turnout, and post your experience to earn PromoPoints and unlock exclusive drops.',
            payout_amount: 50,
            target_category: 'Scout Mission',
            expires_at: new Date(Date.now() + 86400000 * 3).toISOString(),
            requirements: ['Verify location arrival', 'Take 1 photo of the crowd', 'Submit proof receipt'],
          });
        }
      } catch (e) {
        console.warn('Failed to load mission detail:', e);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchMission();
  }, [id]);

  const handleStartMission = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setClaiming(true);
    setTimeout(() => {
      setClaiming(false);
      Alert.alert('Mission Started', 'Your contribution tracking is live. Submit proof when completed to claim your reward!');
      router.push('/(tabs)/post');
    }, 600);
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Mission Details',
          headerStyle: { backgroundColor: Colors.black },
          headerTintColor: Colors.white,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={s.iconBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        {/* Header Hero Banner */}
        <View style={s.hero}>
          <View style={s.badgeRow}>
            <View style={s.roleBadge}>
              <Ionicons name="sparkles" size={14} color={Colors.primary} />
              <Text style={s.roleBadgeText}>{mission?.target_category || 'SCOUT MISSION'}</Text>
            </View>
            {mission?.payout_amount ? (
              <View style={s.payoutBadge}>
                <Ionicons name="cash-outline" size={14} color="#10B981" />
                <Text style={s.payoutBadgeText}>${mission.payout_amount} Payout</Text>
              </View>
            ) : (
              <View style={s.payoutBadge}>
                <Ionicons name="gift-outline" size={14} color={Colors.primary} />
                <Text style={s.payoutBadgeText}>+100 Points</Text>
              </View>
            )}
          </View>

          <Text style={s.title}>{mission?.title || 'Open Cultural Mission'}</Text>
          <Text style={s.description}>{mission?.description || 'No description provided.'}</Text>
        </View>

        {/* Requirements Box */}
        <View style={s.card}>
          <Text style={s.cardTitle}>PROOF REQUIREMENTS</Text>
          {(mission?.requirements || ['Check in on location', 'Upload clear photo or proof link', 'Submit for review']).map(
            (req: string, idx: number) => (
              <View key={idx} style={s.reqRow}>
                <Ionicons name="checkmark-circle-outline" size={18} color={Colors.primary} />
                <Text style={s.reqText}>{req}</Text>
              </View>
            )
          )}
        </View>

        {/* Action Button */}
        <Pressable disabled={claiming} onPress={handleStartMission} style={[s.actionBtn, claiming && s.disabled]}>
          {claiming ? (
            <ActivityIndicator color={Colors.black} />
          ) : (
            <>
              <Text style={s.actionBtnText}>Accept Mission & Submit Proof</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.black} />
            </>
          )}
        </Pressable>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  content: { padding: Spacing.md, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.black },
  iconBtn: { paddingRight: Spacing.sm },
  hero: { backgroundColor: Colors.gray[900], borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  badgeRow: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.sm, flexWrap: 'wrap' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.ambientWash, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  roleBadgeText: { color: Colors.primary, fontSize: 11, fontWeight: '800' },
  payoutBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  payoutBadgeText: { color: '#10B981', fontSize: 11, fontWeight: '800' },
  title: { color: Colors.white, fontSize: 22, fontWeight: '900', marginBottom: Spacing.xs },
  description: { color: Colors.gray[300], fontSize: 14, lineHeight: 20 },
  card: { backgroundColor: Colors.gray[900], borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { color: Colors.gray[400], fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: Spacing.sm },
  reqRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reqText: { color: Colors.white, fontSize: 14, flex: 1 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: BorderRadius.xl, paddingVertical: 16 },
  actionBtnText: { color: Colors.black, fontSize: 15, fontWeight: '900' },
  disabled: { opacity: 0.6 },
});

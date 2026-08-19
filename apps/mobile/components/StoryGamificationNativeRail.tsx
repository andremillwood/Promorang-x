import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StoryGamificationNativeRailProps {
  onOpenWheel?: () => void;
  onOpenStreak?: () => void;
}

export const StoryGamificationNativeRail: React.FC<StoryGamificationNativeRailProps> = ({
  onOpenWheel,
  onOpenStreak,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Daily Wheel Action Card */}
      <TouchableOpacity style={styles.item} onPress={onOpenWheel}>
        <View style={[styles.avatarRing, { borderColor: '#F59E0B' }]}>
          <View style={styles.actionInner}>
            <Ionicons name="sparkles" size={24} color="#F59E0B" />
          </View>
        </View>
        <Text style={[styles.label, { color: '#F59E0B' }]}>Daily Wheel</Text>
      </TouchableOpacity>

      {/* Daily Streak Action Card */}
      <TouchableOpacity style={styles.item} onPress={onOpenStreak}>
        <View style={[styles.avatarRing, { borderColor: '#F97316' }]}>
          <View style={styles.actionInner}>
            <Ionicons name="gift" size={24} color="#F97316" />
          </View>
        </View>
        <Text style={[styles.label, { color: '#F97316' }]}>Day 3 Streak</Text>
      </TouchableOpacity>

      {/* Sample Moment Story */}
      <TouchableOpacity style={styles.item}>
        <View style={[styles.avatarRing, { borderColor: '#F97316' }]}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.label}>Kingston</Text>
      </TouchableOpacity>

      {/* Sample Drop Story */}
      <TouchableOpacity style={styles.item}>
        <View style={[styles.avatarRing, { borderColor: '#52525B' }]}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80' }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.label}>Nike Drop</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 14,
  },
  item: {
    alignItems: 'center',
    gap: 6,
  },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 2,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#09090B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    resizeMode: 'cover',
  },
  label: {
    color: '#D4D4D8',
    fontSize: 10,
    fontWeight: '700',
  },
});

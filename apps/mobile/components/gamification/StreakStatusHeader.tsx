import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StreakStatusHeaderProps {
  currentStreak?: number;
  hoursRemaining?: number;
  onPressStreak?: () => void;
}

export function StreakStatusHeader({
  currentStreak = 5,
  hoursRemaining = 4,
  onPressStreak,
}: StreakStatusHeaderProps) {
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Pulse animation when streak is near expiration (< 6 hours)
    if (hoursRemaining <= 6) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [hoursRemaining]);

  const isUrgent = hoursRemaining <= 6;

  return (
    <Pressable style={styles.container} onPress={onPressStreak}>
      <View style={styles.badgeRow}>
        {/* Flame Streak Pill */}
        <Animated.View
          style={[
            styles.streakPill,
            isUrgent && styles.urgentPill,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Ionicons
            name="flame"
            size={18}
            color={isUrgent ? '#FF3B30' : '#FF9500'}
          />
          <Text style={styles.streakText}>{currentStreak} Days</Text>
        </Animated.View>

        {/* Expiration Tension Pill */}
        <View style={styles.timerPill}>
          <Ionicons
            name="hourglass-outline"
            size={14}
            color={isUrgent ? '#FF3B30' : '#A0A0A0'}
          />
          <Text style={[styles.timerText, isUrgent && styles.urgentTimerText]}>
            {hoursRemaining}h left today
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.4)',
    gap: 4,
  },
  urgentPill: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderColor: 'rgba(255, 59, 48, 0.6)',
  },
  streakText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  timerText: {
    color: '#D0D0D0',
    fontSize: 12,
    fontWeight: '500',
  },
  urgentTimerText: {
    color: '#FF3B30',
    fontWeight: '700',
  },
});

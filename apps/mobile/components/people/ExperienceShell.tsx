import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';

type ExperienceShellProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  backTo?: string;
  backLabel?: string;
  showHeader?: boolean;
  children: ReactNode;
};

export function ExperienceShell({
  title,
  eyebrow,
  description,
  backTo,
  backLabel = 'Back',
  showHeader = true,
  children,
}: ExperienceShellProps) {
  return (
    <View style={styles.screen}>
      {showHeader ? <AppHeader title={title} /> : null}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {backTo ? (
          <Pressable accessibilityRole="button" onPress={() => router.push(backTo as any)} style={styles.back}>
            <Ionicons name="arrow-back" size={16} color={Colors.gray[400]} />
            <Text style={styles.backLabel}>{backLabel}</Text>
          </Pressable>
        ) : null}
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
        <View style={styles.body}>{children}</View>
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

export function StatPile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
    </View>
  );
}

export function QuietEmpty({
  title,
  copy,
  actionLabel,
  onAction,
}: {
  title: string;
  copy: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyCopy}>{copy}</Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={styles.emptyAction}>
          <Text style={styles.emptyActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={[styles.primary, (disabled || loading) && styles.primaryMuted]}
    >
      {loading ? <ActivityIndicator color={Colors.black} /> : <Text style={styles.primaryText}>{label}</Text>}
    </Pressable>
  );
}

export function ChoiceChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function SafeScreen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  content: { paddingHorizontal: Spacing.container, paddingTop: 8 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, marginBottom: 8 },
  backLabel: { color: Colors.gray[400], fontSize: 14 },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 2, fontWeight: '800' },
  title: {
    color: Colors.white,
    fontSize: Typography.sizes['3xl'],
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 8,
  },
  description: { color: Colors.gray[400], fontSize: 14, lineHeight: 21, marginTop: 8, maxWidth: 360 },
  body: { marginTop: 22, gap: 16 },
  bottomSpace: { height: 120 },
  stat: {
    flex: 1,
    minWidth: 140,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 16,
  },
  statLabel: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1.6, fontWeight: '800' },
  statValue: { color: Colors.white, fontSize: 30, fontWeight: '800', letterSpacing: -1, marginTop: 8 },
  statHint: { color: Colors.gray[500], fontSize: 12, marginTop: 4 },
  empty: {
    borderRadius: 28,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyTitle: { color: Colors.white, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  emptyCopy: { color: Colors.gray[400], fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8, maxWidth: 320 },
  emptyAction: { marginTop: 18 },
  emptyActionText: { color: Colors.primary, fontSize: 14, fontWeight: '800' },
  primary: {
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryMuted: { opacity: 0.55 },
  primaryText: { color: Colors.black, fontSize: 14, fontWeight: '900' },
  chip: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray[900],
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.gray[200], fontSize: 13, fontWeight: '800' },
  chipTextActive: { color: Colors.black },
});

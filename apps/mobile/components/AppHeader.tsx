import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/DesignTokens';
import { STAKEHOLDER_EXPERIENCES, isStakeholderRole } from '@/constants/StakeholderExperience';
import { useAuth } from '@/context/AuthContext';
import promorangLogo from '../assets/images/icon.png';

type AppHeaderProps = {
  title?: string;
  showNotifications?: boolean;
};

export function AppHeader({ title, showNotifications = true }: AppHeaderProps) {
  const { activeRole } = useAuth();
  const role = isStakeholderRole(activeRole) ? activeRole : 'participant';
  const experience = STAKEHOLDER_EXPERIENCES[role];

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Change role view. Current role: ${experience.label}`}
          onPress={() => router.push('/modal')}
          style={styles.context}
        >
          <View style={[styles.roleIcon, { backgroundColor: `${experience.color}20` }]}>
            <Ionicons name={experience.icon} size={16} color={experience.color} />
          </View>
          <View>
            <Text style={styles.contextLabel}>{title || experience.label}</Text>
            <Text style={styles.contextAction}>Change role</Text>
          </View>
          <Ionicons name="chevron-down" size={14} color={Colors.gray[500]} />
        </Pressable>

        <View style={styles.actions}>
          <Pressable accessibilityLabel="Search" onPress={() => router.push('/search' as any)} style={styles.iconButton}>
            <Ionicons name="search" size={19} color={Colors.white} />
          </Pressable>
          {showNotifications && (
            <Pressable accessibilityLabel="Notifications" onPress={() => router.push('/inbox')} style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={19} color={Colors.white} />
              <View style={styles.notificationDot} />
            </Pressable>
          )}
          <Pressable accessibilityLabel="Open profile" onPress={() => router.push('/profile')} style={styles.logoButton}>
            <Image source={promorangLogo} resizeMode="contain" style={styles.logo} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: Colors.black },
  header: {
    minHeight: 62,
    paddingHorizontal: Spacing.container,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.black,
  },
  context: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  roleIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  contextLabel: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  contextAction: { color: Colors.gray[500], fontSize: 9, marginTop: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.gray[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: { position: 'absolute', width: 6, height: 6, borderRadius: 3, right: 8, top: 8, backgroundColor: Colors.primary },
  logoButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 29, height: 29 },
});

import { StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing, BorderRadius } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { useUserBalance } from '@/hooks/useEconomy';
import { useMoments } from '@/hooks/useMoments';
import { useAuth } from '@/context/AuthContext';
import { ProductTour } from '@/components/ProductTour';

export default function TodayScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { balance } = useUserBalance();
  const { moments } = useMoments();
  const { user } = useAuth();

  // Momentum is a mock calculation for now, but linked to points
  const momentum = balance ? Math.min(Math.round((balance.points % 1000) / 10), 100) : 65;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Progress Section */}
      <View style={[styles.heroCard, { backgroundColor: DesignColors.secondary }]}>
        <View style={styles.heroContent}>
          <View style={{ backgroundColor: 'transparent' }}>
            <Text style={styles.heroGreeting}>Good morning, {user?.user_metadata?.full_name?.split(" ")[0] || 'Explorer'}</Text>
            <Text style={styles.heroTitle}>Daily <Text style={{ color: DesignColors.primary }}>Momentum</Text></Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>{momentum}%</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{balance?.points || 0}</Text>
            <Text style={styles.statLabel}>Pts Total</Text>
          </View>
          <View style={[styles.statSeparator, { backgroundColor: DesignColors.gray[700] }]} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{balance?.promokeys || 0}</Text>
            <Text style={styles.statLabel}>Keys</Text>
          </View>
          <View style={[styles.statSeparator, { backgroundColor: DesignColors.gray[700] }]} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Rank 4</Text>
            <Text style={styles.statLabel}>Priority</Text>
          </View>
        </View>
      </View>

      {/* Daily Checklist */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daily Checklist</Text>
        <Pressable><Text style={styles.seeAll}>History</Text></Pressable>
      </View>

      <View style={styles.checklistContainer}>
        {[
          { icon: 'camera', title: 'Capture a Moment', pts: '+50 pts', done: false, route: '/post' },
          { icon: 'map', title: 'Visit a Local Venue', pts: '+100 pts', done: false, route: '/check-in' },
          { icon: 'people', title: 'Engage with Hosts', pts: '+25 pts', done: false, route: '/discover' },
          { icon: 'checkmark-circle', title: 'Daily Check-in', pts: '+10 pts', done: true },
        ].map((item, index) => (
          <Pressable
            key={index}
            style={[
              styles.checklistItem,
              { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }
            ]}
            onPress={() => item.route && router.push(item.route as any)}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.done ? DesignColors.success + '20' : DesignColors.primary + '10' }]}>
              <Ionicons name={item.icon as any} size={20} color={item.done ? DesignColors.success : DesignColors.primary} />
            </View>
            <View style={styles.itemTextContainer}>
              <Text style={[styles.itemTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>{item.title}</Text>
              <Text style={styles.itemPts}>{item.pts}</Text>
            </View>
            {item.done ? (
              <Ionicons name="checkmark-circle" size={24} color={DesignColors.success} />
            ) : (
              <View style={[styles.checkbox, { borderColor: DesignColors.gray[300] }]} />
            )}
          </Pressable>
        ))}
      </View>

      {/* Nearby Active Moments */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Moments Near You</Text>
        <Pressable><Text style={styles.seeAll}>View Map</Text></Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {moments.map((item, index) => (
          <Pressable key={item.id} style={styles.momentCard}>
            <View style={styles.momentImagePlaceholder}>
              <Ionicons name="image" size={40} color={DesignColors.gray[700]} />
            </View>
            <View style={styles.momentInfo}>
              <Text style={styles.momentTitle} numberOfLines={1}>{item.title}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color={DesignColors.primary} />
                <Text style={styles.momentLocation} numberOfLines={1}>{item.location}</Text>
              </View>
            </View>
          </Pressable>
        ))}
        {moments.length === 0 && (
          <Text style={{ color: DesignColors.gray[500], marginLeft: Spacing.container }}>No moments near you yet</Text>
        )}
      </ScrollView>

      <View style={{ height: 100 }} />

      {/* First-Time User Tour */}
      <ProductTour tourId="first-time-user" autoStart={true} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.container,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  heroCard: {
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    backgroundColor: 'transparent',
  },
  heroGreeting: {
    fontSize: Typography.sizes.base,
    color: DesignColors.gray[400],
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  heroTitle: {
    fontSize: Typography.sizes["3xl"],
    fontWeight: 'bold',
    color: DesignColors.white,
    marginTop: Spacing.xs,
  },
  progressCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: DesignColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  progressText: {
    color: DesignColors.white,
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statValue: {
    color: DesignColors.white,
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
  },
  statLabel: {
    color: DesignColors.gray[400],
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  statSeparator: {
    width: 1,
    height: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  seeAll: {
    fontSize: Typography.sizes.sm,
    color: DesignColors.primary,
    fontWeight: '600',
  },
  checklistContainer: {
    backgroundColor: 'transparent',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  itemTextContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  itemTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
  },
  itemPts: {
    fontSize: Typography.sizes.xs,
    color: DesignColors.gray[500],
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  horizontalScroll: {
    marginLeft: -Spacing.container,
    paddingLeft: Spacing.container,
    backgroundColor: 'transparent',
  },
  momentCard: {
    width: 200,
    marginRight: Spacing.md,
    backgroundColor: 'transparent',
  },
  momentImagePlaceholder: {
    width: 200,
    height: 120,
    backgroundColor: DesignColors.gray[900],
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  momentOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'transparent',
  },
  momentBlur: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  momentTime: {
    color: DesignColors.white,
    fontSize: Typography.sizes.xs,
    fontWeight: 'bold',
  },
  momentInfo: {
    marginTop: Spacing.sm,
    backgroundColor: 'transparent',
  },
  momentTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: 'transparent',
    gap: 4,
  },
  momentLocation: {
    fontSize: Typography.sizes.xs,
    color: DesignColors.gray[500],
  },
});

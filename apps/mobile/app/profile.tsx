import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { useAuth } from '@/context/AuthContext';
import { useSocialReturn } from '@/hooks/useSocialReturn';

export default function ProfileScreen() {
  const { user, activeRole, roles, signOut } = useAuth();
  const { summary } = useSocialReturn();
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Promorang Explorer';
  const handle = user?.email?.split('@')[0] || 'explorer';
  const initials = name.split(' ').map((part: string) => part[0]).slice(0, 2).join('').toUpperCase();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" style={styles.circleButton} onPress={() => router.back()}><Ionicons name="arrow-back" size={21} color={Colors.white} /></Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable accessibilityLabel="Profile settings" style={styles.circleButton} onPress={() => router.push('/settings' as any)}><Ionicons name="settings-outline" size={20} color={Colors.white} /></Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <View style={styles.avatar}><Text style={styles.initials}>{initials}</Text><View style={styles.statusDot} /></View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.handle}>@{handle}</Text>
          <View style={styles.role}><Ionicons name="sparkles" size={13} color={Colors.primary} /><Text style={styles.roleText}>{activeRole || roles[0] || 'participant'} · becoming part of the Scene</Text></View>
          <Text style={styles.bio}>{user?.user_metadata?.bio || user?.user_metadata?.location || 'Your participation, memories, and contribution to the Scene live here.'}</Text>
          <Pressable style={styles.editButton} onPress={() => router.push('/edit-profile' as any)}><Text style={styles.editText}>Edit profile</Text></Pressable>
        </View>

        <View style={styles.stats}>
          <Stat value={String(summary.moments)} label="moments" />
          <View style={styles.divider} />
          <Stat value={String(summary.scenes)} label="scenes" />
          <View style={styles.divider} />
          <Stat value={String(summary.connections)} label="connections" />
        </View>

        {/* ACTIVE WORKSPACE CONSOLE */}
        <View style={{ marginTop: 22 }}>
          <Text style={styles.sectionEyebrow}>ACTIVE WORKSPACE CONSOLE</Text>
          {activeRole === 'merchant' ? (
            <Pressable style={[styles.roleConsoleCard, { backgroundColor: '#10B981', borderColor: '#059669' }]} onPress={() => router.push('/merchant/scan')}>
              <View style={styles.roleConsoleIcon}><Ionicons name="qr-code" size={24} color={Colors.black} /></View>
              <View style={styles.roleConsoleCopy}>
                <Text style={styles.roleConsoleEyebrow}>MERCHANT WORKSPACE</Text>
                <Text style={styles.roleConsoleTitle}>Open QR Pass Scanner & Venue Console</Text>
                <Text style={styles.roleConsoleDetail}>Scan customer passes, verify check-ins, and capture traffic.</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </Pressable>
          ) : activeRole === 'host' ? (
            <Pressable style={[styles.roleConsoleCard, { backgroundColor: '#8B5CF6', borderColor: '#7C3AED' }]} onPress={() => router.push('/studio')}>
              <View style={styles.roleConsoleIcon}><Ionicons name="calendar" size={24} color={Colors.black} /></View>
              <View style={styles.roleConsoleCopy}>
                <Text style={styles.roleConsoleEyebrow}>HOST WORKSPACE</Text>
                <Text style={styles.roleConsoleTitle}>Open Host Studio & Moment Control</Text>
                <Text style={styles.roleConsoleDetail}>Approve proof submissions, manage co-hosts, and track turnout.</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </Pressable>
          ) : activeRole === 'brand' ? (
            <Pressable style={[styles.roleConsoleCard, { backgroundColor: '#FF5A0A', borderColor: '#EA580C' }]} onPress={() => router.push('/sponsor' as any)}>
              <View style={styles.roleConsoleIcon}><Ionicons name="business" size={24} color={Colors.black} /></View>
              <View style={styles.roleConsoleCopy}>
                <Text style={styles.roleConsoleEyebrow}>BRAND WORKSPACE</Text>
                <Text style={styles.roleConsoleTitle}>Open Brand Campaign Manager</Text>
                <Text style={styles.roleConsoleDetail}>Fund verified activations, match creators, and track ROI.</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </Pressable>
          ) : activeRole === 'agency' ? (
            <Pressable style={[styles.roleConsoleCard, { backgroundColor: '#F59E0B', borderColor: '#D97706' }]} onPress={() => router.push('/dashboard')}>
              <View style={styles.roleConsoleIcon}><Ionicons name="layers" size={24} color={Colors.black} /></View>
              <View style={styles.roleConsoleCopy}>
                <Text style={styles.roleConsoleEyebrow}>AGENCY WORKSPACE</Text>
                <Text style={styles.roleConsoleTitle}>Open Client Portfolio Console</Text>
                <Text style={styles.roleConsoleDetail}>Manage client rosters and multi-partner activation briefs.</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </Pressable>
          ) : activeRole === 'admin' ? (
            <Pressable style={[styles.roleConsoleCard, { backgroundColor: '#6B7280', borderColor: '#4B5563' }]} onPress={() => router.push('/studio')}>
              <View style={styles.roleConsoleIcon}><Ionicons name="settings" size={24} color={Colors.black} /></View>
              <View style={styles.roleConsoleCopy}>
                <Text style={styles.roleConsoleEyebrow}>ADMIN WORKSPACE</Text>
                <Text style={styles.roleConsoleTitle}>Open Platform Operating Console</Text>
                <Text style={styles.roleConsoleDetail}>Oversee system nodes, approve moments, and audit activity.</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </Pressable>
          ) : activeRole === 'creator' ? (
            <Pressable style={[styles.roleConsoleCard, { backgroundColor: '#EC4899', borderColor: '#DB2777' }]} onPress={() => router.push('/promoshare')}>
              <View style={styles.roleConsoleIcon}><Ionicons name="videocam" size={24} color={Colors.black} /></View>
              <View style={styles.roleConsoleCopy}>
                <Text style={styles.roleConsoleEyebrow}>CREATOR WORKSPACE</Text>
                <Text style={styles.roleConsoleTitle}>Open Creator Studio & Bounties</Text>
                <Text style={styles.roleConsoleDetail}>Publish takes for active prompts and track action earnings.</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </Pressable>
          ) : (
            <Pressable style={styles.roleConsoleCardDefault} onPress={() => router.push('/dashboard')}>
              <View style={styles.roleConsoleIcon}><Ionicons name="compass" size={24} color={Colors.primary} /></View>
              <View style={styles.roleConsoleCopy}>
                <Text style={styles.roleConsoleEyebrow}>PARTICIPANT DASHBOARD</Text>
                <Text style={styles.roleConsoleTitle}>View Attendance & Activity</Text>
                <Text style={styles.roleConsoleDetail}>See verified check-ins, saved moments, and memories.</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionEyebrow}>YOUR SCENES</Text>
        {summary.recent_openings.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scenes}>
          {summary.recent_openings.slice(0, 6).map((opening, index) => (
            <Pressable key={opening.id} style={styles.scene} onPress={() => opening.destination_url ? router.push(opening.destination_url as any) : router.push('/discover')}>
              <View style={[styles.sceneIcon, index === 0 && styles.sceneIconActive]}><Ionicons name={opening.type === 'invitation' ? 'mail-open' : 'sparkles'} size={21} color={index === 0 ? Colors.primary : Colors.gray[300]} /></View>
              <Text numberOfLines={2} style={styles.sceneTitle}>{opening.title}</Text><Text style={styles.sceneDetail}>{opening.status.replaceAll('_', ' ')}</Text>
            </Pressable>
          ))}
        </ScrollView> : <Pressable style={styles.sceneEmpty} onPress={() => router.push('/discover')}><Ionicons name="compass" size={20} color={Colors.primary} /><View style={styles.sceneEmptyCopy}><Text style={styles.sceneTitle}>Find your first Scene</Text><Text style={styles.sceneDetail}>Moments and openings you join will appear here.</Text></View><Ionicons name="arrow-forward" size={18} color={Colors.gray[500]} /></Pressable>}

        <View style={styles.sectionRow}><View><Text style={styles.sectionEyebrowFlush}>YOUR PLACE IN THE SCENE</Text><Text style={styles.sectionTitle}>What showing up has opened</Text></View><Pressable onPress={() => router.push('/vault')}><Text style={styles.seeAll}>See all</Text></Pressable></View>
        <View style={styles.proofCard}>
          <View style={styles.proofTop}><View style={styles.proofIcon}><Ionicons name="people" size={22} color={Colors.success} /></View><View style={styles.proofCopy}><Text style={styles.proofTitle}>{summary.returns > 0 ? 'A familiar face' : 'Your Scene is waiting'}</Text><Text style={styles.proofDetail}>{summary.returns > 0 ? `You came back ${summary.returns} time${summary.returns === 1 ? '' : 's'}` : 'Your first return starts with one Moment worth showing up for'}</Text></View><Text style={styles.proofScore}>{summary.returns}</Text></View>
          <View style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, summary.returns * 20)}%` }]} /></View>
          <Text style={styles.proofHint}>{summary.open_doors > 0 ? `${summary.open_doors} open invitation${summary.open_doors === 1 ? '' : 's'} or opportunit${summary.open_doors === 1 ? 'y' : 'ies'} waiting for you.` : 'Keep showing up and taking part. Invitations and opportunities will appear here.'}</Text>
        </View>

        <Text style={styles.sectionEyebrow}>YOUR LIBRARY</Text>
        <View style={styles.menu}>
          <MenuItem icon="bookmark" title="Saved" detail="Moments, creators, and action prompts for later" route="/saved" />
          <MenuItem icon="archive" title="Vault" detail="Memories, access, rewards and receipts" route="/vault" />
          <MenuItem icon="time" title="Activity" detail="Where you went and what happened next" route="/inbox" />
          <MenuItem icon="people" title="Following" detail="Creators and scenes you show up for" route={{ pathname: '/search', params: { type: 'creators' } }} />
        </View>

        <Text style={styles.sectionEyebrow}>ROLE PROGRESSION</Text>
        <Pressable style={styles.studioEntry} onPress={() => router.push('/studio' as any)}>
          <View style={styles.studioIcon}><Ionicons name="grid" size={22} color={Colors.primary} /></View>
          <View style={styles.progressionCopy}><Text style={styles.progressionLabel}>CREATOR & HOST TOOLS</Text><Text style={styles.progressionTitle}>Open Studio</Text><Text style={styles.progressionDetail}>Shape Moments, recognize contributions, and see what happened.</Text></View>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </Pressable>
        <Pressable style={styles.progression} onPress={() => router.push('/promoshare')}>
          <View style={styles.progressionIcon}><Ionicons name="megaphone" size={22} color={Colors.primary} /></View>
          <View style={styles.progressionCopy}><Text style={styles.progressionLabel}>WHAT COULD OPEN NEXT</Text><Text style={styles.progressionTitle}>Help the Scene travel</Text><Text style={styles.progressionDetail}>Share stories that bring the right people into what is happening.</Text></View>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </Pressable>

        <Pressable style={styles.signOut} onPress={signOut}><Ionicons name="log-out-outline" size={18} color={Colors.gray[500]} /><Text style={styles.signOutText}>Sign out</Text></Pressable>
        <View style={{ height: 45 }} />
      </ScrollView>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}
function MenuItem({ icon, title, detail, route }: { icon: any; title: string; detail: string; route?: any }) {
  return <Pressable style={styles.menuItem} onPress={() => route && router.push(route as any)}><View style={styles.menuIcon}><Ionicons name={icon} size={19} color={Colors.primary} /></View><View style={styles.menuCopy}><Text style={styles.menuTitle}>{title}</Text><Text style={styles.menuDetail}>{detail}</Text></View><Ionicons name="chevron-forward" size={18} color={Colors.gray[600]} /></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: Spacing.container, paddingBottom: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.black },
  circleButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: Colors.white, fontSize: 15, fontWeight: '800' },
  content: { paddingHorizontal: Spacing.container },
  identity: { alignItems: 'center', paddingTop: 15, backgroundColor: 'transparent' },
  avatar: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#4B2D1D', borderWidth: 2, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  initials: { color: Colors.white, fontSize: 29, fontWeight: '800' },
  statusDot: { position: 'absolute', right: 3, bottom: 8, width: 17, height: 17, borderRadius: 9, backgroundColor: Colors.success, borderWidth: 3, borderColor: Colors.black },
  name: { color: Colors.white, fontSize: Typography.sizes['2xl'], fontWeight: '800', letterSpacing: -.7, marginTop: 15 },
  handle: { color: Colors.gray[500], fontSize: 12, marginTop: 3 },
  role: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15, backgroundColor: Colors.ambientWash, marginTop: 10 },
  roleText: { color: Colors.accent, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  bio: { color: Colors.gray[300], fontSize: 12, lineHeight: 18, textAlign: 'center', maxWidth: 280, marginTop: 13 },
  editButton: { marginTop: 14, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 18, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  editText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  stats: { flexDirection: 'row', paddingVertical: 18, marginTop: 22, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  stat: { flex: 1, alignItems: 'center', backgroundColor: 'transparent' },
  statValue: { color: Colors.white, fontSize: 20, fontWeight: '800' },
  statLabel: { color: Colors.gray[500], fontSize: 12, marginTop: 2 },
  divider: { width: StyleSheet.hairlineWidth, backgroundColor: Colors.border },
  sectionEyebrow: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1, marginTop: 26, marginBottom: 10 },
  scenes: { gap: 9 },
  sceneEmpty: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  sceneEmptyCopy: { flex: 1, backgroundColor: 'transparent' },
  scene: { width: 116, padding: 13, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  sceneIcon: { width: 39, height: 39, borderRadius: 13, backgroundColor: Colors.gray[800], alignItems: 'center', justifyContent: 'center' },
  sceneIconActive: { backgroundColor: Colors.ambientWash },
  sceneTitle: { color: Colors.white, fontSize: 13, fontWeight: '700', marginTop: 12 },
  sceneDetail: { color: Colors.gray[500], fontSize: 12, marginTop: 3 },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 27, marginBottom: 10, backgroundColor: 'transparent' },
  sectionEyebrowFlush: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1 },
  sectionTitle: { color: Colors.white, fontSize: 17, fontWeight: '800', marginTop: 4 },
  seeAll: { color: Colors.primary, fontSize: 13, fontWeight: '700' },
  proofCard: { padding: 16, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  proofTop: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' },
  proofIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: 'rgba(103,197,135,.12)', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  proofCopy: { flex: 1, backgroundColor: 'transparent' },
  proofTitle: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  proofDetail: { color: Colors.gray[500], fontSize: 12, marginTop: 3 },
  proofScore: { color: Colors.success, fontSize: 16, fontWeight: '800' },
  track: { height: 4, borderRadius: 2, backgroundColor: Colors.gray[700], marginTop: 14 },
  fill: { width: '83%', height: 4, borderRadius: 2, backgroundColor: Colors.success },
  proofHint: { color: Colors.gray[500], fontSize: 12, marginTop: 8 },
  menu: { borderRadius: BorderRadius.xl, overflow: 'hidden', backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, backgroundColor: 'transparent' },
  menuIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  menuCopy: { flex: 1, backgroundColor: 'transparent' },
  menuTitle: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  menuDetail: { color: Colors.gray[500], fontSize: 12, marginTop: 3 },
  progression: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: BorderRadius.xl, backgroundColor: '#24160F', borderWidth: 1, borderColor: 'rgba(255,106,26,.24)' },
  studioEntry: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 9, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  studioIcon: { width: 45, height: 45, borderRadius: 15, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  progressionIcon: { width: 45, height: 45, borderRadius: 15, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  progressionCopy: { flex: 1, backgroundColor: 'transparent' },
  progressionLabel: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .6 },
  progressionTitle: { color: Colors.white, fontSize: 13, fontWeight: '800', marginTop: 3 },
  progressionDetail: { color: Colors.gray[400], fontSize: 12, lineHeight: 14, marginTop: 3 },
  signOut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, padding: 15, marginTop: 20, backgroundColor: 'transparent' },
  signOutText: { color: Colors.gray[500], fontSize: 13, fontWeight: '700' },
  roleConsoleCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: BorderRadius.xl, borderWidth: 1, gap: 12 },
  roleConsoleCardDefault: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, gap: 12 },
  roleConsoleIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  roleConsoleCopy: { flex: 1, backgroundColor: 'transparent' },
  roleConsoleEyebrow: { color: Colors.white, fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: .6, opacity: 0.9 },
  roleConsoleTitle: { color: Colors.white, fontSize: 14, fontWeight: '800', marginTop: 2 },
  roleConsoleDetail: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
});

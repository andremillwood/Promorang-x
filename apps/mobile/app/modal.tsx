import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Colors as DesignColors, Typography, Spacing, BorderRadius } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';

const roleLabels: Record<UserRole, { label: string; icon: any; color: string; desc: string }> = {
  participant: { label: "Participant", icon: "people", color: "#3B82F6", desc: "Discover and join moments" },
  host: { label: "Host", icon: "calendar", color: "#8B5CF6", desc: "Organize and lead moments" },
  brand: { label: "Brand", icon: "business", color: DesignColors.primary, desc: "Fund activations & track ROI" },
  merchant: { label: "Merchant", icon: "storefront", color: "#10B981", desc: "Drive foot traffic to venues" },
  admin: { label: "Admin", icon: "settings", color: "#6B7280", desc: "Manage platform systems" },
};

export default function ModalScreen() {
  const { roles, activeRole, setActiveRole, organizations, activeOrgId, setActiveOrgId, agencyClients, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const activeOrg = organizations.find(o => o.id === activeOrgId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Switch <Text style={{ color: DesignColors.primary }}>Context</Text></Text>
        <Text style={styles.subtitle}>Select your active role or organization</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>YOUR ROLES</Text>
        {roles.map((role) => {
          const info = roleLabels[role];
          const isActive = activeRole === role;
          return (
            <Pressable
              key={role}
              onPress={() => {
                setActiveRole(role);
                router.back();
              }}
              style={[
                styles.card,
                { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white },
                isActive && { borderColor: DesignColors.primary, borderWidth: 2 }
              ]}
            >
              <View style={[styles.iconBox, { backgroundColor: info.color + '20' }]}>
                <Ionicons name={info.icon} size={24} color={info.color} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: isDark ? 'white' : 'black' }]}>{info.label}</Text>
                <Text style={styles.cardDesc}>{info.desc}</Text>
              </View>
              {isActive && <Ionicons name="checkmark-circle" size={24} color={DesignColors.primary} />}
            </Pressable>
          );
        })}

        {organizations.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>ORGANIZATIONS</Text>
            {organizations.map((org) => {
              const isActive = activeOrgId === org.id;
              return (
                <Pressable
                  key={org.id}
                  onPress={() => {
                    setActiveOrgId(org.id);
                    router.back();
                  }}
                  style={[
                    styles.card,
                    { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white },
                    isActive && { borderColor: DesignColors.primary, borderWidth: 2 }
                  ]}
                >
                  <View style={[styles.iconBox, { backgroundColor: DesignColors.primary + '10' }]}>
                    <Ionicons name="business" size={24} color={DesignColors.primary} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: isDark ? 'white' : 'black' }]}>{org.name}</Text>
                    <Text style={styles.cardDesc}>{org.type}</Text>
                  </View>
                  {isActive && <Ionicons name="checkmark-circle" size={24} color={DesignColors.primary} />}
                </Pressable>
              );
            })}
          </>
        )}

        {agencyClients.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>AGENCY CLIENTS</Text>
            {agencyClients.map((client) => {
              const isActive = activeOrgId === client.id;
              return (
                <Pressable
                  key={client.id}
                  onPress={() => {
                    setActiveOrgId(client.id);
                    if (client.type === 'brand') setActiveRole('brand');
                    if (client.type === 'merchant') setActiveRole('merchant');
                    router.back();
                  }}
                  style={[
                    styles.card,
                    { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white },
                    isActive && { borderColor: DesignColors.accent, borderWidth: 2 }
                  ]}
                >
                  <View style={[styles.iconBox, { backgroundColor: DesignColors.accent + '20' }]}>
                    <Ionicons name="people" size={24} color={DesignColors.accent} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: isDark ? 'white' : 'black' }]}>{client.name}</Text>
                    <Text style={styles.cardDesc}>Manage as {client.type}</Text>
                  </View>
                  {isActive && <Ionicons name="checkmark-circle" size={24} color={DesignColors.accent} />}
                </Pressable>
              );
            })}
          </>
        )}

        <Pressable
          style={styles.signOutBtn}
          onPress={async () => {
            await signOut();
            router.replace('/auth/login');
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={DesignColors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 40,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: DesignColors.gray[500],
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 0,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: DesignColors.gray[500],
    letterSpacing: 2,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardDesc: {
    fontSize: 12,
    color: DesignColors.gray[500],
    marginTop: 2,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 40,
    paddingVertical: 16,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: DesignColors.error + '30',
  },
  signOutText: {
    color: DesignColors.error,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

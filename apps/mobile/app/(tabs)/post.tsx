import { StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing, BorderRadius } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';

export default function PostScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Creator Studio</Text>
                <Text style={styles.subtitle}>Share your world, earn priority rank.</Text>
            </View>

            <View style={styles.actionContainer}>
                {[
                    { icon: 'camera', title: 'Snap a Moment', desc: 'Capture what\'s happening now', color: DesignColors.primary },
                    { icon: 'images', title: 'Upload from Canon', desc: 'Share your existing captures', color: DesignColors.accent },
                ].map((item, index) => (
                    <Pressable
                        key={index}
                        style={[styles.actionCard, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
                            <Ionicons name={item.icon as any} size={28} color={item.color} />
                        </View>
                        <View style={styles.cardInfo}>
                            <Text style={[styles.cardTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>{item.title}</Text>
                            <Text style={styles.cardDesc}>{item.desc}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={DesignColors.gray[600]} />
                    </Pressable>
                ))}

                {/* Redirect for Propose */}
                <View style={[styles.divider, { borderBottomColor: isDark ? DesignColors.gray[800] : DesignColors.gray[200] }]} />

                <View style={{ paddingHorizontal: 4 }}>
                    <Text style={{ fontSize: 12, color: DesignColors.gray[500], marginBottom: 12, fontWeight: '600', textTransform: 'uppercase' }}>Looking to Organize?</Text>
                    <Pressable
                        style={[styles.actionCard, { backgroundColor: DesignColors.primary + '10', borderWidth: 1, borderColor: DesignColors.primary + '30' }]}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: 'white' }]}>
                            <Ionicons name="sparkles" size={24} color={DesignColors.primary} />
                        </View>
                        <View style={styles.cardInfo}>
                            <Text style={[styles.cardTitle, { color: DesignColors.primary }]}>Propose a Moment</Text>
                            <Text style={styles.cardDesc}>Get funded to host an event</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={20} color={DesignColors.primary} />
                    </Pressable>
                </View>
            </View>

            <View style={styles.tipContainer}>
                <BlurView intensity={isDark ? 30 : 50} style={styles.tipBlur}>
                    <Ionicons name="sparkles" size={16} color={DesignColors.primary} />
                    <Text style={styles.tipText}>
                        High-quality moments are 3x more likely to be featured by brands.
                    </Text>
                </BlurView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Spacing.container,
    },
    header: {
        marginTop: Platform.OS === 'ios' ? 60 : 40,
        marginBottom: Spacing.2xl,
        backgroundColor: 'transparent',
    },
    title: {
        fontSize: Typography.sizes["3xl"],
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: Typography.sizes.base,
        color: DesignColors.gray[500],
        marginTop: 8,
    },
    actionContainer: {
        gap: Spacing.md,
        backgroundColor: 'transparent',
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius["2xl"],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.lg,
    },
    cardInfo: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    cardTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: 'bold',
    },
    cardDesc: {
        fontSize: Typography.sizes.xs,
        color: DesignColors.gray[500],
        marginTop: 2,
    },
    tipContainer: {
        marginTop: 'auto',
        marginBottom: 40,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    tipBlur: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        gap: 12,
    },
    tipText: {
        flex: 1,
        fontSize: Typography.sizes.xs,
        color: DesignColors.gray[400],
        fontStyle: 'italic',
    },
});

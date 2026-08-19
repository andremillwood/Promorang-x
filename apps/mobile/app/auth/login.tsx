import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuth, UserRole } from '@/context/AuthContext';
import { WEB_BASE } from '@/lib/api';
import promorangLogo from '../../assets/images/icon.png';

const BRAND_ORANGE = '#FF5A0A';
const SHOW_DEMO_LOGIN = __DEV__ || process.env.EXPO_PUBLIC_ENABLE_DEMO_LOGIN === 'true';
const DEMO_ROLES: Array<{
    role: UserRole;
    label: string;
    detail: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    color: string;
}> = [
    { role: 'participant', label: 'Participant', detail: 'Find moments', icon: 'people', color: '#3B82F6' },
    { role: 'creator', label: 'Creator', detail: 'Create proof', icon: 'videocam', color: '#EC4899' },
    { role: 'host', label: 'Host', detail: 'Fill the room', icon: 'calendar', color: '#8B5CF6' },
    { role: 'brand', label: 'Brand', detail: 'Fund action', icon: 'business', color: BRAND_ORANGE },
    { role: 'merchant', label: 'Merchant', detail: 'Drive visits', icon: 'storefront', color: '#10B981' },
    { role: 'agency', label: 'Agency', detail: 'Manage clients', icon: 'layers', color: '#F59E0B' },
];

export default function LoginScreen() {
    const { signInWithGoogle, signInWithApple, demoSignIn, isLoading } = useAuth();
    const isDark = useColorScheme() === 'dark';

    const palette = isDark
        ? {
            background: '#11100F',
            surface: '#1C1A18',
            text: '#FFF9F3',
            muted: '#B8AFA7',
            button: '#FFF9F3',
            buttonText: '#171411',
            line: '#39342F',
        }
        : {
            background: '#FFF8F0',
            surface: '#FFFFFF',
            text: '#201812',
            muted: '#74685E',
            button: '#201812',
            buttonText: '#FFFFFF',
            line: '#EADFD4',
        };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
            <View style={styles.hero}>
                <View style={styles.glowLarge} />
                <View style={styles.glowSmall} />

                <View style={styles.eyebrow}>
                    <View style={styles.liveDot} />
                    <Text style={[styles.eyebrowText, { color: palette.text }]}>SHOW UP. KEEP THE PROOF.</Text>
                </View>

                <View style={styles.logoOrbit}>
                    <View style={styles.logoTile}>
                        <Image
                            source={promorangLogo}
                            style={styles.logo}
                            resizeMode="contain"
                            accessibilityLabel="Promorang logo"
                        />
                    </View>
                    <View style={[styles.sparkBadge, { backgroundColor: palette.text }]}>
                        <Ionicons name="sparkles" size={17} color={palette.background} />
                    </View>
                </View>

                <Text style={[styles.title, { color: palette.text }]}>
                    Make real life{'\n'}
                    <Text style={styles.titleAccent}>count.</Text>
                </Text>
                <Text style={[styles.subtitle, { color: palette.muted }]}>
                    Find moments worth joining, prove what happened, and keep the rewards, access, and memories you earn.
                </Text>
            </View>

            <View style={[styles.authCard, { backgroundColor: palette.surface, borderColor: palette.line }]}>
                <Text style={[styles.cardTitle, { color: palette.text }]}>Welcome to Promorang</Text>
                <Text style={[styles.cardSubtitle, { color: palette.muted }]}>One tap to start exploring.</Text>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Continue with Google"
                    onPress={signInWithGoogle}
                    style={({ pressed }) => [
                        styles.button,
                        { backgroundColor: palette.button },
                        pressed && styles.buttonPressed,
                        isLoading && styles.buttonDisabled,
                    ]}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={palette.buttonText} />
                    ) : (
                        <>
                            <View style={styles.googleBadge}>
                                <Ionicons name="logo-google" size={18} color="#4285F4" />
                            </View>
                            <Text style={[styles.buttonText, { color: palette.buttonText }]}>Continue with Google</Text>
                            <Ionicons name="arrow-forward" size={19} color={palette.buttonText} />
                        </>
                    )}
                </Pressable>

                {Platform.OS === 'ios' && (
                    <AppleAuthentication.AppleAuthenticationButton
                        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                        buttonStyle={isDark
                            ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                            : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                        cornerRadius={14}
                        style={styles.appleButton}
                        onPress={async () => {
                            const { error } = await signInWithApple();
                            if (error) Alert.alert('Apple sign-in unavailable', error.message);
                        }}
                    />
                )}

                <Text style={[styles.legal, { color: palette.muted }]}>
                    By continuing, you agree to our{' '}
                    <Text style={styles.legalLink} onPress={() => Linking.openURL(`${WEB_BASE}/terms`)}>Terms</Text>
                    {' '}and{' '}
                    <Text style={styles.legalLink} onPress={() => Linking.openURL(`${WEB_BASE}/privacy`)}>Privacy Policy</Text>.
                </Text>
            </View>

            {SHOW_DEMO_LOGIN && <View style={styles.demoSection}>
                <View style={styles.demoHeading}>
                    <View style={styles.demoPill}>
                        <Ionicons name="flask" size={13} color={BRAND_ORANGE} />
                        <Text style={styles.demoPillText}>DEVELOPMENT DEMO</Text>
                    </View>
                    <Text style={[styles.demoTitle, { color: palette.text }]}>Explore by stakeholder</Text>
                    <Text style={[styles.demoSubtitle, { color: palette.muted }]}>
                        Open a preset workspace and see the app from that role.
                    </Text>
                </View>

                <View style={styles.demoGrid}>
                    {DEMO_ROLES.map(({ role, label, detail, icon, color }) => (
                        <Pressable
                            key={role}
                            accessibilityRole="button"
                            accessibilityLabel={`Enter ${label} demo`}
                            disabled={isLoading}
                            onPress={async () => {
                                const { error } = await demoSignIn(role);
                                if (error) {
                                    Alert.alert('Demo unavailable', error.message);
                                }
                            }}
                            style={({ pressed }) => [
                                styles.demoCard,
                                { backgroundColor: palette.surface, borderColor: palette.line },
                                pressed && styles.buttonPressed,
                            ]}
                        >
                            <View style={[styles.demoIcon, { backgroundColor: `${color}18` }]}>
                                <Ionicons name={icon} size={21} color={color} />
                            </View>
                            <View style={styles.demoCopy}>
                                <Text style={[styles.demoRole, { color: palette.text }]}>{label}</Text>
                                <Text style={[styles.demoDetail, { color: palette.muted }]}>{detail}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={17} color={palette.muted} />
                        </Pressable>
                    ))}
                </View>
            </View>}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 12,
    },
    hero: {
        minHeight: 470,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        paddingTop: 24,
    },
    glowLarge: {
        position: 'absolute',
        width: 310,
        height: 310,
        borderRadius: 155,
        backgroundColor: '#FF5A0A14',
        top: 35,
        right: -110,
    },
    glowSmall: {
        position: 'absolute',
        width: 170,
        height: 170,
        borderRadius: 85,
        backgroundColor: '#FFB00018',
        top: 108,
        right: -30,
    },
    eyebrow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    liveDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: BRAND_ORANGE,
    },
    eyebrowText: {
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 1.6,
    },
    logoOrbit: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 1,
        borderColor: '#FF5A0A55',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 26,
    },
    logoTile: {
        width: 90,
        height: 90,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: BRAND_ORANGE,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 22,
        elevation: 8,
    },
    logo: {
        width: 62,
        height: 62,
    },
    sparkBadge: {
        position: 'absolute',
        right: 3,
        top: 8,
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 36,
        lineHeight: 41,
        fontWeight: '900',
        letterSpacing: -1.4,
        textAlign: 'center',
    },
    titleAccent: {
        color: BRAND_ORANGE,
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        maxWidth: 330,
        marginTop: 14,
    },
    authCard: {
        borderWidth: 1,
        borderRadius: 28,
        padding: 20,
        shadowColor: '#3A1E0C',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.4,
    },
    cardSubtitle: {
        fontSize: 14,
        marginTop: 4,
        marginBottom: 18,
    },
    button: {
        minHeight: 58,
        borderRadius: 18,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    buttonPressed: {
        transform: [{ scale: 0.985 }],
        opacity: 0.92,
    },
    buttonDisabled: {
        opacity: 0.65,
    },
    googleBadge: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '700',
    },
    legal: {
        fontSize: 13,
        lineHeight: 16,
        textAlign: 'center',
        marginTop: 14,
        paddingHorizontal: 18,
    },
    legalLink: {
        color: BRAND_ORANGE,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    appleButton: {
        width: '100%',
        height: 52,
        marginTop: 10,
    },
    demoSection: {
        paddingTop: 26,
    },
    demoHeading: {
        alignItems: 'center',
        marginBottom: 15,
    },
    demoPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: '#FF5A0A12',
        marginBottom: 10,
    },
    demoPillText: {
        color: BRAND_ORANGE,
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1.1,
    },
    demoTitle: {
        fontSize: 21,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    demoSubtitle: {
        fontSize: 13,
        lineHeight: 18,
        textAlign: 'center',
        marginTop: 5,
    },
    demoGrid: {
        gap: 10,
    },
    demoCard: {
        minHeight: 68,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
    },
    demoIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    demoCopy: {
        flex: 1,
        marginLeft: 12,
    },
    demoRole: {
        fontSize: 15,
        fontWeight: '800',
    },
    demoDetail: {
        fontSize: 12,
        marginTop: 2,
    },
});

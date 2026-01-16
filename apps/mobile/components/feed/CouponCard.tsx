import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ticket, Copy, ExternalLink, Clock } from 'lucide-react-native';
import { Coupon } from '@/types';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import colors from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';
import { LinearGradient } from 'expo-linear-gradient';

interface CouponCardProps {
    coupon: Coupon;
    onPress: (couponId: string) => void;
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon, onPress }) => {
    const theme = useThemeColors();
    const formatExpiry = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <TouchableOpacity onPress={() => onPress(coupon.id)} activeOpacity={0.9}>
            <Card style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }] as any} padding="none">
                <View style={styles.container}>
                    <LinearGradient
                        colors={['#FF6600', '#FF3366']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.leftSection}
                    >
                        <Text style={styles.discountText}>{coupon.discount}</Text>
                        <Text style={styles.discountLabel}>OFF</Text>
                    </LinearGradient>

                    <View style={styles.rightSection}>
                        <View style={styles.header}>
                            {coupon.brand ? (
                                <View style={styles.brandContainer}>
                                    <Avatar
                                        source={coupon.brand.logo}
                                        size="xs"
                                        name={coupon.brand.name}
                                    />
                                    <Text style={[styles.brandName, { color: theme.textSecondary }]}>{coupon.brand.name}</Text>
                                </View>
                            ) : (
                                <View style={styles.brandContainer}>
                                    <Avatar
                                        size="xs"
                                        name="Promorang"
                                    />
                                    <Text style={[styles.brandName, { color: theme.textSecondary }]}>Promorang</Text>
                                </View>
                            )}
                            <View style={[styles.categoryBadge, { backgroundColor: theme.background }]}>
                                <Text style={[styles.categoryText, { color: theme.textSecondary }]}>{coupon.category || 'Deal'}</Text>
                            </View>
                        </View>

                        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                            {coupon.title}
                        </Text>
                        <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
                            {coupon.description}
                        </Text>

                        <View style={styles.footer}>
                            <View style={styles.expiryContainer}>
                                <Clock size={12} color={theme.textSecondary} />
                                <Text style={[styles.expiryText, { color: theme.textSecondary }]}>Expires {formatExpiry(coupon.expiresAt)}</Text>
                            </View>

                            <View style={styles.actionContainer}>
                                {coupon.isClaimed ? (
                                    <View style={styles.claimedBadge}>
                                        <Text style={styles.claimedText}>CLAIMED</Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity style={styles.claimButton}>
                                        <Text style={styles.claimButtonText}>Claim</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Decorative Ticket Notches */}
                <View style={[styles.notch, styles.topNotch, { backgroundColor: theme.background }]} />
                <View style={[styles.notch, styles.bottomNotch, { backgroundColor: theme.background }]} />
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    container: {
        flexDirection: 'row',
        height: 120,
    },
    leftSection: {
        width: 90,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: 'rgba(255,255,255,0.2)',
        borderStyle: 'dashed',
    },
    discountText: {
        color: colors.white,
        fontSize: 24,
        fontWeight: '800',
    },
    discountLabel: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600',
        marginTop: -4,
    },
    rightSection: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    brandName: {
        fontSize: 12,
        color: colors.darkGray,
        marginLeft: 6,
        fontWeight: '600',
    },
    categoryBadge: {
        backgroundColor: colors.gray,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    categoryText: {
        fontSize: 10,
        color: colors.darkGray,
        fontWeight: '500',
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.black,
        marginBottom: 2,
    },
    description: {
        fontSize: 12,
        color: colors.darkGray,
        lineHeight: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    expiryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    expiryText: {
        fontSize: 10,
        color: colors.darkGray,
        marginLeft: 4,
    },
    claimedBadge: {
        backgroundColor: colors.lightGray,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    claimedText: {
        fontSize: 10,
        color: colors.darkGray,
        fontWeight: '700',
    },
    claimButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    claimButtonText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: '700',
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notch: {
        position: 'absolute',
        left: 82, // 90 width - 8 center
        width: 16,
        height: 16,
        backgroundColor: colors.gray, // Match screen background usually
        borderRadius: 8,
        zIndex: 1,
    },
    topNotch: {
        top: -8,
    },
    bottomNotch: {
        bottom: -8,
    },
});

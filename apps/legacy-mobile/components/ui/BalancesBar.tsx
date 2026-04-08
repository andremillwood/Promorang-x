import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Coins, Trophy, DollarSign } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { User } from '@/types';

interface BalancesBarProps {
    user: User | null;
}

export const BalancesBar: React.FC<BalancesBarProps> = ({ user }) => {
    const theme = useThemeColors();

    if (!user) return null;

    return (
        <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.balanceItem}>
                <Coins size={18} color="#F59E0B" />
                <Text style={[styles.balanceValue, { color: theme.text }]}>{user.points_balance?.toLocaleString() || '0'}</Text>
                <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Points</Text>
            </View>
            <View style={[styles.balanceDivider, { backgroundColor: theme.border }]} />
            <View style={styles.balanceItem}>
                <Trophy size={18} color="#8B5CF6" />
                <Text style={[styles.balanceValue, { color: theme.text }]}>{user.keys_balance || '0'}</Text>
                <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Keys</Text>
            </View>
            <View style={[styles.balanceDivider, { backgroundColor: theme.border }]} />
            <View style={styles.balanceItem}>
                <DollarSign size={18} color="#10B981" />
                <Text style={[styles.balanceValue, { color: theme.text }]}>{user.gems_balance || '0'}</Text>
                <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Gems</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    balanceItem: {
        alignItems: 'center',
        gap: 4,
    },
    balanceValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    balanceLabel: {
        fontSize: 11,
    },
    balanceDivider: {
        width: 1,
        height: 40,
    },
});

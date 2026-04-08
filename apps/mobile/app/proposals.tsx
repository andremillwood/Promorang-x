import { StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { useProposals } from '@/hooks/useProposals';

export default function ProposalsScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { data: proposals, isLoading } = useProposals();

    return (
        <View style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={DesignColors.primary} />
                </Pressable>
                <Text style={styles.title}>Proposals</Text>
                <Pressable onPress={() => router.push('/create-proposal')} style={styles.addButton}>
                    <Ionicons name="add" size={24} color="white" />
                </Pressable>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <Text>Loading proposals...</Text>
                </View>
            ) : (
                <FlatList
                    data={proposals}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <View style={[styles.card, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.statusBadge,
                                item.status === 'accepted' ? { backgroundColor: DesignColors.success + '20' } :
                                    item.status === 'draft' ? { backgroundColor: DesignColors.gray[200] } :
                                        { backgroundColor: DesignColors.warning + '20' }
                                ]}>
                                    <Text style={[styles.statusText,
                                    item.status === 'accepted' ? { color: DesignColors.success } :
                                        item.status === 'draft' ? { color: DesignColors.gray[600] } :
                                            { color: DesignColors.warning }
                                    ]}>{item.status}</Text>
                                </View>
                                {item.budget ? (
                                    <Text style={styles.budget}>${item.budget.toLocaleString()}</Text>
                                ) : null}
                            </View>
                            <Text style={styles.proposalTitle}>{item.title}</Text>
                            <Text style={styles.proposalDesc} numberOfLines={2}>{item.description}</Text>
                            {item.brand && (
                                <Text style={styles.brandName}>Pitching to: {item.brand.name}</Text>
                            )}
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="document-text-outline" size={48} color={DesignColors.gray[400]} />
                            <Text style={styles.emptyText}>No proposals yet.</Text>
                            <Pressable onPress={() => router.push('/create-proposal')}>
                                <Text style={{ color: DesignColors.primary, fontWeight: 'bold', marginTop: 8 }}>Create your first draft</Text>
                            </Pressable>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: DesignColors.primary + '10',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: DesignColors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: Typography.sizes.xl,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        padding: 20,
        gap: 16,
    },
    card: {
        padding: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    budget: {
        fontSize: 14,
        fontWeight: 'bold',
        color: DesignColors.success,
    },
    proposalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    proposalDesc: {
        fontSize: 14,
        color: DesignColors.gray[500],
        marginBottom: 8,
    },
    brandName: {
        fontSize: 12,
        color: DesignColors.gray[400],
        fontStyle: 'italic',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        gap: 16,
    },
    emptyText: {
        color: DesignColors.gray[500],
        fontSize: 16,
    },
});

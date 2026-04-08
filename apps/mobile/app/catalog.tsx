import { useState } from 'react';
import { StyleSheet, ScrollView, FlatList, Pressable, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { useProducts, useCreateProduct, useDeleteProduct } from '@/hooks/useProducts';

export default function CatalogScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { activeOrgId } = useAuth();
    const { data: products, isLoading } = useProducts(activeOrgId);
    const createProduct = useCreateProduct();
    const deleteProduct = useDeleteProduct();

    const [isModalVisible, setModalVisible] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        type: 'service' as 'physical' | 'service' | 'digital'
    });

    const handleCreate = async () => {
        if (!activeOrgId) return;
        await createProduct.mutateAsync({
            name: newProduct.name,
            description: newProduct.description,
            price: parseFloat(newProduct.price) || 0,
            currency: 'USD',
            image_url: null,
            type: newProduct.type,
            status: 'active',
            organization_id: activeOrgId,
            metadata: {}
        });
        setModalVisible(false);
        setNewProduct({ name: '', description: '', price: '', type: 'service' });
    };

    const handleDelete = (id: string) => {
        if (!activeOrgId) return;
        deleteProduct.mutate({ id, organizationId: activeOrgId });
    };

    const inputBg = isDark ? DesignColors.gray[900] : DesignColors.white;
    const txtColor = isDark ? 'white' : 'black';

    return (
        <View style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={DesignColors.primary} />
                </Pressable>
                <Text style={styles.title}>Service Catalog</Text>
                <Pressable onPress={() => setModalVisible(true)} style={styles.addButton}>
                    <Ionicons name="add" size={24} color="white" />
                </Pressable>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <Text>Loading products...</Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <View style={[styles.card, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}>
                            <View style={styles.cardHeader}>
                                <View style={styles.typeBadge}>
                                    <Text style={styles.typeText}>{item.type}</Text>
                                </View>
                                <Pressable onPress={() => handleDelete(item.id)}>
                                    <Ionicons name="trash-outline" size={20} color={DesignColors.error} />
                                </Pressable>
                            </View>
                            <Text style={styles.productName}>{item.name}</Text>
                            <Text style={styles.productPrice}>${item.price?.toFixed(2)}</Text>
                            <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="briefcase-outline" size={48} color={DesignColors.gray[400]} />
                            <Text style={styles.emptyText}>No services listed yet.</Text>
                        </View>
                    }
                />
            )}

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Service/Product</Text>
                            <Pressable onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={DesignColors.gray[500]} />
                            </Pressable>
                        </View>

                        <TextInput
                            style={[styles.input, { backgroundColor: inputBg, color: txtColor }]}
                            placeholder="Name"
                            placeholderTextColor={DesignColors.gray[500]}
                            value={newProduct.name}
                            onChangeText={(t) => setNewProduct({ ...newProduct, name: t })}
                        />
                        <TextInput
                            style={[styles.input, { backgroundColor: inputBg, color: txtColor }]}
                            placeholder="Price"
                            placeholderTextColor={DesignColors.gray[500]}
                            keyboardType="numeric"
                            value={newProduct.price}
                            onChangeText={(t) => setNewProduct({ ...newProduct, price: t })}
                        />
                        <TextInput
                            style={[styles.input, { backgroundColor: inputBg, color: txtColor, height: 80 }]}
                            placeholder="Description"
                            placeholderTextColor={DesignColors.gray[500]}
                            multiline
                            value={newProduct.description}
                            onChangeText={(t) => setNewProduct({ ...newProduct, description: t })}
                        />

                        <View style={styles.typeSelector}>
                            {(['service', 'physical', 'digital'] as const).map((type) => (
                                <Pressable
                                    key={type}
                                    style={[
                                        styles.typeOption,
                                        newProduct.type === type && { backgroundColor: DesignColors.primary }
                                    ]}
                                    onPress={() => setNewProduct({ ...newProduct, type })}
                                >
                                    <Text style={[
                                        styles.typeOptionText,
                                        newProduct.type === type && { color: 'white' }
                                    ]}>{type}</Text>
                                </Pressable>
                            ))}
                        </View>

                        <Pressable style={styles.submitButton} onPress={handleCreate}>
                            <Text style={styles.submitButtonText}>Create Item</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
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
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: DesignColors.primary + '10',
    },
    typeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: DesignColors.primary,
        textTransform: 'uppercase',
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: DesignColors.primary,
        marginBottom: 8,
    },
    productDesc: {
        fontSize: 14,
        color: DesignColors.gray[500],
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
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        gap: 16,
        height: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    input: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 8,
    },
    typeOption: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: DesignColors.primary,
        alignItems: 'center',
    },
    typeOptionText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: DesignColors.primary,
        textTransform: 'uppercase',
    },
    submitButton: {
        backgroundColor: DesignColors.primary,
        padding: 16,
        borderRadius: 100,
        alignItems: 'center',
        marginTop: 16,
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

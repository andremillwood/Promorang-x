import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Image,
    Alert,
    Linking,
    Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Plus,
    Clock,
    Users,
    Diamond,
    CheckCircle,
    XCircle,
    Eye,
    ExternalLink,
    Filter,
    ChevronRight,
    AlertCircle,
    Star,
    MessageSquare,
} from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/authStore';
import colors from '@/constants/colors';
import { haptics } from '@/lib/haptics';
import { safeBack } from '@/lib/navigation';

const API_URL = 'https://promorang-api.vercel.app';

interface Drop {
    id: string;
    title: string;
    description: string;
    drop_type: string;
    status: 'active' | 'completed' | 'draft' | 'paused';
    gem_pool_total: number;
    gem_pool_remaining: number;
    current_participants: number;
    max_participants: number;
    deadline_at: string;
    created_at: string;
    preview_image?: string;
    is_proof_drop: boolean;
    pending_submissions?: number;
}

interface Submission {
    id: string;
    user_id: string;
    drop_id: string;
    status: 'pending' | 'approved' | 'rejected';
    proof_url?: string;
    submission_notes?: string;
    applied_at: string;
    reviewed_at?: string;
    user: {
        username: string;
        display_name: string;
        avatar_url: string;
    };
}

export default function ManageDropsScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { token } = useAuthStore();

    const [drops, setDrops] = useState<Drop[]>([]);
    const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchMyDrops();
    }, []);

    const fetchMyDrops = async () => {
        try {
            const response = await fetch(`${API_URL}/api/drops/my-drops`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setDrops(Array.isArray(data) ? data : []);
            } else {
                // Mock data for demo
                setDrops([
                    {
                        id: '1',
                        title: 'Summer Fashion Campaign',
                        description: 'Share our new summer collection',
                        drop_type: 'content_creation',
                        status: 'active',
                        gem_pool_total: 1000,
                        gem_pool_remaining: 750,
                        current_participants: 12,
                        max_participants: 50,
                        deadline_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        is_proof_drop: true,
                        pending_submissions: 5,
                    },
                    {
                        id: '2',
                        title: 'Product Review Drop',
                        description: 'Review our latest tech gadget',
                        drop_type: 'reviews',
                        status: 'active',
                        gem_pool_total: 500,
                        gem_pool_remaining: 400,
                        current_participants: 8,
                        max_participants: 25,
                        deadline_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        is_proof_drop: true,
                        pending_submissions: 3,
                    },
                    {
                        id: '3',
                        title: 'Engagement Boost',
                        description: 'Like and comment on our posts',
                        drop_type: 'engagement',
                        status: 'completed',
                        gem_pool_total: 200,
                        gem_pool_remaining: 0,
                        current_participants: 40,
                        max_participants: 40,
                        deadline_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                        is_proof_drop: false,
                        pending_submissions: 0,
                    },
                ]);
            }
        } catch (error) {
            console.error('Error fetching drops:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubmissions = async (dropId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/drops/${dropId}/applications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setSubmissions(Array.isArray(data) ? data : []);
            } else {
                // Mock submissions
                setSubmissions([
                    {
                        id: 's1',
                        user_id: 'u1',
                        drop_id: dropId,
                        status: 'pending',
                        proof_url: 'https://instagram.com/p/example1',
                        submission_notes: 'Posted to my feed with all required hashtags',
                        applied_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                        user: {
                            username: 'creator_jane',
                            display_name: 'Jane Creator',
                            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
                        },
                    },
                    {
                        id: 's2',
                        user_id: 'u2',
                        drop_id: dropId,
                        status: 'pending',
                        proof_url: 'https://tiktok.com/@user/video/123',
                        submission_notes: 'Created a 60 second video showcasing the product',
                        applied_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                        user: {
                            username: 'mike_content',
                            display_name: 'Mike Content',
                            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
                        },
                    },
                    {
                        id: 's3',
                        user_id: 'u3',
                        drop_id: dropId,
                        status: 'approved',
                        proof_url: 'https://youtube.com/watch?v=example',
                        submission_notes: 'Full review video uploaded',
                        applied_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                        reviewed_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                        user: {
                            username: 'sarah_reviews',
                            display_name: 'Sarah Reviews',
                            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
                        },
                    },
                ]);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchMyDrops();
        if (selectedDrop) {
            await fetchSubmissions(selectedDrop.id);
        }
        setIsRefreshing(false);
    };

    const selectDrop = async (drop: Drop) => {
        await haptics.light();
        setSelectedDrop(drop);
        await fetchSubmissions(drop.id);
    };

    const handleReviewSubmission = async (action: 'approve' | 'reject') => {
        if (!selectedSubmission || !selectedDrop) return;

        setIsProcessing(true);
        await haptics.medium();

        try {
            const response = await fetch(
                `${API_URL}/api/drops/${selectedDrop.id}/applications/${selectedSubmission.id}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ action }),
                }
            );

            if (response.ok) {
                await haptics.success();
                Alert.alert(
                    'Success',
                    `Submission ${action === 'approve' ? 'approved' : 'rejected'} successfully`
                );
                setShowSubmissionModal(false);
                setSelectedSubmission(null);
                await fetchSubmissions(selectedDrop.id);
            } else {
                throw new Error('Failed to process submission');
            }
        } catch (error) {
            console.error('Error processing submission:', error);
            Alert.alert('Error', 'Failed to process submission');
        } finally {
            setIsProcessing(false);
        }
    };

    const openProofUrl = async (url: string) => {
        try {
            await Linking.openURL(url);
        } catch (error) {
            Alert.alert('Error', 'Could not open link');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#10B981';
            case 'completed': return '#6B7280';
            case 'pending': return '#F59E0B';
            case 'approved': return '#10B981';
            case 'rejected': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const formatTimeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const filteredDrops = drops.filter(drop => {
        if (filter === 'all') return true;
        return drop.status === filter;
    });

    const pendingSubmissions = submissions.filter(s => s.status === 'pending');
    const reviewedSubmissions = submissions.filter(s => s.status !== 'pending');

    // Drops List View
    const renderDropsList = () => (
        <ScrollView
            style={styles.content}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
            }
        >
            {/* Stats Summary */}
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.statValue, { color: theme.text }]}>{drops.length}</Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Drops</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.statValue, { color: '#10B981' }]}>
                        {drops.filter(d => d.status === 'active').length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                        {drops.reduce((sum, d) => sum + (d.pending_submissions || 0), 0)}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</Text>
                </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterRow}>
                {(['all', 'active', 'completed'] as const).map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[
                            styles.filterTab,
                            { backgroundColor: filter === f ? colors.primary : theme.surface }
                        ]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[
                            styles.filterTabText,
                            { color: filter === f ? '#FFF' : theme.text }
                        ]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Drops List */}
            {filteredDrops.map((drop) => (
                <TouchableOpacity
                    key={drop.id}
                    style={[styles.dropCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => selectDrop(drop)}
                    activeOpacity={0.7}
                >
                    <View style={styles.dropCardHeader}>
                        <View style={styles.dropCardTitleRow}>
                            <Text style={[styles.dropCardTitle, { color: theme.text }]} numberOfLines={1}>
                                {drop.title}
                            </Text>
                            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(drop.status)}20` }]}>
                                <Text style={[styles.statusBadgeText, { color: getStatusColor(drop.status) }]}>
                                    {drop.status}
                                </Text>
                            </View>
                        </View>
                        <Text style={[styles.dropCardDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                            {drop.description}
                        </Text>
                    </View>

                    <View style={styles.dropCardStats}>
                        <View style={styles.dropCardStat}>
                            <Users size={14} color={theme.textSecondary} />
                            <Text style={[styles.dropCardStatText, { color: theme.textSecondary }]}>
                                {drop.current_participants}/{drop.max_participants}
                            </Text>
                        </View>
                        <View style={styles.dropCardStat}>
                            <Diamond size={14} color="#8B5CF6" />
                            <Text style={[styles.dropCardStatText, { color: theme.textSecondary }]}>
                                {drop.gem_pool_remaining}/{drop.gem_pool_total}
                            </Text>
                        </View>
                        {drop.is_proof_drop && drop.pending_submissions && drop.pending_submissions > 0 && (
                            <View style={[styles.pendingBadge, { backgroundColor: '#F59E0B20' }]}>
                                <AlertCircle size={12} color="#F59E0B" />
                                <Text style={styles.pendingBadgeText}>{drop.pending_submissions} pending</Text>
                            </View>
                        )}
                    </View>

                    <ChevronRight size={20} color={theme.textSecondary} style={styles.dropCardArrow} />
                </TouchableOpacity>
            ))}

            {filteredDrops.length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                        No drops found
                    </Text>
                </View>
            )}

            <View style={{ height: 100 }} />
        </ScrollView>
    );

    // Drop Detail View with Submissions
    const renderDropDetail = () => {
        if (!selectedDrop) return null;

        return (
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                }
            >
                {/* Drop Info Card */}
                <View style={[styles.dropInfoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.dropInfoTitle, { color: theme.text }]}>{selectedDrop.title}</Text>
                    <Text style={[styles.dropInfoDesc, { color: theme.textSecondary }]}>{selectedDrop.description}</Text>

                    <View style={styles.dropInfoStats}>
                        <View style={styles.dropInfoStat}>
                            <Users size={16} color={theme.textSecondary} />
                            <Text style={[styles.dropInfoStatText, { color: theme.text }]}>
                                {selectedDrop.current_participants}/{selectedDrop.max_participants} participants
                            </Text>
                        </View>
                        <View style={styles.dropInfoStat}>
                            <Diamond size={16} color="#8B5CF6" />
                            <Text style={[styles.dropInfoStatText, { color: theme.text }]}>
                                {selectedDrop.gem_pool_remaining} gems remaining
                            </Text>
                        </View>
                        <View style={styles.dropInfoStat}>
                            <Clock size={16} color={theme.textSecondary} />
                            <Text style={[styles.dropInfoStatText, { color: theme.text }]}>
                                Ends {new Date(selectedDrop.deadline_at).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Pending Submissions */}
                {pendingSubmissions.length > 0 && (
                    <View style={styles.submissionsSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            Pending Review ({pendingSubmissions.length})
                        </Text>
                        {pendingSubmissions.map((submission) => (
                            <TouchableOpacity
                                key={submission.id}
                                style={[styles.submissionCard, { backgroundColor: theme.surface, borderColor: '#F59E0B30' }]}
                                onPress={() => {
                                    setSelectedSubmission(submission);
                                    setShowSubmissionModal(true);
                                }}
                            >
                                <Image
                                    source={{ uri: submission.user.avatar_url }}
                                    style={styles.submissionAvatar}
                                />
                                <View style={styles.submissionInfo}>
                                    <Text style={[styles.submissionName, { color: theme.text }]}>
                                        {submission.user.display_name}
                                    </Text>
                                    <Text style={[styles.submissionUsername, { color: theme.textSecondary }]}>
                                        @{submission.user.username}
                                    </Text>
                                    <Text style={[styles.submissionTime, { color: theme.textSecondary }]}>
                                        {formatTimeAgo(submission.applied_at)}
                                    </Text>
                                </View>
                                <View style={[styles.reviewButton, { backgroundColor: colors.primary }]}>
                                    <Eye size={16} color="#FFF" />
                                    <Text style={styles.reviewButtonText}>Review</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Reviewed Submissions */}
                {reviewedSubmissions.length > 0 && (
                    <View style={styles.submissionsSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            Reviewed ({reviewedSubmissions.length})
                        </Text>
                        {reviewedSubmissions.map((submission) => (
                            <View
                                key={submission.id}
                                style={[styles.submissionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            >
                                <Image
                                    source={{ uri: submission.user.avatar_url }}
                                    style={styles.submissionAvatar}
                                />
                                <View style={styles.submissionInfo}>
                                    <Text style={[styles.submissionName, { color: theme.text }]}>
                                        {submission.user.display_name}
                                    </Text>
                                    <Text style={[styles.submissionUsername, { color: theme.textSecondary }]}>
                                        @{submission.user.username}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.statusIcon,
                                    { backgroundColor: `${getStatusColor(submission.status)}20` }
                                ]}>
                                    {submission.status === 'approved' ? (
                                        <CheckCircle size={20} color="#10B981" />
                                    ) : (
                                        <XCircle size={20} color="#EF4444" />
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {submissions.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                            No submissions yet
                        </Text>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        );
    };

    // Submission Review Modal
    const renderSubmissionModal = () => {
        if (!selectedSubmission) return null;

        return (
            <Modal
                visible={showSubmissionModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowSubmissionModal(false)}
            >
                <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                        <TouchableOpacity onPress={() => setShowSubmissionModal(false)}>
                            <Text style={[styles.modalCancel, { color: theme.textSecondary }]}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Review Submission</Text>
                        <View style={{ width: 60 }} />
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {/* User Info */}
                        <View style={[styles.modalUserCard, { backgroundColor: theme.surface }]}>
                            <Image
                                source={{ uri: selectedSubmission.user.avatar_url }}
                                style={styles.modalAvatar}
                            />
                            <View>
                                <Text style={[styles.modalUserName, { color: theme.text }]}>
                                    {selectedSubmission.user.display_name}
                                </Text>
                                <Text style={[styles.modalUsername, { color: theme.textSecondary }]}>
                                    @{selectedSubmission.user.username}
                                </Text>
                            </View>
                        </View>

                        {/* Proof Link */}
                        {selectedSubmission.proof_url && (
                            <View style={styles.modalSection}>
                                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Proof of Work</Text>
                                <TouchableOpacity
                                    style={[styles.proofLink, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                    onPress={() => openProofUrl(selectedSubmission.proof_url!)}
                                >
                                    <ExternalLink size={18} color={colors.primary} />
                                    <Text style={[styles.proofLinkText, { color: colors.primary }]} numberOfLines={1}>
                                        {selectedSubmission.proof_url}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Submission Notes */}
                        {selectedSubmission.submission_notes && (
                            <View style={styles.modalSection}>
                                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Notes</Text>
                                <View style={[styles.notesCard, { backgroundColor: theme.surface }]}>
                                    <MessageSquare size={16} color={theme.textSecondary} />
                                    <Text style={[styles.notesText, { color: theme.text }]}>
                                        {selectedSubmission.submission_notes}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Submitted Time */}
                        <View style={styles.modalSection}>
                            <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Submitted</Text>
                            <Text style={[styles.submittedTime, { color: theme.textSecondary }]}>
                                {new Date(selectedSubmission.applied_at).toLocaleString()}
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={[styles.modalActions, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                        <TouchableOpacity
                            style={[styles.rejectButton, { borderColor: '#EF4444' }]}
                            onPress={() => handleReviewSubmission('reject')}
                            disabled={isProcessing}
                        >
                            <XCircle size={20} color="#EF4444" />
                            <Text style={styles.rejectButtonText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.approveButton, isProcessing && styles.disabledButton]}
                            onPress={() => handleReviewSubmission('approve')}
                            disabled={isProcessing}
                        >
                            <CheckCircle size={20} color="#FFF" />
                            <Text style={styles.approveButtonText}>
                                {isProcessing ? 'Processing...' : 'Approve'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity
                    onPress={() => selectedDrop ? setSelectedDrop(null) : safeBack(router)}
                    style={styles.backButton}
                >
                    <ArrowLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                    {selectedDrop ? selectedDrop.title : 'My Drops'}
                </Text>
                {!selectedDrop && (
                    <TouchableOpacity
                        style={[styles.createButton, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/drop/create' as any)}
                    >
                        <Plus size={20} color="#FFF" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Content */}
            {selectedDrop ? renderDropDetail() : renderDropsList()}

            {/* Submission Review Modal */}
            {renderSubmissionModal()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
    },
    createButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    // Filter
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    // Drop Card
    dropCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
        position: 'relative',
    },
    dropCardHeader: {
        marginBottom: 12,
    },
    dropCardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    dropCardTitle: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    dropCardDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    dropCardStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    dropCardStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dropCardStatText: {
        fontSize: 12,
    },
    pendingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    pendingBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#F59E0B',
    },
    dropCardArrow: {
        position: 'absolute',
        right: 16,
        top: '50%',
        marginTop: -10,
    },
    // Drop Info
    dropInfoCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 20,
    },
    dropInfoTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    dropInfoDesc: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    dropInfoStats: {
        gap: 10,
    },
    dropInfoStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dropInfoStatText: {
        fontSize: 14,
    },
    // Submissions
    submissionsSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    submissionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 10,
    },
    submissionAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
    },
    submissionInfo: {
        flex: 1,
    },
    submissionName: {
        fontSize: 15,
        fontWeight: '600',
    },
    submissionUsername: {
        fontSize: 13,
    },
    submissionTime: {
        fontSize: 11,
        marginTop: 2,
    },
    reviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    reviewButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFF',
    },
    statusIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Empty State
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 15,
    },
    // Modal
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    modalCancel: {
        fontSize: 16,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    modalUserCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    modalAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 14,
    },
    modalUserName: {
        fontSize: 18,
        fontWeight: '700',
    },
    modalUsername: {
        fontSize: 14,
        marginTop: 2,
    },
    modalSection: {
        marginBottom: 20,
    },
    modalSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    proofLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    proofLinkText: {
        flex: 1,
        fontSize: 14,
    },
    notesCard: {
        flexDirection: 'row',
        gap: 10,
        padding: 14,
        borderRadius: 12,
    },
    notesText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    submittedTime: {
        fontSize: 14,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        borderTopWidth: 1,
    },
    rejectButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
    },
    rejectButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
    },
    approveButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#10B981',
    },
    approveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    disabledButton: {
        opacity: 0.6,
    },
});

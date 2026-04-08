import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Zap, Rocket, DollarSign, Trophy } from 'lucide-react-native';
import colors from '@/constants/colors';

type MaturityLevel = 'seed' | 'activated' | 'funded' | 'dominant';

interface MilestoneStage {
    id: MaturityLevel;
    label: string;
    icon: any;
    description: string;
}

const STAGES: MilestoneStage[] = [
    {
        id: 'seed',
        label: 'Seed',
        icon: Zap,
        description: 'Awareness'
    },
    {
        id: 'activated',
        label: 'Activated',
        icon: Rocket,
        description: 'Verified'
    },
    {
        id: 'funded',
        label: 'Funded',
        icon: DollarSign,
        description: 'Scaled'
    },
    {
        id: 'dominant',
        label: 'Dominant',
        icon: Trophy,
        description: 'Leader'
    }
];

interface MaturityMilestonesProps {
    currentMaturity: MaturityLevel;
}

export const MaturityMilestones: React.FC<MaturityMilestonesProps> = ({ currentMaturity = 'seed' }) => {
    const currentIndex = STAGES.findIndex(s => s.id === currentMaturity);
    const { width } = Dimensions.get('window');

    // Calculate progress width carefully to align with icon centers
    const totalWidth = width - 32; // Screen width minus padding
    const segmentWidth = totalWidth / STAGES.length;
    const progressWidth = (currentIndex / (STAGES.length - 1)) * 100;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Maturity Lifecycle</Text>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{currentMaturity}</Text>
                </View>
            </View>

            <View style={styles.timelineContainer}>
                {/* Background Line */}
                <View style={styles.lineBackground} />

                {/* Progress Line */}
                <View style={[styles.lineProgress, { width: `${progressWidth}%` }]} />

                {/* Stages */}
                <View style={styles.stagesRow}>
                    {STAGES.map((stage, index) => {
                        const isCompleted = index < currentIndex;
                        const isActive = index === currentIndex;
                        const Icon = stage.icon;

                        return (
                            <View key={stage.id} style={styles.stageItem}>
                                <View style={[
                                    styles.iconContainer,
                                    isActive && styles.iconActive,
                                    isCompleted && styles.iconCompleted,
                                    !isActive && !isCompleted && styles.iconPending
                                ]}>
                                    <Icon
                                        size={isActive ? 20 : 16}
                                        color={isActive || isCompleted ? colors.white : '#9CA3AF'}
                                    />
                                </View>
                                <Text style={[
                                    styles.stageLabel,
                                    isActive && styles.activeText,
                                    isCompleted && styles.completedText
                                ]}>
                                    {stage.label}
                                </Text>
                                <Text style={styles.stageDesc}>
                                    {stage.description}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    statusBadge: {
        backgroundColor: '#FFF7ED',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFEDD5',
    },
    statusText: {
        color: '#EA580C',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    timelineContainer: {
        position: 'relative',
        paddingTop: 10,
    },
    lineBackground: {
        position: 'absolute',
        top: 24, // Center with icons (28/2 + 10)
        left: 20,
        right: 20,
        height: 2,
        backgroundColor: '#E5E7EB',
        zIndex: 0,
    },
    lineProgress: {
        position: 'absolute',
        top: 24,
        left: 20,
        height: 2,
        backgroundColor: '#F97316', // Orange-500
        zIndex: 1,
    },
    stagesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 2,
    },
    stageItem: {
        alignItems: 'center',
        width: 70,
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 2,
    },
    iconActive: {
        backgroundColor: '#F97316',
        borderColor: '#FFEDD5', // Orange-100 ring
        transform: [{ scale: 1.2 }],
    },
    iconCompleted: {
        backgroundColor: '#F97316',
        borderColor: '#F97316',
    },
    iconPending: {
        backgroundColor: '#F3F4F6',
        borderColor: '#E5E7EB',
    },
    stageLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#6B7280',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    activeText: {
        color: '#F97316',
    },
    completedText: {
        color: '#4B5563',
    },
    stageDesc: {
        fontSize: 9,
        color: '#9CA3AF',
        textAlign: 'center',
    },
});

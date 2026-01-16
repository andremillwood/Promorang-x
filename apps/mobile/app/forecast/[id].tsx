import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Clock, TrendingUp, Users, Target, Zap, ArrowLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { useForecastStore, Forecast } from '@/store/forecastStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';

export default function ForecastDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const theme = useThemeColors();
    const { forecasts, myForecasts, makePrediction, isLoading, fetchForecasts } = useForecastStore();
    const [predictionAmount, setPredictionAmount] = useState('10');
    const [predictionSide, setPredictionSide] = useState<'over' | 'under'>('over');
    const [placing, setPlacing] = useState(false);

    useEffect(() => {
        if (forecasts.length === 0) {
            fetchForecasts();
        }
    }, [forecasts.length, fetchForecasts]);

    const forecast = [...forecasts, ...myForecasts].find(f => f.id === id);
    const hasParticipated = myForecasts.some(f => f.id === id);

    if (isLoading && !forecast) {
        return <LoadingIndicator fullScreen text="Loading forecast..." />;
    }

    if (!forecast) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.text }}>Forecast not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
                    <Text style={{ color: colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const progress = forecast.target.value > 0 ? forecast.currentValue / forecast.target.value : 0;
    const timeLeft = new Date(forecast.expiresAt).getTime() - new Date().getTime();
    const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));

    const getPlatformColor = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'instagram': return '#E1306C';
            case 'tiktok': return '#000000';
            case 'twitter': return '#1DA1F2';
            case 'youtube': return '#FF0000';
            case 'facebook': return '#4267B2';
            default: return colors.primary;
        }
    };

    const handleMakePrediction = async () => {
        const amount = Number(predictionAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid prediction amount.');
            return;
        }

        setPlacing(true);
        try {
            await makePrediction(forecast.id, amount, predictionSide === 'over');
            Alert.alert('Success', 'Your prediction has been placed!');
        } catch (error) {
            Alert.alert('Error', 'Failed to place prediction. Please try again.');
        } finally {
            setPlacing(false);
        }
    };

    const calculatePotentialWinnings = () => {
        const amount = Number(predictionAmount) || 0;
        return (amount * forecast.odds).toFixed(2);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: 'Forecast Details',
                    headerStyle: { backgroundColor: theme.surface },
                    headerTintColor: theme.text,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
                            <ArrowLeft size={24} color={theme.text} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Main Card */}
                <Card style={[styles.card, { backgroundColor: theme.card }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>{forecast.title}</Text>
                        <View style={[styles.platformBadge, { backgroundColor: getPlatformColor(forecast.target.platform) }]}>
                            <Text style={styles.platformText}>{forecast.target.platform}</Text>
                        </View>
                    </View>

                    {/* Creator */}
                    <View style={styles.creatorContainer}>
                        <Avatar
                            source={forecast.creator.avatar}
                            size="md"
                            name={forecast.creator.name}
                        />
                        <View style={styles.creatorInfo}>
                            <Text style={[styles.creatorName, { color: theme.text }]}>{forecast.creator.name}</Text>
                            <Text style={[styles.creatorRole, { color: theme.textSecondary }]}>Forecast Creator</Text>
                        </View>
                    </View>

                    <Divider style={styles.divider} />

                    {/* Description */}
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>About This Forecast</Text>
                    <Text style={[styles.description, { color: theme.textSecondary }]}>{forecast.description}</Text>

                    {/* Progress */}
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Progress</Text>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressHeader}>
                            <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                                {forecast.currentValue.toLocaleString()} / {forecast.target.value.toLocaleString()} {forecast.target.metric}
                            </Text>
                            <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
                        </View>
                        <ProgressBar progress={progress} height={10} />
                    </View>

                    {/* Stats */}
                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, { backgroundColor: theme.background }]}>
                            <TrendingUp size={24} color={colors.primary} />
                            <Text style={[styles.statValue, { color: theme.text }]}>{forecast.odds}x</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Odds</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: theme.background }]}>
                            <Target size={24} color="#10B981" />
                            <Text style={[styles.statValue, { color: theme.text }]}>${forecast.pool}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pool</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: theme.background }]}>
                            <Users size={24} color="#8B5CF6" />
                            <Text style={[styles.statValue, { color: theme.text }]}>{forecast.participants}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Predictors</Text>
                        </View>
                    </View>

                    {/* Time Left */}
                    <View style={[styles.timeContainer, { backgroundColor: daysLeft <= 1 ? '#FEE2E2' : '#FEF3C7' }]}>
                        <Clock size={20} color={daysLeft <= 1 ? '#EF4444' : '#F59E0B'} />
                        <Text style={[styles.timeText, { color: daysLeft <= 1 ? '#EF4444' : '#F59E0B' }]}>
                            {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left to make your prediction
                        </Text>
                    </View>
                </Card>

                {/* Prediction Card */}
                {!hasParticipated && (
                    <Card style={[styles.predictionCard, { backgroundColor: theme.card }]}>
                        <View style={styles.predictionHeader}>
                            <Zap size={24} color={colors.primary} />
                            <Text style={[styles.predictionTitle, { color: theme.text }]}>Make Your Prediction</Text>
                        </View>

                        {/* Prediction Side */}
                        <Text style={[styles.labelText, { color: theme.text }]}>Will it reach the target?</Text>
                        <View style={styles.sideButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.sideButton,
                                    predictionSide === 'over' && styles.sideButtonActive,
                                    { borderColor: theme.border }
                                ]}
                                onPress={() => setPredictionSide('over')}
                            >
                                <Text style={[
                                    styles.sideButtonText,
                                    predictionSide === 'over' && styles.sideButtonTextActive
                                ]}>
                                    YES, it will 🚀
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.sideButton,
                                    predictionSide === 'under' && styles.sideButtonActive,
                                    { borderColor: theme.border }
                                ]}
                                onPress={() => setPredictionSide('under')}
                            >
                                <Text style={[
                                    styles.sideButtonText,
                                    predictionSide === 'under' && styles.sideButtonTextActive
                                ]}>
                                    NO, it won't 📉
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Amount */}
                        <Text style={[styles.labelText, { color: theme.text }]}>Prediction Amount</Text>
                        <View style={[styles.amountInputContainer, { borderColor: theme.border }]}>
                            <Text style={[styles.currencySymbol, { color: theme.textSecondary }]}>$</Text>
                            <TextInput
                                style={[styles.amountInput, { color: theme.text }]}
                                value={predictionAmount}
                                onChangeText={setPredictionAmount}
                                keyboardType="numeric"
                                placeholder="Enter amount"
                                placeholderTextColor={theme.textSecondary}
                            />
                        </View>

                        {/* Potential Winnings */}
                        <View style={styles.winningsContainer}>
                            <Text style={[styles.winningsLabel, { color: theme.text }]}>Potential Winnings:</Text>
                            <Text style={styles.winningsValue}>${calculatePotentialWinnings()}</Text>
                        </View>

                        <Button
                            title="Make Prediction"
                            onPress={handleMakePrediction}
                            variant="primary"
                            size="lg"
                            isLoading={placing}
                            style={styles.submitButton}
                        />
                    </Card>
                )}

                {hasParticipated && (
                    <Card style={[styles.participatedCard, { backgroundColor: '#D1FAE5' }]}>
                        <Text style={styles.participatedText}>✅ You've already made a prediction on this forecast!</Text>
                    </Card>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerBack: {
        marginLeft: 8,
        padding: 8,
    },
    backLink: {
        marginTop: 16,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        flex: 1,
        marginRight: 10,
    },
    platformBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    platformText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    creatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    creatorInfo: {
        flex: 1,
        marginLeft: 12,
    },
    creatorName: {
        fontSize: 16,
        fontWeight: '700',
    },
    creatorRole: {
        fontSize: 13,
    },
    divider: {
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 20,
    },
    progressContainer: {
        marginBottom: 20,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressText: {
        fontSize: 14,
    },
    progressPercent: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.primary,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 11,
        marginTop: 4,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        gap: 10,
    },
    timeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    predictionCard: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
    },
    predictionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    predictionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    labelText: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
    },
    sideButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    sideButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
    },
    sideButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    sideButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    sideButtonTextActive: {
        color: '#FFF',
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    currencySymbol: {
        fontSize: 20,
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        height: 52,
        fontSize: 18,
    },
    winningsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    winningsLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    winningsValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#10B981',
    },
    submitButton: {
        width: '100%',
    },
    participatedCard: {
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    participatedText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#065F46',
    },
});

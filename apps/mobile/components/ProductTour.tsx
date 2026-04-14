import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    ScrollView,
} from 'react-native';
import { useTour } from '../context/TourContext';
import { getTourById, TourId, TourStep } from '../constants/tourConfig';

interface ProductTourProps {
    tourId: TourId;
    autoStart?: boolean;
}

const { width, height } = Dimensions.get('window');

export const ProductTour: React.FC<ProductTourProps> = ({ tourId, autoStart = false }) => {
    const { activeTour, startTour, stopTour, completeTour, skipTour, isTourCompleted } = useTour();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const tour = getTourById(tourId);
    const isActive = activeTour === tourId;
    const isCompleted = isTourCompleted(tourId);

    useEffect(() => {
        if (autoStart && !isCompleted && !isActive) {
            startTour(tourId);
        }
    }, [autoStart, isCompleted, isActive, tourId, startTour]);

    if (!tour || !isActive) return null;

    const currentStep = tour.steps[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === tour.steps.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            completeTour(tourId);
            setCurrentStepIndex(0);
        } else {
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };

    const handleBack = () => {
        if (!isFirstStep) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const handleSkip = () => {
        skipTour(tourId);
        setCurrentStepIndex(0);
    };

    return (
        <Modal
            visible={isActive}
            transparent
            animationType="fade"
            onRequestClose={handleSkip}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Progress Indicator */}
                    <View style={styles.progressContainer}>
                        {tour.steps.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.progressDot,
                                    index === currentStepIndex && styles.progressDotActive,
                                    index < currentStepIndex && styles.progressDotCompleted,
                                ]}
                            />
                        ))}
                    </View>

                    {/* Content */}
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <Text style={styles.title}>{currentStep.title}</Text>
                        <Text style={styles.description}>{currentStep.content}</Text>
                    </ScrollView>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                            <Text style={styles.skipButtonText}>Skip Tour</Text>
                        </TouchableOpacity>

                        <View style={styles.navigationButtons}>
                            {!isFirstStep && (
                                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                                    <Text style={styles.backButtonText}>Back</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                                <Text style={styles.nextButtonText}>
                                    {isLastStep ? 'Finish' : 'Next'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Step Counter */}
                    <Text style={styles.stepCounter}>
                        {currentStepIndex + 1} of {tour.steps.length}
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: width * 0.9,
        maxWidth: 400,
        maxHeight: height * 0.7,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        gap: 8,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E5E7EB',
    },
    progressDotActive: {
        backgroundColor: '#8B5CF6',
        width: 24,
    },
    progressDotCompleted: {
        backgroundColor: '#10B981',
    },
    content: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#6B7280',
    },
    actions: {
        gap: 12,
    },
    skipButton: {
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    skipButtonText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    navigationButtons: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'flex-end',
    },
    backButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    nextButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: '#8B5CF6',
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    stepCounter: {
        textAlign: 'center',
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 12,
    },
});

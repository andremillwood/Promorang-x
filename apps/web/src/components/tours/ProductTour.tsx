import React, { useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, EVENTS, Step, Styles } from 'react-joyride';
import { useTour } from '@/contexts/TourContext';
import { getTour, TourId } from '@/config/tour-config';

interface ProductTourProps {
    tourId: TourId;
    run?: boolean;
    onComplete?: () => void;
}

/**
 * ProductTour Component
 * 
 * Wrapper around React Joyride with Promorang's premium styling
 * and integrated tour progress tracking
 */
export function ProductTour({ tourId, run = true, onComplete }: ProductTourProps) {
    const { completeTour, skipTour, updateTourStep, stopTour } = useTour();
    const tourConfig = getTour(tourId);

    const handleJoyrideCallback = async (data: CallBackProps) => {
        const { status, type, index } = data;

        // Update current step
        if (type === EVENTS.STEP_AFTER) {
            await updateTourStep(tourId, index + 1);
        }

        // Handle tour completion
        if (status === STATUS.FINISHED) {
            await completeTour(tourId);
            onComplete?.();
        }

        // Handle tour skip
        if (status === STATUS.SKIPPED) {
            await skipTour(tourId);
            stopTour();
        }
    };

    // Premium Promorang styling for tour tooltips
    const styles: Partial<Styles> = {
        options: {
            arrowColor: 'hsl(var(--card))',
            backgroundColor: 'hsl(var(--card))',
            overlayColor: 'rgba(0, 0, 0, 0.7)',
            primaryColor: 'hsl(var(--primary))',
            textColor: 'hsl(var(--foreground))',
            width: 380,
            zIndex: 10000,
        },
        tooltip: {
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid hsl(var(--border))',
        },
        tooltipContainer: {
            textAlign: 'left',
        },
        tooltipTitle: {
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: 'hsl(var(--foreground))',
            fontFamily: 'var(--font-serif)',
        },
        tooltipContent: {
            fontSize: '0.9375rem',
            lineHeight: '1.6',
            color: 'hsl(var(--muted-foreground))',
            padding: '0.5rem 0',
        },
        buttonNext: {
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            borderRadius: '9999px',
            padding: '0.625rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        },
        buttonBack: {
            color: 'hsl(var(--muted-foreground))',
            backgroundColor: 'transparent',
            borderRadius: '9999px',
            padding: '0.625rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            marginRight: '0.5rem',
        },
        buttonSkip: {
            color: 'hsl(var(--muted-foreground))',
            backgroundColor: 'transparent',
            fontSize: '0.875rem',
            padding: '0.5rem',
            border: 'none',
            cursor: 'pointer',
        },
        buttonClose: {
            color: 'hsl(var(--muted-foreground))',
            backgroundColor: 'transparent',
            width: '2rem',
            height: '2rem',
            padding: '0',
            border: 'none',
            cursor: 'pointer',
            position: 'absolute',
            right: '0.5rem',
            top: '0.5rem',
        },
        spotlight: {
            borderRadius: '0.5rem',
        },
    };

    // Locale customization
    const locale = {
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        open: 'Open',
        skip: 'Skip tour',
    };

    return (
        <Joyride
            steps={tourConfig.steps}
            run={run}
            continuous
            showProgress
            showSkipButton
            disableCloseOnEsc={false}
            disableOverlayClose={false}
            spotlightClicks={false}
            callback={handleJoyrideCallback}
            styles={styles}
            locale={locale}
            floaterProps={{
                disableAnimation: false,
            }}
        />
    );
}

export default ProductTour;

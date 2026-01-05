type EventType = 'screen_view' | 'button_tap' | 'action_completed';

class AnalyticsService {
    private static instance: AnalyticsService;

    private constructor() { }

    public static getInstance(): AnalyticsService {
        if (!AnalyticsService.instance) {
            AnalyticsService.instance = new AnalyticsService();
        }
        return AnalyticsService.instance;
    }

    public track(event: string, properties?: Record<string, any>) {
        if (__DEV__) {
            console.log(`[Analytics] ${event}`, properties);
        }
        // TODO: Send to backend or 3rd party service (Amplitude/Mixpanel)
    }

    public screen(screenName: string) {
        this.track('screen_view', { screen: screenName });
    }
}

export const analytics = AnalyticsService.getInstance();

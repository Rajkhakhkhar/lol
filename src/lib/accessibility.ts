
export type AccessibilityLevel = 'recommended' | 'neutral' | 'not_recommended';

export interface AccessibilityAdvice {
    level: AccessibilityLevel;
    message: string;
    badge?: string;
}

export const TRANSPORT_ACCESSIBILITY: Record<string, AccessibilityAdvice> = {
    airplane: {
        level: 'recommended',
        message: 'Recommended for accessibility. Airlines provide specialized assistance.',
        badge: '♿ Accessible'
    },
    car: {
        level: 'recommended',
        message: 'Recommended for accessibility. Allows for door-to-door comfort.',
        badge: '♿ Accessible'
    },
    taxi: {
        level: 'recommended',
        message: 'Recommended for accessibility. Convenient door-to-door service.',
        badge: '♿ Accessible'
    },
    rental_car: {
        level: 'recommended',
        message: 'Recommended for accessibility. Most rental companies offer accessible models.',
        badge: '♿ Accessible'
    },
    train: {
        level: 'recommended',
        message: 'Generally accessible. Major stations and trains offer assistance.',
        badge: '♿ Accessible'
    },
    bus: {
        level: 'not_recommended',
        message: 'Limited accessibility depending on service and route.',
        badge: '⚠️ Not ideal'
    },
    'two-wheeler': {
        level: 'not_recommended',
        message: 'Not recommended for accessibility needs.',
        badge: '⚠️ Not ideal'
    },
    walking: {
        level: 'neutral',
        message: 'May require significant physical effort.',
        badge: '⚠️ Physical'
    },
    public_transport: {
        level: 'neutral',
        message: 'Accessibility varies greatly by city and line.',
        badge: 'ℹ️ Varies'
    },
    mixed: {
        level: 'neutral',
        message: 'Depends on the specific modes chosen.',
        badge: 'ℹ️ Mixed'
    }
};

export const getTransportAccessibilityAdvice = (mode: string): AccessibilityAdvice | null => {
    // Normalize mode string
    const normalized = mode.toLowerCase().replace(/\s+/g, '_');
    return TRANSPORT_ACCESSIBILITY[normalized] || TRANSPORT_ACCESSIBILITY[mode] || null;
};

export const getActivityAccessibilityAdvice = (type: string): AccessibilityAdvice | null => {
    const physicallyDemanding = ['hiking', 'climbing', 'sports', 'adventure', 'trekking', 'physically demanding'];
    if (physicallyDemanding.some(t => type.toLowerCase().includes(t))) {
        return {
            level: 'not_recommended',
            message: 'Physically demanding activity. May not be suitable for all accessibility needs.',
            badge: '⚠️ Demanding'
        };
    }
    return null;
};

export const getHotelAccessibilityAdvice = (hotelName: string): AccessibilityAdvice => {
    return {
        level: 'recommended',
        message: 'We recommend checking if this hotel offers specific accessibility features.',
        badge: '♿ Highly Recommended'
    };
};

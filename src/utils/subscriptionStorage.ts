/**
 * Centralized Subscription Configuration & Client-Side Entitlements
 *
 * NOTE & DISCLOSURE:
 * Subscription state and entitlements in this prototype are maintained in client-side
 * storage (localStorage) for demonstration and local simulation purposes.
 * This is NOT a secure server-enforced entitlement system, and no live payment
 * processing or banking gateway is connected.
 */

export type SubscriptionTier = 'free_core' | 'family' | 'circle_plus';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  badge: string;
  monthlyPrice: string;
  annualPrice: string;
  description: string;
  features: string[];
  includesGroupConversations: boolean;
  maxCircleConnections: number; // -1 for unlimited
  isPopular?: boolean;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free_core: {
    id: 'free_core',
    name: 'Free Core',
    badge: 'Standard',
    monthlyPrice: '$0',
    annualPrice: '$0',
    description: 'Essential two-way communication between one teen and parent pair.',
    features: [
      'One-to-one direct conversations',
      'Full Clarity workflow for teens',
      'Parent Perspective reflection guides',
      'Private Haven journal & reflections',
      'Nova AI sounding board',
      'Up to 2 circle connections',
    ],
    includesGroupConversations: false,
    maxCircleConnections: 2,
  },
  family: {
    id: 'family',
    name: 'Two-Way Family',
    badge: 'Recommended',
    monthlyPrice: '$9.99/mo',
    annualPrice: '$79/yr (save 34%)',
    description: 'Expanded family connection with multi-member group conversations.',
    features: [
      'All Free Core capabilities',
      'Family & Circle group conversations',
      'Multi-participant shared messaging',
      'Expanded circle connections (up to 6 members)',
      'Shared family perspective tools',
      'Priority conversational support',
    ],
    includesGroupConversations: true,
    maxCircleConnections: 6,
    isPopular: true,
  },
  circle_plus: {
    id: 'circle_plus',
    name: 'Two-Way Circle Plus',
    badge: 'Unlimited',
    monthlyPrice: '$14.99/mo',
    annualPrice: '$119/yr (save 33%)',
    description: 'Comprehensive family and trusted circle communication without limits.',
    features: [
      'All Family plan capabilities',
      'Unlimited family group conversations',
      'Unlimited circle connections',
      'Extended conversation history archive',
      'Custom quiet hours & priority alerts',
      'Early access to new perspective features',
    ],
    includesGroupConversations: true,
    maxCircleConnections: -1,
  },
};

export const STORAGE_KEY_SUBSCRIPTION_TIER = 'twoway_subscription_tier';

/**
 * Get current user subscription tier from storage (defaults to 'free_core')
 */
export function getCurrentSubscriptionTier(): SubscriptionTier {
  if (typeof localStorage === 'undefined') return 'free_core';
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBSCRIPTION_TIER);
    if (raw === 'family' || raw === 'circle_plus') {
      return raw;
    }
    return 'free_core';
  } catch (err) {
    console.error('Failed to read subscription tier:', err);
    return 'free_core';
  }
}

/**
 * Update current user subscription tier
 */
export function setCurrentSubscriptionTier(tier: SubscriptionTier): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SUBSCRIPTION_TIER, tier);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('twoway-subscription-updated', { detail: { tier } }));
    }
  } catch (err) {
    console.error('Failed to save subscription tier:', err);
  }
}

/**
 * Check if the user has an active paid subscription (Family or Circle Plus)
 */
export function hasPaidSubscription(): boolean {
  const tier = getCurrentSubscriptionTier();
  return tier === 'family' || tier === 'circle_plus';
}

/**
 * Entitlement check: Can user create, join, or view group conversations?
 */
export function canAccessGroupConversations(): boolean {
  const tier = getCurrentSubscriptionTier();
  return SUBSCRIPTION_PLANS[tier].includesGroupConversations;
}

/**
 * Get the active plan definition
 */
export function getCurrentPlan(): SubscriptionPlan {
  const tier = getCurrentSubscriptionTier();
  return SUBSCRIPTION_PLANS[tier];
}

/**
 * Simulate upgrade for local demonstration
 */
export function simulateUpgrade(tier: SubscriptionTier): void {
  setCurrentSubscriptionTier(tier);
}

// Google Analytics tracking utilities
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'set' | 'js',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Log page views
export const pageview = (url: string) => {
  if (!window.gtag) return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Log specific events
export const event = ({
  action,
  category,
  label,
  value,
  userId,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
  userId?: string;
}) => {
  if (!window.gtag) return;
  
  const eventParams: Record<string, any> = {
    event_category: category,
  };
  
  if (label) eventParams.event_label = label;
  if (value !== undefined) eventParams.value = value;
  if (userId) eventParams.user_id = userId;
  
  window.gtag('event', action, eventParams);
};

// Track user sign ups
export const trackSignUp = (method: 'email' | 'google', userId?: string) => {
  event({
    action: 'sign_up',
    category: 'engagement',
    label: method,
    userId,
  });
  
  // Also track as a conversion event
  event({
    action: 'conversion',
    category: 'signup',
    label: method,
    userId,
  });
};

// Track user sign ins
export const trackSignIn = (method: 'email' | 'google', userId?: string) => {
  event({
    action: 'login',
    category: 'engagement',
    label: method,
    userId,
  });
};

// Track generation events
export const trackGeneration = (platform: string, userId?: string) => {
  event({
    action: 'generate',
    category: 'engagement',
    label: platform,
    userId,
  });
};

// Track subscription events
export const trackSubscription = (plan: string, action: 'start' | 'cancel' | 'upgrade', userId?: string) => {
  event({
    action: `subscription_${action}`,
    category: 'revenue',
    label: plan,
    userId,
  });
  
  // Also track as conversion for new subscriptions
  if (action === 'start') {
    event({
      action: 'conversion',
      category: 'subscription',
      label: plan,
      userId,
    });
  }
};

// Set user properties
export const setUserProperties = (userId: string, properties: Record<string, any>) => {
  if (!window.gtag) return;
  
  window.gtag('set', 'user_properties', {
    user_id: userId,
    ...properties,
  });
};
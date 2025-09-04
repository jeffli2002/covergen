import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  generateDeviceFingerprint,
  hashFingerprint,
  generateAnonymousId,
  getAnonymousUsage,
  updateAnonymousUsage,
  hasReachedFreeLimit,
  getRemainingFreeCovers,
  isPlatformAllowedForFreeTier,
  STORAGE_KEYS,
  FREE_TIER_LIMITS,
} from '@/lib/rate-limit';

export interface RateLimitState {
  isLoading: boolean;
  anonymousId: string | null;
  remainingCovers: number;
  hasReachedLimit: boolean;
  canAccessPlatform: (platform: string) => boolean;
  incrementUsage: () => Promise<void>;
}

export function useRateLimit(): RateLimitState {
  const { user, subscription } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [usage, setUsage] = useState(getAnonymousUsage());

  // Initialize anonymous ID on mount
  useEffect(() => {
    const initializeAnonymousId = async () => {
      if (user) {
        // Signed-in users don't need anonymous tracking
        setIsLoading(false);
        return;
      }

      try {
        // Try to get existing anonymous ID
        let anonId = localStorage.getItem(STORAGE_KEYS.ANONYMOUS_ID);
        
        if (!anonId) {
          // Generate new anonymous ID
          const fingerprint = generateDeviceFingerprint();
          const hashedFingerprint = await hashFingerprint(fingerprint);
          anonId = await generateAnonymousId(hashedFingerprint);
          
          localStorage.setItem(STORAGE_KEYS.DEVICE_FINGERPRINT, hashedFingerprint);
          localStorage.setItem(STORAGE_KEYS.ANONYMOUS_ID, anonId);
        }
        
        setAnonymousId(anonId);
        setUsage(getAnonymousUsage());
      } catch (error) {
        console.error('Failed to initialize anonymous ID:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAnonymousId();
  }, [user]);

  // Calculate remaining covers based on user status
  const remainingCovers = user 
    ? (subscription?.tier === 'free' ? FREE_TIER_LIMITS.MONTHLY_COVERS - (subscription?.monthlyUsage || 0) : -1)
    : getRemainingFreeCovers(usage);

  // Check if limit is reached
  const hasReachedLimit = user
    ? (subscription?.tier === 'free' && (subscription?.monthlyUsage || 0) >= FREE_TIER_LIMITS.MONTHLY_COVERS)
    : hasReachedFreeLimit(usage);

  // Check platform access
  const canAccessPlatform = (platform: string): boolean => {
    // Authenticated users with paid subscriptions can access all platforms
    if (user && subscription?.tier !== 'free') {
      return true;
    }
    
    // Free tier (authenticated or anonymous) can only access basic platforms
    return isPlatformAllowedForFreeTier(platform);
  };

  // Increment usage counter
  const incrementUsage = async () => {
    try {
      // Call API to track usage
      const response = await fetch('/api/usage/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          anonymous_id: anonymousId,
          platform: 'unknown', // Will be set by the component calling this
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local storage for anonymous users
        if (!user && anonymousId) {
          const newUsage = updateAnonymousUsage(anonymousId);
          setUsage(newUsage);
        }
        
        // For authenticated users, refresh subscription data
        if (user) {
          // The AuthContext should handle refreshing subscription data
        }
      }
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
  };

  return {
    isLoading,
    anonymousId,
    remainingCovers,
    hasReachedLimit,
    canAccessPlatform,
    incrementUsage,
  };
}
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
  getDailyUsage,
  updateDailyUsage,
  hasReachedDailyLimit,
  getRemainingDailyCovers,
  isPlatformAllowedForFreeTier,
  STORAGE_KEYS,
  FREE_TIER_LIMITS,
} from '@/lib/rate-limit';

export interface RateLimitState {
  isLoading: boolean;
  anonymousId: string | null;
  remainingCovers: number;
  remainingDailyCovers: number;
  hasReachedLimit: boolean;
  hasReachedDailyLimit: boolean;
  canAccessPlatform: (platform: string) => boolean;
  incrementUsage: () => Promise<void>;
}

export function useRateLimit(): RateLimitState {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [usage, setUsage] = useState(getAnonymousUsage());
  const [dailyUsage, setDailyUsage] = useState(getDailyUsage());

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
        setDailyUsage(getDailyUsage());
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
    ? -1 // For authenticated users, we don't track here
    : getRemainingFreeCovers(usage);
    
  const remainingDailyCovers = user
    ? -1 // For authenticated users, we don't track here
    : getRemainingDailyCovers(dailyUsage, FREE_TIER_LIMITS.DAILY_COVERS_FREE);

  // Check if limit is reached
  const hasReachedMonthlyLimit = user
    ? false // For authenticated users, we don't track here
    : hasReachedFreeLimit(usage);
    
  const hasReachedDailyLimitValue = user
    ? false // For authenticated users, we don't track here
    : hasReachedDailyLimit(dailyUsage, FREE_TIER_LIMITS.DAILY_COVERS_FREE);
    
  // Overall limit is reached if either daily or monthly limit is reached
  const hasReachedLimit = hasReachedMonthlyLimit || hasReachedDailyLimitValue;

  // Check platform access
  const canAccessPlatform = (platform: string): boolean => {
    // Authenticated users can access all platforms
    if (user) {
      return true;
    }
    
    // Anonymous users can only access basic platforms
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
          const newDailyUsage = updateDailyUsage(anonymousId);
          setUsage(newUsage);
          setDailyUsage(newDailyUsage);
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
    remainingDailyCovers,
    hasReachedLimit,
    hasReachedDailyLimit: hasReachedDailyLimitValue,
    canAccessPlatform,
    incrementUsage,
  };
}
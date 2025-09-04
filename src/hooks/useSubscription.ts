import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionTier } from '@/lib/rate-limit';

export interface UserSubscription {
  tier: SubscriptionTier;
  monthlyUsage: number;
  quotaLimit: number;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export function useSubscription() {
  const { user, getUserSubscription } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      try {
        const data = await getUserSubscription();
        const quotaLimits = {
          free: 10,
          pro: 120,
          pro_plus: 300
        };
        
        const tier = data?.tier || 'free';
        const monthlyUsage = data?.monthlyUsage || 0;
        
        setSubscription({
          tier: tier as SubscriptionTier,
          monthlyUsage,
          quotaLimit: quotaLimits[tier as keyof typeof quotaLimits] || 10,
          currentPeriodEnd: data?.currentPeriodEnd,
          cancelAtPeriodEnd: data?.cancelAtPeriodEnd
        });
      } catch (error) {
        console.error('Error loading subscription:', error);
        // Default to free tier on error
        setSubscription({
          tier: 'free',
          monthlyUsage: 0,
          quotaLimit: 10
        });
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [user, getUserSubscription]);

  const refreshSubscription = async () => {
    if (!user) return;
    
    try {
      const data = await getUserSubscription();
      const quotaLimits = {
        free: 10,
        pro: 120,
        pro_plus: 300
      };
      
      const tier = data?.tier || 'free';
      const monthlyUsage = data?.monthlyUsage || 0;
      
      setSubscription({
        tier: tier as SubscriptionTier,
        monthlyUsage,
        quotaLimit: quotaLimits[tier as keyof typeof quotaLimits] || 10,
        currentPeriodEnd: data?.currentPeriodEnd,
        cancelAtPeriodEnd: data?.cancelAtPeriodEnd
      });
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    }
  };

  return {
    subscription,
    loading,
    refreshSubscription
  };
}
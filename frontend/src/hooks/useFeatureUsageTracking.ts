import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

interface FeatureUsageLog {
  feature_name: string;
  feature_category?: string;
  action_type: string;
  duration_seconds?: number;
  success?: boolean;
  metadata?: any;
}

export const useFeatureUsageTracking = () => {
  const { user } = useAppStore();

  const trackFeatureUsage = useCallback(async (log: FeatureUsageLog) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tracking/feature-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(log)
      });
    } catch (error) {
      console.debug('Feature usage tracking failed:', error);
    }
  }, [user]);

  return {
    trackFeatureUsage,
    trackFeatureOpen: (name: string, category?: string) => 
      trackFeatureUsage({ feature_name: name, feature_category: category, action_type: 'open' }),
    trackFeatureComplete: (name: string, category?: string, duration?: number) =>
      trackFeatureUsage({ feature_name: name, feature_category: category, action_type: 'complete', duration_seconds: duration }),
    trackFeatureError: (name: string, category?: string, error?: any) =>
      trackFeatureUsage({ feature_name: name, feature_category: category, action_type: 'error', success: false, metadata: error })
  };
};

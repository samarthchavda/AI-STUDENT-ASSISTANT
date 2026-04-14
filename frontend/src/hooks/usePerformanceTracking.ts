import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

interface PerformanceTrendLog {
  topic?: string;
  category?: string;
  difficulty?: string;
  score_percent: number;
  accuracy_percent: number;
  time_taken_seconds: number;
  questions_attempted: number;
  questions_correct: number;
}

export const usePerformanceTracking = () => {
  const { user } = useAppStore();

  const trackPerformance = useCallback(async (log: PerformanceTrendLog) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch('/api/tracking/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(log)
      });
    } catch (error) {
      // Silently fail - tracking should not interrupt user experience
      console.debug('Performance tracking failed:', error);
    }
  }, [user]);

  return { trackPerformance };
};

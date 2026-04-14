import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

interface LearningBehaviorLog {
  topic?: string;
  category?: string;
  difficulty?: string;
  company?: string;
  action_type: string;
  time_of_day?: string;
}

export const useLearningBehaviorTracking = () => {
  const { user } = useAppStore();

  const trackLearningBehavior = useCallback(async (log: LearningBehaviorLog) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch('/api/tracking/learning-behavior', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(log)
      });
    } catch (error) {
      // Silently fail - tracking should not interrupt user experience
      console.debug('Learning behavior tracking failed:', error);
    }
  }, [user]);

  return {
    trackLearningBehavior,
    
    // Convenience methods
    trackStartPractice: (topic?: string, category?: string, difficulty?: string) => {
      trackLearningBehavior({
        topic,
        category,
        difficulty,
        action_type: 'start_practice'
      });
    },
    
    trackCompleteQuestion: (topic?: string, category?: string, difficulty?: string, company?: string) => {
      trackLearningBehavior({
        topic,
        category,
        difficulty,
        company,
        action_type: 'complete_question'
      });
    },
    
    trackSkipQuestion: (topic?: string, category?: string, difficulty?: string, company?: string) => {
      trackLearningBehavior({
        topic,
        category,
        difficulty,
        company,
        action_type: 'skip_question'
      });
    },
    
    trackViewSolution: (topic?: string, category?: string, difficulty?: string, company?: string) => {
      trackLearningBehavior({
        topic,
        category,
        difficulty,
        company,
        action_type: 'view_solution'
      });
    }
  };
};

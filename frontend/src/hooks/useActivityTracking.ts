/**
 * Activity Tracking Hook
 * Automatically tracks user activity, page views, and time spent
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Generate or get session ID (simple implementation)
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('activity_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('activity_session_id', sessionId);
  }
  return sessionId;
};

interface ActivityLog {
  page_url?: string;
  feature_name?: string;
  action_type: string;
  duration_seconds: number;
  session_id: string;
  metadata?: Record<string, any>;
}

const logActivity = async (activity: ActivityLog) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return; // Don't track if not logged in

    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tracking/activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(activity)
    });
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.debug('Activity tracking failed:', error);
  }
};

/**
 * Hook to track page views and time spent
 */
export const usePageTracking = () => {
  const location = useLocation();
  const startTimeRef = useRef<number>(Date.now());
  const sessionId = getSessionId();

  useEffect(() => {
    // Log page view
    logActivity({
      page_url: location.pathname,
      action_type: 'page_view',
      duration_seconds: 0,
      session_id: sessionId,
      metadata: {
        search: location.search,
        hash: location.hash
      }
    });

    // Reset start time
    startTimeRef.current = Date.now();

    // Log page exit and duration when leaving
    return () => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (duration > 0) {
        logActivity({
          page_url: location.pathname,
          action_type: 'page_exit',
          duration_seconds: duration,
          session_id: sessionId
        });
      }
    };
  }, [location.pathname, sessionId]);
};

/**
 * Hook to track feature usage
 */
export const useFeatureTracking = (featureName: string) => {
  const sessionId = getSessionId();
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Log feature start
    logActivity({
      feature_name: featureName,
      action_type: 'feature_use',
      duration_seconds: 0,
      session_id: sessionId
    });

    startTimeRef.current = Date.now();

    // Log feature exit
    return () => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (duration > 0) {
        logActivity({
          feature_name: featureName,
          action_type: 'feature_exit',
          duration_seconds: duration,
          session_id: sessionId
        });
      }
    };
  }, [featureName, sessionId]);
};

/**
 * Function to track button clicks
 */
export const trackButtonClick = (buttonName: string, metadata?: Record<string, any>) => {
  const sessionId = getSessionId();
  logActivity({
    feature_name: buttonName,
    action_type: 'button_click',
    duration_seconds: 0,
    session_id: sessionId,
    metadata
  });
};

/**
 * Function to track session start
 */
export const trackSessionStart = () => {
  const sessionId = getSessionId();
  logActivity({
    action_type: 'session_start',
    duration_seconds: 0,
    session_id: sessionId,
    metadata: {
      user_agent: navigator.userAgent,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  });
};

/**
 * Function to track session end
 */
export const trackSessionEnd = () => {
  const sessionId = getSessionId();
  logActivity({
    action_type: 'session_end',
    duration_seconds: 0,
    session_id: sessionId
  });
};

/**
 * Hook to track session lifecycle
 */
export const useSessionTracking = () => {
  useEffect(() => {
    // Track session start
    trackSessionStart();

    // Track session end on page unload
    const handleUnload = () => {
      trackSessionEnd();
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);
};

/**
 * Main activity tracking hook - use this in App.tsx
 */
export const useActivityTracking = () => {
  usePageTracking();
  useSessionTracking();
};

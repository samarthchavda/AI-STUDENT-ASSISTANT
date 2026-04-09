import { useCallback, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

interface DeviceBrowserLog {
  session_id: string;
  device_type?: string;
  device_brand?: string;
  browser_name?: string;
  browser_version?: string;
  os_name?: string;
  os_version?: string;
  screen_width?: number;
  screen_height?: number;
  country?: string;
  city?: string;
}

export const useDeviceBrowserTracking = () => {
  const { user } = useAppStore();

  const detectDeviceInfo = useCallback((): DeviceBrowserLog => {
    const ua = navigator.userAgent;
    const sessionId = sessionStorage.getItem('session_id') || `session_${Date.now()}_${Math.random()}`;
    sessionStorage.setItem('session_id', sessionId);

    // Detect device type
    let deviceType = 'desktop';
    if (/mobile/i.test(ua)) deviceType = 'mobile';
    else if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';

    // Detect browser
    let browserName = 'Unknown';
    let browserVersion = '';
    if (ua.includes('Chrome')) {
      browserName = 'Chrome';
      browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || '';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browserName = 'Safari';
      browserVersion = ua.match(/Version\/(\d+)/)?.[1] || '';
    } else if (ua.includes('Firefox')) {
      browserName = 'Firefox';
      browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || '';
    } else if (ua.includes('Edge')) {
      browserName = 'Edge';
      browserVersion = ua.match(/Edge\/(\d+)/)?.[1] || '';
    }

    // Detect OS
    let osName = 'Unknown';
    let osVersion = '';
    if (ua.includes('Windows')) {
      osName = 'Windows';
      osVersion = ua.match(/Windows NT (\d+\.\d+)/)?.[1] || '';
    } else if (ua.includes('Mac OS')) {
      osName = 'macOS';
      osVersion = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || '';
    } else if (ua.includes('Linux')) {
      osName = 'Linux';
    } else if (ua.includes('Android')) {
      osName = 'Android';
      osVersion = ua.match(/Android (\d+)/)?.[1] || '';
    } else if (ua.includes('iOS')) {
      osName = 'iOS';
      osVersion = ua.match(/OS (\d+_\d+)/)?.[1]?.replace('_', '.') || '';
    }

    return {
      session_id: sessionId,
      device_type: deviceType,
      browser_name: browserName,
      browser_version: browserVersion,
      os_name: osName,
      os_version: osVersion,
      screen_width: window.screen.width,
      screen_height: window.screen.height
    };
  }, []);

  const trackDeviceBrowser = useCallback(async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const deviceInfo = detectDeviceInfo();

      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tracking/device-browser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(deviceInfo)
      });
    } catch (error) {
      console.debug('Device/browser tracking failed:', error);
    }
  }, [user, detectDeviceInfo]);

  // Auto-track on mount
  useEffect(() => {
    if (user) {
      trackDeviceBrowser();
    }
  }, [user, trackDeviceBrowser]);

  return {
    trackDeviceBrowser,
    detectDeviceInfo
  };
};

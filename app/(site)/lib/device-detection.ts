/**
 * Client-side device detection utilities
 * Detects iOS, Android, and other mobile platforms
 */

export type DeviceType = 'ios' | 'android' | 'desktop' | 'unknown';

export interface DeviceInfo {
  type: DeviceType;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  userAgent: string;
}

/**
 * Detect device type from user agent
 * This runs on the client side only
 */
export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      type: 'unknown',
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      userAgent: '',
    };
  }
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);
  
  let type: DeviceType = 'desktop';
  if (isIOS) type = 'ios';
  else if (isAndroid) type = 'android';
  else if (isMobile) type = 'unknown';
  
  return {
    type,
    isMobile,
    isIOS,
    isAndroid,
    userAgent,
  };
}

/**
 * Get the calendar URL based on device type
 * - iOS: Direct .ics download
 * - Android: Direct .ics download (Google Calendar will handle it)
 * - Desktop: webcal:// protocol for subscription
 */
export function getCalendarUrl(baseUrl: string, deviceType: DeviceType): string {
  // For mobile, always use direct download
  if (deviceType === 'ios' || deviceType === 'android') {
    return `${baseUrl}/api/calendar`;
  }
  
  // For desktop, use webcal for subscription
  const webcalUrl = baseUrl.replace(/^https?:/, 'webcal:');
  return `${webcalUrl}/api/calendar`;
}

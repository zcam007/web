"use client";

import { useEffect, useState } from 'react';
import { detectDevice, getCalendarUrl } from '../lib/device-detection';

interface CalendarButtonProps {
  variant?: 'default' | 'compact';
}

export default function CalendarButton({ variant = 'default' }: CalendarButtonProps) {
  const [deviceInfo, setDeviceInfo] = useState<ReturnType<typeof detectDevice> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [hasAdded, setHasAdded] = useState(false);

  useEffect(() => {
    const info = detectDevice();
    setDeviceInfo(info);
    
    // Check if user has already added the calendar
    const added = localStorage.getItem('calendar-added');
    setHasAdded(!!added);
  }, []);

  const handleAddToCalendar = () => {
    if (!deviceInfo) return;
    
    setIsAdding(true);
    
    const baseUrl = window.location.origin;
    const calendarUrl = getCalendarUrl(baseUrl, deviceInfo.type);
    
    // Mark as added
    localStorage.setItem('calendar-added', 'true');
    setHasAdded(true);
    
    // Small delay for visual feedback
    setTimeout(() => {
      window.location.href = calendarUrl;
      setIsAdding(false);
    }, 300);
  };

  // Don't render on desktop in compact mode
  if (variant === 'compact' && !deviceInfo?.isMobile) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleAddToCalendar}
        disabled={isAdding}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isAdding ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Adding...</span>
          </>
        ) : (
          <>
            <span>📅</span>
            <span>{hasAdded ? 'Update Calendar' : 'Add to Calendar'}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCalendar}
      disabled={isAdding}
      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isAdding ? (
        <>
          <span className="animate-spin text-xl">⏳</span>
          <span>Adding to Calendar...</span>
        </>
      ) : (
        <>
          <span className="text-xl">📅</span>
          <span>
            {hasAdded ? (
              deviceInfo?.isMobile ? 'Update Calendar' : 'Re-subscribe'
            ) : (
              <>
                {deviceInfo?.isIOS && 'Add to iPhone Calendar'}
                {deviceInfo?.isAndroid && 'Add to Google Calendar'}
                {!deviceInfo?.isMobile && 'Subscribe to Calendar'}
              </>
            )}
          </span>
        </>
      )}
    </button>
  );
}

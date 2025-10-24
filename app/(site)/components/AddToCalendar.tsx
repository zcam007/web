"use client";

import { useEffect, useState } from 'react';
import { detectDevice, getCalendarUrl } from '../lib/device-detection';

export default function AddToCalendar() {
  const [deviceInfo, setDeviceInfo] = useState<ReturnType<typeof detectDevice> | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const info = detectDevice();
    setDeviceInfo(info);
    
    // Check if user has already dismissed the prompt or added the calendar
    const hasDismissed = localStorage.getItem('calendar-prompt-dismissed');
    const hasAdded = localStorage.getItem('calendar-added');
    
    if (!hasDismissed && !hasAdded && info.isMobile) {
      // Show prompt after a short delay for better UX
      setTimeout(() => setShowPrompt(true), 2000);
    }
  }, []);

  const handleAddToCalendar = () => {
    if (!deviceInfo) return;
    
    const baseUrl = window.location.origin;
    const calendarUrl = getCalendarUrl(baseUrl, deviceInfo.type);
    
    // Mark as added so we don't ask again
    localStorage.setItem('calendar-added', 'true');
    
    // Open the calendar URL
    window.location.href = calendarUrl;
    
    // Dismiss the prompt
    handleDismiss();
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('calendar-prompt-dismissed', 'true');
  };

  const handleShowAgain = () => {
    setShowPrompt(true);
  };

  // Don't render anything if not mobile
  if (!deviceInfo?.isMobile) return null;

  return (
    <>
      {/* Floating prompt modal */}
      {showPrompt && !dismissed && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform animate-slideUp">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">📅</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Add to Calendar
              </h3>
              <p className="text-gray-600 text-sm">
                {deviceInfo.isIOS && "Save all wedding events to your iPhone calendar"}
                {deviceInfo.isAndroid && "Save all wedding events to your Google Calendar"}
              </p>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={handleAddToCalendar}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                📅 Add Events
              </button>
              
              <button
                onClick={handleDismiss}
                className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200"
              >
                Maybe Later
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              💡 Events will automatically update if we make changes
            </p>
          </div>
        </div>
      )}

      {/* Floating action button when prompt is dismissed */}
      {!showPrompt && deviceInfo.isMobile && (
        <button
          onClick={handleShowAgain}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-full shadow-2xl hover:shadow-pink-300 transform hover:scale-110 transition-all duration-200 animate-bounce"
          aria-label="Add to Calendar"
        >
          <span className="text-2xl">📅</span>
        </button>
      )}
    </>
  );
}

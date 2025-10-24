/**
 * Utilities for displaying times in multiple timezones
 */

/**
 * Get timezone abbreviation (IST, PST, EST, etc.)
 */
export function getTimezoneAbbreviation(timezone: string, date?: Date): string {
  const testDate = date || new Date();
  
  try {
    // Use Intl.DateTimeFormat to get the short timezone name
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    });
    
    const parts = formatter.formatToParts(testDate);
    const tzPart = parts.find(part => part.type === 'timeZoneName');
    
    if (tzPart) {
      return tzPart.value;
    }
  } catch (e) {
    // Fallback for unknown timezones
  }
  
  // Fallback: manual mapping for common timezones
  const tzMap: Record<string, string> = {
    'Asia/Kolkata': 'IST',
    'Asia/Calcutta': 'IST',
    'America/New_York': 'EST', // or EDT
    'America/Chicago': 'CST', // or CDT
    'America/Denver': 'MST', // or MDT
    'America/Los_Angeles': 'PST', // or PDT
    'Europe/London': 'GMT', // or BST
    'Europe/Paris': 'CET', // or CEST
    'Asia/Dubai': 'GST',
    'Asia/Tokyo': 'JST',
    'Asia/Shanghai': 'CST',
    'Australia/Sydney': 'AEDT', // or AEST
  };
  
  return tzMap[timezone] || timezone.split('/')[1] || 'Local';
}

/**
 * Convert IST time to another timezone
 */
export function convertISTToTimezone(
  dateStr: string,
  timeStr: string,
  targetTimezone: string
): { time: string; abbr: string } {
  try {
    // Parse the date and time
    const [year, month, day] = dateStr.split('-').map(Number);
    
    // Parse time (handle both 24-hour and 12-hour formats)
    let hours: number;
    let minutes: number;
    
    if (timeStr.includes(':')) {
      const timeParts = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (timeParts) {
        hours = parseInt(timeParts[1]);
        minutes = parseInt(timeParts[2]);
        const period = timeParts[3];
        
        if (period) {
          if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
          if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
      } else {
        return { time: timeStr, abbr: '' };
      }
    } else {
      return { time: timeStr, abbr: '' };
    }
    
    // Create IST date (UTC+5:30)
    const istDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    
    // Subtract IST offset to get actual UTC
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const utcDate = new Date(istDate.getTime() - istOffsetMs);
    
    // Convert to target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: targetTimezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    const formattedTime = formatter.format(utcDate);
    const abbr = getTimezoneAbbreviation(targetTimezone, utcDate);
    
    return { time: formattedTime, abbr };
  } catch (e) {
    console.error('Error converting timezone:', e);
    return { time: timeStr, abbr: '' };
  }
}

/**
 * Check if timezone is IST
 */
export function isIST(timezone: string): boolean {
  return timezone === 'Asia/Kolkata' || 
         timezone === 'Asia/Calcutta' ||
         getTimezoneAbbreviation(timezone) === 'IST';
}

/**
 * Format time with timezone display
 */
export function formatDualTimezone(
  dateStr: string,
  timeStr: string,
  userTimezone: string
): string {
  // Always show IST
  const istTime = timeStr.includes(':') ? 
    (timeStr.match(/\d{1,2}:\d{2}\s*(AM|PM)/i)?.[0] || timeStr) : 
    timeStr;
  
  // If user is in IST, only show IST
  if (isIST(userTimezone)) {
    return `${istTime} IST`;
  }
  
  // Convert to user's timezone
  const converted = convertISTToTimezone(dateStr, timeStr, userTimezone);
  
  // Show both: IST / Local timezone
  return `${istTime} IST / ${converted.time} ${converted.abbr}`.trim();
}

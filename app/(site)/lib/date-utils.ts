/**
 * Date formatting utilities for events
 */

/**
 * Format date as "Monday, 24th Nov"
 * Parses date in local timezone (IST) to avoid off-by-one errors
 */
export function formatEventDate(dateStr: string): string {
  if (!dateStr) return '';
  
  try {
    // Parse date without timezone interpretation to avoid off-by-one errors
    // "2025-11-24" should always be Nov 24, regardless of user's timezone
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return '';
    
    // Create date in local timezone (no UTC conversion)
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return '';
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayNum = date.getDate();
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    // Add ordinal suffix (st, nd, rd, th)
    const ordinal = getOrdinalSuffix(dayNum);
    
    return `${dayName}, ${dayNum}${ordinal} ${monthName}`;
  } catch (e) {
    return '';
  }
}

/**
 * Format date with year as "Monday, 24th Nov 2025"
 * Parses date in local timezone (IST) to avoid off-by-one errors
 */
export function formatEventDateWithYear(dateStr: string): string {
  if (!dateStr) return '';
  
  try {
    // Parse date without timezone interpretation
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return '';
    
    // Create date in local timezone (no UTC conversion)
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return '';
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayNum = date.getDate();
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    const ordinal = getOrdinalSuffix(dayNum);
    
    return `${dayName}, ${dayNum}${ordinal} ${monthName} ${year}`;
  } catch (e) {
    return '';
  }
}

/**
 * Format full date and time as "Monday, 24th Nov 6:00 PM"
 */
export function formatEventDateTime(dateStr: string, timeStr: string): string {
  const dateFormatted = formatEventDate(dateStr);
  if (!dateFormatted) return timeStr || '';
  
  // Extract start time from time string (e.g., "6:00 PM - 8:00 PM" -> "6:00 PM")
  const startTime = extractStartTime(timeStr);
  
  return `${dateFormatted} ${startTime}`.trim();
}

/**
 * Extract start time from time range string
 * "6:00 PM - 8:00 PM" -> "6:00 PM"
 * "6:00 PM onwards" -> "6:00 PM"
 * "18:00" -> "6:00 PM"
 */
function extractStartTime(timeStr: string): string {
  if (!timeStr) return '';
  
  // Check if it's in 24-hour format (HH:MM)
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    return format24HourTo12Hour(timeStr);
  }
  
  // Split by dash or "onwards"
  const parts = timeStr.split(/\s*[-–]\s*|\s+onwards/i);
  return parts[0]?.trim() || timeStr;
}

/**
 * Convert 24-hour time to 12-hour format with AM/PM
 * "18:00" -> "6:00 PM"
 * "09:30" -> "9:30 AM"
 */
export function format24HourTo12Hour(time24: string): string {
  if (!time24) return '';
  
  const [hours24Str, minutes] = time24.split(':');
  const hours24 = parseInt(hours24Str, 10);
  
  if (isNaN(hours24)) return time24;
  
  const period = hours24 >= 12 ? 'PM' : 'AM';
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  
  return `${hours12}:${minutes} ${period}`;
}

/**
 * Convert 12-hour time to 24-hour format
 * "6:00 PM" -> "18:00"
 * "9:30 AM" -> "09:30"
 */
export function format12HourTo24Hour(time12: string): string {
  if (!time12) return '';
  
  const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return time12;
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

/**
 * Get ordinal suffix for day number
 */
function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

/**
 * Get date range string from array of dates
 * ["2025-11-24", "2025-11-25", "2025-11-26"] -> "24th - 26th November, 2025"
 * Parses dates in local timezone (IST) to avoid off-by-one errors
 */
export function formatDateRange(dates: string[]): string {
  if (!dates || dates.length === 0) return '';
  
  // Parse all valid dates in local timezone
  const parsedDates = dates
    .map(d => {
      const [year, month, day] = d.split('-').map(Number);
      if (!year || !month || !day) return null;
      return new Date(year, month - 1, day);
    })
    .filter(d => d !== null && !isNaN(d.getTime()))
    .sort((a, b) => a!.getTime() - b!.getTime()) as Date[];
  
  if (parsedDates.length === 0) return '';
  if (parsedDates.length === 1) {
    return formatEventDateWithYear(dates[0]);
  }
  
  const firstDate = parsedDates[0];
  const lastDate = parsedDates[parsedDates.length - 1];
  
  const firstDay = firstDate.getDate();
  const lastDay = lastDate.getDate();
  const month = firstDate.toLocaleDateString('en-US', { month: 'long' });
  const year = firstDate.getFullYear();
  
  const firstOrdinal = getOrdinalSuffix(firstDay);
  const lastOrdinal = getOrdinalSuffix(lastDay);
  
  return `${firstDay}${firstOrdinal} - ${lastDay}${lastOrdinal} ${month}, ${year}`;
}

/**
 * Parse date from string and return Date object in local timezone
 * Avoids timezone interpretation issues
 */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return null;
    
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date;
  } catch (e) {
    return null;
  }
}

/**
 * Group events by date
 */
export function groupEventsByDate(events: any[]): Map<string, any[]> {
  const groups = new Map<string, any[]>();
  
  events.forEach(event => {
    const date = event.date || 'no-date';
    if (!groups.has(date)) {
      groups.set(date, []);
    }
    groups.get(date)!.push(event);
  });
  
  return groups;
}

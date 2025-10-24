/**
 * Calendar utility for generating iCalendar (.ics) files
 * Supports both iOS and Android calendar apps
 */

export interface CalendarEvent {
  name: string;
  time: string;
  place?: string;
  description?: string;
  date?: string; // e.g., "2025-11-24"
}

export interface ParsedCalendarEvent {
  summary: string;
  start: Date;
  end: Date;
  location: string;
  description: string;
}

/**
 * Parse event time string to extract start and end times
 * Handles formats like:
 * - "6:00 PM - 7:00 PM"
 * - "6:00 PM onwards"
 * - "6:00 PM"
 */
function parseEventTime(timeStr: string, eventDate: string): { start: Date; end: Date } {
  const [datePart] = eventDate.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  
  // Extract start time
  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!timeMatch) {
    // Default to noon if we can't parse
    const defaultStart = new Date(year, month - 1, day, 12, 0);
    const defaultEnd = new Date(year, month - 1, day, 14, 0);
    return { start: defaultStart, end: defaultEnd };
  }
  
  let hours = parseInt(timeMatch[1]);
  const minutes = parseInt(timeMatch[2]);
  const meridiem = timeMatch[3].toUpperCase();
  
  // Convert to 24-hour format
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  
  const startDate = new Date(year, month - 1, day, hours, minutes);
  
  // Check if there's an end time
  const endTimeMatch = timeStr.match(/-(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  let endDate: Date;
  
  if (endTimeMatch) {
    let endHours = parseInt(endTimeMatch[1]);
    const endMinutes = parseInt(endTimeMatch[2]);
    const endMeridiem = endTimeMatch[3].toUpperCase();
    
    if (endMeridiem === 'PM' && endHours !== 12) endHours += 12;
    if (endMeridiem === 'AM' && endHours === 12) endHours = 0;
    
    endDate = new Date(year, month - 1, day, endHours, endMinutes);
  } else {
    // Default to 2 hours duration
    endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  }
  
  return { start: startDate, end: endDate };
}

/**
 * Convert Date to iCalendar format (YYYYMMDDTHHMMSS)
 */
function formatICalDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Generate a unique ID for the event
 */
function generateEventId(event: ParsedCalendarEvent): string {
  const timestamp = event.start.getTime();
  const summary = event.summary.replace(/\s+/g, '-').toLowerCase();
  return `${timestamp}-${summary}@wedding.chandu.dev`;
}

/**
 * Parse event data into structured calendar event
 */
export function parseCalendarEvent(event: CalendarEvent, defaultDate: string): ParsedCalendarEvent {
  const eventDate = event.date || defaultDate;
  const { start, end } = parseEventTime(event.time, eventDate);
  
  return {
    summary: event.name,
    start,
    end,
    location: event.place || '',
    description: event.description || '',
  };
}

/**
 * Generate a single .ics file content for an event
 */
export function generateICS(event: ParsedCalendarEvent): string {
  const now = new Date();
  const dtstamp = formatICalDateTime(now);
  const dtstart = formatICalDateTime(event.start);
  const dtend = formatICalDateTime(event.end);
  const uid = generateEventId(event);
  
  // Escape special characters in text fields
  const escapedSummary = event.summary.replace(/[,;\\]/g, '\\$&');
  const escapedLocation = event.location.replace(/[,;\\]/g, '\\$&');
  const escapedDescription = event.description.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding Invitation//Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Chandu/Mouni Wedding Events
X-WR-TIMEZONE:Asia/Kolkata
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${escapedSummary}
LOCATION:${escapedLocation}
DESCRIPTION:${escapedDescription}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
}

/**
 * Generate a calendar feed with multiple events
 */
export function generateCalendarFeed(events: ParsedCalendarEvent[]): string {
  const now = new Date();
  const dtstamp = formatICalDateTime(now);
  
  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding Invitation//Calendar Feed//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Chandu/Mounika Wedding Events
X-WR-TIMEZONE:Asia/Kolkata
X-WR-CALDESC:Wedding ceremonies and reception events
`;
  
  events.forEach(event => {
    const dtstart = formatICalDateTime(event.start);
    const dtend = formatICalDateTime(event.end);
    const uid = generateEventId(event);
    
    const escapedSummary = event.summary.replace(/[,;\\]/g, '\\$&');
    const escapedLocation = event.location.replace(/[,;\\]/g, '\\$&');
    const escapedDescription = event.description.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
    
    icsContent += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${escapedSummary}
LOCATION:${escapedLocation}
DESCRIPTION:${escapedDescription}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
`;
  });
  
  icsContent += 'END:VCALENDAR';
  return icsContent;
}

/**
 * Map event dates based on event names
 * This is a helper to assign dates to events from the config
 */
export function getEventDate(eventName: string): string {
  const name = eventName.toLowerCase();
  
  // Map event names to dates (Nov 24-26 for wedding, Nov 30 for reception)
  if (name.includes('pellikuthuru') || name.includes('mehendi')) {
    return '2025-11-24';
  }
  if (name.includes('sangeet') || name.includes('music')) {
    return '2025-11-25';
  }
  if (name.includes('haldi') || name.includes('turmeric')) {
    return '2025-11-25';
  }
  if (name.includes('muhurtham') || name.includes('wedding')) {
    return '2025-11-26';
  }
  if (name.includes('reception')) {
    return '2025-11-30';
  }
  
  // Default to first day
  return '2025-11-24';
}

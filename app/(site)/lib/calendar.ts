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
  liveStreamUrl?: string; // YouTube, Zoom, or any live stream link
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
 * IMPORTANT: Times from the website are in IST (Asia/Kolkata)
 * This function converts IST times to UTC for calendar storage
 * Calendar apps will then convert UTC to user's local timezone
 * 
 * Handles formats like:
 * - "18:00" (24-hour from time picker)
 * - "6:00 PM" (12-hour legacy)
 * - "6:00 PM - 8:00 PM" (with end time)
 */
function parseEventTime(
  timeStr: string,
  eventDate: string,
  targetTimezone: string = 'Asia/Kolkata'
): { start: Date; end: Date } {
  const [datePart] = eventDate.split('T');
  const [year, month, day] = datePart.split('-').map(Number);

  const [startPart, endPart] = timeStr.split('-').map((part) => part?.trim() ?? '');

  const parseTimeComponent = (component: string): { hours: number; minutes: number } | null => {
    if (!component) return null;
    const twelveHour = component.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (twelveHour) {
      let hours = parseInt(twelveHour[1], 10);
      const minutes = parseInt(twelveHour[2], 10);
      const meridiem = twelveHour[3].toUpperCase();
      if (meridiem === 'PM' && hours !== 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
      return { hours, minutes };
    }

    const twentyFourHour = component.match(/(\d{1,2}):(\d{2})/);
    if (twentyFourHour) {
      const hours = parseInt(twentyFourHour[1], 10);
      const minutes = parseInt(twentyFourHour[2], 10);
      if (hours >= 0 && hours < 24) {
        return { hours, minutes };
      }
    }
    return null;
  };

  const startTime = parseTimeComponent(startPart);
  if (!startTime) {
    const defaultStart = createDateInTimezone(year, month, day, 12, 0, targetTimezone);
    const defaultEnd = createDateInTimezone(year, month, day, 14, 0, targetTimezone);
    return { start: defaultStart, end: defaultEnd };
  }

  const startDate = createDateInTimezone(
    year,
    month,
    day,
    startTime.hours,
    startTime.minutes,
    targetTimezone
  );

  const endTime = parseTimeComponent(endPart);
  let endDate: Date;

  if (endTime) {
    endDate = createDateInTimezone(
      year,
      month,
      day,
      endTime.hours,
      endTime.minutes,
      targetTimezone
    );
    // Handle cases where end time crosses midnight implicitly
    if (endDate <= startDate) {
      endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
    }
  } else {
    // Default to 2 hours duration when no explicit end time
    endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  }

  return { start: startDate, end: endDate };
}

/**
 * Create a Date object in a specific timezone
 * Since the times on the website are in IST, we need to convert them properly
 */
function createDateInTimezone(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
  timezone: string
): Date {
  const baseUtc = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  const localeString = baseUtc.toLocaleString('en-US', { timeZone: timezone });
  const tzDate = new Date(localeString);
  const offset = baseUtc.getTime() - tzDate.getTime();
  return new Date(baseUtc.getTime() - offset);
}

/**
 * Convert Date to iCalendar UTC format (YYYYMMDDTHHMMSSZ)
 * The 'Z' suffix indicates UTC time
 */
function formatICalDateTime(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Generate the master UID for the wedding event series
 * ALL events use this same UID to be treated as one series
 */
function getMasterEventId(): string {
  return 'chandu-mouni-wedding-2025@wedding.chandu.dev';
}

/**
 * Parse event data into structured calendar event
 * @param event The event data from config
 * @param defaultDate The default date if not specified
 * @param timezone The target timezone for the event (defaults to IST)
 */
export function parseCalendarEvent(event: CalendarEvent, defaultDate: string, timezone: string = 'Asia/Kolkata'): ParsedCalendarEvent {
  const eventDate = event.date || defaultDate;
  const { start, end } = parseEventTime(event.time, eventDate, timezone);
  
  // Add "Chandu & Mouni - " prefix to all event names
  const eventName = `Chandu & Mouni - ${event.name}`;
  
  // Build description with live stream link if available
  let description = event.description || '';
  if (event.liveStreamUrl) {
    if (description) {
      description += '\n\n';
    }
    description += `📹 Watch Live: ${event.liveStreamUrl}`;
  }
  
  return {
    summary: eventName,
    start,
    end,
    location: event.place || '',
    description,
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
  const uid = getMasterEventId();
  
  // Escape special characters in text fields
  const escapedSummary = event.summary.replace(/[,;\\]/g, '\\$&');
  const escapedLocation = event.location.replace(/[,;\\]/g, '\\$&');
  const escapedDescription = event.description.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding Invitation//Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Chandu & Mouni Wedding
BEGIN:VEVENT
UID:${uid}
RECURRENCE-ID:${dtstart}
DTSTAMP:${dtstamp}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${escapedSummary}
LOCATION:${escapedLocation}
DESCRIPTION:${escapedDescription}
CATEGORIES:Chandu & Mouni Wedding
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
}

/**
 * Generate a calendar feed with multiple events
 * All events are linked as a series using RELATED-TO field
 */
export function generateCalendarFeed(events: ParsedCalendarEvent[]): string {
  const now = new Date();
  const dtstamp = formatICalDateTime(now);
  const masterUid = getMasterEventId();
  
  // Use current timestamp as part of the sequence to force updates
  // This ensures calendar apps recognize changes when events are modified
  const baseSequence = Math.floor(now.getTime() / 1000);
  
  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding Invitation//Calendar Feed//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Chandu & Mouni Wedding
X-WR-CALDESC:Wedding ceremonies and reception events. Delete any event to remove all.
X-PUBLISHED-TTL:PT1H
`;
  
  events.forEach((event) => {
    const dtstart = formatICalDateTime(event.start);
    const dtend = formatICalDateTime(event.end);
    
    // All events use the SAME UID - this is the key for series behavior!
    const uid = getMasterEventId();
    
    const escapedSummary = event.summary.replace(/[,;\\]/g, '\\$&');
    const escapedLocation = event.location.replace(/[,;\\]/g, '\\$&');
    const escapedDescription = event.description.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
    
    // RECURRENCE-ID makes each event unique while keeping same UID
    // This is the proper way to create a series on mobile
    icsContent += `BEGIN:VEVENT
UID:${uid}
RECURRENCE-ID:${dtstart}
DTSTAMP:${dtstamp}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${escapedSummary}
LOCATION:${escapedLocation}
DESCRIPTION:${escapedDescription}
CATEGORIES:Chandu & Mouni Wedding
STATUS:CONFIRMED
SEQUENCE:${baseSequence}
LAST-MODIFIED:${dtstamp}
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
/**
 * API endpoint for calendar feed
 * Generates a subscribable .ics file with all wedding events
 */

import { NextRequest, NextResponse } from 'next/server';
import { readConfig } from '../../lib/config';
import { 
  generateCalendarFeed, 
  parseCalendarEvent, 
  getEventDate,
  CalendarEvent 
} from '../../lib/calendar';

export async function GET(request: NextRequest) {
  try {
    const config = await readConfig();
    
    // Find the events section
    const eventsSection = config.sections.find((s: any) => s.type === 'events');
    if (!eventsSection || !eventsSection.items) {
      return new NextResponse('No events found', { status: 404 });
    }
    
    // Parse all events
    const parsedEvents = eventsSection.items.map((event: CalendarEvent) => {
      const eventDate = getEventDate(event.name);
      return parseCalendarEvent(event, eventDate);
    });
    
    // Generate ICS content
    const icsContent = generateCalendarFeed(parsedEvents);
    
    // Return as downloadable .ics file
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="wedding-events.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating calendar:', error);
    return new NextResponse('Error generating calendar', { status: 500 });
  }
}

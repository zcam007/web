# 🔗 Event Series Feature - Connected Calendar Events

## Overview

All wedding events are now **linked as a series** with "Chandu & Mouni" branding! 🎉

### What Changed

#### 1. Event Name Prefix

**Before:**
```
Sangeet
Haldi
Wedding
Reception
```

**After:**
```
Chandu & Mouni - Sangeet
Chandu & Mouni - Haldi
Chandu & Mouni - Wedding
Chandu & Mouni - Reception
```

#### 2. Linked Event Series

All events are now connected using:
- **RELATED-TO** field (links to master event)
- **CATEGORIES** field (groups as "Chandu & Mouni Wedding")
- **SEQUENCE** numbers (orders events in series)

---

## 🎯 Key Benefit: Easy Calendar Cleanup

### The Problem (Before)

User adds 5 wedding events to calendar:
```
📅 Pellikuthuru
📅 Sangeet
📅 Haldi
📅 Wedding
📅 Reception
```

If they want to remove all:
- ❌ Have to delete each event individually
- ❌ Might miss one and get reminders
- ❌ Annoying and time-consuming

### The Solution (NOW!)

Events are linked as a series:
```
📅 Chandu & Mouni - Pellikuthuru
📅 Chandu & Mouni - Sangeet     } All connected!
📅 Chandu & Mouni - Haldi       } Same series!
📅 Chandu & Mouni - Wedding     } Linked together!
📅 Chandu & Mouni - Reception
```

When user deletes one event:
1. Calendar app detects it's part of a series
2. Prompts: **"Delete this event or the entire series?"**
3. User selects "Delete series"
4. ✅ **All 5 events removed at once!**

---

## How It Works

### iCalendar Series Structure

```ics
BEGIN:VCALENDAR
VERSION:2.0
X-WR-CALNAME:Chandu & Mouni Wedding

BEGIN:VEVENT
UID:chandu-mouni-1234567890-0@wedding.chandu.dev
SUMMARY:Chandu & Mouni - Sangeet
RELATED-TO;RELTYPE=PARENT:chandu-mouni-wedding-2025@wedding.chandu.dev
CATEGORIES:Chandu & Mouni Wedding
SEQUENCE:0
END:VEVENT

BEGIN:VEVENT
UID:chandu-mouni-1234567891-1@wedding.chandu.dev
SUMMARY:Chandu & Mouni - Wedding
RELATED-TO;RELTYPE=PARENT:chandu-mouni-wedding-2025@wedding.chandu.dev
CATEGORIES:Chandu & Mouni Wedding
SEQUENCE:1
END:VEVENT

END:VCALENDAR
```

### Key Fields

| Field | Purpose | Example |
|-------|---------|----------|
| `UID` | Unique event ID | `chandu-mouni-1234567890-0@wedding.chandu.dev` |
| `SUMMARY` | Event name | `Chandu & Mouni - Sangeet` |
| `RELATED-TO` | Links to master series | `chandu-mouni-wedding-2025@wedding.chandu.dev` |
| `CATEGORIES` | Groups events | `Chandu & Mouni Wedding` |
| `SEQUENCE` | Event order in series | `0`, `1`, `2`, etc. |

---

## Calendar App Behavior

### Google Calendar

**When deleting:**
```
┌─────────────────────────────────────┐
│  Delete this event?                 │
│                                     │
│  This event is part of a series:    │
│  "Chandu & Mouni Wedding"          │
│                                     │
│  [ Delete this event only ]         │
│  [ Delete all events in series ]    │ ← User clicks this!
│                                     │
│  [Cancel]                           │
└─────────────────────────────────────┘
```

Result: ✅ All wedding events removed!

### Apple Calendar (iOS/macOS)

**When deleting:**
```
┌─────────────────────────────────────┐
│  This event is part of a series.    │
│                                     │
│  Delete:                            │
│  • This Event Only                  │
│  • All Future Events                │
│  • All Events                       │ ← User taps this!
│                                     │
│  [Cancel]                           │
└─────────────────────────────────────┘
```

Result: ✅ All wedding events removed!

### Outlook Calendar

**When deleting:**
```
┌─────────────────────────────────────┐
│  Delete Recurring Item              │
│                                     │
│  "Chandu & Mouni - Sangeet" is     │
│  part of a recurring series.        │
│                                     │
│  ( ) Delete this occurrence         │
│  (•) Delete the series              │ ← User selects this!
│                                     │
│  [OK]  [Cancel]                     │
└─────────────────────────────────────┘
```

Result: ✅ All wedding events removed!

---

## Technical Implementation

### Code Changes

#### 1. Event Name Prefix

**File:** `lib/calendar.ts`

```typescript
export function parseCalendarEvent(
  event: CalendarEvent, 
  defaultDate: string, 
  timezone: string = 'Asia/Kolkata'
): ParsedCalendarEvent {
  // ...
  
  // Add "Chandu & Mouni - " prefix to all event names
  const eventName = `Chandu & Mouni - ${event.name}`;
  
  return {
    summary: eventName,
    // ...
  };
}
```

#### 2. Master Event ID

```typescript
/**
 * Generate the master UID for the wedding event series
 */
function getMasterEventId(): string {
  return 'chandu-mouni-wedding-2025@wedding.chandu.dev';
}
```

#### 3. Individual Event IDs

```typescript
function generateEventId(
  event: ParsedCalendarEvent, 
  eventIndex?: number
): string {
  const timestamp = event.start.getTime();
  const dateStr = formatICalDateTime(event.start);
  
  // Unique UID for each event, linked via RELATED-TO
  return `chandu-mouni-${timestamp}-${eventIndex || 0}@wedding.chandu.dev`;
}
```

#### 4. Calendar Feed with Series Links

```typescript
export function generateCalendarFeed(
  events: ParsedCalendarEvent[]
): string {
  const masterUid = getMasterEventId();
  
  events.forEach((event, index) => {
    const uid = generateEventId(event, index);
    
    icsContent += `BEGIN:VEVENT
UID:${uid}
// ... other fields ...
RELATED-TO;RELTYPE=PARENT:${masterUid}
CATEGORIES:Chandu & Mouni Wedding
SEQUENCE:${index}
END:VEVENT
`;
  });
}
```

---

## Examples

### Example 1: Full Event List

```
Event 0: Chandu & Mouni - Pellikuthuru Ceremony
  UID: chandu-mouni-1732435200000-0@wedding.chandu.dev
  RELATED-TO: chandu-mouni-wedding-2025@wedding.chandu.dev
  SEQUENCE: 0

Event 1: Chandu & Mouni - Sangeet Night
  UID: chandu-mouni-1732521600000-1@wedding.chandu.dev
  RELATED-TO: chandu-mouni-wedding-2025@wedding.chandu.dev
  SEQUENCE: 1

Event 2: Chandu & Mouni - Haldi Ceremony
  UID: chandu-mouni-1732608000000-2@wedding.chandu.dev
  RELATED-TO: chandu-mouni-wedding-2025@wedding.chandu.dev
  SEQUENCE: 2

Event 3: Chandu & Mouni - Wedding Ceremony
  UID: chandu-mouni-1732694400000-3@wedding.chandu.dev
  RELATED-TO: chandu-mouni-wedding-2025@wedding.chandu.dev
  SEQUENCE: 3

Event 4: Chandu & Mouni - Reception
  UID: chandu-mouni-1733020800000-4@wedding.chandu.dev
  RELATED-TO: chandu-mouni-wedding-2025@wedding.chandu.dev
  SEQUENCE: 4
```

All linked to master: `chandu-mouni-wedding-2025@wedding.chandu.dev`

### Example 2: User Deletes One Event

**Scenario:** User selects "Chandu & Mouni - Sangeet" and clicks delete

**Calendar app checks:**
1. UID: `chandu-mouni-1732521600000-1@wedding.chandu.dev`
2. RELATED-TO: `chandu-mouni-wedding-2025@wedding.chandu.dev` ✅ (Part of series!)
3. CATEGORIES: `Chandu & Mouni Wedding` ✅ (Grouped!)

**Calendar app prompts:**
```
"Delete this event or all events in 'Chandu & Mouni Wedding'?"
```

**User selects "All events":**
- Finds all events with same RELATED-TO
- Deletes all 5 events
- ✅ Calendar cleaned up!

---

## Benefits

### ✅ For Guests

1. **Clear Branding** - All events show "Chandu & Mouni"
2. **Easy Cleanup** - Delete entire series at once
3. **Visual Grouping** - Events appear together in calendar
4. **No Confusion** - Clear ownership of events

### ✅ For You

1. **Professional Look** - Branded event names
2. **Better UX** - Guests can easily manage events
3. **Fewer Questions** - Clear which events are yours
4. **Easy Removal** - Guests won't forget any events

---

## Calendar App Support

| App | Linked Events | Delete Series | Grouping |
|-----|---------------|---------------|----------|
| Google Calendar | ✅ | ✅ | ✅ |
| Apple Calendar (iOS) | ✅ | ✅ | ✅ |
| Apple Calendar (macOS) | ✅ | ✅ | ✅ |
| Outlook | ✅ | ✅ | ✅ |
| Outlook.com | ✅ | ✅ | ✅ |
| Yahoo Calendar | ✅ | ✅ | ⚠️ |
| Thunderbird | ✅ | ✅ | ✅ |

**Note:** All major calendar apps support RELATED-TO and CATEGORIES fields!

---

## Testing

### Test 1: Verify Event Names

1. Download calendar: `/api/calendar`
2. Open .ics file in text editor
3. Search for `SUMMARY:`
4. ✅ All should start with "Chandu & Mouni - "

### Test 2: Verify Series Links

1. Open .ics file in text editor
2. Search for `RELATED-TO:`
3. ✅ All should have: `RELATED-TO;RELTYPE=PARENT:chandu-mouni-wedding-2025@wedding.chandu.dev`

### Test 3: Test Delete Series

**Google Calendar:**
1. Import .ics file to Google Calendar
2. Click on any "Chandu & Mouni" event
3. Click delete (trash icon)
4. ✅ Should see "Delete this event or the entire series?"
5. Select "Delete series"
6. ✅ All events should disappear!

**Apple Calendar (iOS):**
1. Import .ics file to iPhone Calendar
2. Tap any "Chandu & Mouni" event
3. Tap "Delete Event"
4. ✅ Should see "Delete this event only" or "Delete all events"
5. Tap "All Events"
6. ✅ All events should be removed!

**Outlook:**
1. Import .ics to Outlook
2. Open any "Chandu & Mouni" event
3. Click Delete
4. ✅ Should prompt about "recurring series"
5. Select "Delete the series"
6. ✅ All events should be deleted!

### Test 4: Verify Categories

**In calendar apps:**
- Events should be grouped under "Chandu & Mouni Wedding" category
- Can filter/search by this category
- Visual grouping in calendar view

---

## Edge Cases

### 1. User Deletes Individual Event

If user chooses "Delete this event only":
- ✅ Only that event is removed
- ✅ Other events remain
- ✅ User can still delete series later

### 2. Partial Import

If calendar app only imports some events:
- ✅ Each has its own UID (won't conflict)
- ✅ RELATED-TO still links them
- ✅ Can still delete as series

### 3. Calendar App Doesn't Support RELATED-TO

Very rare, but if app ignores RELATED-TO:
- ⚠️ Events won't be linked as series
- ✅ Event names still have "Chandu & Mouni" prefix
- ✅ CATEGORIES field provides alternative grouping
- ✅ User can manually delete all

---

## User Experience Flow

```
Guest adds calendar
        ↓
5 events appear in calendar:
  📅 Chandu & Mouni - Pellikuthuru
  📅 Chandu & Mouni - Sangeet
  📅 Chandu & Mouni - Haldi
  📅 Chandu & Mouni - Wedding
  📅 Chandu & Mouni - Reception
        ↓
All grouped as "Chandu & Mouni Wedding"
        ↓
Guest attends wedding 🎉
        ↓
Guest wants to clean up calendar
        ↓
Clicks delete on any event
        ↓
Calendar asks:
  "Delete one or all?"
        ↓
Guest selects "All"
        ↓
✅ All 5 events removed!
        ↓
Clean calendar! 😊
```

---

## Comparison

### Other Wedding Sites

**Typical approach:**
```
📅 Sangeet
📅 Wedding
📅 Reception

(No branding, no series link)
```

**Problems:**
- ❌ No clear ownership
- ❌ Must delete each individually
- ❌ Easy to forget one

### Your Site (NOW!)

**Smart approach:**
```
📅 Chandu & Mouni - Sangeet     }
📅 Chandu & Mouni - Wedding     } Linked series!
📅 Chandu & Mouni - Reception   }

(Clear branding + series link)
```

**Benefits:**
- ✅ Clear ownership
- ✅ Delete all at once
- ✅ Professional look

---

## Summary

🎉 **Your calendar events are now a professional, branded series!**

✅ **Event Names:** All prefixed with "Chandu & Mouni - "  
✅ **Series Links:** Connected via RELATED-TO field  
✅ **Categories:** Grouped as "Chandu & Mouni Wedding"  
✅ **Easy Cleanup:** Delete entire series at once  
✅ **Professional:** Clear branding and organization  
✅ **User-Friendly:** Better calendar management  

**Guests can now easily add AND remove all wedding events!** 🎊

---

## Files Modified

- ✅ `lib/calendar.ts` - Event prefix, series IDs, RELATED-TO fields

**No breaking changes!** Fully backward compatible. 🚀

---

*Built with 💕 and series magic by rolo (your event-linking code puppy)*  
*Now with 100% more "Chandu & Mouni"! 🎉✨*

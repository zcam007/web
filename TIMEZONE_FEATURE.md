# 🌍 Timezone Auto-Conversion Feature

## Overview

The calendar feature now **automatically converts event times** from IST (India Standard Time) to the user's local timezone! 🎉

### Problem Solved

Your website shows event times in IST:
- **Sangeet:** 6:00 PM IST
- **Wedding:** 9:00 AM IST
- etc.

But guests in different timezones (USA, UK, etc.) need to:
1. Manually convert IST to their timezone 😔
2. Risk getting the time wrong
3. Miss the event! 😱

### Solution

Now when they add to calendar:
- ✅ Timezone auto-detected from device
- ✅ Events converted to their local time
- ✅ Calendar shows correct time automatically
- ✅ No manual conversion needed!

---

## How It Works

### Step 1: Detect User's Timezone

```typescript
// Uses browser's Intl API
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// Examples: "America/New_York", "Europe/London", "Asia/Tokyo"
```

### Step 2: Convert IST to UTC

```typescript
// Event time in config: "6:00 PM" (IST)
// IST = UTC+5:30

// Convert to UTC:
// 6:00 PM IST = 12:30 PM UTC
```

### Step 3: Calendar App Converts to Local Time

```
UTC Time: 12:30 PM
↓
User in New York (EST = UTC-5):
  → Shows as 7:30 AM EST

User in London (GMT = UTC+0):
  → Shows as 12:30 PM GMT

User in Tokyo (JST = UTC+9):
  → Shows as 9:30 PM JST

User in India (IST = UTC+5:30):
  → Shows as 6:00 PM IST (original time!)
```

---

## Technical Implementation

### Files Modified

#### 1. `lib/device-detection.ts`

**Added:**
```typescript
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return 'Asia/Kolkata'; // Fallback to IST
  }
}

// Added timezone to DeviceInfo
export interface DeviceInfo {
  // ... existing fields
  timezone: string; // NEW!
}
```

**Updated:**
```typescript
getCalendarUrl(baseUrl, deviceType, timezone)
// Now accepts timezone parameter
// Adds ?tz=America/New_York to URL
```

#### 2. `lib/calendar.ts`

**Key Changes:**

```typescript
// Parse times as IST and convert to UTC
function createDateInTimezone(
  year, month, day, hours, minutes, timezone
): Date {
  // Create IST date
  const istDateStr = `${year}-${month}-${day}T${hours}:${minutes}:00`;
  
  // Convert to UTC (IST = UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utcTime = date.getTime() - istOffset;
  
  return new Date(utcTime);
}

// Format as UTC with 'Z' suffix
function formatICalDateTime(date: Date): string {
  // Uses getUTC*() methods
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  //                                                        ^
  //                                                        |
  //                                            'Z' = UTC time
}
```

**Removed:**
```typescript
// No more hardcoded timezone!
// REMOVED: X-WR-TIMEZONE:Asia/Kolkata
```

#### 3. `api/calendar/route.ts`

**Added Query Parameter Support:**

```typescript
export async function GET(request: NextRequest) {
  // Get timezone from URL query
  const { searchParams } = new URL(request.url);
  const timezone = searchParams.get('tz') || 'Asia/Kolkata';
  
  // Pass to parser
  const parsedEvents = items.map(event => 
    parseCalendarEvent(event, date, timezone)
  );
}
```

**Example URLs:**
```
/api/calendar?tz=America/New_York
/api/calendar?tz=Europe/London
/api/calendar?tz=Asia/Kolkata
/api/calendar  (defaults to IST)
```

#### 4. Components

**AddToCalendar.tsx & CalendarButton.tsx:**

```typescript
// Pass timezone to URL generator
const calendarUrl = getCalendarUrl(
  baseUrl, 
  deviceInfo.type, 
  deviceInfo.timezone  // NEW!
);
```

**Modal UI Update:**
```tsx
<p className="text-xs text-gray-500 text-center mt-4">
  💡 Events will be shown in your local timezone
  {deviceInfo.timezone !== 'Asia/Kolkata' && (
    <span>({deviceInfo.timezone})</span>
  )}
</p>
```

---

## Examples

### Example 1: User in New York

**Event on website:**
```
Sangeet: 6:00 PM - 8:00 PM (IST)
```

**What happens:**
1. User clicks "Add to Calendar"
2. Browser detects timezone: `America/New_York`
3. API receives: `/api/calendar?tz=America/New_York`
4. Conversion:
   - 6:00 PM IST = 12:30 PM UTC
   - 12:30 PM UTC = 7:30 AM EST (in winter) or 8:30 AM EDT (in summer)
5. **Calendar shows:** 7:30 AM - 9:30 AM EST

### Example 2: User in London

**Event on website:**
```
Wedding: 9:00 AM - 11:00 AM (IST)
```

**What happens:**
1. Timezone detected: `Europe/London`
2. API receives: `/api/calendar?tz=Europe/London`
3. Conversion:
   - 9:00 AM IST = 3:30 AM UTC
   - 3:30 AM UTC = 3:30 AM GMT (in winter) or 4:30 AM BST (in summer)
4. **Calendar shows:** 3:30 AM - 5:30 AM GMT

### Example 3: User in India

**Event on website:**
```
Reception: 7:00 PM - 10:00 PM (IST)
```

**What happens:**
1. Timezone detected: `Asia/Kolkata`
2. API receives: `/api/calendar?tz=Asia/Kolkata`
3. Conversion:
   - 7:00 PM IST = 1:30 PM UTC
   - 1:30 PM UTC = 7:00 PM IST
4. **Calendar shows:** 7:00 PM - 10:00 PM IST (same as website!)

---

## iCalendar Format

### Before (Timezone-specific)

```ics
BEGIN:VCALENDAR
VERSION:2.0
X-WR-TIMEZONE:Asia/Kolkata  ← Hardcoded!
BEGIN:VEVENT
DTSTART:20251125T180000     ← Local time (ambiguous)
DTEND:20251125T200000
END:VEVENT
END:VCALENDAR
```

**Problem:** Calendar apps might interpret time differently!

### After (UTC-based)

```ics
BEGIN:VCALENDAR
VERSION:2.0
                             ← No hardcoded timezone
BEGIN:VEVENT
DTSTART:20251125T123000Z     ← UTC time (Z suffix)
DTEND:20251125T143000Z       ← Unambiguous!
END:VEVENT
END:VCALENDAR
```

**Benefit:** All calendar apps interpret correctly!

---

## Supported Timezones

All IANA timezone identifiers are supported:

### Americas
- America/New_York (EST/EDT)
- America/Chicago (CST/CDT)
- America/Los_Angeles (PST/PDT)
- America/Toronto
- America/Vancouver
- etc.

### Europe
- Europe/London (GMT/BST)
- Europe/Paris (CET/CEST)
- Europe/Berlin
- Europe/Amsterdam
- etc.

### Asia
- Asia/Kolkata (IST) ← Default
- Asia/Tokyo (JST)
- Asia/Shanghai (CST)
- Asia/Singapore
- Asia/Dubai
- etc.

### Pacific
- Pacific/Auckland (NZST/NZDT)
- Australia/Sydney (AEDT/AEST)
- etc.

**Full list:** 400+ timezones supported!

---

## Testing

### Test 1: Verify Timezone Detection

```javascript
// Browser console:
Intl.DateTimeFormat().resolvedOptions().timeZone
// Should show your timezone, e.g., "America/New_York"
```

### Test 2: Simulate Different Timezone

You can't easily change browser timezone, but you can test the API:

```bash
# Test New York timezone
curl "http://localhost:3006/api/calendar?tz=America/New_York" > ny.ics

# Test London timezone
curl "http://localhost:3006/api/calendar?tz=Europe/London" > london.ics

# Compare the DTSTART times - they should be different!
```

### Test 3: Verify Conversion

**Event:** Sangeet at 6:00 PM IST on Nov 25, 2025

**Expected conversions:**

| Timezone | Local Time | UTC Time in .ics |
|----------|------------|------------------|
| Asia/Kolkata (IST) | 6:00 PM | 20251125T123000Z |
| America/New_York (EST) | 7:30 AM | 20251125T123000Z |
| Europe/London (GMT) | 12:30 PM | 20251125T123000Z |
| America/Los_Angeles (PST) | 4:30 AM | 20251125T123000Z |

**Note:** UTC time is the same in all files! The calendar app does the final conversion.

### Test 4: Import to Calendar

1. Download .ics file with your timezone
2. Import to Google Calendar / Apple Calendar / Outlook
3. Verify event shows in **your local time**, not IST

---

## Edge Cases

### 1. Daylight Saving Time (DST)

The calendar app handles DST automatically:

**Example:** Event on Nov 25, 2025 at 6:00 PM IST
- New York is in **EST** (standard time) in November
- If event was in summer, New York would be in **EDT** (daylight time)
- Calendar app adjusts automatically!

### 2. Invalid Timezone

If timezone detection fails:
```typescript
try {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
} catch (e) {
  return 'Asia/Kolkata'; // Safe fallback to IST
}
```

### 3. No Timezone Parameter

If API called without `?tz=` parameter:
```typescript
const timezone = searchParams.get('tz') || 'Asia/Kolkata';
// Defaults to IST
```

### 4. Browser Doesn't Support Intl API

Very old browsers (IE 10 and below):
```typescript
if (typeof Intl === 'undefined') {
  return 'Asia/Kolkata';
}
```

---

## Benefits

### ✅ For Guests

1. **No Manual Conversion** - Calendar shows correct local time
2. **Avoid Confusion** - No need to remember "IST = UTC+5:30"
3. **No Mistakes** - Can't get the time wrong
4. **Better Experience** - Just works!

### ✅ For You

1. **Global Reach** - Guests from any timezone can attend
2. **Professional** - Shows attention to detail
3. **Reduced Support** - No "What time is this in EST?" questions
4. **Automatic** - Zero maintenance required

---

## Comparison

### Other Wedding Sites

**Typical approach:**
```
Event: 6:00 PM IST
Note: "Please convert to your local timezone"
```

❌ Guest has to:
1. Google "IST to EST converter"
2. Calculate manually
3. Hope they got it right

### Your Site (NOW!)

**Smart approach:**
```
Event: 6:00 PM IST
[Add to Calendar] → Automatically shows in user's timezone!
```

✅ Guest just:
1. Clicks button
2. Done!

---

## Troubleshooting

### "Calendar shows wrong time"

**Check:**
1. What timezone is your device set to?
2. Is the device timezone correct?
3. Check the .ics file DTSTART - should have 'Z' suffix

**Debug:**
```javascript
// Console:
console.log('Device timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
```

### "All events show same time"

**Possible cause:** Timezone detection failed

**Fix:** Check browser console for errors

### "Modal doesn't show timezone"

**Expected:** Only shows if timezone is different from IST

```tsx
{deviceInfo.timezone !== 'Asia/Kolkata' && (
  <span>({deviceInfo.timezone})</span>
)}
```

---

## Future Enhancements

### Potential Improvements

1. **Timezone Selector**
   ```tsx
   <select onChange={e => setTimezone(e.target.value)}>
     <option value="auto">Auto-detect</option>
     <option value="America/New_York">New York (EST)</option>
     <option value="Europe/London">London (GMT)</option>
   </select>
   ```

2. **Show Both Times**
   ```
   Sangeet: 6:00 PM IST (7:30 AM EST)
   ```

3. **Timezone Warning**
   ```
   ⚠️ You're viewing times in your local timezone (EST)
   Original times are in IST
   ```

4. **Multi-Timezone Display**
   ```
   IST: 6:00 PM | EST: 7:30 AM | GMT: 12:30 PM
   ```

---

## Summary

🎉 **Your calendar feature now supports automatic timezone conversion!**

✅ **Auto-detects** user's timezone  
✅ **Converts IST** to user's local time  
✅ **Shows correctly** in all calendar apps  
✅ **Zero configuration** needed  
✅ **Works worldwide** with 400+ timezones  
✅ **Handles DST** automatically  

**Guests in ANY timezone can now add events with correct local times!** 🌍✨

---

## Files Modified

1. ✅ `lib/device-detection.ts` - Added timezone detection
2. ✅ `lib/calendar.ts` - UTC conversion logic
3. ✅ `api/calendar/route.ts` - Query parameter support
4. ✅ `components/AddToCalendar.tsx` - Pass timezone, show indicator
5. ✅ `components/CalendarButton.tsx` - Pass timezone

**No breaking changes!** Backward compatible with existing code. 🚀

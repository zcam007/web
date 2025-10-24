# 🌏 Timezone Fix - Date Display Issue

## Problem Solved

**Issue:** Date showing 1 day before in previews and website

**Example:**
```
Admin sets: 2025-11-24
Preview showed: Monday, 23rd Nov  ❌ (Wrong!)
Should show: Monday, 24th Nov     ✅ (Correct!)
```

**Root Cause:** JavaScript `new Date("2025-11-24")` interprets the date as UTC midnight, which in some timezones appears as the previous day.

---

## Solution

### Local Timezone Parsing

**Before (Wrong):**
```typescript
const date = new Date("2025-11-24");
// JavaScript interprets as: 2025-11-24T00:00:00Z (UTC midnight)
// In IST (UTC+5:30), this is: 2025-11-24 05:30 AM
// But in some browsers/timezones, shows as Nov 23!
```

**After (Correct):**
```typescript
const [year, month, day] = "2025-11-24".split('-').map(Number);
const date = new Date(year, month - 1, day);
// Creates: 2025-11-24T00:00:00 in LOCAL timezone
// Always shows as Nov 24, regardless of user's timezone!
```

---

## What Changed

### 1. Date Formatting Utilities

**File:** `lib/date-utils.ts`

All date parsing functions now use local timezone:

```typescript
// formatEventDate()
// formatEventDateWithYear()
// formatDateRange()
// parseDate()

// All now parse like this:
const [year, month, day] = dateStr.split('-').map(Number);
const date = new Date(year, month - 1, day);
// ✅ No timezone interpretation!
```

### 2. Admin Panel Preview

**File:** `admin/page.tsx`

Date preview now uses local parsing:

```typescript
const [year, month, day] = it.date.split('-').map(Number);
const date = new Date(year, month - 1, day);
// ✅ Shows correct date in preview
```

### 3. Website Display

**File:** `sections/Events.tsx`

Reception date now uses local parsing:

```typescript
const [year, month, day] = receptionEvent.date.split('-').map(Number);
const date = new Date(year, month - 1, day);
// ✅ Shows correct date on website
```

---

## Timezone Handling Strategy

### 🌐 Website: IST (No Conversion)

**All times displayed in IST:**

```
Website shows:
  Monday, 24th Nov 6:00 PM
  ↑                    ↑
  Local date parsing   IST time (no conversion)
```

**Why?**
- Event is in India
- Organizers set times in IST
- Website visitors see IST times
- Clear and consistent

---

### 📅 Calendar: UTC (With Conversion)

**Calendar events converted to UTC:**

```
Calendar stores:
  DTSTART:20251124T123000Z
  ↑                       ↑
  UTC date                Z = UTC time
```

**Why?**
- International standard
- Calendar apps know user's timezone
- Automatic conversion to local time
- Works globally

---

## Example Flow

### Admin Sets Event

```
1. Admin panel:
   Date: 2025-11-24
   Time: 18:00 (6 PM)
   
2. Preview shows:
   ✅ Monday, 24th Nov 6:00 PM (IST)
   
3. Website shows:
   ✅ Monday, 24th Nov 6:00 PM
```

### Guest Views Calendar

```
1. Website: Monday, 24th Nov 6:00 PM (IST)
   ↓
2. Add to calendar
   ↓
3. Calendar file contains:
   DTSTART:20251124T123000Z (UTC)
   ↓
4. Guest in New York sees:
   Monday, 24th Nov 7:30 AM EST
   ↓
5. Guest in India sees:
   Monday, 24th Nov 6:00 PM IST
```

**Both are CORRECT for their timezone!** ✨

---

## Testing

### Test Date Display

**Admin Panel:**
```
1. Set date: 2025-11-24
2. Preview should show: ✅ Monday, 24th Nov
3. NOT: ❌ Sunday, 23rd Nov
```

**Website:**
```
1. Check Events section
2. Date should show: 24th Nov (correct)
3. NOT: 23rd Nov (wrong)
```

### Test Time Display

**Admin Panel:**
```
1. Set time: 18:00
2. Preview should show: ✅ 6:00 PM
3. Full preview: Monday, 24th Nov 6:00 PM
```

**Website:**
```
1. Event time: Monday, 24th Nov 6:00 PM
2. This is IST (no conversion)
3. Exactly as set in admin
```

### Test Calendar Conversion

**Calendar File:**
```bash
curl http://localhost:3006/api/calendar > test.ics

# Check DTSTART (should be UTC):
grep "DTSTART:" test.ics
# Should show: DTSTART:20251124T123000Z
#                                    ^ Z = UTC
```

**In Calendar App:**
```
1. Import test.ics to calendar
2. Check event time
3. Should show in YOUR local timezone
4. Example (if in EST): 7:30 AM EST (converted from 6 PM IST)
```

---

## Key Points

### ✅ Website Display

- **Shows IST times always**
- No timezone conversion
- What you set is what shows
- Example: "6:00 PM" means 6:00 PM IST

### ✅ Calendar Storage

- **Stores UTC times**
- Converts IST → UTC
- Example: 6:00 PM IST → 12:30 PM UTC

### ✅ Calendar Display

- **Shows user's local timezone**
- Converts UTC → Local
- Example: 12:30 PM UTC → 7:30 AM EST (for New York user)

---

## Why This Approach?

### Option 1: Show IST Everywhere (Bad)

```
Website: 6:00 PM IST ✅
Calendar: 6:00 PM IST ❌

Problem: User in New York adds to calendar
         Calendar shows 6:00 PM EST (wrong!)
         Actually needs to wake up at 7:30 AM EST
```

### Option 2: Convert Everything (Confusing)

```
Website: 7:30 AM EST ❌
Calendar: 7:30 AM EST ✅

Problem: Website shows different time for different users
         Confusing for Indian users
         "Wait, the event is at 7:30 AM or 6:00 PM?!"
```

### Option 3: IST on Website, UTC in Calendar (Perfect!) ✨

```
Website: 6:00 PM IST ✅
Calendar: 12:30 PM UTC ✅
         ↓
User in India sees: 6:00 PM IST ✅
User in New York sees: 7:30 AM EST ✅

Benefit: Clear for everyone!
         Website is consistent (IST)
         Calendar apps do the conversion
```

---

## Admin Panel Notes

**Preview now shows:**

```
👀 Preview on Website (IST):
Monday, 24th Nov 6:00 PM

Note: Calendar apps will show in user's local timezone
```

**This clarifies:**
- Website shows IST
- Calendar converts automatically
- No confusion!

---

## Files Modified

```
✅ lib/date-utils.ts
   - formatEventDate() - local timezone parsing
   - formatEventDateWithYear() - local timezone parsing
   - formatDateRange() - local timezone parsing
   - parseDate() - local timezone parsing

✅ admin/page.tsx
   - Date preview - local timezone parsing
   - Full event preview - local timezone parsing
   - Added "(IST)" label
   - Added timezone conversion note

✅ sections/Events.tsx
   - Reception date - local timezone parsing

✅ lib/calendar.ts
   - Updated comments to clarify IST → UTC conversion
```

---

## Summary

🎯 **Problem:** Date showing 1 day before

✅ **Solution:** Parse dates in local timezone (no UTC interpretation)

🌐 **Website:** Shows IST times (what you set)

📅 **Calendar:** Stores UTC, displays user's local timezone

🎉 **Result:** Correct dates everywhere!

---

*Fixed by rolo - no more off-by-one date errors! 📅✨*

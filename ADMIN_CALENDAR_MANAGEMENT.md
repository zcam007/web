# 🛠️ Admin Panel Calendar Management

## Overview

You can now manage all calendar events directly from the admin panel! 🎉

### New Features

1. **Edit Event Details** - Update time, date, place, description
2. **Add Live Stream Links** - YouTube, Zoom, or any streaming platform
3. **Visual Admin UI** - Beautiful, intuitive event editor
4. **Auto-Sync** - Changes instantly update calendar feeds
5. **Test Links** - Verify live stream URLs before publishing

---

## 🎯 What You Can Edit

### Event Fields

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| **Event Name** | Text | "Sangeet Night" | Required - shown on calendar |
| **Date** | Date Picker | "2025-11-25" | Used for calendar sync |
| **Time** | Text | "6:00 PM - 8:00 PM" | Display format (IST) |
| **Venue/Place** | Text | "SRINIDHI Resort" | Event location |
| **Description** | Textarea | "Traditional music..." | Event details |
| **Live Stream URL** | URL | "https://youtube.com/..." | Optional live stream link |
| **Event Image** | Image Picker | With focus point | Optional visual |

---

## 📹 Live Stream Feature

### What It Does

When you add a live stream URL to an event:

1. **Website Shows "Watch Live" Button**
   - Appears on the event card
   - Beautiful gradient button (red/pink)
   - Opens in new tab when clicked

2. **Calendar Includes Link**
   - Added to event description
   - Format: "📹 Watch Live: [URL]"
   - Visible in all calendar apps

3. **Test Before Publishing**
   - Click the test link in admin panel
   - Verify it works before saving

### Supported Platforms

✅ **YouTube Live**
```
https://youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
```

✅ **YouTube Embedded**
```
https://youtube.com/embed/VIDEO_ID
```

✅ **Zoom**
```
https://zoom.us/j/MEETING_ID
```

✅ **Google Meet**
```
https://meet.google.com/xxx-xxxx-xxx
```

✅ **Facebook Live**
```
https://facebook.com/username/videos/...
```

✅ **Any URL**
```
Any valid URL works - Twitch, Vimeo, custom streams, etc.
```

---

## 💻 How to Use Admin Panel

### Step 1: Access Admin Panel

```
URL: https://your-domain.com/admin
```

### Step 2: Find Events Section

Scroll to the **"Events"** section

### Step 3: Edit Event

#### Event Name
```
✏️ Edit: "Sangeet Night"
```
- This appears on website and calendar
- Automatically prefixed with "Chandu & Mouni - "

#### Date (Calendar Sync)
```
📅 Select: 2025-11-25
```
- Used for calendar auto-conversion
- Helps timezone calculations

#### Time (Display)
```
🕒 Edit: "6:00 PM - 8:00 PM"
```
- Shown on website (IST)
- Converted to user's timezone in calendar

#### Venue/Place
```
📍 Edit: "SRINIDHI Joy 'n' Joy Clubs & Resorts, Ghatkesar"
```
- Shows where event happens
- Added to calendar location field

#### Description
```
📝 Edit: "Join us for a night of music, dance, and celebration!

Dress Code: Traditional Indian Attire
Dinner will be served."
```
- Event details and notes
- Supports multiple lines

#### Live Stream URL
```
📹 Add: https://youtube.com/watch?v=abc123
```
- Optional streaming link
- Test link appears below input
- Click to verify it works

### Step 4: Save

Changes save automatically! ✨

---

## 🎨 Admin UI Features

### Visual Design

```
┌───────────────────────────────────────────────┐
│ 📅 Event 1 - Sangeet Night          🗑️ Delete │
├───────────────────────────────────────────────┤
│                                               │
│ Event Name *                                  │
│ [Sangeet Night_________________________]      │
│                                               │
│ Date              Time *                      │
│ [2025-11-25]      [6:00 PM - 8:00 PM____]     │
│                                               │
│ Venue/Place                                   │
│ [SRINIDHI Resort_______________________]      │
│                                               │
│ Description                                   │
│ [_______________________________________]      │
│ [_______________________________________]      │
│                                               │
│ 📹 Live Stream URL (Optional)              │
│ [https://youtube.com/watch?v=abc123___]       │
│ 💡 Add YouTube, Zoom, or any live stream     │
│ 🔗 Test link: youtube.com/watch?v=abc123     │
│                                               │
│ Event Image (with Focus Point)                │
│ [Choose Image]                                │
│                                               │
└───────────────────────────────────────────────┘

[➕ Add New Event]

📝 Note: Changes are saved automatically.
Calendar events will update for all subscribers.
```

### Color Coding

- **Event Cards**: Purple-pink gradient background
- **Live Stream Section**: Blue background (stands out)
- **Required Fields**: Marked with `*`
- **Delete Button**: Red for caution
- **Add Button**: Green/purple gradient

### Helper Text

- **Date Field**: "Used for calendar sync"
- **Time Field**: "Display format (IST)"
- **Live Stream**: "💡 Add YouTube, Zoom, or any live stream link"
- **Test Link**: Shows clickable URL to verify

---

## 🌐 How It Appears on Website

### Without Live Stream

```
┌──────────────────────────────┐
│    Sangeet Night             │
│                              │
│ 🕒 6:00 PM - 8:00 PM         │
│ 📍 SRINIDHI Resort           │
│                              │
│ Traditional music and dance  │
└──────────────────────────────┘
```

### With Live Stream

```
┌──────────────────────────────┐
│    Sangeet Night             │
│                              │
│ 🕒 6:00 PM - 8:00 PM         │
│ 📍 SRINIDHI Resort           │
│                              │
│ Traditional music and dance  │
│                              │
│  [📹 Watch Live]  ← NEW!   │
└──────────────────────────────┘
```

Beautiful gradient button (red → pink) appears!

---

## 📅 Calendar Integration

### In Calendar Apps

**Without Live Stream:**
```
Chandu & Mouni - Sangeet Night
Nov 25, 2025 at 6:00 PM (EST)

Location: SRINIDHI Resort

Traditional music and dance celebration!
```

**With Live Stream:**
```
Chandu & Mouni - Sangeet Night
Nov 25, 2025 at 6:00 PM (EST)

Location: SRINIDHI Resort

Traditional music and dance celebration!

📹 Watch Live: https://youtube.com/watch?v=abc123
```

Live stream link is clickable in most calendar apps!

---

## 🔄 Auto-Update Flow

### How Changes Propagate

```
1. You edit event in admin panel
   ↓
2. Click save (auto-saves)
   ↓
3. Config file updates (data/site.json)
   ↓
4. Website immediately reflects changes
   ↓
5. Calendar API serves fresh data
   ↓
6. Desktop subscribers get updates (auto)
   ↓
7. Mobile users can re-download for updates
```

### Desktop Calendar Subscribers

**Behavior:**
- Calendar app periodically checks for updates
- Typically every 1-24 hours (depends on app)
- Changes appear automatically
- No user action needed!

### Mobile Calendar Users

**Behavior:**
- Calendar apps don't auto-update .ics imports
- User must re-download to see changes
- Floating calendar button makes this easy

**Tell Guests:**
```
"If event details change, please re-add the calendar 
from our website to see the latest updates."
```

---

## 🎬 Live Stream Use Cases

### Scenario 1: Hybrid Wedding

**Problem:** Some guests can't attend in person

**Solution:**
1. Set up YouTube Live for wedding ceremony
2. Add live stream URL to "Wedding" event
3. Guests see "Watch Live" button
4. Can watch remotely!

### Scenario 2: Pre-Wedding Livestream

**Problem:** Want to stream Sangeet for distant relatives

**Solution:**
1. Create Zoom meeting or YouTube Live
2. Add URL to Sangeet event
3. Share link through website + calendar
4. Everyone can join!

### Scenario 3: Reception Toast

**Problem:** Want to share speeches live

**Solution:**
1. Set up Facebook Live or Instagram Live
2. Add URL to Reception event
3. Guests get notified via calendar
4. Can tune in for toast!

---

## ✅ Best Practices

### 📅 Date Field

**Why it matters:**
- Used for timezone conversion
- Calendar apps need proper date
- Helps sort events chronologically

**Format:** `YYYY-MM-DD`
- ✅ Good: `2025-11-25`
- ❌ Bad: `Nov 25` or `25/11/2025`

### 🕒 Time Field

**Why it matters:**
- Displayed on website (IST)
- Parsed for calendar conversion
- Shown in user's local timezone

**Format Examples:**
- ✅ `6:00 PM - 8:00 PM`
- ✅ `9:00 AM - 11:00 AM`
- ✅ `6:00 PM onwards`
- ✅ `7:30 PM`
- ❌ `6pm-8pm` (no space before AM/PM)
- ❌ `18:00` (use 12-hour format with AM/PM)

### 📹 Live Stream URL

**Testing:**
1. Add URL in admin panel
2. Click the "Test link" below input
3. Verify it opens correctly
4. Save when confirmed

**Privacy:**
- Use unlisted YouTube videos for privacy
- Zoom: Set waiting room for control
- Facebook: Adjust privacy settings

**Backup:**
- Have backup stream platform
- Test before event day
- Share link early to guests

### 📝 Description Field

**What to include:**
- Event highlights
- Dress code
- Special instructions
- Contact info
- Parking details

**Example:**
```
Join us for an evening of traditional music and dance!

Dress Code: Traditional Indian Attire
Dinner: 7:00 PM onwards
Parking: Available on-site

Contact: +91 1234567890
```

---

## 🛠️ Troubleshooting

### "Changes not showing on website"

**Fix:**
1. Hard refresh browser: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Check if save actually completed

### "Live stream button not appearing"

**Check:**
1. Is `liveStreamUrl` field filled?
2. Is URL valid (starts with http:// or https://)?
3. Did you save changes?
4. Refresh website

### "Test link doesn't work"

**Verify:**
1. URL is correct (copy-paste from browser)
2. Video/meeting is public or has correct permissions
3. URL is complete (including https://)

### "Calendar not updating"

**Desktop:**
- Wait 1-24 hours for auto-refresh
- Or manually refresh calendar feed

**Mobile:**
- Re-download .ics file from website
- Delete old events first (optional)
- Add new calendar

---

## 📊 Example Event Configuration

### Complete Event Setup

```json
{
  "name": "Sangeet Night",
  "date": "2025-11-25",
  "time": "6:00 PM - 10:00 PM",
  "place": "SRINIDHI Joy 'n' Joy Clubs & Resorts, Ghatkesar",
  "description": "An evening of music, dance, and celebration!\n\nDress Code: Traditional Indian Attire\nDinner: 7:00 PM onwards\n\nContact: +91 1234567890",
  "liveStreamUrl": "https://youtube.com/watch?v=abc123xyz",
  "image": {
    "url": "/uploads/sangeet.jpg",
    "focusX": 50,
    "focusY": 40,
    "zoom": 1.2
  }
}
```

### Minimal Event Setup

```json
{
  "name": "Haldi Ceremony",
  "time": "10:00 AM - 12:00 PM",
  "description": "Traditional Haldi ceremony"
}
```

Just name, time, and description is enough!

---

## 📝 Summary

Your admin panel now has a **professional event management system**:

✅ **Edit all event details** (name, date, time, place, description)  
✅ **Add live stream links** (YouTube, Zoom, any platform)  
✅ **Beautiful visual UI** (gradients, icons, helper text)  
✅ **Test links inline** (verify before publishing)  
✅ **Auto-sync** (changes update website + calendar instantly)  
✅ **Mobile-friendly** (responsive admin interface)  
✅ **Calendar integration** (links appear in .ics files)  
✅ **WCAG accessible** (proper labels, focus states)  

Manage everything in one place! 🎊

---

## Files Modified

1. ✅ `app/(site)/admin/page.tsx` - Enhanced EventRepeater component
2. ✅ `app/(site)/sections/Events.tsx` - Added "Watch Live" buttons
3. ✅ `app/(site)/lib/calendar.ts` - Include live stream in .ics description

**No breaking changes!** Fully backward compatible. 🚀

---

*Built with 💕 and admin panel magic by rolo*  
*Now you control everything! 🎉✨*

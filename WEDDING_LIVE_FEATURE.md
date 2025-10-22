# Wedding Live Stream Feature 🎬

A beautiful, accessible wedding live streaming section for your wedding website!

## Features

### Two Display Modes

#### 1. **Links Mode** (Multiple Platforms)
Display multiple streaming platform links with beautiful gradient cards:
- YouTube Live
- Facebook Live
- Instagram Live
- Any custom streaming platform

Each link card shows:
- Platform name/label
- Custom emoji icon
- Hover effects with "Click to watch" prompt
- Gradient border animations

#### 2. **Iframe Mode** (Embedded Stream)
Embed a single stream directly on your page:
- Responsive 16:9 aspect ratio
- Works with YouTube, Facebook, and most streaming platforms
- Full-screen support
- Auto-responsive on all devices

## How to Use

### Adding the Section (Admin Panel)

1. **Login to Admin Panel** at `/admin`
2. Scroll to the **Sections** area
3. Click **"+ Add New Section"**
4. Select **"+ Wedding Live Stream 🎬"**
5. A new Wedding Live section will appear!

### Configuring the Section

#### Basic Settings
- **Section Heading**: Default is "Watch Live" - customize it!
- **Description**: Optional text to show below the heading
- **Display Mode**: Choose between:
  - `Multiple Links` - Show cards for multiple platforms
  - `Single Embedded Stream` - Embed one stream via iframe

#### Links Mode Configuration

1. Select **"Multiple Links"** from Display Mode
2. Click **"+ Add Live Stream Link"**
3. For each link, provide:
   - **Platform**: e.g., "YouTube Live", "Facebook", "Instagram"
   - **Full URL**: The complete link to your stream (e.g., `https://youtube.com/watch?v=...`)
   - **Icon**: An emoji to display (e.g., 🎥, 📹, 🎬, ▶️)
4. Add as many links as you want!
5. Delete unwanted links using the **Delete** button

**Example Links:**
```
Platform: YouTube Live
URL: https://youtube.com/watch?v=YOUR_VIDEO_ID
Icon: 🎥

Platform: Facebook Live
URL: https://facebook.com/your_page/videos/YOUR_VIDEO_ID
Icon: 📘

Platform: Instagram Live
URL: https://instagram.com/your_username/live
Icon: 📸
```

#### Iframe Mode Configuration

1. Select **"Single Embedded Stream"** from Display Mode
2. Enter your **Iframe Embed URL** in the input field
3. The stream will be embedded directly on the page!

**🎉 SMART URL CONVERSION - Just Paste ANY YouTube URL!**

No need to find the embed URL manually! The admin panel automatically converts:
- `https://youtube.com/watch?v=VIDEO_ID` → `https://youtube.com/embed/VIDEO_ID`
- `https://youtu.be/VIDEO_ID` → `https://youtube.com/embed/VIDEO_ID`
- `https://youtube.com/live/VIDEO_ID` → `https://youtube.com/embed/VIDEO_ID`
- Facebook video URLs → Proper embed format

**Just paste the regular URL and we handle the rest!** ✨

**Manual Embed URLs (if needed):**

**YouTube:**
- Format: `https://www.youtube.com/embed/VIDEO_ID`
- Or just paste any YouTube URL - auto-conversion handles it!

**Facebook:**
- Format: `https://www.facebook.com/plugins/video.php?href=YOUR_VIDEO_URL`
- Or paste your Facebook video URL directly

**Other Platforms:**
- Most streaming platforms provide embed codes
- Look for `<iframe src="...">` and copy the `src` URL

### Section Visibility

Control when the section appears:
- Click **"👁️ Visible"** to show the section on your website
- Click **"🚫 Hidden"** to hide it (useful before the wedding or after streaming ends)

### Reordering Sections

- Drag the **☰** handle to reorder the Wedding Live section
- Position it wherever makes sense (typically after Events or before Gallery)

## Accessibility (WCAG 2.2 Level AA)

This feature is fully accessible and follows best practices:

✅ **Keyboard Navigation**: All buttons and links are keyboard accessible  
✅ **Touch-Friendly**: Minimum 44px touch targets for mobile devices  
✅ **Color Contrast**: Text meets WCAG AA contrast requirements  
✅ **Semantic HTML**: Proper heading hierarchy and landmarks  
✅ **Screen Readers**: Descriptive labels and ARIA attributes  
✅ **Responsive Design**: Works on mobile, tablet, and desktop  

## Tips & Best Practices

### Before the Wedding
- Keep the section **Hidden** until you're ready to go live
- Test your streaming setup in advance
- Add a description like "Live stream starts at 3:00 PM EST"

### During the Wedding
- Make the section **Visible**
- Update the heading to "🔴 We're Live!" for excitement
- Consider using Links Mode if streaming to multiple platforms

### After the Wedding
- Either **Hide** the section or update it:
  - Change heading to "Watch the Recording"
  - Update links to recorded versions
  - Switch to Iframe Mode to embed the full recording

### Platform Recommendations

**YouTube** 🎥
- Best for: HD quality, easy embedding, reliable
- Setup: YouTube Studio → Go Live
- Embed URL: `https://www.youtube.com/embed/VIDEO_ID`

**Facebook Live** 📘
- Best for: Reaching Facebook friends/family
- Setup: Facebook Page → Live Video
- Can be embedded or linked

**Instagram Live** 📸
- Best for: Mobile-first audience
- Note: Instagram doesn't support embedding, use Links Mode

**Zoom/Meet** 💼
- Best for: Small, private ceremonies
- Share meeting links directly (password protect!)

## Technical Details

### Component Location
```
app/(site)/sections/WeddingLive.tsx
```

### Data Structure
```json
{
  "type": "wedding-live",
  "heading": "Watch Live",
  "description": "Join us virtually as we celebrate!",
  "mode": "links",
  "links": [
    {
      "label": "YouTube Live",
      "url": "https://youtube.com/watch?v=...",
      "icon": "🎥"
    }
  ],
  "iframeUrl": "https://www.youtube.com/embed/VIDEO_ID",
  "visible": true
}
```

### Supported in Admin Panel
Yes! Full CRUD support in `/admin`

---

## Troubleshooting

### "Refused to display in a frame" Error

❌ **Problem:** You see an error like "Refused to display https://www.youtube.com/ in a frame because it set X-Frame-Options to sameorigin"

✅ **Solution:** You're using a regular YouTube URL instead of an embed URL. The admin panel should auto-convert it, but if not:
- Make sure you paste the URL and click outside the input field (triggers conversion)
- The URL should change from `youtube.com/watch?v=...` to `youtube.com/embed/...`
- If it doesn't auto-convert, manually change `/watch?v=` to `/embed/`

### Other Common Issues

**Iframe not showing:**
1. Verify the URL starts with `https://`
2. Check that the streaming platform allows embedding
3. Test the embed URL directly in your browser
4. Make sure the section is set to **Visible**

**Links not working:**
1. Ensure URLs are complete (include `https://`)
2. Test the link by clicking it
3. Verify the streaming platform is live

**Mobile issues:**
- Some platforms restrict mobile embedding
- Use Links Mode as a fallback for mobile users
- Test on multiple devices before the big day

Happy streaming! 🎉💕

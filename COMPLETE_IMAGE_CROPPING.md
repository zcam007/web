# 🎯 Complete Image Cropping & Focus Point Control

## Every Photo, Perfect Cropping! 📸

### What's New:
You can now control the crop/focus point for **EVERY single image** across your entire wedding website!

---

## Supported Sections

### ✅ 1. Hero Images (Carousel)
**What:** Main slideshow images on homepage  
**Control:** Horizontal + Vertical focus points  
**Special Feature:** Smart text positioning (avoids faces)

**How to Edit:**
1. Go to `/admin` → Hero section
2. Drag ☰ handle to reorder images
3. Adjust sliders for each image:
   - ↔️ Horizontal: Mark where faces/subjects are (left to right)
   - ↕️ Vertical: Mark where faces/subjects are (top to bottom)
4. Watch real-time preview
5. Auto-saves! ✨

**Best For:**
- Marking where faces are so text doesn't cover them
- Ensuring important subjects stay visible
- Creating balanced compositions

---

### ✅ 2. Gallery Images
**What:** Photo gallery/album section  
**Control:** Horizontal + Vertical focus points  

**How to Edit:**
1. Go to `/admin` → Gallery section
2. Hover over any image thumbnail
3. Click the 🎯 target icon
4. Adjust sliders in popup:
   - ↔️ Horizontal (0-100%)
   - ↕️ Vertical (0-100%)
5. Click "Done"

**Best For:**
- Masonry layout cropping
- Keeping faces in view
- Portrait vs landscape optimization

---

### ✅ 3. Couple Section Image
**What:** Main couple photo  
**Control:** Horizontal + Vertical focus points  

**How to Edit:**
1. Go to `/admin` → Couple section
2. Hover over couple image
3. Click 🎯 icon
4. Adjust focus sliders
5. Click "Done"

**Best For:**
- Ensuring both people's faces are visible
- Perfect cropping for different screen sizes
- Professional portrait framing

---

### ✅ 4. Event Images
**What:** Photos for each wedding event (ceremony, reception, etc.)  
**Control:** Horizontal + Vertical focus points  

**How to Edit:**
1. Go to `/admin` → Events section
2. For each event, find "Event Image (with Focus Point)"
3. Hover over image → Click 🎯
4. Adjust sliders
5. Click "Done"

**Best For:**
- Event card thumbnails
- Maintaining subject visibility
- Consistent cropping across events

---

### ✅ 5. Invitation Section Background
**What:** Full-screen background image for invitation  
**Control:** Horizontal + Vertical focus points  

**How to Edit:**
1. Go to `/admin` → Invitation section
2. Find "Background Image (with Focus Point)"
3. Hover over image → Click 🎯
4. Adjust focus point
5. Click "Done"

**Best For:**
- Full-screen backgrounds
- Ensuring key elements stay visible
- Mobile vs desktop optimization

---

### ✅ 6. Invitation Hero Images (Bride & Groom)
**What:** Circular portrait photos  
**Control:** Horizontal + Vertical focus points  

**How to Edit:**
1. Go to `/admin` → Invitation Hero section
2. Find "Bride Image (Circular - with Focus Point)"
3. Find "Groom Image (Circular - with Focus Point)"
4. Hover → Click 🎯 for each
5. Adjust to center faces
6. Click "Done"

**Best For:**
- Circular crops
- Centering faces perfectly
- Professional portrait framing

---

## How It Works

### Focus Point Concept:

Imagine a red dot on your photo. That's your **focus point**.

```
┌─────────────────────┐
│                     │
│         •           │ ← Red dot = Focus Point
│                     │
│                     │
└─────────────────────┘
```

When the image is cropped (different screen sizes, aspect ratios), the browser tries to **keep that dot visible**.

### The Sliders:

**Horizontal Slider (↔️):**
- **0%**: Far left edge
- **50%**: Center
- **100%**: Far right edge

**Vertical Slider (↕️):**
- **0%**: Top edge
- **50%**: Middle
- **100%**: Bottom edge

### Example:

**Portrait with face in upper-right:**
```
Original Image:
┌─────────────────────┐
│            👤       │ ← Face here (70% right, 30% down)
│                     │
│                     │
│                     │
└─────────────────────┘

Set focus to: { focusX: 70, focusY: 30 }

When cropped for mobile:
┌──────────┐
│      👤  │ ← Face still visible!
│          │
│          │
└──────────┘
```

---

## Visual Indicators

### 🔴 Red Focus Dot:
- Shows exactly where your focus point is
- Moves in real-time as you adjust sliders
- The image will try to keep this point visible when cropped

### Preview Thumbnail:
- Shows how the image will be cropped
- Updates live as you adjust
- Gives you confidence before saving

---

## Technical Details

### Data Structure

**Old Format (Still Supported!):**
```json
{
  "image": "/uploads/photo.jpg"
}
```

**New Format (With Focus):**
```json
{
  "image": {
    "url": "/uploads/photo.jpg",
    "focusX": 70,
    "focusY": 30
  }
}
```

**Automatic Migration:**
- Old string URLs → Auto-converted to `{ url, focusX: 50, focusY: 50 }`
- No data loss
- Gradual migration
- Backward compatible ✅

### CSS Implementation:

```tsx
<img 
  src={image.url}
  style={{ 
    objectFit: 'cover',
    objectPosition: `${image.focusX}% ${image.focusY}%`
  }}
/>
```

For backgrounds:
```tsx
<div style={{
  backgroundImage: `url(${image.url})`,
  backgroundPosition: `${image.focusX}% ${image.focusY}%`,
  backgroundSize: 'cover'
}} />
```

---

## Best Practices

### 1. **For Portraits:**
- Focus on the eyes/face
- Typical range: `focusX: 40-60, focusY: 25-40` (upper center)
- Ensures faces stay visible on all devices

### 2. **For Landscapes:**
- Focus on the main subject/feature
- Consider composition rule of thirds
- Adjust based on where action is

### 3. **For Circular Images:**
- Center the face perfectly
- Use `focusX: 50, focusY: 40` (slightly above center) for best results
- Test with different zoom levels

### 4. **For Background Images:**
- Consider where text will overlay
- Avoid focusing on busy areas if text goes there
- Test mobile vs desktop views

### 5. **For Event Cards:**
- Keep subjects recognizable
- Avoid extreme crop edges (use 20-80% range)
- Maintain visual consistency across events

---

## Common Use Cases

### Use Case 1: Group Photo with Faces on Right
**Problem:** Mobile crops cut off people on the right  
**Solution:** Set `focusX: 70` to keep right side visible

### Use Case 2: Portrait with Face at Top
**Problem:** Face gets cut off on short screens  
**Solution:** Set `focusY: 25` to prioritize top area

### Use Case 3: Landscape with Mountain on Left
**Problem:** Mountain hidden when cropped  
**Solution:** Set `focusX: 30` to keep left side

### Use Case 4: Circular Crop Cutting Off Face
**Problem:** Circle crops the forehead  
**Solution:** Set `focusY: 45` (slightly above center)

---

## Testing Your Focus Points

### Step-by-Step Test:

1. **Set Focus Point** in admin panel
2. **Save Changes** (auto-saves)
3. **Visit Website** on different devices:
   - Desktop (wide)
   - Tablet (medium)
   - Mobile (narrow)
4. **Check if Subject Visible** in all views
5. **Adjust if Needed**

### Quick Test Checklist:

✅ Desktop view - subject visible?  
✅ Mobile view - subject visible?  
✅ Faces not cut off?  
✅ Important elements in frame?  
✅ Looks professional?  

---

## Accessibility (WCAG 2.2 AA)

✅ **Keyboard Navigation:**
- All sliders keyboard accessible
- Tab through controls
- Arrow keys adjust sliders

✅ **Screen Readers:**
- Descriptive labels
- Percentage values announced
- Clear feedback

✅ **Touch-Friendly:**
- Large touch targets (≥44px)
- Easy to tap buttons
- Mobile-optimized UI

✅ **Visual Feedback:**
- Real-time preview
- Red focus dot
- Hover states

---

## Troubleshooting

### Issue: Focus point editor won't open
**Solution:**
1. Make sure image is selected/uploaded first
2. Try refreshing the admin panel
3. Hover over image (🎯 icon should appear)

### Issue: Changes not showing on website
**Solution:**
1. Make sure you clicked "Done" in the popup
2. Refresh the main website (not just admin)
3. Clear browser cache
4. Check if section is set to "Visible"

### Issue: Image still crops weirdly
**Solution:**
1. Try more extreme values (e.g., 20% or 80%)
2. Check the original image dimensions
3. Consider using a different crop of the photo
4. Test on actual devices, not just browser resize

### Issue: Red dot not where I expect
**Solution:**
1. Sliders show percentage of image dimensions
2. 50% = center, not necessarily center of subject
3. Adjust based on where subject actually is in the photo

---

## Pro Tips 💡

### Tip 1: Use Real Devices for Testing
Browser resize ≠ actual mobile view. Test on:
- iPhone/Android phone
- iPad/Android tablet
- Desktop monitor

### Tip 2: Consistency is Key
Use similar focus points for similar photos:
- All portraits: `focusY: 30-35`
- All landscapes: `focusY: 45-55`
- Creates visual harmony

### Tip 3: Start with Center, Then Adjust
Default is `50, 50` (center). Start there, then:
- Adjust horizontal if subject is left/right
- Adjust vertical if subject is top/bottom

### Tip 4: Consider the Rule of Thirds
Professional photos often place subjects at:
- `focusX: 33` or `67` (1/3 or 2/3 across)
- `focusY: 33` or `67` (1/3 or 2/3 down)

### Tip 5: Test Edge Cases
- Very wide screens (ultrawide monitors)
- Very narrow screens (mobile portrait)
- Square crops (for social media embeds)

---

## Summary

### What You Can Do Now:

✅ Control **every image crop** on your entire website  
✅ Set **focus points** for perfect framing  
✅ Ensure **faces always visible** on all devices  
✅ Create **professional-looking** galleries  
✅ Optimize for **mobile, tablet, and desktop**  
✅ **Drag-and-drop** hero images to reorder  
✅ **Real-time preview** of changes  
✅ **Backward compatible** with existing images  

### Files Modified:

1. ✅ `app/(site)/admin/page.tsx`
   - Added `ImagePickerWithFocus` component
   - Updated all section editors
   - Enhanced `ImagePickerList` for gallery

2. ✅ `app/(site)/sections/Couple.tsx`
3. ✅ `app/(site)/sections/Events.tsx`
4. ✅ `app/(site)/sections/Invitation.tsx`
5. ✅ `app/(site)/sections/InvitationHero.tsx`
6. ✅ `app/(site)/sections/Gallery.tsx` (already done)

### Conforms to WCAG 2.2 Level AA! ✅

---

**Now every photo on your wedding website has perfect, professional cropping! 📸✨**

*Built with 🐶 by rolo, your code puppy!*

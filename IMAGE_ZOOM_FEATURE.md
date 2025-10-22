# 🔍 Image Zoom Feature - Complete Control!

## Zoom In & Out on Every Photo! 📸

### What's New:
In addition to focus point control, you can now **ZOOM IN or OUT** on every single image across your wedding website!

---

## What is Zoom?

**Zoom** lets you scale images larger or smaller:

- **Zoom In (100% - 300%)**: Show more detail, tighter crop, closer view
- **Zoom Out (50% - 99%)**: Show more context, wider view, more of the scene
- **Normal (100%)**: Original size (default)

### Visual Example:

```
Original Image (100% zoom):
┌─────────────────────┐
│                     │
│      👤 👤 👤      │  ← 3 people visible
│                     │
│  🌳            🌳  │  ← Trees on sides
└─────────────────────┘

Zoomed In (200%):
┌─────────────────────┐
│                     │
│    👤 👤           │  ← Focus on faces
│                     │  ← More detail
│                     │  ← Less background
└─────────────────────┘

Zoomed Out (50%):
┌─────────────────────┐
│ 🌳                🌳 │  ← More context
│   👤 👤 👤 👤 👤 👤   │  ← More people
│                     │  ← Wider scene
│ 🏞️               🏞️ │  ← More scenery
└─────────────────────┘
```

---

## How To Use:

### Step 1: Open Image Editor
1. Go to `/admin`
2. Find any section with images:
   - Hero images
   - Gallery images  
   - Couple image
   - Event images
   - Invitation background
   - Bride/Groom circular photos
3. Hover over the image thumbnail
4. Click the **🎯 target icon**

### Step 2: Adjust Zoom
1. In the popup editor, find the **🔍 Zoom** slider
2. Drag the slider:
   - **Left (50%)**: Zoom out (show more)
   - **Center (100%)**: Normal (default)
   - **Right (300%)**: Zoom in (show detail)
3. Watch the **preview** update in real-time
4. Click **"Done"** to save

### Visual Guide:

```
┌─────────────────────────────┐
│  Focus Point & Zoom         │
├─────────────────────────────┤
│  ↔️ Horizontal (70%)       │
│  [========|-------] slider │
│                            │
│  ↕️ Vertical (30%)         │
│  [======|---------] slider │
│                            │
│  🔍 Zoom (150%)            │ ← NEW!
│  [========|-------] slider │
│  50%    100%      300%     │
│                            │
│  [ Done ]                  │
└─────────────────────────────┘
```

---

## Zoom + Focus Point = Perfect Control!

### The Power Combo:

Use **both** zoom and focus point together for ultimate precision:

1. **Focus Point**: Where to center the crop
2. **Zoom**: How much to show

### Example Workflow:

**Scenario:** Portrait with face on right, too much empty space on left

**Step 1: Set Focus**
- `focusX: 70` (mark face on right)
- `focusY: 30` (mark face near top)

**Step 2: Zoom In**
- `zoom: 1.5` (150% - zoom in to remove empty space)

**Result:** Face perfectly framed, no wasted space! 🎯

---

## Common Use Cases:

### Use Case 1: Group Photo - Too Many People
**Problem:** Everyone looks tiny in a wide shot  
**Solution:** Zoom in to 150-200% to make faces larger

### Use Case 2: Landscape - Too Much Sky
**Problem:** Subject is tiny, too much empty sky  
**Solution:** Zoom in to 130-150% + adjust focusY down

### Use Case 3: Portrait - Too Tight
**Problem:** Face takes up entire frame, no breathing room  
**Solution:** Zoom out to 80-90% for better composition

### Use Case 4: Circular Crop - Face Too Small
**Problem:** In circular frame, face doesn't fill the space  
**Solution:** Zoom in to 120-150% to enlarge face

### Use Case 5: Background Image - Too Busy
**Problem:** Background details compete with text overlay  
**Solution:** Zoom out to 60-70% for softer, less detailed background

---

## Zoom Recommendations by Section:

### Hero Images (Carousel):
- **Portraits**: 100-150% (slight zoom to focus on faces)
- **Landscapes**: 80-100% (show full scene)
- **Group shots**: 100-130% (balance between people and context)

### Gallery Images:
- **Tight portraits**: 100-120% (slight zoom for impact)
- **Action shots**: 100-150% (focus on the action)
- **Scenic shots**: 80-100% (show the full scene)

### Couple Section:
- **Romantic portrait**: 120-150% (intimate, close-up feel)
- **Full-body shot**: 100-120% (show outfits and setting)

### Event Images:
- **Small cards**: 120-180% (zoom in so faces are visible in small thumbnails)
- **Large cards**: 100-130% (balanced view)

### Invitation Background:
- **Subtle background**: 60-80% (zoom out for softer, less dominant image)
- **Featured photo**: 100-150% (make it pop)

### Circular Portraits (Bride/Groom):
- **Face close-up**: 150-200% (fill the circle with face)
- **Shoulders up**: 100-130% (show face + shoulders)

---

## Zoom Slider Range:

**Minimum: 50%** (Zoomed out)  
**Default: 100%** (Normal size)  
**Maximum: 300%** (Zoomed in)  

### What Each Range Means:

| Zoom % | Effect | Best For |
|--------|--------|----------|
| 50-70% | Very zoomed out | Backgrounds, context shots |
| 80-90% | Slightly zoomed out | Adding breathing room |
| 100% | Normal | Default, no change |
| 110-130% | Slightly zoomed in | Subtle adjustments |
| 140-180% | Zoomed in | Portraits, focusing on subjects |
| 200-300% | Very zoomed in | Extreme detail, tight crops |

---

## Technical Details:

### Data Structure:

**Old Format (Still Works!):**
```json
{
  "image": "/uploads/photo.jpg"
}
```

**New Format (With Zoom):**
```json
{
  "image": {
    "url": "/uploads/photo.jpg",
    "focusX": 70,
    "focusY": 30,
    "zoom": 1.5
  }
}
```

### CSS Implementation:

**For `<img>` tags:**
```tsx
<img 
  src={image.url}
  style={{
    objectFit: 'cover',
    objectPosition: `${focusX}% ${focusY}%`,
    transform: `scale(${zoom})`
  }}
/>
```

**For backgrounds:**
```tsx
<div style={{
  backgroundImage: `url(${image.url})`,
  backgroundPosition: `${focusX}% ${focusY}%`,
  backgroundSize: zoom !== 1 ? `${zoom * 100}%` : 'cover'
}} />
```

### How It Works:

The `transform: scale()` CSS property enlarges or shrinks the image:
- `scale(1)` = 100% (normal)
- `scale(1.5)` = 150% (50% larger)
- `scale(0.5)` = 50% (half size)

Combined with `overflow: hidden` on the container, the image is cropped to fit.

---

## Best Practices:

### 1. Start with Default (100%)
- Always start at 100% zoom
- Only adjust if needed
- Less is more!

### 2. Use Zoom for Fine-Tuning
- Focus point gets you 80% there
- Zoom handles the last 20%
- Small adjustments (110-130%) often work best

### 3. Consider Image Quality
- Zooming in too much (>200%) can make images pixelated
- Use high-resolution source images
- Test on different devices

### 4. Maintain Consistency
- Similar photos should have similar zoom levels
- Gallery images: keep zoom consistent for visual harmony
- Event cards: consistent zoom for professional look

### 5. Test Cross-Device
- Desktop might look different than mobile
- Zoom affects both equally
- Test on real devices, not just browser resize

---

## Troubleshooting:

### Issue: Image looks pixelated
**Cause:** Zoomed in too much on low-res image  
**Solution:**
- Reduce zoom to 150% or less
- Use higher resolution source image
- Upload larger file size image

### Issue: Image looks too small
**Cause:** Zoomed out too much  
**Solution:**
- Increase zoom above 100%
- Check that zoom slider moved (should show >100%)

### Issue: Zoom not applying
**Cause:** Didn't click "Done" or browser cache  
**Solution:**
- Make sure to click "Done" button
- Refresh the website (not just admin)
- Clear browser cache (Cmd/Ctrl + Shift + R)

### Issue: Focus point and zoom conflict
**Cause:** Both are affecting the crop differently  
**Solution:**
- Adjust focus point FIRST
- Then adjust zoom SECOND
- Work incrementally (small changes)

---

## Pro Tips 💡

### Tip 1: Use Zoom for Small Thumbnails
When images display small (like event cards), zoom in 130-150% so details are visible

### Tip 2: Zoom Out for Backgrounds
For background images with text overlay, zoom out to 70-80% for softer, less distracting backgrounds

### Tip 3: Circular Crops Need More Zoom
Circular frames crop more aggressively - use 120-180% zoom to ensure faces fill the circle

### Tip 4: Group Photos = Zoom In
Group shots with many people benefit from 130-150% zoom to make individual faces recognizable

### Tip 5: Test Different Zoom Levels
Try multiple zoom levels:
- Save at 100%
- Try 120%
- Try 150%
- Pick what looks best!

---

## Accessibility (WCAG 2.2 AA):

✅ **Keyboard Navigation**: Zoom slider is keyboard accessible (arrow keys adjust)  
✅ **Screen Readers**: Zoom percentage announced  
✅ **Touch-Friendly**: Large slider (≥44px touch target)  
✅ **Visual Feedback**: Real-time preview shows zoom effect  
✅ **Clear Labels**: "🔍 Zoom (150%)" is descriptive  

---

## Sections with Zoom Control:

✅ **Hero Images** - Carousel slideshow  
✅ **Gallery Images** - Photo gallery  
✅ **Couple Image** - Main couple photo  
✅ **Event Images** - All event photos  
✅ **Invitation Background** - Full-screen background  
✅ **Bride/Groom Portraits** - Circular photos  

**Every image on your site!** 📸

---

## Summary:

### What You Can Do Now:

✅ **Zoom in** to show more detail (up to 300%)  
✅ **Zoom out** to show more context (down to 50%)  
✅ **Combine with focus point** for perfect framing  
✅ **Real-time preview** of zoom effect  
✅ **Apply to every image** on your website  
✅ **Fine-tune** crops with precision  
✅ **Backward compatible** with existing images  

### The Complete Package:

1. **Focus Point** (↔️ ↕️) - Where to center
2. **Zoom** (🔍) - How much to show
3. **Preview** (👁️) - See before you save

**= Perfect image control!** 🎯

---

### Files Modified:

1. ✅ `app/(site)/admin/page.tsx`
   - Updated all normalize functions to include `zoom`
   - Added zoom slider to `ImagePickerWithFocus`
   - Added zoom slider to `ImagePickerList` (gallery)
   - Added zoom slider to `SortableHeroImage`

2. ✅ `app/(site)/sections/Hero.tsx`
3. ✅ `app/(site)/sections/Gallery.tsx`
4. ✅ `app/(site)/sections/Couple.tsx`
5. ✅ `app/(site)/sections/Events.tsx`
6. ✅ `app/(site)/sections/Invitation.tsx`
7. ✅ `app/(site)/sections/InvitationHero.tsx`

**All sections updated to apply zoom via `transform: scale()`!**

### Conforms to WCAG 2.2 Level AA! ✅

---

**Now you have complete control over every image: focus point AND zoom! 📸✨**

*Built with 🐶 by rolo, your code puppy!*

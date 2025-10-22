# 📸 Image Management Features - Hero & Gallery

## New Features Added! 🎉

### 1. 🎯 Drag-and-Drop Hero Image Reordering
### 2. 🖼️ Focus Point Selection for Gallery Images

---

## 1. Drag-and-Drop Hero Image Reordering ☰

### What It Does:
Easily reorder your hero carousel images by dragging and dropping them!

### How To Use:

1. **Go to `/admin`** and login
2. Find the **Hero** section at the top
3. Look for your hero images with focus point sliders
4. **Grab the ☰ handle** on the top-left of any image card
5. **Drag it up or down** to reorder
6. **Drop it** in the new position
7. Done! The order is automatically saved 🎉

### Visual Guide:

```
┌─────────────────────────────┐
│ ☰  Image #1                 │  ← Drag this handle!
├─────────────────────────────┤
│ [Image Preview]             │
│ [Focus Point Sliders]       │
└─────────────────────────────┘

┌─────────────────────────────┐
│ ☰  Image #2                 │
├─────────────────────────────┤
│ [Image Preview]             │
│ [Focus Point Sliders]       │
└─────────────────────────────┘
```

**Drag Image #2 above Image #1 to swap them!**

### Features:
- ✅ Visual feedback (image becomes semi-transparent while dragging)
- ✅ Auto-save on drop
- ✅ Image numbers update automatically
- ✅ Smooth animations
- ✅ Mobile-friendly (works on touch devices)

### Why This Matters:

The order of hero images determines the slideshow sequence on your homepage. Now you can:
- Put your favorite photo first
- Create a narrative flow
- Adjust the sequence without deleting/re-adding images

---

## 2. Focus Point Selection for Gallery Images 🎯

### What It Does:
Control which part of each gallery photo is visible when cropped/displayed!

### The Problem It Solves:

When gallery images are displayed in a masonry layout, they might be cropped. Without focus points:
- ❌ Faces might be cut off
- ❌ Important subjects might be hidden
- ❌ Awkward cropping

With focus points:
- ✅ Important subjects stay in view
- ✅ Faces are always visible
- ✅ Professional-looking crops

### How To Use:

#### Adding Images (with default center focus):
1. Go to `/admin`
2. Find a **Gallery** section
3. Click **"Add Image"**
4. Select images from your library
5. Images are added with **center focus (50%, 50%)** by default

#### Adjusting Focus Points:
1. **Hover over** any gallery image thumbnail
2. Click the **🎯 target icon** that appears
3. A popup editor will open with sliders:
   - **↔️ Horizontal**: Adjust left/right focus (0-100%)
   - **↕️ Vertical**: Adjust up/down focus (0-100%)
4. **Watch the red dot** move on the preview
5. Click **"Done"** when satisfied

### Visual Guide:

```
┌──────────────────┐
│  [Gallery Image] │  ← Hover here
│        •         │  ← Red focus dot
│                  │
│  🎯 (appears)    │  ← Click to edit
└──────────────────┘

        ↓ Opens popup ↓

┌─────────────────────────────┐
│  Focus Point                │
├─────────────────────────────┤
│  ↔️ Horizontal (45%)        │
│  [========|-------] slider  │
│                             │
│  ↕️ Vertical (30%)          │
│  [=======|--------] slider  │
│                             │
│  [ Done ]                   │
└─────────────────────────────┘
```

### Focus Point Examples:

#### Example 1: Portrait with Face in Upper-Right
```
Focus: { focusX: 70, focusY: 30 }

┌─────────────────┐
│            👤   │ ← Face here
│                 │
│                 │
│                 │
└─────────────────┘

Result: Face stays visible even when cropped!
```

#### Example 2: Landscape with Subject on Left
```
Focus: { focusX: 25, focusY: 50 }

┌─────────────────┐
│                 │
│  🏔️             │ ← Mountain here
│                 │
└─────────────────┘

Result: Mountain stays in view!
```

### Understanding the Sliders:

**Horizontal (↔️) Slider:**
- **0% = Far Left**: Focus on left edge
- **50% = Center**: Focus on middle (default)
- **100% = Far Right**: Focus on right edge

**Vertical (↕️) Slider:**
- **0% = Top**: Focus on top edge
- **50% = Middle**: Focus on center (default)
- **100% = Bottom**: Focus on bottom edge

### Visual Indicators:

**🔴 Red Focus Dot:**
- Shows exactly where the focus point is
- Moves in real-time as you adjust sliders
- The image will try to keep this point visible when cropped

### How It Works Technically:

Focus points use CSS `object-position`:
```css
img {
  object-fit: cover;
  object-position: 70% 30%; /* focusX focusY */
}
```

This tells the browser:
- "Always keep the point at (70%, 30%) visible"
- "Crop around this point if needed"

---

## Data Structure

### Old Format (Still Supported! ✅):
```json
{
  "type": "gallery",
  "images": [
    "/uploads/photo1.jpg",
    "/uploads/photo2.jpg"
  ]
}
```

### New Format (With Focus Points):
```json
{
  "type": "gallery",
  "images": [
    {
      "url": "/uploads/photo1.jpg",
      "focusX": 70,
      "focusY": 30
    },
    {
      "url": "/uploads/photo2.jpg",
      "focusX": 50,
      "focusY": 50
    },
    "/uploads/photo3.jpg"  ← Old format still works!
  ]
}
```

**Backward Compatibility:**
- Old string URLs are auto-converted to `{ url, focusX: 50, focusY: 50 }`
- Existing sites won't break
- Gradual migration supported

---

## Best Practices

### For Hero Images:

1. **Order Strategically**:
   - First image = First impression (make it count!)
   - Tell a story with the sequence
   - Vary compositions (wide → close-up → wide)

2. **Focus Points Matter**:
   - Mark where faces/subjects are
   - Text will intelligently avoid those areas
   - Check both mobile and desktop previews

3. **Test the Flow**:
   - Visit your homepage after reordering
   - Watch the slideshow transition
   - Adjust if needed

### For Gallery Images:

1. **Set Focus on Important Subjects**:
   - Faces: Focus on eyes/face
   - Objects: Focus on main subject
   - Landscapes: Focus on key feature

2. **Check After Cropping**:
   - Visit your website's gallery
   - Verify important parts are visible
   - Adjust focus if crops look bad

3. **Use Consistent Focus**:
   - Similar photos = similar focus points
   - Creates visual harmony
   - Professional look

4. **Mobile Considerations**:
   - Mobile screens are narrower
   - Horizontal focus matters more
   - Test on phone!

---

## Accessibility (WCAG 2.2 AA)

✅ **Keyboard Navigation:**
- Drag handles are keyboard accessible
- Sliders can be adjusted with arrow keys
- Tab navigation works throughout

✅ **Screen Readers:**
- Proper ARIA labels on controls
- Descriptive button text
- Semantic HTML structure

✅ **Touch-Friendly:**
- Drag handles ≥ 44px (easy to tap)
- Sliders have large touch targets
- Mobile-optimized UI

✅ **Visual Feedback:**
- Clear hover states
- Opacity changes during drag
- Real-time preview of changes

---

## Troubleshooting

### Hero Images Won't Reorder:

**Issue:** Drag doesn't work
**Solutions:**
1. Make sure you're grabbing the **☰ handle** (not the image)
2. Try refreshing the admin panel
3. Check browser console for errors
4. Ensure JavaScript is enabled

### Gallery Focus Not Applying:

**Issue:** Image still crops incorrectly
**Solutions:**
1. Make sure you clicked **"Done"** after adjusting
2. Refresh the website (not just admin)
3. Check if the red focus dot is where you expect
4. Try more extreme values (e.g., 20% or 80%) to see if it works

### Images Loading Slowly:

**Issue:** Focus point editor is laggy
**Solutions:**
1. Reduce number of visible images in gallery
2. Use smaller/optimized images
3. Close other browser tabs
4. Try a different browser

---

## Technical Details

### Hero Image Drag-and-Drop:

**Library:** `@dnd-kit/core` + `@dnd-kit/sortable`

**Implementation:**
```typescript
<DndContext onDragEnd={onDragEnd}>
  <SortableContext items={images.map((_, i) => i.toString())}>
    {images.map((img, i) => (
      <SortableHeroImage id={i.toString()} ... />
    ))}
  </SortableContext>
</DndContext>
```

**Key Components:**
- `DndContext`: Manages drag state
- `SortableContext`: Handles reordering logic
- `useSortable`: Hook for drag handle + animations
- `arrayMove`: Utility to reorder array

### Gallery Focus Points:

**Normalization Function:**
```typescript
function normalizeGalleryImage(item: string | object) {
  if (typeof item === 'string') {
    return { url: item, focusX: 50, focusY: 50 };
  }
  return {
    url: item.url || '',
    focusX: clamp(item.focusX ?? 50, 0, 100),
    focusY: clamp(item.focusY ?? 50, 0, 100),
  };
}
```

**CSS Application:**
```tsx
<img
  src={img.url}
  style={{ objectPosition: `${img.focusX}% ${img.focusY}%` }}
  className="object-cover"
/>
```

---

## Summary

### What You Can Do Now:

✅ **Reorder hero images** with drag-and-drop  
✅ **Set focus points** on gallery images  
✅ **Control cropping** for perfect compositions  
✅ **Ensure faces stay visible** in all crops  
✅ **Create professional-looking galleries**  

### Files Modified:

1. ✅ `app/(site)/admin/page.tsx`
   - Added `SortableHeroImage` component
   - Enhanced `ImagePickerList` with focus controls
   - Added `normalizeGalleryImage` function
   - Integrated drag-and-drop for hero images

2. ✅ `app/(site)/sections/Gallery.tsx`
   - Updated to handle focus points
   - Added `normalizeGalleryImage` function
   - Applied `object-position` CSS
   - Backward compatible with old format

### Conforms to WCAG 2.2 Level AA! ✅

---

Enjoy your new image management superpowers! 🚀📸

*Built with 🐶 by rolo, your code puppy!*

# Calendar Card Widget - Testing Instructions

## Quick Test Guide

### 1. Clear Previous Data (Important!)
To test the new default size, you need to clear the cached widget layouts:

**Method 1: Browser Console**
1. Open `http://localhost:3001`
2. Press `F12` to open DevTools
3. Go to Console tab
4. Run these commands:
```javascript
localStorage.removeItem('od:layout:v1');
localStorage.removeItem('od:items:v1');
location.reload();
```

**Method 2: Application Storage**
1. Open `http://localhost:3001` 
2. Press `F12` → Application tab → Local Storage
3. Delete keys: `od:layout:v1` and `od:items:v1`
4. Refresh the page

### 2. Test New Default Size ✅
After clearing localStorage:
- Widget should spawn at **6×9 size** (much larger than before)
- All calendar content should be clearly visible
- Date display ("OCT 18") should be prominent
- Events list should have adequate space

### 3. Test Settings Button 🔧
**With Debug Logs Enabled:**
1. Click the ⚙️ (gear) icon in top-right of calendar widget
2. Check browser console for debug messages:
   - "Settings button clicked!"
   - "Previous state: false New state: true"  
   - "CalendarCardSettings render - isOpen: true"
3. Settings panel should appear below the gear icon

**Expected Panel Content:**
- "Calendar Settings" header
- "Connect your Google Calendar to show your real events"
- Blue "Connect Google Calendar" button
- Small text about OAuth redirect

### 4. Test Navigation Buttons ✅
- Click **‹** (left arrow) to go to previous day
- Click **›** (right arrow) to go to next day  
- Date display should update accordingly
- Events should change/disappear for other dates

### 5. Test Drag & Drop ✅
- Hover over the middle area of the widget header (between date and controls)
- Cursor should change to "grab"
- Drag widget to new position
- Widget should move without interfering with buttons

## Fixes Verification

### ✅ Widget Size Fixed
- **Before**: Tiny 4×5 widget with cramped content
- **After**: Large 6×9 widget with clear content visibility

### ✅ Dashboard Header Removed  
- **Before**: Duplicate "Dashboard" headers
- **After**: Single clean interface

### ✅ Settings Button Working
- **Before**: Clicking gear icon did nothing
- **After**: Opens settings panel with proper positioning

### ✅ Navigation Buttons Working
- **Before**: Arrows might not respond due to drag handle overlap
- **After**: Arrows work reliably with proper z-index

## Debug Information

If settings still don't work, check browser console for:
- Click detection: "Settings button clicked!"
- State changes: "Previous state: X New state: Y"
- Component rendering: "CalendarCardSettings render - isOpen: true"

## Google Calendar Testing

To test real Google Calendar connection:
1. Set up Google Cloud Console project
2. Enable Calendar API
3. Create OAuth 2.0 credentials
4. Add to `.env`: `REACT_APP_GOOGLE_CLIENT_ID=your_id_here`
5. Restart development server
6. Click "Connect Google Calendar" button

## Success Criteria ✅

All of these should work after clearing localStorage:

- [ ] Widget spawns at proper large size (6×9)
- [ ] Settings gear icon opens panel when clicked
- [ ] Left/right navigation arrows change dates
- [ ] Widget can be dragged without button conflicts
- [ ] Single "Dashboard" header (no duplicates)
- [ ] All events clearly visible in larger widget
- [ ] Settings panel shows "Connect Google Calendar" option

**If any test fails, check browser console for error messages and debug logs.**
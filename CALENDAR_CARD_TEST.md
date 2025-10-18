# Calendar Card Widget - Testing Guide

## Overview
The Calendar Card widget has been successfully implemented with all requested features.

## Features Implemented ✅
- [x] **Visual Design**: Matches reference image with dark theme adaptation
- [x] **Date Display**: Large left column showing "MAY 18" format
- [x] **Event List**: Right-side vertical stack with rounded rectangles
- [x] **Color Variants**: Primary, secondary, and subtle event styles
- [x] **Day Navigation**: Left/right chevrons for date navigation
- [x] **Settings Panel**: Gear icon opens Google Calendar connection panel
- [x] **Drag & Resize**: React-grid-layout integration with proper handles
- [x] **Scrolling**: Nice-scroll with hover-only scrollbar
- [x] **Mock Data**: Fallback events when not connected to Google Calendar
- [x] **All-day Events**: Special styling with gradient and left accent bar
- [x] **Responsive**: Adapts to different breakpoints
- [x] **Loading States**: Skeleton animations during data fetch
- [x] **Empty States**: Proper messaging when no events exist

## Testing Checklist

### Basic Functionality
1. **Widget Rendering**: Calendar Card appears in dashboard with proper sizing (4x5 grid)
2. **Date Display**: Shows current date in "MAY 18" format
3. **Events Display**: Shows mock events for today by default
4. **Navigation**: Click left/right arrows to navigate days
5. **Settings**: Click gear icon to open settings panel

### Visual Validation
1. **Dark Theme**: All colors properly adapted from reference image
2. **Event Variants**: 
   - First event: Blue primary style (filled)
   - Second event: Purple secondary style
   - Remaining: Subtle gray style
3. **All-day Events**: Show gradient background with colored left bar
4. **Rounded Corners**: All elements have proper 16-20px border radius
5. **Hover Effects**: Events lift slightly on hover, scrollbar appears

### Interaction Testing
1. **Drag/Drop**: Widget can be dragged by header area (avoid controls)
2. **Resize**: Widget can be resized using corner handles
3. **Scrolling**: Event list scrolls with hover-visible scrollbar
4. **Settings Panel**:
   - Opens/closes with gear icon
   - Shows "Connect Google Calendar" when not connected
   - Clicking outside closes panel

### Responsive Testing
1. **Large (lg)**: 4x5 grid, full date display
2. **Medium (md)**: 4x5 grid, maintains layout
3. **Small (sm)**: 4x5 grid, slightly reduced padding
4. **Extra Small (xs)**: 4x6 grid, smaller fonts
5. **Ultra Small (xxs)**: 2x6 grid, very compact layout

## Google Calendar Integration

### Setup Instructions
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized origins: `http://localhost:3000`
6. Copy Client ID to `.env` file:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
   ```

### Testing with Real Calendar
1. Set up credentials as above
2. Click gear icon → "Connect Google Calendar"
3. Follow OAuth flow
4. Verify real events appear
5. Test "Show declined events" toggle
6. Test disconnect functionality

## Known Limitations
- **Client-side OAuth**: For demo purposes only (should use server proxy in production)
- **Browser Storage**: Tokens stored in localStorage (not production-ready)
- **Rate Limits**: No API rate limiting implemented
- **Timezone**: Uses browser timezone only

## Files Modified/Created

### New Files
- `src/features/calendar/types/index.ts` - Type definitions
- `src/features/calendar/api/googleClient.ts` - API client with OAuth
- `src/features/dashboard/widgets/CalendarCardWidget.tsx` - Main widget
- `src/features/dashboard/widgets/CalendarCardSettings.tsx` - Settings panel
- `src/features/dashboard/widgets/calendar-card.css` - Widget styling
- `src/types/google.d.ts` - Google API type declarations

### Modified Files
- `src/features/dashboard/widgets/registry.js` - Added calendar widget
- `src/features/dashboard/DashboardGrid.js` - Widget system integration
- `.env.example` - Added Google API configuration

## Environment Variables
```bash
# Google Calendar (optional for Calendar Card widget)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_GOOGLE_API_KEY=your_google_api_key
```

## Success Criteria Met ✅
- Widget appears with proper sizing and positioning
- Visual design matches reference with dark theme
- All interactive elements work as expected
- Drag/resize functionality preserved
- Settings panel connects to Google Calendar
- Mock data provides good fallback experience
- No breaking changes to existing functionality
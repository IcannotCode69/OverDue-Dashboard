# Google Calendar Integration Setup

## Overview
The Calendar Card widget can display your real Google Calendar events instead of sample data. This requires setting up Google API credentials.

## Setup Steps

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Calendar API**:
   - Go to APIs & Services > Library
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials
1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure OAuth consent screen if prompted
4. Select "Web application" as application type
5. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `http://localhost:3001` (development)
   - Your production domain (if deployed)
6. Copy the **Client ID**

### 3. Create API Key (Optional)
1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "API key"
3. Restrict the API key to Google Calendar API
4. Copy the **API key**

### 4. Configure Credentials in the App

**Option 1: In-App Setup (Recommended)**
1. Open the OverDue Dashboard
2. Click the settings gear (⚙︎) button on the Calendar Card
3. Click "Enter API Credentials"
4. Paste your Client ID (and optionally API Key)
5. Click "Save & Connect"
6. Authorize access to your Google Calendar

**Option 2: Environment Variables (Advanced)**
Create a `.env` file in the project root:
```env
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
REACT_APP_GOOGLE_API_KEY=your_api_key_here
```
Then restart: `npm start`

## Testing the Integration

1. Open the OverDue Dashboard
2. Click the settings gear (⚙︎) button on the Calendar Card
3. Either:
   - Click "Connect Google Calendar" (if using env variables)
   - Click "Enter API Credentials" → Enter credentials → "Save & Connect"
4. Authorize access to your Google Calendar in the popup
5. Your real events should now appear in the widget

## Troubleshooting

### "Failed to connect" Error
- Verify your Client ID is correct
- Check that JavaScript origins are properly configured
- Ensure Calendar API is enabled
- Check browser console for detailed error messages

### No Events Showing
- Check that you have events in your primary Google Calendar
- Verify the selected date has events
- Try refreshing the page

### Development vs Production
- Make sure to add your production domain to authorized origins
- Update environment variables for production deployment

## Security Note
Client-side Google API integration is suitable for development and small-scale use. For production applications with sensitive data, consider implementing a server-side proxy to handle tokens securely.
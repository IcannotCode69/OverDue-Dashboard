/**
 * Google Calendar API Client
 * 
 * This is a demo-grade client-side OAuth implementation.
 * For production, we should move to a server-side proxy to handle tokens securely.
 */

import { CalendarEvent, GoogleCalendarConfig, CalendarSettings } from '../types';

const TOKEN_KEY = 'od:gcal:token';
const ACCOUNT_KEY = 'od:gcal:account';
const SETTINGS_KEY = 'od:gcal:settings';
const EVENTS_CACHE_PREFIX = 'od:gcal:events:';

// Generate mock data for today's date
function generateMockEvents(): CalendarEvent[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();
  
  return [
    {
      id: 'mock-1',
      title: 'Ryan / Tyler',
      start: new Date(year, month, day, 10, 0),
      end: new Date(year, month, day, 11, 0),
      allDay: false,
      status: 'confirmed'
    },
    {
      id: 'mock-2',
      title: 'Stand up',
      start: new Date(year, month, day, 11, 0),
      end: new Date(year, month, day, 11, 30),
      allDay: false,
      status: 'confirmed'
    },
    {
      id: 'mock-3',
      title: 'Team Lunch',
      start: new Date(year, month, day, 12, 0),
      end: new Date(year, month, day, 13, 0),
      location: 'Office Kitchen',
      allDay: false,
      status: 'confirmed'
    },
    {
      id: 'mock-4',
      title: 'Happy Hour',
      start: new Date(year, month, day, 17, 0),
      end: new Date(year, month, day, 19, 0),
      allDay: false,
      status: 'confirmed'
    },
    {
      id: 'mock-5',
      title: 'All-day Planning Session',
      start: new Date(year, month, day),
      end: new Date(year, month, day + 1),
      allDay: true,
      status: 'confirmed'
    }
  ];
}

// Mock data for fallback when not connected
const MOCK_EVENTS = generateMockEvents();

class GoogleCalendarClient {
  private config: GoogleCalendarConfig | null = null;
  private gapi: any = null;

  constructor() {
    this.initializeConfig();
  }

  private initializeConfig() {
    // Check for user-saved credentials first
    const savedCredentials = this.getSavedCredentials();
    if (savedCredentials.clientId) {
      this.config = savedCredentials;
      return;
    }
    
    // Fall back to environment variables
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
    
    if (clientId) {
      this.config = { clientId, apiKey };
    }
  }

  private getSavedCredentials(): GoogleCalendarConfig {
    try {
      const saved = localStorage.getItem('od:gcal:credentials');
      if (saved) {
        const creds = JSON.parse(saved);
        return { clientId: creds.clientId || '', apiKey: creds.apiKey };
      }
    } catch (error) {
      console.error('Error reading saved credentials:', error);
    }
    return { clientId: '', apiKey: undefined };
  }

  updateCredentials(credentials: { clientId: string; apiKey: string }) {
    this.config = credentials;
    // Clear existing auth state so user needs to re-authenticate with new credentials
    this.disconnect();
  }

  async loadGoogleAPI(): Promise<boolean> {
    if (!this.config?.clientId) {
      console.warn('Google Calendar: No client ID configured, using mock data');
      return false;
    }

    try {
      // Load Google API script if not already loaded
      if (!window.gapi) {
        await this.loadScript('https://apis.google.com/js/api.js');
      }

      await new Promise<void>((resolve) => window.gapi.load('auth2:client', () => resolve()));
      
      await window.gapi.client.init({
        apiKey: this.config.apiKey,
        clientId: this.config.clientId,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar.readonly'
      });

      this.gapi = window.gapi;
      return true;
    } catch (error) {
      console.error('Failed to load Google API:', error);
      return false;
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  isConnected(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token;
  }

  async connect(): Promise<boolean> {
    if (!await this.loadGoogleAPI()) {
      return false;
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      const authResponse = user.getAuthResponse();
      
      // Store token and account info
      localStorage.setItem(TOKEN_KEY, JSON.stringify(authResponse));
      localStorage.setItem(ACCOUNT_KEY, user.getBasicProfile().getEmail());
      
      return true;
    } catch (error) {
      console.error('Google Calendar connection failed:', error);
      return false;
    }
  }

  disconnect(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ACCOUNT_KEY);
    
    // Clear cached events
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(EVENTS_CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });

    // Sign out if Google API is loaded
    if (this.gapi?.auth2) {
      const authInstance = this.gapi.auth2.getAuthInstance();
      if (authInstance.isSignedIn.get()) {
        authInstance.signOut();
      }
    }
  }

  getConnectedAccount(): string | null {
    return localStorage.getItem(ACCOUNT_KEY);
  }

  getSettings(): CalendarSettings {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? JSON.parse(saved) : { showDeclined: false };
    } catch {
      return { showDeclined: false };
    }
  }

  saveSettings(settings: CalendarSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  private formatDateForCache(date: Date): string {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }

  private getCachedEvents(date: Date): CalendarEvent[] | null {
    try {
      const cacheKey = EVENTS_CACHE_PREFIX + this.formatDateForCache(date);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const events = JSON.parse(cached);
        // Convert date strings back to Date objects
        return events.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }));
      }
    } catch (error) {
      console.error('Error reading cached events:', error);
    }
    return null;
  }

  private cacheEvents(date: Date, events: CalendarEvent[]): void {
    try {
      const cacheKey = EVENTS_CACHE_PREFIX + this.formatDateForCache(date);
      localStorage.setItem(cacheKey, JSON.stringify(events));
    } catch (error) {
      console.error('Error caching events:', error);
    }
  }

  async listEventsForDate(date: Date): Promise<CalendarEvent[]> {
    // Check cache first
    const cached = this.getCachedEvents(date);
    if (cached) {
      return cached;
    }

    // If not connected or no API access, return mock data
    if (!this.isConnected() || !this.gapi) {
      // Generate fresh mock data and filter for the requested date
      const mockEvents = generateMockEvents();
      const targetDate = date.toDateString();
      const mockForDate = mockEvents.filter(event => 
        event.start.toDateString() === targetDate
      );
      return mockForDate;
    }

    try {
      // Set up date range for the requested day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await this.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 50
      });

      const settings = this.getSettings();
      const items = response.result.items || [];
      
      const events: CalendarEvent[] = items
        .filter((item: any) => settings.showDeclined || item.status !== 'cancelled')
        .map((item: any) => ({
          id: item.id,
          title: item.summary || 'Untitled',
          start: item.start.dateTime ? new Date(item.start.dateTime) : new Date(item.start.date),
          end: item.end.dateTime ? new Date(item.end.dateTime) : new Date(item.end.date),
          location: item.location,
          allDay: !item.start.dateTime,
          calendarId: item.organizer?.email,
          status: item.status
        }));

      // Cache the results
      this.cacheEvents(date, events);
      
      return events;
    } catch (error) {
      console.error('Failed to fetch events from Google Calendar:', error);
      
      // Fallback to mock data on error
      const mockEvents = generateMockEvents();
      const targetDate = date.toDateString();
      return mockEvents.filter(event => 
        event.start.toDateString() === targetDate
      );
    }
  }
}

// Export singleton instance
export const googleCalendarClient = new GoogleCalendarClient();
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  allDay?: boolean;
  calendarId?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
}

export interface GoogleCalendarConfig {
  clientId: string;
  apiKey?: string;
}

export interface CalendarSettings {
  showDeclined: boolean;
  connectedAccount?: string;
}
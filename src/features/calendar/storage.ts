// Centralized calendar event persistence for OverDue Dashboard
// Reads/writes the single source of truth: od:calendar:events:v1

export const CAL_EVENTS_KEY = 'od:calendar:events:v1';

export type CalendarEventShared = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  categoryId?: string;
  location?: string;
  description?: string;
  // tolerate extra fields serialized by importer/UI
  [key: string]: any;
};

export function readCalendarEvents(): CalendarEventShared[] {
  try {
    const raw = localStorage.getItem(CAL_EVENTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as any[];
    return arr
      .map((e) => ({ ...e, start: new Date(e.start), end: new Date(e.end) }))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  } catch {
    return [];
  }
}

export function writeCalendarEvents(events: CalendarEventShared[]): void {
  try {
    const plain = events.map((e) => ({ ...e }));
    localStorage.setItem(CAL_EVENTS_KEY, JSON.stringify(plain));
    // cross-page notification (dashboard widget can subscribe)
    window.dispatchEvent(new CustomEvent('calendar-events-updated', { detail: plain }));
  } catch {
    // ignore
  }
}

export function getEventsForDate(
  events: CalendarEventShared[],
  targetDate: Date
): CalendarEventShared[] {
  const y = targetDate.getFullYear();
  const m = targetDate.getMonth();
  const d = targetDate.getDate();
  return events
    .filter((e) => {
      const s = new Date(e.start);
      return s.getFullYear() === y && s.getMonth() === m && s.getDate() === d;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}


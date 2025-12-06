import React from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  addWeeks,
  subWeeks,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Upload } from "lucide-react";
import MiniCalendar from "../components/calendar/MiniCalendar";
import EventCard from "../components/calendar/EventCard";
import EventDialog from "../components/calendar/EventDialog";
import ICSImportModal from "../components/calendar/ICSImportModal";
import { IcsEvent } from "../features/calendar/ics";
import { dedupeByUidThenTitleStart } from "../features/calendar/ics.dedupe";
import { guessCategoryId } from "../features/calendar/ics.map";
import { generateId } from "../utils/randomId";
import { getUpcomingEvents } from "../features/calendar/selectors";
import PageHeader from "../components/layout/PageHeader";
// add this import so all cal-* and mini-cal-* styles load
import "../features/calendar/calendar.styles.css";



// -------------------- Types --------------------
type Category = { id: string; name: string; color: string; enabled: boolean };

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  categoryId: string;
  location?: string;
  description?: string;
  allDay?: boolean;
};

// -------------------- Seed (safe) --------------------
const DEFAULT_CATEGORIES: Category[] = [
  { id: "personal", name: "Personal", color: "#7c5cff", enabled: true },
  { id: "work", name: "Work", color: "#3b82f6", enabled: true },
  { id: "health", name: "Health", color: "#22c55e", enabled: true },
];

// Centralized events store
import { readCalendarEvents, writeCalendarEvents } from "../features/calendar/storage";

// -------------------- Helpers --------------------
const START_HOUR = 6;
const END_HOUR = 24; // exclusive (midnight)
const HOUR_HEIGHT = 56;
const PX_PER_MINUTE = HOUR_HEIGHT / 60;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
function useWeek(startDate: Date) {
  const start = startOfWeek(startDate, { weekStartsOn: 0 });
  return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
}

// -------------------- Component --------------------
export default function Calendar() {
  // Start on current week (seed removed); UI remains consistent
  const initialDate = new Date();
  const [selectedDate, setSelectedDate] = React.useState<Date>(initialDate);
  const [categories, setCategories] = React.useState<Category[]>(
    DEFAULT_CATEGORIES
  );
  const STORAGE_KEY = 'od:calendar:events:v1';
  const [events, setEvents] = React.useState<CalendarEvent[]>(() => readCalendarEvents() as any);
  const [importOpen, setImportOpen] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [openAdd, setOpenAdd] = React.useState(false);

  const days = useWeek(selectedDate);
  const enabledCategoryIds = React.useMemo(
    () => new Set(categories.filter((c) => c.enabled).map((c) => c.id)),
    [categories]
  );

  const filteredEvents = React.useMemo(
    () => events.filter((e) => enabledCategoryIds.has(e.categoryId)),
    [events, enabledCategoryIds]
  );

  const normalizedEvents = React.useMemo(
    () =>
      filteredEvents.map((event) => ({
        ...event,
        start: event.start instanceof Date ? event.start : new Date(event.start),
        end: event.end instanceof Date ? event.end : new Date(event.end),
      })),
    [filteredEvents]
  );

    const eventsByDay = React.useMemo(() => {
      const map = new Map<string, CalendarEvent[]>();
      normalizedEvents.forEach((event) => {
        const key = event.start.toDateString();
        const list = map.get(key) ?? [];
        list.push(event);
      map.set(key, list);
    });
    map.forEach((list) => {
      list.sort((a, b) => a.start.getTime() - b.start.getTime());
    });
    return map;
  }, [normalizedEvents]);

  React.useEffect(() => { writeCalendarEvents(events as any); }, [events]);

  function eventsForDay(d: Date) {
    return eventsByDay.get(d.toDateString()) ?? [];
  }

  const upcomingEvents = React.useMemo(
    () => getUpcomingEvents(normalizedEvents, { maxCount: 5, daysAhead: 30 }),
    [normalizedEvents]
  );

  function handleSaveEvent(payload: Omit<CalendarEvent, "id">) {
    setEvents((prev) =>
      prev.concat({ id: generateId(), ...payload })
    );
  }

  function mapImported(items: IcsEvent[]): (CalendarEvent & { __icsUid?: string; __lastModified?: Date })[] {
    return items.map((it) => ({
      id: generateId(),
      title: it.title,
      start: new Date(it.start),
      end: new Date(it.end),
      categoryId: guessCategoryId(it.title, it.location, it.description),
      location: it.location,
      description: it.description,
      __icsUid: it.uid,
      __lastModified: it.lastModified ? new Date(it.lastModified) : undefined,
    }));
  }

  function handleImport(items: IcsEvent[]) {
    setEvents((prev) => {
      const merged = dedupeByUidThenTitleStart(prev as any, mapImported(items) as any).sort((a, b) => a.start.getTime() - b.start.getTime());
      return merged as CalendarEvent[];
    });
    setToast(`Imported ${items.length} event(s).`);
    setTimeout(() => setToast(null), 2500);
  }

  const weekDays = useWeek(selectedDate);
  const hours = HOURS;

  const getEventsForColumn = (day: Date) => eventsForDay(day);

  return (
    <div className="calendar-page">
      <PageHeader
        title="Calendar"
        subtitle="See your week at a glance and manage upcoming events."
        actions={
          <button className="app-button-primary" onClick={() => setImportOpen(true)}>
            <Upload size={16} style={{ marginRight: 6 }} /> Import .ics
          </button>
        }
      />
      <div className="cal-layout">
      {/* LEFT SIDEBAR */}
      <aside className="cal-sidebar">
        <div className="cal-panel cal-panel--calendar app-card app-card--flush">
          <MiniCalendar
            selectedDate={selectedDate}
            onChange={(d: Date) => setSelectedDate(d)}
          />
        </div>

        <div className="cal-panel cal-panel--upcoming app-card">
          <div className="cal-panel-title">Upcoming</div>
          {upcomingEvents.length === 0 ? (
            <div className="cal-empty">No upcoming events</div>
          ) : (
            upcomingEvents.map((e) => {
              const cat = categories.find((c) => c.id === e.categoryId);
              return (
                <div key={e.id} className="cal-upcoming-card">
                  <div className="cal-upcoming-time">
                    {format(e.start, "HH:mm")} – {format(e.end, "HH:mm")}
                  </div>
                  <div className="cal-upcoming-title">{e.title}</div>
                  {e.location ? (
                    <div className="cal-upcoming-sub">{e.location}</div>
                  ) : null}
                  <div className="cal-upcoming-actions">
                    <button className="cal-btn cal-btn-ghost">Later</button>
                    <button className="cal-btn cal-btn-soft">Details</button>
                  </div>
                  <span
                    className="cal-upcoming-dot"
                    style={{ background: cat?.color || "#64748b" }}
                  />
                </div>
              );
            })
          )}
        </div>

        <div className="cal-panel cal-panel--categories app-card">
          <div className="cal-panel-title">Categories</div>
          <div className="cal-cat-list">
            {categories.map((c) => (
              <label key={c.id} className="cal-cat-item">
                <span className="cal-cat-dot" style={{ background: c.color }} />
                <span>{c.name}</span>
                <input
                  type="checkbox"
                  checked={c.enabled}
                  onChange={() =>
                    setCategories((prev) =>
                      prev.map((x) =>
                        x.id === c.id ? { ...x, enabled: !x.enabled } : x
                      )
                    )
                  }
                />
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <section className="cal-main app-card">
        <header className="cal-toolbar">
          <div className="cal-toolbar-left">
            <button
              className="cal-icon-btn"
              aria-label="Prev week"
              onClick={() => setSelectedDate((d) => subWeeks(d, 1))}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="cal-btn cal-btn-soft"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </button>
            <button
              className="cal-icon-btn"
              aria-label="Next week"
              onClick={() => setSelectedDate((d) => addWeeks(d, 1))}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <h1 className="cal-month-title">{format(selectedDate, "MMMM, yyyy")}</h1>

          <div className="cal-segment">
            <button className="cal-segment-item cal-segment-item--active">Week</button>
            <button className="cal-segment-item">Day</button>
          </div>
        </header>

        <div className="cal-week-shell">
          <div className="cal-week-header-row">
            <div className="cal-week-header-time" />
            {weekDays.map((d) => (
              <div
                key={d.toISOString()}
                className={`cal-week-header-day ${isSameDay(d, selectedDate) ? 'is-active' : ''}`}
              >
                <div className="cal-day-name">{format(d, "EEE")}</div>
                <div className="cal-day-number">{format(d, "d")}</div>
              </div>
            ))}
          </div>

          <div className="cal-week-body">
            <div className="cal-time-column">
              {hours.map((hr) => (
                <div key={hr} className="cal-time-slot-label">
                  {format(new Date().setHours(hr, 0, 0, 0), "h a")}
                </div>
              ))}
            </div>

            <div className="cal-week-scroll">
              <div className="cal-day-columns">
                {weekDays.map((day) => {
                  const eventsForThisDay = getEventsForColumn(day);
                  return (
                    <div key={day.toISOString()} className="cal-day-column">
                      {hours.map((hr) => (
                        <div key={`${day.toDateString()}-${hr}`} className="cal-hour-cell" />
                      ))}

                      {eventsForThisDay.map((event) => {
                        const start = event.start instanceof Date ? event.start : new Date(event.start);
                        const end = event.end instanceof Date ? event.end : new Date(event.end);

                        const eventStartMinutes = start.getHours() * 60 + start.getMinutes();
                        const eventEndMinutes = end.getHours() * 60 + end.getMinutes();
                        const visibleStartMinutes = START_HOUR * 60;
                        const visibleEndMinutes = END_HOUR * 60;
                        const MIN_DURATION_MINUTES = 45;

                        // Skip events entirely before the visible window
                        if (eventEndMinutes <= visibleStartMinutes) {
                          return null;
                        }

                        const clampedStart = Math.min(
                          Math.max(eventStartMinutes, visibleStartMinutes),
                          visibleEndMinutes - MIN_DURATION_MINUTES
                        );
                        const clampedEnd = Math.min(
                          Math.max(eventEndMinutes, clampedStart + MIN_DURATION_MINUTES),
                          visibleEndMinutes
                        );

                        const offsetMinutes = clampedStart - visibleStartMinutes;
                        const durationMinutes = Math.max(MIN_DURATION_MINUTES, clampedEnd - clampedStart);

                        const top = offsetMinutes * PX_PER_MINUTE;
                        const height = Math.max(MIN_DURATION_MINUTES * PX_PER_MINUTE, durationMinutes * PX_PER_MINUTE);

                        const cat = categories.find((c) => c.id === event.categoryId);
                        return (
                          <div
                            key={event.id}
                            className="cal-event-block"
                            style={{
                              top,
                              height,
                              background: cat?.color
                                ? `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`
                                : undefined,
                            }}
                          >
                            <div className="cal-event-title">{event.title}</div>
                            {!event.allDay && (
                              <div className="cal-event-time">
                                {format(start, "h:mm a")} – {format(end, "h:mm a")}
                              </div>
                            )}
                            {event.location && <div className="cal-event-location">{event.location}</div>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Add Button */}
        <button className="cal-fab" onClick={() => setOpenAdd(true)}>
          <Plus size={18} />
          <span>Add Event</span>
        </button>
      </section>

      {/* ADD / EDIT DIALOG */}
      <EventDialog
        isOpen={openAdd}
        onClose={() => setOpenAdd(false)}
        onSave={(payload) => {
          handleSaveEvent(payload as Omit<CalendarEvent, "id">);
          setOpenAdd(false);
        }}
        categories={categories}
        baseDate={selectedDate}
      />

      {/* ICS Import */}
      <ICSImportModal open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImport} />
      {toast && (
        <div role="status" aria-live="polite" className="pf-toast" style={{ position:'fixed', right:24, bottom:24 }}>
          {toast}
        </div>
      )}
    </div>
  </div>
  );
}

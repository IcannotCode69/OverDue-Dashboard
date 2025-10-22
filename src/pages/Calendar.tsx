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
};

// -------------------- Seed (safe) --------------------
const DEFAULT_CATEGORIES: Category[] = [
  { id: "personal", name: "Personal", color: "#7c5cff", enabled: true },
  { id: "work", name: "Work", color: "#3b82f6", enabled: true },
  { id: "health", name: "Health", color: "#22c55e", enabled: true },
];

// If you already have SAMPLE_EVENTS in this file, you can remove the below and reuse yours.
const SEED_EVENTS: CalendarEvent[] = [
  {
    id: "e1",
    title: "Booking taxi app",
    start: new Date(2025, 9, 13, 6, 0),
    end: new Date(2025, 9, 13, 7, 30),
    categoryId: "work",
    location: "",
  },
  {
    id: "e2",
    title: "Design onboarding",
    start: new Date(2025, 9, 14, 6, 0),
    end: new Date(2025, 9, 14, 7, 10),
    categoryId: "work",
  },
  {
    id: "e3",
    title: "Design session",
    start: new Date(2025, 9, 14, 7, 50),
    end: new Date(2025, 9, 14, 9, 20),
    categoryId: "personal",
  },
  {
    id: "e4",
    title: "Development meet",
    start: new Date(2025, 9, 14, 8, 0),
    end: new Date(2025, 9, 14, 8, 30),
    categoryId: "work",
    location: "Room 3B",
  },
];

// -------------------- Helpers --------------------
const HOURS = Array.from({ length: 15 }, (_, i) => i + 6); // 6am–8pm
function useWeek(startDate: Date) {
  const start = startOfWeek(startDate, { weekStartsOn: 0 });
  return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
}

// -------------------- Component --------------------
export default function Calendar() {
  // IMPORTANT: land on the week that has seed events so the grid is not empty
  const initialDate = (SEED_EVENTS[0]?.start ?? new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date>(initialDate);
  const [categories, setCategories] = React.useState<Category[]>(
    DEFAULT_CATEGORIES
  );
  const STORAGE_KEY = 'od:calendar:events:v1';
  const [events, setEvents] = React.useState<CalendarEvent[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return SEED_EVENTS;
      const parsed = JSON.parse(raw) as any[];
      return parsed.map((e) => ({ ...e, start: new Date(e.start), end: new Date(e.end) }));
    } catch { return SEED_EVENTS; }
  });
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

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)); } catch {}
  }, [events]);

  function eventsForDay(d: Date) {
    return filteredEvents
      .filter((e) => isSameDay(e.start, d))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  function getUpcoming() {
    const weekStart = startOfWeek(selectedDate);
    return filteredEvents
      .filter((e) => e.start >= weekStart)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 1); // Lovable mock shows a single featured upcoming card
  }

  function handleSaveEvent(payload: Omit<CalendarEvent, "id">) {
    setEvents((prev) =>
      prev.concat({ id: crypto.randomUUID(), ...payload })
    );
  }

  function mapImported(items: IcsEvent[]): (CalendarEvent & { __icsUid?: string; __lastModified?: Date })[] {
    return items.map((it) => ({
      id: crypto.randomUUID(),
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

  return (
    <div className="cal-layout">
      {/* LEFT SIDEBAR */}
      <aside className="cal-sidebar">
        <div className="cal-panel cal-panel--calendar">
          <MiniCalendar
            selectedDate={selectedDate}
            onChange={(d: Date) => setSelectedDate(d)}
          />
        </div>

        <div className="cal-panel cal-panel--upcoming">
          <div className="cal-panel-title">Upcoming</div>
          {getUpcoming().length === 0 ? (
            <div className="cal-empty">No upcoming events</div>
          ) : (
            getUpcoming().map((e) => {
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

        <div className="cal-panel cal-panel--categories">
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
      <section className="cal-main">
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
            <button className="cal-btn cal-btn-ghost" onClick={() => setImportOpen(true)}>
              <Upload size={16} style={{ marginRight: 6 }} /> Import .ics
            </button>
          </div>

          <h1 className="cal-month-title">{format(selectedDate, "MMMM, yyyy")}</h1>

          <div className="cal-segment">
            <button className="cal-segment-item cal-segment-item--active">Week</button>
            <button className="cal-segment-item">Day</button>
          </div>
        </header>

        {/* Day headers */}
        <div className="cal-week-headers">
          {useWeek(selectedDate).map((d) => (
            <div key={d.toISOString()} className={`cal-day-header ${isSameDay(d, selectedDate) ? 'is-active' : ''}`}>
              <div className="cal-day-name">{format(d, "EEEE")}</div>
              <div className="cal-day-number">{format(d, "d")}</div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="cal-week-grid">
          {HOURS.map((hr) => (
            <div key={hr} className="cal-hour-row">
              {days.map((d) => (
                <div key={`${d.toDateString()}-${hr}`} className="cal-hour-cell">
                  {eventsForDay(d)
                    .filter((e) => e.start.getHours() === hr)
                    .map((e) => {
                      const cat = categories.find((c) => c.id === e.categoryId);
                      return (
                        <EventCard
                          key={e.id}
                          title={e.title}
                          start={e.start}
                          end={e.end}
                          color={cat?.color || "#6366f1"}
                        />
                      );
                    })}
                </div>
              ))}
            </div>
          ))}
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
  );
}

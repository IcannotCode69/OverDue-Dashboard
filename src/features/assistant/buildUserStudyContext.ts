import { getNotes } from "../notes/store";
import type { Class } from "../notes/types";
import { readCalendarEvents, CalendarEventShared } from "../calendar/storage";
import type { GradeItem } from "../grades/grades.types";

export interface UserStudyContext {
  text: string;
  summary: string;
}

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function formatDate(date: Date | string | number | undefined): string {
  if (!date) return "Unknown date";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "Unknown date";
  return DATE_FMT.format(d);
}

function gatherNotes(): string[] {
  let classes: Class[] = [];
  try {
    classes = getNotes();
  } catch {
    classes = [];
  }

  if (!classes.length) return ["(none yet)"];

  return classes.map((cls) => {
    const chapterNames = (cls.chapters || []).map((ch) => ch.name).filter(Boolean);
    const preview =
      chapterNames.length > 0
        ? ` (${chapterNames.slice(0, 4).join(", ")}${chapterNames.length > 4 ? ", ..." : ""})`
        : "";
    return `- ${cls.name}: ${chapterNames.length} chapters${preview}`;
  });
}

function gatherEvents(): string[] {
  let events: CalendarEventShared[] = [];
  try {
    events = readCalendarEvents();
  } catch {
    events = [];
  }

  if (!events.length) return ["(none yet)"];

  const now = new Date();
  const horizon = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const upcoming = events.filter(
    (evt) => evt.start instanceof Date && evt.start >= now && evt.start <= horizon
  );

  const focusRegex = /(exam|test|quiz|midterm|final|project|due)/i;
  const prioritized = upcoming.filter((evt) => focusRegex.test(`${evt.title} ${evt.description || ""}`));
  const list = (prioritized.length ? prioritized : upcoming).slice(0, 10);

  if (!list.length) return ["(none in next 14 days)"];

  return list.map((evt) => `- ${formatDate(evt.start)}: ${evt.title || "Untitled event"}`);
}

function gatherGrades(): string[] {
  let items: GradeItem[] = [];
  try {
    const raw = localStorage.getItem("grades.items");
    if (raw) {
      items = JSON.parse(raw) as GradeItem[];
    }
  } catch {
    items = [];
  }

  if (!items.length) return ["(none yet)"];

  return items
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
    .slice(0, 6)
    .map((item) => {
      const status =
        item.pointsEarned != null
          ? `${Math.round((item.pointsEarned / item.pointsPossible) * 100)}%`
          : item.status;
      return `- ${item.course}: ${item.assignment} – ${status} (due ${formatDate(item.due)})`;
    });
}

export function buildUserStudyContext(): UserStudyContext {
  try {
    const notesSection = gatherNotes();
    const eventsSection = gatherEvents();
    const gradesSection = gatherGrades();

    const summary = `Classes: ${
      notesSection[0] === "(none yet)" ? 0 : notesSection.length
    }, Upcoming events (14d): ${
      eventsSection[0] === "(none yet)" || eventsSection[0] === "(none in next 14 days)"
        ? 0
        : eventsSection.length
    }, Grades tracked: ${gradesSection[0] === "(none yet)" ? 0 : gradesSection.length}`;

    const text = [
      "=== Classes & Notes ===",
      ...notesSection,
      "",
      "=== Upcoming Events (next 14 days) ===",
      ...eventsSection,
      "",
      "=== Grades / Assignments ===",
      ...gradesSection,
    ].join("\n");

    return { text, summary };
  } catch (err) {
    console.error("buildUserStudyContext error", err);
    return { text: "No user context available yet.", summary: "No context" };
  }
}

import { getNotes } from "../notes/store";
import type { Class } from "../notes/types";
import { readCalendarEvents, CalendarEventShared } from "../calendar/storage";
import type {
  GradeAssignment,
  GradeCourse,
  GradeItem,
  GradesState,
} from "../grades/grades.types";

export interface UserStudyContext {
  text: string;
  summary: string;
}

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

type AuthUserSnapshot = {
  email?: string;
  sub?: string;
  name?: string;
};

const AUTH_STORAGE_KEY = "od:auth:currentUser:v1";
const PROFILE_STORAGE_BASE_KEY = "overdue.profile.v1";
const TODO_STORAGE_BASE_KEY = "od:todo:v1";

function readAuthUser(): AuthUserSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUserSnapshot;
    if (!parsed || (!parsed.email && !parsed.sub)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function withUserSuffix(baseKey: string, userId: string | null): string {
  if (!userId) return baseKey;
  return `${baseKey}:${userId}`;
}

function getCurrentUserId(): string | null {
  const auth = readAuthUser();
  if (!auth) return null;
  return auth.email || auth.sub || null;
}

/**
 * Read active TODO tasks from the dashboard Todo widget.
 * Supports a future per-user key shape (baseKey:userId) but
 * will also fall back to the plain "od:todo:v1" key used today.
 */
function gatherTodos(): string[] {
  if (typeof window === "undefined") return ["(none yet)"];

  const userId = getCurrentUserId();
  const baseKey = TODO_STORAGE_BASE_KEY;
  const perUserKey = withUserSuffix(baseKey, userId);

  const raw =
    window.localStorage.getItem(perUserKey) ||
    window.localStorage.getItem(baseKey);

  if (!raw) return ["(none yet)"];

  try {
    const tasks = JSON.parse(raw) as {
      id: string;
      text: string;
      completed: boolean;
      createdAt: string;
      completedAt?: string | null;
    }[];

    const active = tasks.filter((t) => !t.completed);

    if (!active.length) {
      if (!tasks.length) return ["(none yet)"];
      return ["All tasks completed recently."];
    }

    return active.slice(0, 10).map((task) => `- ${task.text}`);
  } catch {
    return ["(none yet)"];
  }
}

/**
 * Read basic profile information from the profile storage
 * that onboarding writes to (overdue.profile.v1[:userId]).
 */
function gatherProfileSummary(): string[] {
  if (typeof window === "undefined") return ["(none yet)"];

  const userId = getCurrentUserId();
  const baseKey = PROFILE_STORAGE_BASE_KEY;
  const key = withUserSuffix(baseKey, userId);

  const raw =
    window.localStorage.getItem(key) ||
    window.localStorage.getItem(baseKey);

  if (!raw) return ["(none yet)"];

  try {
    const profile = JSON.parse(raw) as {
      fullName?: string;
      school?: string;
      program?: string;
      graduationYear?: string;
      timezone?: string;
      locale?: string;
    };

    const lines: string[] = [];

    if (profile.fullName) {
      lines.push(`Name: ${profile.fullName.trim()}`);
    }

    if (profile.school || profile.program) {
      const parts = [profile.school, profile.program].filter(Boolean);
      if (parts.length) {
        lines.push(`Program: ${parts.join(" — ")}`);
      }
    }

    if (profile.graduationYear) {
      lines.push(`Graduation year: ${profile.graduationYear}`);
    }

    if (profile.timezone) {
      lines.push(`Timezone: ${profile.timezone}`);
    }

    if (!lines.length) return ["(none yet)"];

    return lines.map((line) => `- ${line}`);
  } catch {
    return ["(none yet)"];
  }
}

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
  const prioritized = upcoming.filter((evt) =>
    focusRegex.test(`${evt.title} ${evt.description || ""}`)
  );
  const list = (prioritized.length ? prioritized : upcoming).slice(0, 10);

  if (!list.length) return ["(none in next 14 days)"];

  return list.map((evt) => `- ${formatDate(evt.start)}: ${evt.title || "Untitled event"}`);
}

function readCurrentGrades(): { courses: GradeCourse[]; assignments: GradeAssignment[] } {
  try {
    const raw = localStorage.getItem("grades.state.v2");
    if (raw) {
      const parsed = JSON.parse(raw) as GradesState;
      if (parsed?.assignments?.length) {
        return { courses: parsed.courses ?? [], assignments: parsed.assignments };
      }
    }
  } catch {
    // ignore and attempt legacy fallback
  }

  try {
    const legacyRaw = localStorage.getItem("grades.items");
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as GradeItem[];
      const assignments: GradeAssignment[] = legacy.map((item) => ({
        id: item.id,
        courseId: item.course,
        name: item.assignment,
        due: item.due,
        pointsEarned: item.pointsEarned,
        pointsPossible: item.pointsPossible,
        letter: null,
        status: item.status,
        notes: item.notes,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));
      return { courses: [], assignments };
    }
  } catch {
    // ignore
  }

  return { courses: [], assignments: [] };
}

function gatherGrades(): string[] {
  const { assignments, courses } = readCurrentGrades();

  if (!assignments.length) return ["(none yet)"];

  const courseNames = new Map<string, string>();
  courses.forEach((course) => courseNames.set(course.id, course.name));

  return assignments
    .slice()
    .sort((a, b) => {
      const aTime = a.due ? new Date(a.due).getTime() : Infinity;
      const bTime = b.due ? new Date(b.due).getTime() : Infinity;
      return aTime - bTime;
    })
    .slice(0, 6)
    .map((assignment) => {
      const course =
        courseNames.get(assignment.courseId) ||
        courseNames.get(assignment.name) ||
        assignment.courseId ||
        "Course";
      const status =
        assignment.pointsEarned != null && assignment.pointsPossible
          ? `${Math.round((assignment.pointsEarned / assignment.pointsPossible) * 100)}%`
          : assignment.status;
      return `- ${course}: ${assignment.name} • ${status} (due ${formatDate(
        assignment.due ?? undefined
      )})`;
    });
}

export function buildUserStudyContext(): UserStudyContext {
  try {
    const notesSection = gatherNotes();
    const eventsSection = gatherEvents();
    const gradesSection = gatherGrades();
    const todosSection = gatherTodos();
    const profileSection = gatherProfileSummary();

    const classesCount =
      notesSection[0] === "(none yet)" ? 0 : notesSection.length;
    const eventsCount =
      eventsSection[0] === "(none yet)" ||
      eventsSection[0] === "(none in next 14 days)"
        ? 0
        : eventsSection.length;
    const gradesCount =
      gradesSection[0] === "(none yet)" ? 0 : gradesSection.length;
    const todoCount =
      todosSection[0] === "(none yet)" ||
      todosSection[0] === "All tasks completed recently."
        ? 0
        : todosSection.length;

    const summary = `Classes: ${classesCount}, Upcoming events (14d): ${eventsCount}, Grades tracked: ${gradesCount}, Active tasks: ${todoCount}`;

    const text = [
      "=== Classes & Notes ===",
      ...notesSection,
      "",
      "=== Tasks / To-do ===",
      ...todosSection,
      "",
      "=== Upcoming Events (next 14 days) ===",
      ...eventsSection,
      "",
      "=== Grades / Assignments ===",
      ...gradesSection,
      "",
      "=== Profile ===",
      ...profileSection,
    ].join("\n");

    return { text, summary };
  } catch (err) {
    console.error("buildUserStudyContext error", err);
    return { text: "No user context available yet.", summary: "No context" };
  }
}

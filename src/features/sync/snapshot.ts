export interface DashboardSnapshot {
  version: 1;
  calendarEvents: any[];
  notes: any[];
  grades: any;
  userProfile: any;
  assistantConversations?: any[];
  quickLinks?: any[];
  updatedAt: string;
}

const CAL_KEY = 'od:calendar:events:v1';
const NOTES_KEY = 'od:notes:v2';
const GRADES_KEY = 'grades.state.v2';
const USER_PROFILE_KEY = 'od:userProfile:v1';
const ASSISTANT_KEY = 'overdue.ai.conversations.v1';
const QUICK_LINKS_KEY = 'od:quickLinks:v1';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Build a snapshot of all key OverDue data from localStorage.
 * This is intentionally generic and tolerant of missing/legacy data.
 */
export function buildSnapshotFromLocal(): DashboardSnapshot {
  const calendarEvents = safeParse<any[]>(typeof window !== 'undefined' ? window.localStorage.getItem(CAL_KEY) : null, []);
  const notes = safeParse<any[]>(typeof window !== 'undefined' ? window.localStorage.getItem(NOTES_KEY) : null, []);
  const grades = safeParse<any>(typeof window !== 'undefined' ? window.localStorage.getItem(GRADES_KEY) : null, null);
  const userProfile = safeParse<any>(typeof window !== 'undefined' ? window.localStorage.getItem(USER_PROFILE_KEY) : null, null);
  const assistantConversations = safeParse<any[]>(typeof window !== 'undefined' ? window.localStorage.getItem(ASSISTANT_KEY) : null, []);
  const quickLinks = safeParse<any[]>(typeof window !== 'undefined' ? window.localStorage.getItem(QUICK_LINKS_KEY) : null, []);

  return {
    version: 1,
    calendarEvents,
    notes,
    grades,
    userProfile,
    assistantConversations,
    quickLinks,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Apply a previously saved snapshot back into localStorage.
 * Existing stores (calendar, notes, grades, user profile) will pick this up on next mount.
 */
export function applySnapshotToLocal(snapshot: DashboardSnapshot): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(CAL_KEY, JSON.stringify(snapshot.calendarEvents ?? []));
    window.localStorage.setItem(NOTES_KEY, JSON.stringify(snapshot.notes ?? []));
    if (snapshot.grades !== undefined) {
      window.localStorage.setItem(GRADES_KEY, JSON.stringify(snapshot.grades));
    }
    if (snapshot.userProfile !== undefined) {
      window.localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(snapshot.userProfile));
    }
    if (snapshot.assistantConversations !== undefined) {
      window.localStorage.setItem(
        ASSISTANT_KEY,
        JSON.stringify(snapshot.assistantConversations ?? [])
      );
    }
    if (snapshot.quickLinks !== undefined) {
      window.localStorage.setItem(QUICK_LINKS_KEY, JSON.stringify(snapshot.quickLinks));
    }
  } catch {
    // ignore storage errors
  }
}

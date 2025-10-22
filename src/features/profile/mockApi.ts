import { Profile, Preferences, SecurityState, Connections } from './types';

const delay = (ms = 450) => new Promise((res) => setTimeout(res, ms));

const KEYS = {
  profile: 'overdue.profile.v1',
  preferences: 'overdue.preferences.v1',
  security: 'overdue.security.v1',
  connections: 'overdue.connections.v1',
};

const DEFAULT_PROFILE: Profile = {
  firstName: 'Aki',
  lastName: 'Student',
  displayName: 'Aki',
  handle: '@aki',
  email: 'aki@example.edu',
  phone: '',
  bio: 'CS student exploring distributed systems and UI craft.',
  timezone: 'America/New_York',
  locale: 'en-US',
  school: 'Overdue University',
  program: 'Computer Science',
  graduationYear: new Date().getFullYear() + 2,
  socials: { github: 'https://github.com/example', linkedin: '', website: '' },
  avatarUrl: '',
  coverUrl: '',
};

const DEFAULT_PREFS: Preferences = {
  emailReminders: true,
  pushReminders: false,
  calendar: { autoImportIcs: false, showCategoryColors: true },
  grades: { showWeighted: true },
  categoryColors: ['#7c5cff', '#3b82f6', '#22c55e', '#f59e0b'],
};

const DEFAULT_SECURITY: SecurityState = {
  has2FA: false,
  sessions: [
    { id: crypto.randomUUID(), agent: 'Chrome • Windows', ip: '127.0.0.1', lastActive: new Date().toISOString() },
    { id: crypto.randomUUID(), agent: 'Safari • iPhone', ip: '10.0.0.21', lastActive: new Date(Date.now() - 86400000).toISOString() },
  ],
  recoveryCodes: [],
};

const DEFAULT_CONNECTIONS: Connections = { google: false, outlook: false, brightspace: false };

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // noop
  }
}

export async function loadProfile(): Promise<Profile> {
  await delay();
  return read(KEYS.profile, DEFAULT_PROFILE);
}
export async function saveProfile(profile: Profile): Promise<void> {
  await delay(600);
  write(KEYS.profile, profile);
}

export async function loadPreferences(): Promise<Preferences> {
  await delay();
  return read(KEYS.preferences, DEFAULT_PREFS);
}
export async function savePreferences(prefs: Preferences): Promise<void> {
  await delay(600);
  write(KEYS.preferences, prefs);
}

export async function loadSecurity(): Promise<SecurityState> {
  await delay();
  return read(KEYS.security, DEFAULT_SECURITY);
}
export async function saveSecurity(sec: SecurityState): Promise<void> {
  await delay(600);
  write(KEYS.security, sec);
}

export async function loadConnections(): Promise<Connections> {
  await delay();
  return read(KEYS.connections, DEFAULT_CONNECTIONS);
}
export async function saveConnections(conns: Connections): Promise<void> {
  await delay(600);
  write(KEYS.connections, conns);
}


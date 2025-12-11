import { Profile, Preferences, SecurityState, Connections } from './types';
import { generateId } from '../../utils/randomId';
import { AuthUser } from '../auth/AuthContext';
import { getUserIdFromAuth } from '../sync/userId';

const delay = (ms = 450) => new Promise((res) => setTimeout(res, ms));

const KEYS = {
  profile: 'overdue.profile.v1',
  preferences: 'overdue.preferences.v1',
  security: 'overdue.security.v1',
  connections: 'overdue.connections.v1',
};

const AUTH_STORAGE_KEY = 'od:auth:currentUser:v1';

function loadAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

function withUserSuffix(baseKey: string, userId: string | null): string {
  if (!userId) return baseKey;
  return `${baseKey}:${userId}`;
}

const CURRENT_YEAR = new Date().getFullYear();

function buildDefaultProfile(authUser: AuthUser | null): Profile {
  const tz = typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'America/New_York';
  const locale = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US';

  return {
    firstName: '',
    lastName: '',
    displayName: authUser?.name || '',
    handle: '',
    email: authUser?.email || '',
    phone: '',
    bio: '',
    timezone: tz,
    locale,
    school: '',
    program: '',
    graduationYear: CURRENT_YEAR,
    socials: {
      github: '',
      linkedin: '',
      website: '',
    },
    avatarUrl: '',
    coverUrl: '',
  };
}

const ONBOARDING_STORAGE_KEY = 'od:userProfile:v1';

function readOnboardingProfileFromLocalStorage(): Partial<Profile> | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    const state = parsed?.state ?? parsed;

    if (!state) return null;

    const source =
      state.profile ??
      state.userProfile ??
      state;

    if (!source) return null;

    const onboardingProfile: Partial<Profile> = {
      firstName: source.firstName ?? '',
      lastName: source.lastName ?? '',
      displayName: source.displayName ?? '',
      handle: source.handle ?? '',
      email: source.email ?? '',
      bio: source.bio ?? '',
      timezone: source.timezone ?? 'America/New_York',
      locale: source.locale ?? 'en-US',
      school: source.school ?? '',
      program: source.program ?? '',
      graduationYear: source.graduationYear ?? new Date().getFullYear(),
      socials: {
        github: source.socials?.github ?? '',
        linkedin: source.socials?.linkedin ?? '',
        website: source.socials?.website ?? '',
      },
      avatarUrl: source.avatarUrl ?? '',
      coverUrl: source.coverUrl ?? '',
    };

    const hasAnyValue = Object.values(onboardingProfile).some((v) => {
      if (v == null) return false;
      if (typeof v === 'string') return v.trim().length > 0;
      return true;
    });

    return hasAnyValue ? onboardingProfile : null;
  } catch {
    return null;
  }
}

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
    { id: generateId(), agent: 'Chrome • Windows', ip: '127.0.0.1', lastActive: new Date().toISOString() },
    { id: generateId(), agent: 'Safari • iPhone', ip: '10.0.0.21', lastActive: new Date(Date.now() - 86400000).toISOString() },
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

function isDemoProfile(profile: Profile): boolean {
  if (!profile) return true;
  if (profile.email === 'aki@example.edu') return true;
  if (profile.displayName === 'Aki' && profile.firstName === 'Aki') return true;

  const keyFields = [
    profile.firstName,
    profile.lastName,
    profile.displayName,
    profile.email,
    profile.school,
    profile.program,
  ];

  const allEmpty = keyFields.every((v) => !v || String(v).trim().length === 0);
  return allEmpty;
}

export async function loadProfile(): Promise<Profile> {
  await delay();

  const authUser = loadAuthUser();
  const userId = getUserIdFromAuth(authUser);
  const key = withUserSuffix(KEYS.profile, userId);
  const stored = read(key, buildDefaultProfile(authUser)) as Profile;

  if (!isDemoProfile(stored)) {
    return stored;
  }

  const onboarding = readOnboardingProfileFromLocalStorage();
  if (onboarding) {
    const merged: Profile = {
      ...buildDefaultProfile(authUser),
      ...stored,
      ...onboarding,
    };

    write(key, merged);
    return merged;
  }

  const fresh: Profile = { ...buildDefaultProfile(authUser) };
  write(key, fresh);
  return fresh;
}
export async function saveProfile(profile: Profile): Promise<void> {
  await delay(600);
  const authUser = loadAuthUser();
  const userId = getUserIdFromAuth(authUser);
  const key = withUserSuffix(KEYS.profile, userId);
  write(key, profile);
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

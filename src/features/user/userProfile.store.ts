import { create } from "zustand";
import { AuthUser } from "../auth/AuthContext";
import { getUserIdFromAuth } from "../sync/userId";

export type UserProfile = {
  fullName: string;
  email: string;
  bio?: string;
  timezone?: string;
  locale?: string;
  school?: string;
  program?: string;
  graduationYear?: string;
  github?: string;
  linkedin?: string;
  website?: string;
};

interface UserProfileState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  clearProfile: () => void;
}

const AUTH_STORAGE_KEY = "od:auth:currentUser:v1";
const PROFILE_BASE_KEY = "od:userProfile:v1";

function loadAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
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

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function buildDefaultProfile(authUser: AuthUser | null): UserProfile {
  const timezone =
    (typeof Intl !== "undefined" && Intl.DateTimeFormat().resolvedOptions().timeZone) || "";
  const locale = (typeof navigator !== "undefined" && navigator.language) || "en-US";
  return {
    fullName: authUser?.name || "",
    email: authUser?.email || "",
    bio: "",
    timezone,
    locale,
    school: "",
    program: "",
    graduationYear: "",
    github: "",
    linkedin: "",
    website: "",
  };
}

function loadInitialProfile(): UserProfile | null {
  const authUser = loadAuthUser();
  const userId = getUserIdFromAuth(authUser);
  const key = withUserSuffix(PROFILE_BASE_KEY, userId);
  const existing = safeParse<UserProfile | null>(
    typeof window !== "undefined" ? window.localStorage.getItem(key) : null,
    null
  );
  if (existing) return existing;

  const fallback = buildDefaultProfile(authUser);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(key, JSON.stringify(fallback));
    } catch {
      // ignore
    }
  }
  return fallback;
}

export const useUserProfileStore = create<UserProfileState>((set, get) => ({
  profile: loadInitialProfile(),
  setProfile(profile) {
    const authUser = loadAuthUser();
    const userId = getUserIdFromAuth(authUser);
    const key = withUserSuffix(PROFILE_BASE_KEY, userId);
    const next = { ...profile };
    set({ profile: next });
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore
      }
    }
  },
  updateProfile(patch) {
    const current = get().profile;
    if (!current) return;
    const next = { ...current, ...patch };
    const authUser = loadAuthUser();
    const userId = getUserIdFromAuth(authUser);
    const key = withUserSuffix(PROFILE_BASE_KEY, userId);
    set({ profile: next });
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore
      }
    }
  },
  clearProfile() {
    const authUser = loadAuthUser();
    const userId = getUserIdFromAuth(authUser);
    const key = withUserSuffix(PROFILE_BASE_KEY, userId);
    set({ profile: null });
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
  },
}));
